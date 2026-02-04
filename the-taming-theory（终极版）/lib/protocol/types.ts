export type Mode = 'HUMAN_SILENCE' | 'MIND_RIOT';

export interface InputModel {
  mode: Mode;
  topicInput: string;
  intensity: 1 | 2 | 3 | 4 | 5;
  outputScale: 'standard' | 'enhanced';
  constraints: string[];
  visualLang: 'en' | 'zh_en';
}

export interface JudgmentContent {
  observedClaim: string;
  operationalMechanism: string;
  failurePoint: string;
  judgmentLock: string;
}

export interface JudgmentOutput {
  draft: JudgmentContent | null;
  confirmed: JudgmentContent | null;
}

export interface CopyOutput {
  narrativeSpine: string;
  keyLines: string[];
}

export interface Scene {
  id: 1 | 2 | 3 | 4;
  enPrompt: string;
  zhHint?: string;
}

export interface VisualOutput {
  scenes: Scene[];
}

export interface CoachOutput {
  didRight: string;
  visualTips: string;
  copyTips: string;
  avoided: string;
  musicVibe: string;
}

export interface OutputModel {
  judgment: JudgmentOutput;
  copy: CopyOutput;
  visual: VisualOutput;
  coach: CoachOutput;
}

export type RunStatus = 'COMPLETED' | 'FAILED';

export interface Run {
  id: string;
  createdAt: number; // changed to number for sorting/storage
  status: RunStatus;
  input: InputModel;
  output: OutputModel;
  failures: ValidationError[];
}

export type ValidationStatus = 'ok' | 'warning' | 'failed';

export interface ValidationError {
  phase: 'copy' | 'visual';
  reasons: string[];
}

export interface ProtocolState {
  version: number;
  input: InputModel;
  output: OutputModel;
  runs: Run[];
  status: ValidationStatus;
  failures: ValidationError[];
  viewingRunId: string | null; // ID of the run currently being replayed/inspected
}