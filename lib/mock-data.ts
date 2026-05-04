export interface GridData {
  grid_id: string;
  lat: number;
  lon: number;
  species: string;
  icon: 'fish' | 'shrimp' | 'waves';
  probability: number;
  trend: number;
  reason: string;
  bait: string;
  status: 'normal' | 'protected';
  quantity: string;
  depth: string;
  best_time: string;
}

export const MOCK_GRIDS: GridData[] = [
  {
    grid_id: '8a2b3c4d5e6f',
    lat: -6.12,
    lon: 106.45,
    species: 'Tongkol',
    icon: 'fish',
    probability: 84,
    trend: 12,
    reason: 'Light rain + falling pressure',
    bait: 'Small squid / 20g Jig',
    status: 'normal',
    quantity: '100–500',
    depth: '15–40m',
    best_time: '05:12–07:45 & 16:20–18:10',
  },
  {
    grid_id: '8a2b3c4d5e70',
    lat: -6.13,
    lon: 106.46,
    species: 'Kakap Merah',
    icon: 'fish',
    probability: 38,
    trend: -5,
    reason: 'High wind + SST outside optimal range',
    bait: 'Live shrimp / Bottom rig',
    status: 'protected',
    quantity: '50–200',
    depth: '10–30m',
    best_time: 'N/A (Spawning Season)',
  },
  {
    grid_id: '8a2b3c4d5e71',
    lat: -6.11,
    lon: 106.44,
    species: 'Lobster',
    icon: 'shrimp',
    probability: 65,
    trend: 8,
    reason: 'Incoming tide + clear visibility',
    bait: 'Cut bait / Hand net at night',
    status: 'normal',
    quantity: '10–30',
    depth: '5–15m',
    best_time: '20:00–23:30 (Low light)',
  },
  {
    grid_id: '8a2b3c4d5e72',
    lat: -6.14,
    lon: 106.44,
    species: 'Tuna',
    icon: 'fish',
    probability: 72,
    trend: 6,
    reason: 'Optimal temp + good visibility',
    bait: 'Live mackerel / Popper',
    status: 'normal',
    quantity: '5–15',
    depth: '30–60m',
    best_time: '06:00–09:30 & 15:00–18:00',
  },
  {
    grid_id: '8a2b3c4d5e73',
    lat: -6.10,
    lon: 106.46,
    species: 'Crab',
    icon: 'shrimp',
    probability: 45,
    trend: -2,
    reason: 'Moderate current + clear water',
    bait: 'Squid / Trap net',
    status: 'normal',
    quantity: '20–50',
    depth: '3–12m',
    best_time: '21:00–23:00 (Nocturnal)',
  },
  {
    grid_id: '8a2b3c4d5e74',
    lat: -6.15,
    lon: 106.45,
    species: 'Grouper',
    icon: 'fish',
    probability: 92,
    trend: 18,
    reason: 'Perfect conditions + rising tide',
    bait: 'Live mullet / Rock cover',
    status: 'normal',
    quantity: '3–8',
    depth: '10–25m',
    best_time: '07:00–10:00 & 16:30–19:00',
  },
  {
    grid_id: '8a2b3c4d5e75',
    lat: -6.11,
    lon: 106.47,
    species: 'Squid',
    icon: 'waves',
    probability: 58,
    trend: 3,
    reason: 'Mild current + low light hours',
    bait: 'Jig / Artificial lure',
    status: 'normal',
    quantity: '50–150',
    depth: '8–20m',
    best_time: '05:00–08:00 & 18:00–21:00',
  },
  {
    grid_id: '8a2b3c4d5e76',
    lat: -6.13,
    lon: 106.43,
    species: 'Snapper',
    icon: 'fish',
    probability: 34,
    trend: -8,
    reason: 'High turbidity + adverse pressure',
    bait: 'Live shrimp / Cut bait',
    status: 'normal',
    quantity: '30–80',
    depth: '12–35m',
    best_time: '06:30–09:00 & 16:00–18:30',
  },
  {
    grid_id: '8a2b3c4d5e77',
    lat: -6.12,
    lon: 106.47,
    species: 'Mackerel',
    icon: 'fish',
    probability: 76,
    trend: 14,
    reason: 'Strong current + clear conditions',
    bait: 'Small fish / Spinner',
    status: 'normal',
    quantity: '30–100',
    depth: '5–20m',
    best_time: '05:30–08:30 & 17:00–19:30',
  },
];

export const SPECIES_CATEGORIES = [
  { name: 'All', icon: 'fish', filter: 'all' },
  { name: 'Pelagic', icon: 'fish', filter: 'pelagic' },
  { name: 'Crustacean', icon: 'shrimp', filter: 'crustacean' },
  { name: 'Cephalopod', icon: 'waves', filter: 'cephalopod' },
];

export type UserTier = 'free' | 'premium' | 'ultra';

export interface UserProfile {
  tier: UserTier;
  subscription_status: 'active' | 'inactive';
  last_updated: string;
}
