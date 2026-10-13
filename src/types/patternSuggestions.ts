// src/data/patternSuggestions.ts

import type { PatternSuggestion } from './pattern';

export const selectedPatternSuggestions: PatternSuggestion[] = [
  {
    id: 'parachute-adams',
    name: 'Parachute Adams',
    size: '#16',
    description: 'Foam terrestrial lead on foam-indicator rig',
    activity: 'High Activity',
    location: 'Mid-riffle',
    icon: 'flutter',
    badgeVariant: 'primary',
  },
  {
    id: 'pmd',
    name: 'Pale Morning Dun (PMD)',
    size: '#18',
    description: 'Emergence predicted at 1:30 PM along tailouts',
    activity: '1:30 PM Peak',
    location: 'Slack pools',
    icon: 'water',
    badgeVariant: 'secondary',
  },
  {
    id: 'zebra-midge',
    name: 'Tungsten Zebra Midge',
    size: '#20',
    description: `Drop 18" under foam terrestrial; black/silver rib`,
    activity: 'Constant',
    location: 'Benthic feed',
    icon: 'midge',
    badgeVariant: 'dark',
  },
];
