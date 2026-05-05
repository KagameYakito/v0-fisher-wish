'use client';

import { useState } from 'react';
// Import komponen lain seperti biasa
import { GridData, UserTier } from '@/lib/mock-data';
import { HeaderBar } from '@/components/HeaderBar';
import { GridInfoCard } from '@/components/GridInfoCard';
import { SpeciesFilterBar } from '@/components/SpeciesFilterBar';
import { UpgradeModal } from '@/components/UpgradeModal';

// ⚠️ GANTI IMPORT INI - Dynamic Import dengan ssr: false
import dynamic from 'next/dynamic';

const MapCanvas = dynamic(() => import('@/components/MapCanvas').then(mod => ({ default: mod.MapCanvas })), {
  ssr: false,  // ← INI KUNCINYA! Disable server-side rendering
  loading: () => (
    <div className="w-full h-full bg-slate-950 flex items-center justify-center">
      <div className="text-cyan-400 animate-pulse">Loading map...</div>
    </div>
  )
});

export default function Home() {
  // ... rest of your code tetap sama
  const [userTier, setUserTier] = useState<UserTier>('free');
  const [selectedGrid, setSelectedGrid] = useState<GridData | null>(null);
  const [speciesFilter, setSpeciesFilter] = useState('all');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeSource, setUpgradeSource] = useState<'header' | 'card'>('header');

  const handleGridSelect = (grid: GridData) => {
    setSelectedGrid(grid);
  };

  const handleUpgradeClick = () => {
    setUpgradeSource('card');
    setShowUpgradeModal(true);
  };

  const handleUpgradeModal = () => {
    setShowUpgradeModal(true);
    setUpgradeSource('header');
  };

  const handleSelectTier = (tier: 'premium' | 'ultra') => {
    setUserTier(tier);
  };

  return (
    <div className="w-screen h-screen bg-slate-950 flex flex-col overflow-hidden">
      <HeaderBar userTier={userTier} onSettingsClick={handleUpgradeModal} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <MapCanvas
            onGridSelect={handleGridSelect}
            selectedGridId={selectedGrid?.grid_id}
            filterSpecies={speciesFilter}
          />
        </div>
        
        <SpeciesFilterBar onFilterChange={setSpeciesFilter} activeFilter={speciesFilter} />
      </div>

      {selectedGrid && (
        <GridInfoCard
          grid={selectedGrid}
          userTier={userTier}
          onClose={() => setSelectedGrid(null)}
          onUpgrade={handleUpgradeClick}
          isOpen={true}
        />
      )}

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentTier={userTier}
        onSelectTier={handleSelectTier}
      />
    </div>
  );
}