export type Mode = 'HUMAN_SILENCE' | 'MIND_RIOT';

export interface AppState {
  mode: Mode;
  topic: string;
  intensity: number;
  outputScale: 'STANDARD' | 'ENHANCED';
  constraints: string[];
  visualLanguage: 'ENGLISH_MAIN' | 'BILINGUAL';
}