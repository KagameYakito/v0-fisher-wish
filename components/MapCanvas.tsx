'use client';

import { useState, useEffect } from 'react';
import { MOCK_GRIDS, GridData } from '@/lib/mock-data';
import { SpeciesIcon } from './SpeciesIcon';

interface MapCanvasProps {
  onGridSelect: (grid: GridData) => void;
  selectedGridId?: string;
  filterSpecies?: string;
}

export function MapCanvas({
  onGridSelect,
  selectedGridId,
  filterSpecies = 'all',
}: MapCanvasProps) {
  const [hoveredGrid, setHoveredGrid] = useState<string | null>(null);
  const [displayGrids, setDisplayGrids] = useState<GridData[]>(MOCK_GRIDS);

  useEffect(() => {
    if (filterSpecies === 'all') {
      setDisplayGrids(MOCK_GRIDS);
      return;
    }

    const filtered = MOCK_GRIDS.filter((grid) => {
      switch (filterSpecies) {
        case 'pelagic':
          return grid.icon === 'fish';
        case 'crustacean':
          return grid.icon === 'shrimp';
        case 'cephalopod':
          return grid.icon === 'waves';
        default:
          return true;
      }
    });
    setDisplayGrids(filtered);
  }, [filterSpecies]);

  // Generate H3-style 8x3 hexagonal grid positions
  const getGridPosition = (index: number) => {
    const cols = 8;
    const rows = 3;
    const col = index % cols;
    const row = Math.floor(index / cols);
    
    // H3-style hexagon spacing (responsive sizing)
    // SVG viewBox is 960x400, but scales responsively
    const hexWidth = 110;
    const hexHeight = 130;
    
    // Offset every other row for hexagonal alignment
    const offsetX = (row % 2) * (hexWidth / 2);
    const x = col * hexWidth + offsetX + 40;
    const y = row * hexHeight + 50;
    
    return { x, y };
  };

  const getProbabilityColor = (probability: number) => {
    if (probability < 40) return '#ef4444'; // Red
    if (probability < 70) return '#f59e0b'; // Amber
    return '#10b981'; // Emerald
  };

  const getProbabilityLabel = (probability: number) => {
    if (probability < 40) return 'Low';
    if (probability < 70) return 'Medium';
    return 'High';
  };

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden">
      {/* World Map Background SVG */}
      <svg
        className="absolute inset-0 w-full h-full opacity-30"
        viewBox="0 0 960 600"
        preserveAspectRatio="xMidYMid slice"
        style={{ pointerEvents: 'none' }}
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Simplified world map continents */}
        <g fill="none" stroke="#06b6d4" strokeWidth="1.5" opacity="0.4">
          {/* North America */}
          <path d="M 100 150 L 150 160 L 160 200 L 140 220 L 120 200 Z" />
          {/* South America */}
          <path d="M 140 250 L 160 280 L 155 320 L 135 300 Z" />
          {/* Europe */}
          <path d="M 350 120 L 400 130 L 410 160 L 380 150 Z" />
          {/* Africa */}
          <path d="M 380 180 L 420 190 L 430 280 L 390 290 Z" />
          {/* Asia */}
          <path d="M 450 100 L 550 120 L 560 200 L 480 190 Z" />
          {/* Australia */}
          <path d="M 520 350 L 560 360 L 555 400 L 515 390 Z" />
        </g>

        {/* Ocean current lines */}
        <g stroke="#0ea5e9" strokeWidth="1" opacity="0.2" fill="none" strokeDasharray="5,5">
          <path d="M 200 200 Q 400 150 600 200" />
          <path d="M 300 300 Q 450 400 600 350" />
          <path d="M 100 400 Q 300 500 500 450" />
        </g>
      </svg>

      {/* H3-style Hexagonal Grid Overlay */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: 'none' }}
        viewBox="0 0 960 430"
        preserveAspectRatio="xMidYMid slice"
      >
        {MOCK_GRIDS.map((grid, index) => {
          const { x, y } = getGridPosition(index);
          const isSelected = selectedGridId === grid.grid_id;
          const isHovered = hoveredGrid === grid.grid_id;
          const isVisible = displayGrids.some(g => g.grid_id === grid.grid_id);
          
          if (!isVisible) return null;

          const hexSize = 35;
          const hexPoints = generateHexPoints(x, y, hexSize);

          return (
            <g key={grid.grid_id} opacity={isVisible ? 1 : 0}>
              {/* Hexagon */}
              <polygon
                points={hexPoints}
                fill={`${getProbabilityColor(grid.probability)}08`}
                stroke={getProbabilityColor(grid.probability)}
                strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 1.5}
                opacity={isSelected ? 1 : isHovered ? 0.8 : 0.5}
                style={{
                  transition: 'all 0.3s ease',
                  filter: isSelected
                    ? `drop-shadow(0 0 8px ${getProbabilityColor(grid.probability)})`
                    : isHovered
                    ? `drop-shadow(0 0 4px ${getProbabilityColor(grid.probability)})`
                    : 'none',
                }}
              />
              
              {/* Probability percentage text */}
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="14"
                fontWeight="bold"
                fill={getProbabilityColor(grid.probability)}
                style={{ pointerEvents: 'none' }}
              >
                {grid.probability}%
              </text>
            </g>
          );
        })}
      </svg>

      {/* Interactive overlay buttons */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {MOCK_GRIDS.map((grid, index) => {
          const { x, y } = getGridPosition(index);
          const isVisible = displayGrids.some(g => g.grid_id === grid.grid_id);
          const isSelected = selectedGridId === grid.grid_id;

          if (!isVisible) return null;

          // Scale coordinates for interactive layer
          const interactiveX = (x / 960) * 100;
          const interactiveY = (y / 400) * 100;

          return (
            <button
              key={grid.grid_id}
              onClick={() => onGridSelect(grid)}
              onMouseEnter={() => setHoveredGrid(grid.grid_id)}
              onMouseLeave={() => setHoveredGrid(null)}
              className={`absolute w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 cursor-pointer transition-all duration-300 flex items-center justify-center group ${
                isSelected ? 'scale-125' : hoveredGrid === grid.grid_id ? 'scale-110' : 'scale-100'
              }`}
              style={{
                left: `${interactiveX}%`,
                top: `${interactiveY}%`,
                transform: 'translate(-50%, -50%)',
                background: 'transparent',
                border: 'none',
                pointerEvents: 'auto',
              }}
              aria-label={`${grid.species} - ${grid.probability}% probability`}
            >
              {/* Icon display */}
              <div className={`transition-all ${isSelected || hoveredGrid === grid.grid_id ? 'opacity-100' : 'opacity-60'}`}>
                <SpeciesIcon icon={grid.icon} size={20} className="sm:w-7 sm:h-7 md:w-8 md:h-8" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Info overlay text */}
      <div className="absolute top-4 left-0 right-0 pointer-events-none">
        <div className="text-xs text-slate-400 text-center px-4">
          Tap a hexagon to view detailed predictions
        </div>
      </div>
    </div>
  );
}

function generateHexPoints(
  centerX: number,
  centerY: number,
  size: number
): string {
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i * 60 * Math.PI) / 180;
    const x = centerX + size * Math.cos(angle);
    const y = centerY + size * Math.sin(angle);
    points.push(`${x},${y}`);
  }
  return points.join(' ');
}
