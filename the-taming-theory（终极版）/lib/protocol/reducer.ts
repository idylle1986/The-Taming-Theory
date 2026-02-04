
import { ProtocolState, InputModel, ValidationError, Run, OutputModel } from './types';
import { mockJudgment, mockCopy, mockVisuals, mockCoach } from './mock';
import { validateCopy, validateVisual } from './validation';

export type Action =
  | { type: 'SET_MODE'; payload: InputModel['mode'] }
  | { type: 'SET_TOPIC'; payload: string }
  | { type: 'SET_INTENSITY'; payload: InputModel['intensity'] }
  | { type: 'SET_OUTPUT_SCALE'; payload: InputModel['outputScale'] }
  | { type: 'TOGGLE_CONSTRAINT'; payload: string }
  | { type: 'SET_VISUAL_LANG'; payload: InputModel['visualLang'] }
  | { type: 'GENERATE_MOCK_JUDGMENT' }
  | { type: 'CONFIRM_JUDGMENT' }
  | { type: 'GENERATE_MOCK_COPY' }
  | { type: 'GENERATE_MOCK_VISUALS' }
  | { type: 'GENERATE_MOCK_COACH' }
  | { type: 'RESET_PROTOCOL' }
  | { type: 'LOAD_STATE'; payload: ProtocolState }
  | { type: 'RUN_FULL_PIPELINE' }
  | { type: 'PIPELINE_COMPLETE'; payload: { run: Run, status: 'COMPLETED' | 'FAILED' | 'WARNING' } }
  | { type: 'VIEW_RUN'; payload: string }
  | { type: 'EXIT_REPLAY' }
  | { type: 'REUSE_INPUT'; payload: string }
  | { type: 'REUSE_JUDGMENT'; payload: string }
  | { type: 'DELETE_RUN'; payload: string };

export const initialState: ProtocolState = {
  version: 1,
  input: {
    mode: 'HUMAN_SILENCE',
    topicInput: '',
    intensity: 3,
    outputScale: 'standard',
    constraints: [],
    visualLang: 'en'
  },
  output: {
    judgment: { draft: null, confirmed: null },
    copy: { narrativeSpine: '', keyLines: [] },
    visual: { scenes: [] },
    // Fix: Added missing musicVibe property to match CoachOutput interface
    coach: { didRight: '', visualTips: '', copyTips: '', avoided: '', musicVibe: '' }
  },
  runs: [],
  status: 'ok',
  failures: [],
  viewingRunId: null
};

