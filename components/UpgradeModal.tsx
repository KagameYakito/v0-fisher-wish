'use client';

import { Check, X } from 'lucide-react';
import { UserTier } from '@/lib/mock-data';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: UserTier;
  onSelectTier: (tier: 'premium' | 'ultra') => void;
}

export function UpgradeModal({
  isOpen,
  onClose,
  currentTier,
  onSelectTier,
}: UpgradeModalProps) {
  const tiers = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'Forever',
      description: 'Perfect for getting started',
      features: [
        'Species name & icon',
        'Probability (always visible)',
        'Bait recommendation',
        'Protection status',
        '3x3 Grid map',
      ],
      cta: 'Current Plan',
      ctaVariant: 'disabled' as const,
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$10',
      period: '/month',
      description: 'For serious anglers',
      features: [
        'Everything in Free',
        'Quantity index',
        'Target depth range',
        'Advanced analytics',
        'Email support',
      ],
      cta: 'Upgrade to Premium',
      ctaVariant: (currentTier === 'premium' || currentTier === 'ultra' ? 'disabled' : 'primary') as const,
    },
    {
      id: 'ultra',
      name: 'Ultra',
      price: '$25',
      period: '/month',
      description: 'For trophy hunters',
      features: [
        'Everything in Premium',
        'Optimal fishing windows',
        '3x3 grid recommendations',
        'GPS export',
        'Priority support',
        'Advanced weather overlay',
      ],
      cta: currentTier === 'ultra' ? 'Current Plan' : 'Upgrade to Ultra',
      ctaVariant: (currentTier === 'ultra' ? 'disabled' : 'ultra') as const,
    },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="w-full max-w-4xl bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border border-white/10 shadow-2xl overflow-hidden max-h-96 overflow-y-auto animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div>
              <h2 className="text-2xl font-bold text-slate-100">Choose Your Plan</h2>
              <p className="text-sm text-slate-400 mt-1">
                Unlock advanced fishing predictions
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-lg transition"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Pricing cards */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {tiers.map((tier) => (
                <div
                  key={tier.id}
                  className={`relative border rounded-xl p-6 transition-all ${
                    tier.id === 'ultra'
                      ? 'border-cyan-500/50 bg-gradient-to-b from-cyan-500/10 to-slate-900/50 ring-2 ring-cyan-500/20'
                      : 'border-white/10 bg-slate-800/30 hover:bg-slate-800/50'
                  }`}
                >
                  {tier.id === 'ultra' && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 text-xs font-bold rounded-full">
                        BEST VALUE
                      </span>
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-bold text-slate-100">
                      {tier.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {tier.description}
                    </p>
                  </div>

                  <div className="mt-4 mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-slate-100">
                        {tier.price}
                      </span>
                      <span className="text-sm text-slate-400">
                        {tier.period}
                      </span>
                    </div>
                  </div>

                  {/* Features list */}
                  <ul className="space-y-3 mb-6 text-sm">
                    {tier.features.map((feature, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-slate-300"
                      >
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => {
                      if (
                        tier.ctaVariant === 'primary' ||
                        tier.ctaVariant === 'ultra'
                      ) {
                        onSelectTier(tier.id as 'premium' | 'ultra');
                        onClose();
                      }
                    }}
                    disabled={tier.ctaVariant === 'disabled'}
                    className={`w-full py-2 rounded-lg font-semibold text-sm transition ${
                      tier.ctaVariant === 'disabled'
                        ? 'bg-slate-700/50 text-slate-400 cursor-not-allowed'
                        : tier.ctaVariant === 'ultra'
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 hover:shadow-lg hover:shadow-cyan-500/30'
                          : 'bg-cyan-600 text-slate-950 hover:bg-cyan-500'
                    }`}
                  >
                    {tier.cta}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Footer note */}
          <div className="px-6 py-4 border-t border-white/10 bg-slate-900/50">
            <p className="text-xs text-slate-400 text-center">
              All plans include access to the 3x3 interactive grid map. No credit
              card required to get started.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
