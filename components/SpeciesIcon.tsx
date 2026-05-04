'use client';

import { Fish, Shrimp, Waves } from 'lucide-react';

interface SpeciesIconProps {
  icon: 'fish' | 'shrimp' | 'waves';
  size?: number;
  className?: string;
}

export function SpeciesIcon({ icon, size = 24, className = '' }: SpeciesIconProps) {
  const iconProps = { size, className };

  switch (icon) {
    case 'fish':
      return <Fish {...iconProps} />;
    case 'shrimp':
      return <Shrimp {...iconProps} />;
    case 'waves':
      return <Waves {...iconProps} />;
    default:
      return <Fish {...iconProps} />;
  }
}
