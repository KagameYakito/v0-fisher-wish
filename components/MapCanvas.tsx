'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Polygon, useMap, ZoomControl, CircleMarker } from 'react-leaflet';
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

// 📍 KOMPONEN TITIK GPS DENGAN ANIMASI PULSE
// 📍 KOMPONEN TITIK GPS DENGAN ANIMASI PULSE
function GPSMarker({ position, onClick }: { position: [number, number] | null; onClick?: () => void }) {
  if (!position) return null;

  return (
    <>
      {/* Lingkaran luar (pulse animation) */}
      <CircleMarker
        center={position}
        radius={20}
        pathOptions={{
          color: '#3b82f6',
          fillColor: '#3b82f6',
          fillOpacity: 0.2,
          weight: 1,
        }}
        className="animate-ping"
        eventHandlers={{
          click: onClick,  // ✅ Tambah klik handler
        }}
      />
      {/* Lingkaran dalam (solid) */}
      <CircleMarker
        center={position}
        radius={8}
        pathOptions={{
          color: '#3b82f6',
          fillColor: '#3b82f6',
          fillOpacity: 0.8,
          weight: 2,
        }}
        eventHandlers={{
          click: onClick,  // ✅ Tambah klik handler
        }}
      />
      {/* Titik tengah (putih) */}
      <CircleMarker
        center={position}
        radius={4}
        pathOptions={{
          color: '#ffffff',
          fillColor: '#ffffff',
          fillOpacity: 1,
          weight: 1,
        }}
        eventHandlers={{
          click: onClick,  // ✅ Tambah klik handler
        }}
      />
    </>
  );
}

// 🎯 TOMBOL LOKASI FLOATING
function LocationButton({ onClick, hasLocation }: { onClick: () => void; hasLocation: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`absolute bottom-20 right-4 z-[1000] p-3 rounded-full shadow-lg border-2 transition-all ${
        hasLocation 
          ? 'bg-blue-600 border-blue-400 hover:bg-blue-700' 
          : 'bg-slate-700 border-slate-500 hover:bg-slate-600'
      }`}
      title="Lokasi Saya"
    >
      <svg 
        className="w-6 h-6 text-white" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
        />
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
        />
      </svg>
    </button>
  );
}

const getH3Resolution = (zoom: number): number => {
  if (zoom <= 2) return 2;
  if (zoom <= 4) return 3;
  if (zoom <= 6) return 5;
  if (zoom <= 8) return 7;
  return 9;
};

