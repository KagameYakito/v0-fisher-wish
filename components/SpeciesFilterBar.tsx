'use client';

import { useState } from 'react';
import { SPECIES_CATEGORIES } from '@/lib/mock-data';

interface SpeciesFilterBarProps {
  onFilterChange: (filter: string) => void;
  activeFilter?: string;
}

export function SpeciesFilterBar({
  onFilterChange,
  activeFilter = 'all',
}: SpeciesFilterBarProps) {
  const [selected, setSelected] = useState(activeFilter);

  const handleFilterChange = (filter: string) => {
    setSelected(filter);
    onFilterChange(filter);
  };

  return (
    <div className="w-full bg-gradient-to-b from-slate-950 to-slate-900 border-t border-white/10 p-4">
      <div className="flex gap-2 overflow-x-auto pb-2 px-2 -mx-2">
        {SPECIES_CATEGORIES.map((category) => (
          <button
            key={category.filter}
            onClick={() => handleFilterChange(category.filter)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all duration-200 border flex-shrink-0 ${
              selected === category.filter
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/20'
                : 'bg-slate-800/50 text-slate-300 border-white/10 hover:bg-slate-800 hover:border-white/20'
            }`}
          >
            <span className="text-lg">{category.icon}</span>
            {category.name}
          </button>
        ))}
      </div>
      <div className="text-xs text-slate-400 px-2 mt-2">
        Swipe to filter by species type
      </div>
    </div>
  );
}
