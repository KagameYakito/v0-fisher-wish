'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Polygon, useMap, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import * as h3 from 'h3-js';
import { GridData, MOCK_GRIDS } from '@/lib/mock-data';

// Fix Leaflet icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MapCanvasProps {
  onGridSelect: (grid: GridData) => void;
  selectedGridId?: string;
  filterSpecies?: string;
}

function MapZoomHandler({ onZoomChange, onMapReady }: { onZoomChange: (zoom: number) => void; onMapReady: () => void }) {
  const map = useMap();
  
  useEffect(() => {
    const handleZoom = () => onZoomChange(map.getZoom());
    map.on('zoomend', handleZoom);
    onMapReady();
    return () => { map.off('zoomend', handleZoom); };
  }, [map, onZoomChange, onMapReady]);
  
  return null;
}

const getH3Resolution = (zoom: number): number => {
  if (zoom <= 2) return 2;
  if (zoom <= 4) return 3;
  if (zoom <= 6) return 5;
  if (zoom <= 8) return 7;
  return 9;
};

export function MapCanvas({ onGridSelect, selectedGridId, filterSpecies = 'all' }: MapCanvasProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [bounds, setBounds] = useState<L.LatLngBounds | null>(null);
  // ✅ FIXED: Tambahkan "data:" sebelum GridData
  const [hexagons, setHexagons] = useState<Array<{ 
    id: string; 
    coords: [number, number][]; 
    data: GridData  // ← INI YANG BENAR (ada "data:")
  }>>([]);
  const [isMapReady, setIsMapReady] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

  const getHexColor = (prob: number) => {
    if (prob < 40) return '#ef4444';
    if (prob < 70) return '#f59e0b';
    return '#10b981';
  };

  const generateHexagons = useCallback((mapBounds: L.LatLngBounds, resolution: number) => {
    const newHexagons: Array<{ id: string; coords: [number, number][]; data: GridData }> = [];
    const step = resolution >= 8 ? 0.2 : resolution >= 6 ? 0.5 : 1.0;
    const sw = mapBounds.getSouthWest();
    const ne = mapBounds.getNorthEast();
    const mockGridMap = new Map(MOCK_GRIDS.map(g => [g.grid_id, g]));

    for (let lat = sw.lat; lat < ne.lat; lat += step) {
      for (let lng = sw.lng; lng < ne.lng; lng += step) {
        try {
          const h3Index = h3.latLngToCell(lat, lng, resolution);
          const boundary = h3.cellToBoundary(h3Index);
          const coords = boundary.map((p: number[]) => [p[1], p[0]] as [number, number]);
          
          const existingData = mockGridMap.get(h3Index);
          let gridData: GridData;

          if (existingData) {
            gridData = existingData;
          } else {
            const icons: Array<'fish' | 'shrimp' | 'waves'> = ['fish', 'shrimp', 'waves'];
            const randomIcon = icons[Math.floor(Math.random() * icons.length)];
            const speciesNames: Record<string, string> = { fish: 'Tongkol', shrimp: 'Lobster', waves: 'Cumi-cumi' };
            
            gridData = {
              grid_id: h3Index, lat, lon: lng,
              species: speciesNames[randomIcon], icon: randomIcon,
              probability: Math.floor(Math.random() * 100),
              trend: Math.floor(Math.random() * 20) - 10,
              reason: 'Auto-generated', bait: 'N/A', status: 'normal' as const,
            } as GridData;
          }

          if (filterSpecies !== 'all') {
            const iconMap: Record<string, string[]> = { pelagic: ['fish'], crustacean: ['shrimp'], cephalopod: ['waves'] };
            if (!iconMap[filterSpecies]?.includes(gridData.icon)) continue;
          }

          newHexagons.push({ id: h3Index, coords, data: gridData });
        } catch (e) { /* skip */ }
      }
    }
    setHexagons(newHexagons);
  }, [filterSpecies]);

  // Auto-fit world bounds saat map ready
  useEffect(() => {
    if (mapRef.current && !isMapReady) {
      const worldBounds = L.latLngBounds([[-90, -180], [90, 180]]);
      mapRef.current.fitBounds(worldBounds, { 
        padding: [0, 0],
        maxZoom: 1,
        animate: false 
      });
      setIsMapReady(true);
    }
  }, [isMapReady]);

  useEffect(() => {
    if (bounds) generateHexagons(bounds, getH3Resolution(zoomLevel));
  }, [zoomLevel, bounds, generateHexagons]);

  useEffect(() => {
    if (mapRef.current) {
      setBounds(mapRef.current.getBounds());
      mapRef.current.on('moveend', () => setBounds(mapRef.current!.getBounds()));
    }
  }, []);

  return (
    <div className="relative w-full h-[100dvh] bg-slate-950 overflow-hidden">
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-[1000] bg-slate-900/90 backdrop-blur px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg border border-white/10 text-xs sm:text-sm pointer-events-none select-none">
        <div className="text-gray-400">Grid Density</div>
        <div className="font-bold text-cyan-400">
          {zoomLevel <= 2 ? '1x (World)' : zoomLevel <= 6 ? '10x (Region)' : '100x+ (Local)'}
        </div>
      </div>

      <MapContainer
        ref={mapRef}
        center={[0, 0]}
        zoom={1}
        minZoom={1}
        maxZoom={19}
        maxBounds={[[-90, -180], [90, 180]]}
        maxBoundsViscosity={1.0}
        zoomSnap={0.5}
        zoomDelta={0.5}
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        touchZoom={true}
        dragging={true}
        worldCopyJump={true}
        preferCanvas={true}
      >
        <MapZoomHandler onZoomChange={setZoomLevel} onMapReady={() => setIsMapReady(true)} />
        <ZoomControl position="bottomright" />
        
        <TileLayer
          attribution='&copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          maxZoom={19}
          noWrap={false}
        />

        {hexagons.map((hex) => {
          const isSelected = selectedGridId === hex.id;
          return (
            <Polygon
              key={hex.id}
              positions={hex.coords}
              pathOptions={{
                color: getHexColor(hex.data.probability),
                fillColor: getHexColor(hex.data.probability),
                fillOpacity: isSelected ? 0.45 : 0.15,
                weight: isSelected ? 3 : 1.5,
                opacity: 0.8,
              }}
              eventHandlers={{
                click: () => onGridSelect(hex.data),
                mouseover: (e: any) => !isSelected && e.target.setStyle({ fillOpacity: 0.35, weight: 2.5 }),
                mouseout: (e: any) => !isSelected && e.target.setStyle({ fillOpacity: 0.15, weight: 1.5 }),
              }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}