'use client';

import { useState, useEffect } from 'react';
import { MOCK_GRIDS, GridData } from '@/lib/mock-data';

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
          return ['🐠', '🐟'].includes(grid.icon);
        case 'crustacean':
          return grid.icon === '🦀';
        case 'cephalopod':
          return grid.icon === '🦑';
        default:
          return true;
      }
    });
    setDisplayGrids(filtered);
  }, [filterSpecies]);

  // Create 3x3 hexagonal grid positions (simplified grid layout)
  const getGridPosition = (index: number) => {
    const col = index % 3;
    const row = Math.floor(index / 3);
    const offsetX = col * 140 + (row % 2) * 70;
    const offsetY = row * 120;
    return { x: offsetX, y: offsetY };
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
    <div className="relative w-full h-full bg-gradient-to-b from-slate-900 via-slate-950 to-black overflow-hidden">
      {/* Animated background grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(0deg, transparent 24%, rgba(6, 182, 212, .05) 25%, rgba(6, 182, 212, .05) 26%, transparent 27%, transparent 74%, rgba(6, 182, 212, .05) 75%, rgba(6, 182, 212, .05) 76%, transparent 77%, transparent),
              linear-gradient(90deg, transparent 24%, rgba(6, 182, 212, .05) 25%, rgba(6, 182, 212, .05) 26%, transparent 27%, transparent 74%, rgba(6, 182, 212, .05) 75%, rgba(6, 182, 212, .05) 76%, transparent 77%, transparent)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* SVG for hexagonal grid */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: 'none' }}
        viewBox="0 0 800 700"
        preserveAspectRatio="xMidYMid slice"
      >
        {displayGrids.map((grid, index) => {
          const { x, y } = getGridPosition(index);
          const isSelected = selectedGridId === grid.grid_id;
          const isHovered = hoveredGrid === grid.grid_id;
          const hexSize = 50;
          const hexPoints = generateHexPoints(x + 400, y + 100, hexSize);

          return (
            <g key={grid.grid_id}>
              {/* Hexagon border */}
              <polygon
                points={hexPoints}
                fill={`${getProbabilityColor(grid.probability)}15`}
                stroke={getProbabilityColor(grid.probability)}
                strokeWidth={isSelected ? '3' : isHovered ? '2' : '1.5'}
                opacity={isSelected ? 1 : isHovered ? 0.8 : 0.6}
                style={{
                  transition: 'all 0.3s ease',
                  filter: isSelected
                    ? `drop-shadow(0 0 12px ${getProbabilityColor(grid.probability)})`
                    : 'none',
                }}
              />
              {/* Species icon */}
              <text
                x={x + 400}
                y={y + 120}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="28"
                style={{ pointerEvents: 'none' }}
              >
                {grid.icon}
              </text>
              {/* Probability text */}
              <text
                x={x + 400}
                y={y + 155}
                textAnchor="middle"
                fontSize="12"
                fill="#f1f5f9"
                style={{ pointerEvents: 'none' }}
              >
                {grid.probability}%
              </text>
            </g>
          );
        })}
      </svg>

      {/* Interactive overlay hexagons (for click detection) */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {displayGrids.map((grid, index) => {
          const { x, y } = getGridPosition(index);
          const isSelected = selectedGridId === grid.grid_id;

          return (
            <button
              key={grid.grid_id}
              onClick={() => onGridSelect(grid)}
              onMouseEnter={() => setHoveredGrid(grid.grid_id)}
              onMouseLeave={() => setHoveredGrid(null)}
              className={`absolute w-24 h-24 rounded-full cursor-pointer transition-all duration-300 ${
                isSelected ? 'scale-125' : hoveredGrid === grid.grid_id ? 'scale-110' : 'scale-100'
              }`}
              style={{
                left: `calc(50% + ${x - 280}px)`,
                top: `calc(50% + ${y - 100}px)`,
                transform: `translate(-50%, -50%)`,
                background: 'transparent',
                border: 'none',
                pointerEvents: 'auto',
              }}
              aria-label={`${grid.species} - ${grid.probability}% probability`}
            />
          );
        })}
      </div>

      {/* Info overlay text */}
      <div className="absolute top-0 left-0 right-0 p-4 pointer-events-none">
        <div className="text-xs text-slate-400 text-center">
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
