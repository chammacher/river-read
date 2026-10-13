// src/types/pattern.ts

export type PatternIcon = 'flutter' | 'water' | 'midge';

export interface PatternSuggestion {
  id: string;
  name: string;
  size: string;
  description: string;

  activity: string;
  location: string;

  icon: PatternIcon;
  badgeVariant: 'primary' | 'secondary' | 'dark';
}
