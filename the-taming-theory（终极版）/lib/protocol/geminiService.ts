
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { InputModel, JudgmentContent, CopyOutput, VisualOutput, CoachOutput, OutputModel, Run, ValidationError, Scene } from './types';
import { validateCopy, validateVisual } from './validation';
import { mockJudgment, mockCopy, mockVisuals, mockCoach } from './mock';

// Initialize Gemini Client
// The API key is obtained exclusively from the environment variable process.env.API_KEY
// Fix: Use direct named parameter for API key as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Constants
// Fix: Use gemini-3-pro-preview for complex reasoning, creative writing, and deconstruction tasks
const MODEL_NAME = 'gemini-3-pro-preview'; 

// --- RIOT MODE EROSION SYSTEMS ---
const EROSION_SYSTEMS = [
  "Glitch Art / Datamoshing (Digital decay and reality corruption)",
  "Liquid Melting / Dali Surrealism (Melting of state and form)",
  "Fragmentation / Cubism (Shattering of perspectives and geometry)",
  "Negative Film / X-Ray (Internal inversion and skeletal truth)",
  "Thermal Imaging / Predator Vision (Dehumanization and heat maps)",
  "Low-Poly / Wireframe (Reduction to artificial infrastructure)",
  "Junji Ito Spiral Patterns (Inward compulsion and geometric madness)",
  "Satoshi Kon Psychological Anime style (Hallucinatory 2D, fragmented identity)",
  "Ukiyo-e Woodblock Print (Traditional Japanese 2D illustration, flattening of reality)",
  "Cybernetic Manga / Line art style (Futuristic precision and artificiality)",
  "Neon Acid Psychedelia (Over-stimulation and sensory burn)"
];

const getRandomErosionSystem = () => EROSION_SYSTEMS[Math.floor(Math.random() * EROSION_SYSTEMS.length)];

// --- RETRY UTILITY ---

