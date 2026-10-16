import type { FlyPattern } from '../types/fly';

export const flyPatterns: FlyPattern[] = [
  {
    id: 'parachute-adams',

    name: 'Parachute Adams',

    category: 'bwo',

    type: 'dry',

    sizes: ['16', '18', '20'],

    regions: ['rockies', 'upperMidwest', 'northeast', 'appalachia'],

    seasons: ['earlySpring', 'lateSpring', 'earlyFall', 'lateFall'],

    colors: ['natural', 'gray'] as any,

    description: 'Versatile mayfly dry for rising trout.',
  },

  {
    id: 'scud',

    name: 'Scud',

    category: 'scud',

    type: 'nymph',

    sizes: ['12', '14', '16', '18'],

    regions: ['upperMidwest', 'rockies', 'northeast'],

    seasons: [
      'winter',
      'earlySpring',
      'lateSpring',
      'earlySummer',
      'lateSummer',
      'earlyFall',
      'lateFall',
    ],

    colors: ['olive', 'natural', 'pink', 'orange'],

    description:
      'Reliable subsurface scud imitation for spring creeks and productive trout water.',
  },

  {
    id: 'zebra-midge',

    name: 'Zebra Midge',

    category: 'midge',

    type: 'nymph',

    sizes: ['18', '20', '22'],

    regions: [
      'rockies',
      'pacificNorthwest',
      'upperMidwest',
      'northeast',
      'appalachia',
    ],

    seasons: ['winter', 'earlySpring', 'lateFall'],

    colors: ['black', 'red'],

    description: 'Reliable midge larva or pupa imitation.',
  },

  {
    id: 'san-juan-worm',

    name: 'San Juan Worm',

    category: 'worm',

    type: 'nymph',

    sizes: ['10', '12', '14'],

    regions: [
      'rockies',
      'pacificNorthwest',
      'upperMidwest',
      'northeast',
      'appalachia',
    ],

    seasons: [
      'winter',
      'earlySpring',
      'lateSpring',
      'earlySummer',
      'lateSummer',
      'earlyFall',
      'lateFall',
    ],

    colors: ['pink', 'red', 'orange'],

    description: 'Strong runoff and stained-water pattern.',
  },

  {
    id: 'squirmy-worm',

    name: 'Squirmy Worm',

    category: 'worm',

    type: 'nymph',

    sizes: ['10', '12', '14'],

    regions: [
      'rockies',
      'pacificNorthwest',
      'upperMidwest',
      'northeast',
      'appalachia',
    ],

    seasons: [
      'earlySpring',
      'lateSpring',
      'earlySummer',
      'lateSummer',
      'earlyFall',
      'lateFall',
    ],

    colors: ['pink', 'red', 'orange'],

    description:
      'High-visibility option after rain or during stained conditions.',
  },

  {
    id: 'woolly-bugger',

    name: 'Woolly Bugger',

    category: 'streamer',

    type: 'streamer',

    sizes: ['6', '8', '10'],

    regions: [
      'rockies',
      'pacificNorthwest',
      'upperMidwest',
      'northeast',
      'appalachia',
    ],

    seasons: [
      'winter',
      'earlySpring',
      'lateSpring',
      'earlySummer',
      'lateSummer',
      'earlyFall',
      'lateFall',
    ],

    colors: ['black', 'olive', 'brown', 'white'],

    description:
      'General-purpose streamer for aggressive or opportunistic trout.',
  },
];