export default function MapCanvas({ onGridSelect, selectedGridId, filterSpecies = 'all' }: MapCanvasProps) {
  const [zoomLevel, setZoomLevel] = useState(5);
  const [bounds, setBounds] = useState<L.LatLngBounds | null>(null);
  const [hexagons, setHexagons] = useState<any[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  
  // 📍 STATE UNTUK GPS LOCATION
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [hasUserMoved, setHasUserMoved] = useState(false); // Track if user manually moved map
  const hasCenteredRef = useRef(false);

  const getHexColor = (prob: number) => {
    if (prob < 40) return '#ef4444';
    if (prob < 70) return '#f59e0b';
    return '#10b981';
  };

  // 📍 FUNGSI MENDAPATKAN LOKASI GPS
  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Browser tidak mendukung GPS');
      return;
    }

    // Sukses mendapat lokasi
    const success = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      const newLocation: [number, number] = [latitude, longitude];
      
      setUserLocation(newLocation);
      setLocationError(null);

      // ✅ useRef TIDAK reset saat re-render/switch tab
      if (mapRef.current && !hasCenteredRef.current) {
        mapRef.current.setView(newLocation, 5, {
          animate: true,
          duration: 1,
        });
        hasCenteredRef.current = true; // Langsung set true (tidak pakai setState)
      }
    };

    // Error saat mendapat lokasi
    const error = (err: GeolocationPositionError) => {
      let message = 'Gagal mendapat lokasi';
      if (err.code === 1) message = 'Izin lokasi ditolak';
      if (err.code === 2) message = 'Lokasi tidak tersedia';
      if (err.code === 3) message = 'Timeout meminta lokasi';
      
      setLocationError(message);
      console.warn('GPS Error:', err);
    };

    // Opsi GPS
    const options = {
      enableHighAccuracy: true,  // Akurasi tinggi
      timeout: 10000,            // Timeout 10 detik
      maximumAge: 0,             // Jangan cache
    };

    // Dapatkan lokasi pertama kali
    navigator.geolocation.getCurrentPosition(success, error, options);

    // Tracking posisi real-time (update setiap 5 detik)
    // ✅ TIDAK auto-center, hanya update posisi titik biru
    const id = navigator.geolocation.watchPosition(success, error, options);
    setWatchId(id);
  }, []);

  // ✅ FUNGSI UNTUK CENTER MAP KE LOKASI USER (dipanggil saat tombol diklik)
  const centerToLocation = useCallback(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.flyTo(userLocation, 7, {
        duration: 1.5,
      });
    }
  }, [userLocation]);

  const handleGPSMarkerClick = useCallback(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.flyTo(userLocation, 7, {
        duration: 1.5,
      });
    }
  }, [userLocation]);

  // Track jika user manual move map
  const handleMapMove = useCallback(() => {
    if (mapRef.current) {
      setBounds(mapRef.current.getBounds());
      setHasUserMoved(true); // User sudah geser map manual
    }
  }, []);

  // Start GPS tracking saat component mount
  useEffect(() => {
    getUserLocation();

    // Cleanup: stop tracking saat component unmount
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [getUserLocation]);

  const generateHexagons = useCallback((mapBounds: L.LatLngBounds, resolution: number) => {
    const newHexagons: any[] = [];
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
              grid_id: h3Index,
              lat,
              lon: lng,
              species: speciesNames[randomIcon],
              icon: randomIcon,
              probability: Math.floor(Math.random() * 100),
              trend: Math.floor(Math.random() * 20) - 10,
              reason: 'Auto-generated',
              bait: 'N/A',
              status: 'normal' as const,
            } as GridData;
          }

          if (filterSpecies !== 'all') {
            const iconMap: Record<string, string[]> = { 
              pelagic: ['fish'], 
              crustacean: ['shrimp'], 
              cephalopod: ['waves'] 
            };
            const allowedIcons = iconMap[filterSpecies] || [];
            if (!allowedIcons.includes(gridData.icon)) continue;
          }

          newHexagons.push({ 
            id: h3Index, 
            coords, 
            data: gridData 
          });
        } catch (e) {
          // Skip invalid coordinates
        }
      }
    }
    
    setHexagons(newHexagons);
  }, [filterSpecies]);

  useEffect(() => {
    if (bounds) {
      generateHexagons(bounds, getH3Resolution(zoomLevel));
    }
  }, [zoomLevel, bounds, generateHexagons]);

  useEffect(() => {
    if (mapRef.current) {
      handleMapMove();
      mapRef.current.on('moveend', handleMapMove);
    }
  }, [handleMapMove]);

  return (
    <div className="relative w-full h-[100dvh] bg-slate-950 overflow-hidden">
      {/* Grid Density Indicator */}
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-[1000] bg-slate-900/90 backdrop-blur px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg border border-white/10 text-xs sm:text-sm pointer-events-none select-none">
        <div className="text-gray-400">Grid Density</div>
        <div className="font-bold text-cyan-400">
          {zoomLevel <= 3 ? '1x (Region)' : zoomLevel <= 6 ? '10x (Local)' : '100x+ (Detail)'}
        </div>
      </div>

      {/* 📍 TOMBOL LOKASI */}
      <LocationButton 
        onClick={centerToLocation}  // ✅ Pakai fungsi center, bukan getUserLocation
        hasLocation={userLocation !== null} 
      />

      {/* 📍 ERROR MESSAGE (jika GPS ditolak) */}
      {locationError && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-[1000] bg-red-600/90 backdrop-blur px-4 py-2 rounded-lg text-white text-sm">
          ⚠️ {locationError}
        </div>
      )}

      <MapContainer
        ref={mapRef}
        center={[0, 110]}  // ✅ DEFAULT: Tetap di Indonesia, TIDAK auto-center ke GPS
        zoom={5}           // ✅ DEFAULT: Zoom level 5 (regional view)
        minZoom={5}  
        maxZoom={19}
        maxBounds={[[-90, -180], [90, 180]]}
        maxBoundsViscosity={1.0}
        zoomSnap={0.1}
        zoomDelta={0.5}
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        touchZoom={true}
        dragging={true}
        worldCopyJump={false}
        preferCanvas={true}
      >
        <MapZoomHandler onZoomChange={setZoomLevel} onMapReady={() => setIsMapReady(true)} />
        <ZoomControl position="bottomright" />
        
        <TileLayer
          attribution='&copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          maxZoom={19}
          noWrap={true}
        />

        {/* 📍 TITIK GPS USER (bisa diklik untuk zoom detail) */}
        <GPSMarker 
          position={userLocation} 
          onClick={handleGPSMarkerClick}  // ✅ Tambah onClick
        />

        {hexagons.map((hex: any) => {
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