const withRetry = async <T>(
    operation: () => Promise<T>, 
    retries = 2, 
    baseDelay = 1000
): Promise<T> => {
    let lastError: any;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await operation();
        } catch (error: any) {
            lastError = error;
            const msg = (error.message || '').toLowerCase();
            const status = error.status || 0;
            const isRetryable = msg.includes('503') || msg.includes('overloaded') || msg.includes('429') || status === 503 || status === 429;
            
            if (isRetryable && attempt < retries) {
                const jitter = Math.random() * 500;
                const delay = baseDelay * Math.pow(2, attempt) + jitter;
                console.warn(`[Gemini Service] API Busy (503/429). Retrying in ${Math.round(delay)}ms... (Attempt ${attempt + 1}/${retries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            throw error;
        }
    }
    throw lastError;
};

// --- SCHEMAS ---

const JudgmentSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    observedClaim: { type: Type.STRING },
    operationalMechanism: { type: Type.STRING },
    failurePoint: { type: Type.STRING },
    judgmentLock: { type: Type.STRING },
  },
  required: ['observedClaim', 'operationalMechanism', 'failurePoint', 'judgmentLock'],
};

const CopySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    narrativeSpine: { type: Type.STRING },
    resonanceLines: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ['narrativeSpine', 'resonanceLines'],
};

const VisualSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    scenes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.INTEGER },
          enPrompt: { type: Type.STRING },
          zhHint: { type: Type.STRING, nullable: true },
        },
        required: ['id', 'enPrompt'],
      },
    },
  },
  required: ['scenes'],
};

const SingleSceneSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.INTEGER },
    enPrompt: { type: Type.STRING },
    zhHint: { type: Type.STRING, nullable: true },
  },
  required: ['id', 'enPrompt'],
};

const CoachSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    didRight: { type: Type.STRING },
    visualTips: { type: Type.STRING },
    copyTips: { type: Type.STRING },
    avoided: { type: Type.STRING },
    musicVibe: { type: Type.STRING },
  },
  required: ['didRight', 'visualTips', 'copyTips', 'avoided', 'musicVibe'],
};

// --- PROMPTS ---

const getSystemInstruction = (mode: InputModel['mode']) => {
  const base = "You are the content engine for 'The Taming Theory' (驯化论). You must output strictly in JSON format.";
  if (mode === 'HUMAN_SILENCE') {
    return `${base} MODE: HUMAN_SILENCE (人间·默剧). 
    Tone: Introverted, restrained, documentary, sober, detached. 
    Perspective: The Camera Eye. Record reality, do not intervene.
    Visual Style: Fine Art Photography, Atmospheric Realism, Candid, Textural.
    Forbidden: Preaching, theatrical acting, stock photo emotions, surrealism, clichés.`;
  } else {
    return `${base} MODE: MIND_RIOT (颅内·暴走).
    Tone: Extroverted, explosive, ego-driven, surreal, absurdist.
    Philosophy: Subjective tyranny. Chaos is a collision between Order and Erosion.
    Visual Style: Unstable, aggressive, mixed media, visual paradoxes.
    Forbidden: Pure noise without subjects, bland stability, generic aesthetic without thought.`;
  }
};

// --- API CALLS ---

async function runJudgment(input: InputModel): Promise<JudgmentContent> {
  const prompt = `
    Analyze the topic: "${input.topicInput}".
    Intensity: ${input.intensity}/5.
    Output Scale: ${input.outputScale}.
    
    Task: Deconstruct this topic into a structural judgment.
    1. observedClaim: What does the user think this topic is?
    2. operationalMechanism: How does it actually function as a psychological compensation?
    3. failurePoint: Where does this mechanism inevitably fail?
    4. judgmentLock: A single, sharp, final conclusion anchoring the entire theory.
    
    Return JSON only.
  `;

  return withRetry(async () => {
    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
        systemInstruction: getSystemInstruction(input.mode),
        responseMimeType: "application/json",
        responseSchema: JudgmentSchema,
        },
    });
    const json = JSON.parse(response.text || '{}');
    return json as JudgmentContent;
  });
}

async function runCopy(input: InputModel, judgmentLock: string): Promise<{ narrativeSpine: string, resonanceLines: string[] }> {
  const prompt = `
    Context - Judgment Lock: "${judgmentLock}".
    
    Task: Create the Narrative Spine and Resonance Lines.
    
    CRITICAL INSTRUCTION: You MUST explicitly include and restate the core text of the Judgment Lock within the Narrative Spine.
    Implicit binding is NOT allowed.
    
    Structure for 'narrativeSpine' (Strict 3 Sections):
    1. ANCHOR: Restate ONE core condition explicitly from the Judgment Lock.
    2. REALITY: Describe how this condition manifests in reality.
    3. TENSION: Show the consequence or tension implied by this condition.
    
    Constraints for 'resonanceLines':
    - Each line must be conceptually traceable to the Judgment Lock.
    - No generic slogans.
    - Avoid metaphor-only expressions.
    
    Input Constraints: ${input.constraints.join(', ')}.
    Return JSON only.
    `;

  return withRetry(async () => {
    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
        systemInstruction: getSystemInstruction(input.mode),
        responseMimeType: "application/json",
        responseSchema: CopySchema,
        },
    });
    const json = JSON.parse(response.text || '{}');
    return json as { narrativeSpine: string, resonanceLines: string[] };
  });
}

async function runVisual(input: InputModel, judgmentLock: string, narrativeSpine: string): Promise<VisualOutput> {
  const isBilingual = input.visualLang === 'zh_en';
  
  // Dynamic Visual Instruction Construction
  let visualInstruction = "";
  if (input.mode === 'MIND_RIOT') {
      const selectedSystem = getRandomErosionSystem();
      visualInstruction = `
      MODE: MIND_RIOT (颅内·暴走).
      CONCEPT: "The Collision" (Meaningful Chaos). Reality is a subject under attack.
      
      ACTIVE EROSION SYSTEM: "${selectedSystem}"
      
      CRITICAL PROMPT ASSEMBLY SEQUENCE (The Collision):
      1. THE ANCHOR SUBJECT: A hyper-clear, tangible object/person from the Judgment Lock.
      2. THE ACTION OF DISTORTION: How the System attacks the Subject (e.g., "melting into", "exploding into").
      3. THE ART SYSTEM: Use keyword variants of "${selectedSystem}".
      4. THE PHILOSOPHICAL VIBE: Keywords like "Cognitive collapse", "Existential dread".
      
      5. DYNAMIC MODEL ROUTING (IMPORTANT):
         - NIJI-TRIGGER CHECK: If the scene uses keywords like "Anime", "Manga", "Satoshi Kon", "Ghibli", "Cel Shaded", "Illustration", "Ukiyo-e", "Line art", "2D":
           Suffix: "--niji 6 --stylize 250"
         - DEFAULT V-MODEL: Otherwise (Photography, Oil Painting, Glitch, 3D):
           Suffix: "--v 6.0 --stylize 750 --weird 250"
      
      FINAL ASSEMBLY (Comma Separated):
      [Anchor Subject], [Action of Distortion], [Art System], [Vibe], [Suffix Parameters]
      
      Example: "A white birdcage, exploding into binary code fragments, Satoshi Kon Anime style, identity meltdown, --niji 6 --stylize 250"
      
      DO NOT generate random noise. Keep a clear focal point being attacked.
      `;
  } else {
      // HUMAN SILENCE - GOLDEN FORMULA (REMAINS FROZEN)
      const PHOTOGRAPHY_ASSETS = JSON.stringify({
        CAMERAS: ["Hasselblad 500C", "Leica M6", "Canon AE-1", "Arri Alexa Mini"],
        LENSES: ["35mm f/1.4", "50mm f/1.2", "85mm f/1.8"],
        LIGHTING: ["Soft Morning Window Light", "Fluorescent Overhead", "High Contrast/Chiaroscuro", "Direct Flash", "Golden Hour"],
        FILM_STOCKS: ["Kodak Portra 400", "Ilford HP5", "Cinestill 800T", "Fujifilm Pro 400H"]
      });

      visualInstruction = `
      MODE: HUMAN_SILENCE (人间·默剧).
      ROLE: Director of Photography.
      ASSETS: ${PHOTOGRAPHY_ASSETS}
      
      ASSEMBLY: [Subject], [Action & Environment], [Lighting & Color], [Camera & Lens], [Texture/Film Stock] --style raw --stylize [Value] --v 6.0
      Separated by commas. --stylize 250 or 300.
      `;
  }

  const prompt = `
    Context - Judgment Lock: "${judgmentLock}".
    Context - Narrative: "${narrativeSpine.substring(0, 200)}...".
    
    ${visualInstruction}

    Task: Generate exactly 4 scenes (id 1 to 4) representing the progression of the judgment.
    - Scene 1: The Trace (Introduction of the Subject).
    - Scene 2: The Action (Distortion begins).
    - Scene 3: The Crack (System takes over).
    - Scene 4: The Meltdown (Total collision).
    
    VISUAL LANGUAGE SETTING: ${isBilingual ? 'BILINGUAL (ZH_EN)' : 'ENGLISH ONLY'}.
    
    Return JSON only.
  `;

  return withRetry(async () => {
    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
        systemInstruction: getSystemInstruction(input.mode),
        responseMimeType: "application/json",
        responseSchema: VisualSchema,
        },
    });
    const json = JSON.parse(response.text || '{}');
    return {
        scenes: (json.scenes || []).map((s: any) => ({
            id: s.id as 1|2|3|4,
            enPrompt: s.enPrompt,
            zhHint: s.zhHint
        }))
    };
  });
}

async function runSingleScene(input: InputModel, judgmentLock: string, narrativeSpine: string, sceneId: number): Promise<Scene> {
  const isBilingual = input.visualLang === 'zh_en';

  let visualInstruction = "";
  if (input.mode === 'MIND_RIOT') {
      const selectedSystem = getRandomErosionSystem();
      visualInstruction = `
      MODE: MIND_RIOT (颅内·暴走).
      CONCEPT: "The Collision" (Meaningful Chaos).
      ACTIVE SYSTEM: "${selectedSystem}"
      
      DYNAMIC ROUTING:
      - Anime/2D keywords -> --niji 6 --stylize 250
      - Realism/3D/Glitch -> --v 6.0 --stylize 750 --weird 250
      
      ASSEMBLY: [Anchor Subject], [Distortion Action], [Erosion Style], [Vibe], [Suffix]
      `;
  } else {
      // HUMAN SILENCE - GOLDEN FORMULA (REMAINS FROZEN)
      visualInstruction = `
      MODE: HUMAN_SILENCE (人间·默剧).
      ASSEMBLY: [Subject], [Action & Environment], [Lighting & Color], [Camera & Lens], [Texture/Film Stock] --style raw --stylize [Value] --v 6.0
      `;
  }

  const prompt = `
    Context - Judgment Lock: "${judgmentLock}".
    Context - Narrative: "${narrativeSpine.substring(0, 200)}...".
    
    ${visualInstruction}
    
    Task: RE-GENERATE ONLY Scene ${sceneId}.
    
    Return JSON only for this single scene.
  `;

  return withRetry(async () => {
    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
        systemInstruction: getSystemInstruction(input.mode),
        responseMimeType: "application/json",
        responseSchema: SingleSceneSchema,
        },
    });
    const json = JSON.parse(response.text || '{}');
    return {
        id: sceneId as 1|2|3|4,
        enPrompt: json.enPrompt,
        zhHint: json.zhHint
    };
  });
}

async function runCoach(input: InputModel, judgmentLock: string, narrativeSpine: string, scenes: any[]): Promise<CoachOutput> {
  const modeInstruction = input.mode === 'HUMAN_SILENCE' 
    ? `MODE: HUMAN_SILENCE (人间·默剧). 
       Audio Mapping: Ambient, Minimalist Piano, Field Recordings, Cello, Post-Rock (Slow), Lo-fi (No beats).
       Artists: Ryuichi Sakamoto, Max Richter, Brian Eno, Cigarettes After Sex.
       Search Terms: 独处, 胶片感, 氛围感, 纯音乐, 深夜.`
    : `MODE: MIND_RIOT (颅内·暴走).
       Audio Mapping: Phonk, Breakcore, Glitch Hop, Industrial Techno, Distorted Bass, Experimental Noise, Cyberpunk.
       Artists: Death Grips, Aphex Twin, Crystal Castles, Gesaffelstein.
       Search Terms: 压迫感, 故障风, 赛博朋克, 精神状态, 燃点.`;

  const prompt = `
    Analyze the generated content (Judgment, Narrative, Scenes).
    Judgment Lock: "${judgmentLock}"
    Narrative Spine: "${narrativeSpine.substring(0, 150)}..."
    
    Task: Provide a "Coach Log" retrospective (复盘日志) in SIMPLIFIED CHINESE (简体中文).
    Tone: Professional, Director-level insight, analytical.
    
    Fields:
    1. didRight (本次我做对了什么): Analyze how the abstract emotion was successfully objectified/structuralized.
    2. visualTips (可直接借鉴的画面技巧): Specific composition, lighting, or camera technique used to enhance the atmosphere.
    3. copyTips (可直接借鉴的文案技巧): Specific linguistic choice (e.g., using nouns, medical terms) that achieved the "Zero-Degree" or "Riot" style.
    4. avoided (这次我刻意没做的一件事): A specific cliché or cheap emotional trap that was successfully bypassed.
    5. musicVibe (听觉通感推荐):
       ${modeInstruction}
       Output exact format:
       推荐流派：[Genre 1] / [Genre 2]
       BGM 搜索关键词：[Keyword 1], [Keyword 2], [Keyword 3]
       建议听感：[1-2 sentences description based on the specific mood of the judgment]
    
    Return JSON only.
  `;

  return withRetry(async () => {
    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
        systemInstruction: getSystemInstruction(input.mode),
        responseMimeType: "application/json",
        responseSchema: CoachSchema,
        },
    });
    const json = JSON.parse(response.text || '{}');
    return json as CoachOutput;
  });
}

// --- TRANSLATION HELPERS ---

export async function translateJudgment(content: JudgmentContent): Promise<JudgmentContent> {
  const prompt = `
    Task: Translate the following JSON content values into Chinese (Simplified).
    Maintain the exact JSON structure. Do not translate keys. 
    If the value is already Chinese, return it as is or refine it.
    
    Content:
    ${JSON.stringify(content)}
  `;

  return withRetry(async () => {
    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
        responseMimeType: "application/json",
        responseSchema: JudgmentSchema,
        },
    });
    return JSON.parse(response.text || '{}') as JudgmentContent;
  });
}

export async function translateCopy(content: CopyOutput): Promise<CopyOutput> {
  const adapterInput = {
      narrativeSpine: content.narrativeSpine,
      resonanceLines: content.keyLines
  };

  const prompt = `
    Task: Translate the following JSON content values into Chinese (Simplified).
    Maintain the exact JSON structure. Do not translate keys.
    If the value is already Chinese, return it as is or refine it.
    
    Content:
    ${JSON.stringify(adapterInput)}
  `;

  return withRetry(async () => {
    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
        responseMimeType: "application/json",
        responseSchema: CopySchema,
        },
    });
    const json = JSON.parse(response.text || '{}');
    return {
        narrativeSpine: json.narrativeSpine || '',
        keyLines: json.resonanceLines || []
    };
  });
}

// --- ORCHESTRATOR & UTILS ---

export interface PipelineResult {
    run: Run;
    status: 'COMPLETED' | 'FAILED' | 'WARNING'; 
    error?: string;
}

const bundleAndValidate = (
    input: InputModel,
    judgment: JudgmentContent,
    copy: CopyOutput,
    visual: VisualOutput,
    coach: CoachOutput
): PipelineResult => {
    const copyErrors = validateCopy(judgment, copy);
    const copyHasWarning = copyErrors.length > 0;
    
    const visualErrorsRaw = validateVisual(judgment, visual, input.mode, input.visualLang, copyHasWarning);
    
    const visualCritical = visualErrorsRaw.filter(e => !e.startsWith('WARNING:'));
    const visualWarnings = visualErrorsRaw.map(e => e.replace('WARNING: ', ''));

    const failures: ValidationError[] = [];
    let status: 'COMPLETED' | 'FAILED' | 'WARNING' = 'COMPLETED';
    
    if (copyErrors.length > 0) {
        failures.push({ phase: 'copy', reasons: copyErrors });
        status = 'WARNING';
    }

    if (visualCritical.length > 0) {
        failures.push({ phase: 'visual', reasons: visualCritical });
        status = 'FAILED'; 
    } else if (visualErrorsRaw.length > 0) {
        const existingVisualFailure = failures.find(f => f.phase === 'visual');
        if (existingVisualFailure) {
             existingVisualFailure.reasons.push(...visualWarnings);
        } else {
             failures.push({ phase: 'visual', reasons: visualWarnings });
        }
        
        status = 'WARNING';
    }

    const output: OutputModel = {
        judgment: { draft: judgment, confirmed: judgment },
        copy,
        visual,
        coach
    };

    const run: Run = {
        id: Date.now().toString(),
        createdAt: Date.now(),
        status: status === 'FAILED' ? 'FAILED' : 'COMPLETED',
        input,
        output,
        failures
    };

    return { 
        run, 
        status
    };
};

export const runFullPipeline = async (input: InputModel, useMock = false): Promise<PipelineResult> => {
  if (useMock) return runMockPipeline(input);

  const judgmentContent = await runJudgment(input);
  const copyRaw = await runCopy(input, judgmentContent.judgmentLock);
  const copyOutput = { narrativeSpine: copyRaw.narrativeSpine, keyLines: copyRaw.resonanceLines };
  const visualOutput = await runVisual(input, judgmentContent.judgmentLock, copyOutput.narrativeSpine);
  const coachOutput = await runCoach(input, judgmentContent.judgmentLock, copyOutput.narrativeSpine, visualOutput.scenes);

  return bundleAndValidate(input, judgmentContent, copyOutput, visualOutput, coachOutput);
};

export const runPipelineFromCopy = async (input: InputModel, judgment: JudgmentContent): Promise<PipelineResult> => {
    const copyRaw = await runCopy(input, judgment.judgmentLock);
    const copyOutput = { narrativeSpine: copyRaw.narrativeSpine, keyLines: copyRaw.resonanceLines };
    const visualOutput = await runVisual(input, judgment.judgmentLock, copyOutput.narrativeSpine);
    const coachOutput = await runCoach(input, judgment.judgmentLock, copyOutput.narrativeSpine, visualOutput.scenes);
  
    return bundleAndValidate(input, judgment, copyOutput, visualOutput, coachOutput);
};

export const runPipelineFromVisual = async (input: InputModel, judgment: JudgmentContent, copy: CopyOutput): Promise<PipelineResult> => {
    const visualOutput = await runVisual(input, judgment.judgmentLock, copy.narrativeSpine);
    const coachOutput = await runCoach(input, judgment.judgmentLock, copy.narrativeSpine, visualOutput.scenes);
  
    return bundleAndValidate(input, judgment, copy, visualOutput, coachOutput);
};

export const runSceneRegeneration = async (
    input: InputModel, 
    judgment: JudgmentContent, 
    copy: CopyOutput, 
    currentScenes: Scene[],
    sceneId: number
): Promise<PipelineResult> => {
    const newScene = await runSingleScene(input, judgment.judgmentLock, copy.narrativeSpine, sceneId);
    
    const newScenes = currentScenes.map(s => s.id === sceneId ? newScene : s);
    const visualOutput = { scenes: newScenes };
    const coachOutput = await runCoach(input, judgment.judgmentLock, copy.narrativeSpine, newScenes);

    return bundleAndValidate(input, judgment, copy, visualOutput, coachOutput);
};

const runMockPipeline = async (input: InputModel): Promise<PipelineResult> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const judgment = mockJudgment(input);
            const copy = mockCopy(judgment.judgmentLock, input);
            const visualScenes = mockVisuals(judgment.judgmentLock, copy.narrativeSpine, input);
            const visual = { scenes: visualScenes };
            const coach = mockCoach({ judgment: { draft: judgment, confirmed: judgment }, copy, visual, coach: { didRight: '', visualTips: '', copyTips: '', avoided: '', musicVibe: '' } }, input);
            resolve(bundleAndValidate(input, judgment, copy, visual, coach));
        }, 1000);
    });
};
