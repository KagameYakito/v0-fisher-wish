'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Polygon, useMap, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import * as h3 from 'h3-js';
import { GridData, MOCK_GRIDS } from '@/lib/mock-data';
import { SpeciesIcon } from './SpeciesIcon';

// Fix Leaflet default icon
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

// Component untuk handle zoom
function MapZoomHandler({ onZoomChange }: { onZoomChange: (zoom: number) => void }) {
  const map = useMap();
  useEffect(() => {
    const handleZoom = () => onZoomChange(map.getZoom());
    map.on('zoomend', handleZoom);
    return () => { map.off('zoomend', handleZoom); };
  }, [map, onZoomChange]);
  return null;
}

// Helper: Map zoom ke H3 Resolution
const getH3Resolution = (zoom: number): number => {
  if (zoom <= 3) return 3;
  if (zoom <= 5) return 4;
  if (zoom <= 7) return 6;
  if (zoom <= 9) return 8;
  return 9;
};

export function MapCanvas({ onGridSelect, selectedGridId, filterSpecies = 'all' }: MapCanvasProps) {
  const [zoomLevel, setZoomLevel] = useState(6);
  const [bounds, setBounds] = useState<L.LatLngBounds | null>(null);
  const [hexagons, setHexagons] = useState<Array<{ 
    id: string; 
    coords: [number, number][]; 
    data: GridData 
  }>>([]);
  
  const mapRef = useRef<L.Map | null>(null);

  const getHexColor = (prob: number) => {
    if (prob < 40) return '#ef4444';
    if (prob < 70) return '#f59e0b';
    return '#10b981';
  };

  // Generate hexagons
  const generateHexagons = useCallback((mapBounds: L.LatLngBounds, resolution: number) => {
    const newHexagons: Array<{ id: string; coords: [number, number][]; data: GridData }> = [];
    const step = resolution >= 8 ? 0.2 : resolution >= 6 ? 0.5 : 1.0;
    
    const sw = mapBounds.getSouthWest();
    const ne = mapBounds.getNorthEast();

    // Buat map dari MOCK_GRIDS untuk lookup cepat
    const mockGridMap = new Map(MOCK_GRIDS.map(g => [g.grid_id, g]));

    for (let lat = sw.lat; lat < ne.lat; lat += step) {
      for (let lng = sw.lng; lng < ne.lng; lng += step) {
        try {
          const h3Index = h3.latLngToCell(lat, lng, resolution);
          const boundary = h3.cellToBoundary(h3Index);
          const coords = boundary.map((p: number[]) => [p[1], p[0]] as [number, number]);
          
          // Cek apakah ada di MOCK_GRIDS
          const existingData = mockGridMap.get(h3Index);
          let gridData: GridData;

          if (existingData) {
            gridData = existingData;
          } else {
            // Buat dummy data
            const icons: Array<'fish' | 'shrimp' | 'waves'> = ['fish', 'shrimp', 'waves'];
            const randomIcon = icons[Math.floor(Math.random() * icons.length)];
            const speciesNames: Record<string, string> = {
              fish: 'Tongkol',
              shrimp: 'Lobster',
              waves: 'Cumi-cumi'
            };
            
            gridData = {
              grid_id: h3Index,
              lat,
              lon: lng,
              species: speciesNames[randomIcon],
              icon: randomIcon,
              probability: Math.floor(Math.random() * 100),
              trend: Math.floor(Math.random() * 20) - 10,
              reason: 'Auto-generated',
              bait: 'N/A',
              status: 'normal',
            } as GridData;
          }

          // Filter species
          if (filterSpecies !== 'all') {
            const iconMap: Record<string, string[]> = {
              pelagic: ['fish'],
              crustacean: ['shrimp'],
              cephalopod: ['waves']
            };
            const allowedIcons = iconMap[filterSpecies] || [];
            if (!allowedIcons.includes(gridData.icon)) {
              continue;
            }
          }

          newHexagons.push({ id: h3Index, coords, data: gridData });
        } catch (e) {
          // Skip invalid coordinates
        }
      }
    }
    
    setHexagons(newHexagons);
  }, [filterSpecies]);

  // Update hexagons saat zoom/bounds berubah
  useEffect(() => {
    if (bounds) {
      const res = getH3Resolution(zoomLevel);
      generateHexagons(bounds, res);
    }
  }, [zoomLevel, bounds, generateHexagons]);

  // Handle map ready
  useEffect(() => {
    if (mapRef.current) {
      setBounds(mapRef.current.getBounds());
      mapRef.current.on('moveend', () => {
        setBounds(mapRef.current!.getBounds());
      });
    }
  }, []);

  return (
    <div className="relative w-full h-full bg-slate-950">
      {/* Grid Density Indicator */}
      <div className="absolute top-4 right-4 z-[1000] bg-slate-900/90 backdrop-blur px-3 py-2 rounded-lg border border-white/10 text-xs">
        <div className="text-gray-400">Grid Density</div>
        <div className="font-bold text-cyan-400">
          {zoomLevel <= 3 ? '1x (Overview)' : zoomLevel <= 7 ? '10x (Medium)' : '100x+ (Detail)'}
        </div>
        <div className="text-gray-500">H3 Res: {getH3Resolution(zoomLevel)}</div>
      </div>

      <MapContainer
        ref={mapRef}
        center={[-6.0, 110.0]}
        zoom={6}
        minZoom={2}  // 🔒 Batasi zoom out maksimal level 2
        className="w-full h-full"
        zoomControl={false}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        maxBounds={[[-90, -180], [90, 180]]} // 🔒 Kunci area valid dunia
        maxBoundsViscosity={1.0} // 🔒 Buat batas "keras" (tidak bisa geser lebih)
      >
        <MapZoomHandler onZoomChange={setZoomLevel} />
        <ZoomControl position="bottomright" />
        
        <TileLayer
          attribution='&copy; <a href="https://carto.com">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          maxZoom={19}
          noWrap={true} // 🔑 KUNCI UTAMA: Matikan pengulangan tile horizontal
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
                fillOpacity: isSelected ? 0.4 : 0.15,
                weight: isSelected ? 3 : 1,
                opacity: 0.8,
              }}
              eventHandlers={{
                click: () => onGridSelect(hex.data),
                mouseover: (e: any) => !isSelected && e.target.setStyle({ fillOpacity: 0.3, weight: 2 }),
                mouseout: (e: any) => !isSelected && e.target.setStyle({ fillOpacity: 0.15, weight: 1 }),
              }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}