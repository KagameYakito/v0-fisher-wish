'use client';

import { Lock } from 'lucide-react';
import { UserTier } from '@/lib/mock-data';

interface TierLockOverlayProps {
  requiredTier: 'premium' | 'ultra';
  userTier: UserTier;
  onUpgrade: () => void;
}

export function TierLockOverlay({
  requiredTier,
  userTier,
  onUpgrade,
}: TierLockOverlayProps) {
  const tierInfo = {
    premium: { name: 'Premium', price: '$10/mo' },
    ultra: { name: 'Ultra', price: '$25/mo' },
  };

  const info = tierInfo[requiredTier];
  const isLocked =
    (requiredTier === 'premium' && userTier !== 'premium' && userTier !== 'ultra') ||
    (requiredTier === 'ultra' && userTier !== 'ultra');

  if (!isLocked) {
    return null;
  }

  return (
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-lg flex items-center justify-center cursor-pointer group hover:bg-black/50 transition-colors"
      onClick={onUpgrade}>
      <div className="text-center flex flex-col items-center gap-3 px-4">
        <div className="p-2 bg-cyan-500/20 rounded-full group-hover:bg-cyan-500/30 transition-colors">
          <Lock className="w-6 h-6 text-cyan-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-100">{info.name}</p>
          <p className="text-xs text-slate-400">{info.price}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onUpgrade();
          }}
          className="text-xs px-3 py-1 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-semibold rounded transition-colors"
        >
          Upgrade Now
        </button>
      </div>
    </div>
  );
}