export const reducer = (state: ProtocolState, action: Action): ProtocolState => {
  switch (action.type) {
    case 'SET_MODE':
      if (state.viewingRunId) return state; // Read-only in replay
      return { ...state, input: { ...state.input, mode: action.payload } };
    case 'SET_TOPIC':
        if (state.viewingRunId) return state;
      return { ...state, input: { ...state.input, topicInput: action.payload } };
    case 'SET_INTENSITY':
        if (state.viewingRunId) return state;
      return { ...state, input: { ...state.input, intensity: action.payload } };
    case 'SET_OUTPUT_SCALE':
        if (state.viewingRunId) return state;
      return { ...state, input: { ...state.input, outputScale: action.payload } };
    case 'TOGGLE_CONSTRAINT': {
      if (state.viewingRunId) return state;
      const tag = action.payload;
      const constraints = state.input.constraints.includes(tag)
        ? state.input.constraints.filter(t => t !== tag)
        : [...state.input.constraints, tag];
      return { ...state, input: { ...state.input, constraints } };
    }
    case 'SET_VISUAL_LANG':
        if (state.viewingRunId) return state;
      return { ...state, input: { ...state.input, visualLang: action.payload } };
    
    // --- MANUAL GENERATION ACTIONS (Legacy/Manual Tweak) ---
    case 'GENERATE_MOCK_JUDGMENT':
      if (state.viewingRunId) return state;
      return {
        ...state,
        status: 'ok',
        failures: [],
        output: {
          ...state.output,
          judgment: {
            ...state.output.judgment,
            draft: mockJudgment(state.input)
          }
        }
      };

    case 'CONFIRM_JUDGMENT':
        if (state.viewingRunId) return state;
      return {
        ...state,
        output: {
          ...state.output,
          judgment: {
            ...state.output.judgment,
            confirmed: state.output.judgment.draft
          }
        }
      };

    case 'GENERATE_MOCK_COPY': {
      if (state.viewingRunId) return state;
      if (!state.output.judgment.confirmed) return state;
      
      const copyOutput = mockCopy(state.output.judgment.confirmed.judgmentLock, state.input);
      const copyErrors = validateCopy(state.output.judgment.confirmed, copyOutput);
      
      let newStatus = state.status;
      let newFailures = state.failures.filter(f => f.phase !== 'copy');

      if (copyErrors.length > 0) {
        newStatus = 'warning';
        newFailures.push({ phase: 'copy', reasons: copyErrors });
      }

      return {
        ...state,
        status: newStatus,
        failures: newFailures,
        output: {
          ...state.output,
          copy: copyOutput
        }
      };
    }

    case 'GENERATE_MOCK_VISUALS': {
      if (state.viewingRunId) return state;
      if (!state.output.judgment.confirmed || !state.output.copy.narrativeSpine) return state;
      
      const visualOutput = {
        scenes: mockVisuals(
          state.output.judgment.confirmed.judgmentLock, 
          state.output.copy.narrativeSpine, 
          state.input
        )
      };

      // Check upstream status
      const copyErrors = validateCopy(state.output.judgment.confirmed, state.output.copy);
      const copyHasWarning = copyErrors.length > 0;

      const visualErrors = validateVisual(
          state.output.judgment.confirmed, 
          visualOutput, 
          state.input.mode,
          state.input.visualLang,
          copyHasWarning
      );
      
      let newStatus = state.status;
      let newFailures = state.failures.filter(f => f.phase !== 'visual');

      if (visualErrors.length > 0) {
        newStatus = 'failed';
        newFailures.push({ phase: 'visual', reasons: visualErrors });
      }

      return {
        ...state,
        status: newStatus,
        failures: newFailures,
        output: {
          ...state.output,
          visual: visualOutput
        }
      };
    }
      
    case 'GENERATE_MOCK_COACH':
        if (state.viewingRunId) return state;
        return {
            ...state,
            output: {
                ...state.output,
                coach: mockCoach(state.output, state.input)
            }
        };

    // --- PIPELINE HANDLER ---
    case 'PIPELINE_COMPLETE': {
        const { run, status } = action.payload;
        // Ingest the completed run into state
        let validationStatus: 'ok' | 'warning' | 'failed' = 'ok';
        if (status === 'WARNING') validationStatus = 'warning';
        if (status === 'FAILED') validationStatus = 'failed';

        return {
            ...state,
            output: run.output,
            status: validationStatus,
            failures: run.failures,
            runs: [run, ...state.runs]
        };
    }

    // Keep legacy action for now, but functionality is largely replaced by PIPELINE_COMPLETE
    case 'RUN_FULL_PIPELINE': {
      if (state.viewingRunId) return state; 
      // This is now purely a placeholder if we use the async service.
      // If used, it defaults to the synchronous mock logic.
      
      const judgmentContent = mockJudgment(state.input);
      const judgmentOutput = { draft: judgmentContent, confirmed: judgmentContent };
      const copyOutput = mockCopy(judgmentContent.judgmentLock, state.input);
      
      const copyErrors = validateCopy(judgmentContent, copyOutput);
      const copyHasWarning = copyErrors.length > 0;

      const visualOutput = {
        scenes: mockVisuals(judgmentContent.judgmentLock, copyOutput.narrativeSpine, state.input)
      };
      
      const visualErrors = validateVisual(
          judgmentContent, 
          visualOutput, 
          state.input.mode,
          state.input.visualLang,
          copyHasWarning
      );

      let status: ProtocolState['status'] = 'ok';
      const failures: ValidationError[] = [];

      if (copyErrors.length > 0) {
        status = 'warning';
        failures.push({ phase: 'copy', reasons: copyErrors });
      }
      if (visualErrors.length > 0) {
        status = 'failed';
        failures.push({ phase: 'visual', reasons: visualErrors });
      }

      const tempOutput: OutputModel = {
          judgment: judgmentOutput,
          copy: copyOutput,
          visual: visualOutput,
          // Fix: Added missing musicVibe property to tempOutput to satisfy OutputModel typing
          coach: { didRight: '', visualTips: '', copyTips: '', avoided: '', musicVibe: '' }
      };
      const coachOutput = mockCoach(tempOutput, state.input);
      const finalOutput: OutputModel = { ...tempOutput, coach: coachOutput };

      const newRun: Run = {
        id: Date.now().toString(),
        createdAt: Date.now(),
        status: status === 'failed' ? 'FAILED' : 'COMPLETED',
        input: { ...state.input },
        output: finalOutput,
        failures: failures
      };

      return {
        ...state,
        status,
        failures,
        output: finalOutput,
        runs: [newRun, ...state.runs]
      };
    }

    case 'VIEW_RUN': {
      const run = state.runs.find(r => r.id === action.payload);
      if (!run) return state;
      return {
        ...state,
        viewingRunId: run.id,
        input: run.input,
        output: run.output,
        status: run.status === 'FAILED' ? 'failed' : (run.failures.length > 0 ? 'warning' : 'ok'),
        failures: run.failures
      };
    }

    case 'EXIT_REPLAY': {
      return {
        ...state,
        viewingRunId: null,
        input: { ...state.input }, 
        output: { ...initialState.output },
        status: 'ok',
        failures: []
      };
    }

    case 'REUSE_INPUT': {
      const run = state.runs.find(r => r.id === action.payload);
      if (!run) return state;
      return {
        ...state,
        viewingRunId: null, 
        input: run.input, 
        output: { ...initialState.output }, 
        status: 'ok',
        failures: []
      };
    }

    case 'REUSE_JUDGMENT': {
      const run = state.runs.find(r => r.id === action.payload);
      if (!run) return state;
      return {
        ...state,
        viewingRunId: null,
        input: run.input,
        output: {
          judgment: run.output.judgment,
          copy: { narrativeSpine: '', keyLines: [] },
          visual: { scenes: [] },
          // Fix: Added missing musicVibe property to reuse case
          coach: { didRight: '', visualTips: '', copyTips: '', avoided: '', musicVibe: '' }
        },
        status: 'ok',
        failures: []
      };
    }
    
    case 'DELETE_RUN':
        return {
            ...state,
            runs: state.runs.filter(r => r.id !== action.payload)
        };

    case 'RESET_PROTOCOL':
        return {
            ...initialState,
            runs: state.runs,
            input: { ...initialState.input, mode: state.input.mode }
        };

    case 'LOAD_STATE':
      return action.payload;

    default:
      return state;
  }
};
