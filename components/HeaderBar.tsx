'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Settings } from 'lucide-react';
import { UserTier } from '@/lib/mock-data';

interface HeaderBarProps {
  userTier: UserTier;
  onSettingsClick: () => void;
  onProfileClick?: () => void;
}

export function HeaderBar({
  userTier,
  onSettingsClick,
  onProfileClick,
}: HeaderBarProps) {
  const [countdown, setCountdown] = useState<string>('14:32');
  const [lastSync, setLastSync] = useState<string>('2m ago');

  useEffect(() => {
    let timeLeft = 14 * 60 + 32; // 14:32 in seconds

    const interval = setInterval(() => {
      timeLeft--;
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      setCountdown(`${minutes}:${seconds.toString().padStart(2, '0')}`);

      if (timeLeft <= 0) {
        timeLeft = 15 * 60; // Reset to 15 minutes
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getTierBadge = () => {
    const tiers = {
      free: { label: 'Free', color: 'bg-slate-700 text-slate-100' },
      premium: { label: 'Premium', color: 'bg-cyan-500/20 text-cyan-300' },
      ultra: { label: 'Ultra', color: 'bg-purple-500/20 text-purple-300' },
    };
    return tiers[userTier];
  };

  const tier = getTierBadge();

  return (
    <div className="w-full bg-gradient-to-b from-slate-950 via-slate-900 to-transparent border-b border-white/10 px-4 py-4">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Top row: Title and tier */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Fishwise</h1>
            <p className="text-xs text-slate-400">Predictive Fishing Guide</p>
          </div>
          <button
            onClick={onSettingsClick}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5 text-slate-400 hover:text-slate-200" />
          </button>
        </div>

        {/* Status badges row */}
        <div className="flex items-center justify-between gap-3">
          {/* Sync countdown */}
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/40 border border-white/5 rounded-lg flex-1 hover:bg-slate-800/60 transition-colors">
            <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
            <div className="text-sm">
              <div className="font-semibold text-slate-100">
                Next update in {countdown}
              </div>
              <div className="text-xs text-slate-400">
                Last synced: {lastSync}
              </div>
            </div>
          </div>

          {/* Tier badge */}
          <div
            className={`px-3 py-2 rounded-lg text-xs font-semibold border border-white/10 ${tier.color}`}
          >
            {tier.label}
          </div>
        </div>
      </div>
    </div>
  );
}
