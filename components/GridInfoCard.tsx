'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { GridData, UserTier } from '@/lib/mock-data';
import { TierLockOverlay } from './TierLockOverlay';
import { SpeciesIcon } from './SpeciesIcon';

interface GridInfoCardProps {
  grid: GridData;
  userTier: UserTier;
  onClose: () => void;
  onUpgrade: () => void;
  isOpen: boolean;
}

export function GridInfoCard({
  grid,
  userTier,
  onClose,
  onUpgrade,
  isOpen,
}: GridInfoCardProps) {
  const getProbabilityColor = (probability: number) => {
    if (probability < 40) return 'bg-red-500/20 text-red-300 border-red-500/30';
    if (probability < 70) return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
  };

  const getProbabilityLabel = (probability: number) => {
    if (probability < 40) return 'Low';
    if (probability < 70) return 'Medium';
    return 'High';
  };

  const getProbabilityIcon = (probability: number) => {
    if (probability < 40) return <span className="text-red-400">●</span>;
    if (probability < 70) return <span className="text-amber-400">●</span>;
    return <span className="text-emerald-400">●</span>;
  };

  return (
    <>
      {/* Overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* Card */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ease-out ${
          isOpen ? 'translate-y-0 animate-slide-up' : 'translate-y-full'
        }`}
      >
        <div className="mx-auto max-w-2xl rounded-t-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-white/10 border-b-0 shadow-2xl">
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="h-1 w-12 bg-slate-600 rounded-full" />
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="mb-3 text-cyan-400">
                  <SpeciesIcon icon={grid.icon} size={32} />
                </div>
                <h2 className="text-2xl font-bold text-slate-100">
                  {grid.species}
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Lat: {grid.lat.toFixed(2)}, Lon: {grid.lon.toFixed(2)}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-200 transition p-1"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Protection status */}
            {grid.status === 'protected' && (
              <div className="flex items-center gap-3 p-3 bg-red-500/15 border border-red-500/30 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <div className="text-sm text-red-200">
                  <span className="font-semibold">SPAWNING PROTECTED</span> – Catch & Release Only
                </div>
              </div>
            )}

            {/* Probability section (ALWAYS VISIBLE) */}
            <div className="bg-slate-800/50 border border-white/5 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-300">Probability</span>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-bold border flex items-center gap-2 ${getProbabilityColor(
                    grid.probability
                  )}`}
                >
                  {getProbabilityIcon(grid.probability)} {grid.probability}% ({getProbabilityLabel(grid.probability)})
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Trend</span>
                <div className="flex items-center gap-1">
                  {grid.trend > 0 ? (
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                  <span className={grid.trend > 0 ? 'text-emerald-300' : 'text-red-300'}>
                    {grid.trend > 0 ? '+' : ''}{grid.trend}%
                  </span>
                </div>
              </div>
              <div className="flex items-start justify-between text-sm">
                <span className="text-slate-400">Reason</span>
                <span className="text-right text-slate-300 text-xs max-w-xs">
                  {grid.reason}
                </span>
              </div>
            </div>

            {/* Bait recommendation (FREE) */}
            <div className="space-y-2">
              <div className="text-sm font-semibold text-slate-300">Bait Recommendation</div>
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                <p className="text-sm text-cyan-100 font-medium">{grid.bait}</p>
              </div>
            </div>

            {/* Premium fields */}
            <div className="space-y-3">
              {/* Quantity Index */}
              <div className="relative">
                <div className="text-sm font-semibold text-slate-300 mb-2">
                  Quantity Index
                </div>
                <div className="p-3 bg-slate-800/50 border border-white/5 rounded-lg relative">
                  <p className="text-sm text-slate-300">{grid.quantity}</p>
                  {userTier === 'free' && (
                    <TierLockOverlay
                      requiredTier="premium"
                      userTier={userTier}
                      onUpgrade={onUpgrade}
                    />
                  )}
                </div>
              </div>

              {/* Depth Range */}
              <div className="relative">
                <div className="text-sm font-semibold text-slate-300 mb-2">
                  Target Depth Range
                </div>
                <div className="p-3 bg-slate-800/50 border border-white/5 rounded-lg relative">
                  <p className="text-sm text-slate-300">{grid.depth}</p>
                  {userTier === 'free' && (
                    <TierLockOverlay
                      requiredTier="premium"
                      userTier={userTier}
                      onUpgrade={onUpgrade}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Ultra fields */}
            <div className="space-y-3">
              {/* Best fishing window */}
              <div className="relative">
                <div className="text-sm font-semibold text-slate-300 mb-2">
                  Optimal Fishing Window
                </div>
                <div className="p-3 bg-slate-800/50 border border-white/5 rounded-lg relative">
                  <p className="text-sm text-slate-300">{grid.best_time}</p>
                  {userTier !== 'ultra' && (
                    <TierLockOverlay
                      requiredTier="ultra"
                      userTier={userTier}
                      onUpgrade={onUpgrade}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Scientific disclaimer */}
            <div className="p-3 bg-slate-900/50 border border-slate-700 rounded-lg">
              <p className="text-xs text-slate-400 leading-relaxed">
                Predictions are habitat-based estimates. Actual catch varies by
                technique, weather, and local conditions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
