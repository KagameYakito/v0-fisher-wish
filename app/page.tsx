'use client';

import { useState } from 'react';
import { GridData, UserTier } from '@/lib/mock-data';
import { HeaderBar } from '@/components/HeaderBar';
import { MapCanvas } from '@/components/MapCanvas';
import { GridInfoCard } from '@/components/GridInfoCard';
import { SpeciesFilterBar } from '@/components/SpeciesFilterBar';
import { UpgradeModal } from '@/components/UpgradeModal';

export default function Home() {
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
      {/* Header */}
      <HeaderBar
        userTier={userTier}
        onSettingsClick={handleUpgradeModal}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Map canvas - takes up remaining space minus filter bar */}
        <div className="flex-1 overflow-hidden">
          <MapCanvas
            onGridSelect={handleGridSelect}
            selectedGridId={selectedGrid?.grid_id}
            filterSpecies={speciesFilter}
          />
        </div>

        {/* Filter bar */}
        <SpeciesFilterBar
          onFilterChange={setSpeciesFilter}
          activeFilter={speciesFilter}
        />
      </div>

      {/* Grid info card (bottom sheet) */}
      {selectedGrid && (
        <GridInfoCard
          grid={selectedGrid}
          userTier={userTier}
          onClose={() => setSelectedGrid(null)}
          onUpgrade={handleUpgradeClick}
          isOpen={true}
        />
      )}

      {/* Upgrade modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentTier={userTier}
        onSelectTier={handleSelectTier}
      />
    </div>
  );
}
