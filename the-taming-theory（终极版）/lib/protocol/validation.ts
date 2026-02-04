import { JudgmentContent, CopyOutput, VisualOutput, InputModel } from './types';

export const validateCopy = (judgment: JudgmentContent, copy: CopyOutput): string[] => {
  const errors: string[] = [];
  
  if (!copy.narrativeSpine || !judgment.judgmentLock) return [];

  // 1. Structural Binding Check (Strict)
  const rawLock = judgment.judgmentLock.replace(/^Conclusion[:：]\s*/i, '').trim();
  const checkFragment = rawLock.substring(0, Math.min(rawLock.length, 6)); 

  if (!copy.narrativeSpine.includes(checkFragment)) {
    errors.push('文案未明确绑定核心判断结构，存在语义漂移风险 (Narrative does not explicitly anchor to Judgment Lock)');
  }

  // 2. Anti-Slogan Check
  const forbiddenPhrases = [
    '相信自己', '明天会更好', 'Just do it', '拥抱未来', '初心', '正能量', 
    'Believe in yourself', 'Better tomorrow'
  ];
  const foundSlogan = forbiddenPhrases.find(phrase => copy.narrativeSpine.includes(phrase));
  if (foundSlogan) {
    errors.push(`风格偏离：检测到被禁止的通用口号 "${foundSlogan}" (Generic slogan detected)`);
  }

  return errors;
};

/**
 * Validates Mode B (Mind Riot) prompts for structural integrity (The Collision Formula).
 * DEPRECATED: Per user request, Mind Riot validation is now permissive to allow creative ambiguity.
 */
const checkChaosStructure = (prompt: string, id: number): string[] => {
  // Logic removed to prevent false positives in Riot mode.
  return [];
};

export const validateVisual = (
  judgment: JudgmentContent, 
  visual: VisualOutput, 
  mode: InputModel['mode'],
  visualLang: InputModel['visualLang'],
  copyHasWarning: boolean = false
): string[] => {
  const errors: string[] = [];

  // 1. Structural Mapping Check
  if (visual.scenes.length !== 4) {
    errors.push('结构错误：场景数量不符合协议要求 (Scene count mismatch)');
  }

  visual.scenes.forEach(scene => {
    const promptWithoutParams = scene.enPrompt.toLowerCase().split('--')[0].trim();
    const lowerPrompt = scene.enPrompt.toLowerCase();

    // Bilingual Output Enforcement
    if (visualLang === 'zh_en') {
        if (!scene.zhHint || scene.zhHint.trim().length < 5) {
            errors.push(`场景 ${scene.id} [中英对照模式] 缺少中文结构解释 (Missing Chinese structural hint in Bilingual mode)`);
        }
    }

    // --- BIFURCATED LOGIC ---

    if (mode === 'HUMAN_SILENCE') {
       // MODE A: Strict Realism Rules (Remains Strict)
       if (promptWithoutParams.length < 30) {
         errors.push(`场景 ${scene.id} 提示词过短，缺乏纪录片细节 (Prompt too short)`);
       }

       // A. HARD BAN: Metaphysical / Subjective / Hallucinatory
       const metaphysicalTerms = [
           'surreal', 'psychedelic', 'dreamscape', 'hallucination', 
           'impossible geometry', 'floating object', 'levitation',
           'melting skin', 'melting reality', 'reality collapse',
           'monster', 'creature', 'conscious entity'
       ];
       
       const foundMetaphysical = metaphysicalTerms.find(term => promptWithoutParams.includes(term));
       if (foundMetaphysical) {
           errors.push(`[默剧模式违规] 检测到形而上/主观幻觉词汇 "${foundMetaphysical}" (Metaphysical forbidden in Silence mode)`);
       }

       // B. CONTEXTUAL CHECK: Anomaly
       const anomalyTerms = ['glitch', 'distortion', 'artifact', 'noise', 'flicker', 'interference', 'static'];
       const foundAnomaly = anomalyTerms.find(term => promptWithoutParams.includes(term));

       if (foundAnomaly) {
           const safeContexts = ['screen', 'monitor', 'tv', 'signal', 'broadcast', 'camera', 'lens', 'film', 'vhs', 'infrastructure', 'machine', 'lamp'];
           const dangerContexts = ['reality', 'mind', 'memory', 'world', 'universe', 'soul', 'consciousness', 'perception', 'sky', 'nature'];

           const hasSafeContext = safeContexts.some(ctx => promptWithoutParams.includes(ctx));
           const hasDangerContext = dangerContexts.some(ctx => promptWithoutParams.includes(ctx));

           if (hasDangerContext) {
                errors.push(`[默剧模式违规] 异常元素 "${foundAnomaly}" 作用于现实而非介质 (Anomaly affecting reality is forbidden)`);
           } else if (!hasSafeContext) {
               errors.push(`WARNING: [默剧模式] 异常元素 "${foundAnomaly}" 缺乏明确的物理介质支撑 (Ambiguous anomaly context)`);
           }
       }

       if (promptWithoutParams.includes('cyberpunk')) {
            errors.push(`[默剧模式违规] 检测到 "Cyberpunk" 风格定义，违背写实纪录片基调`);
       }

    } else if (mode === 'MIND_RIOT') {
        // MODE B: Relaxed Mind Riot Rules (Permissive Mode)
        // Trust the generator. We only block truly empty or non-existent prompts.
        
        if (promptWithoutParams.length < 10) {
          errors.push(`场景 ${scene.id} 提示词内容缺失或过短 (Prompt content insufficient)`);
        }

        // Removed checkChaosStructure to prevent false positives.
        // Removed Model Routing Consistency Check per user request.
        // In Mind Riot, any combination of style and model parameters is an artistic choice.
    }

    // STRICT VALIDATION (Only for escalations)
    if (copyHasWarning && mode === 'HUMAN_SILENCE') {
        if (promptWithoutParams.length < 50) {
             errors.push(`[严格模式] 场景 ${scene.id} 描述过于单薄，无法承载结构风险 (Strict Mode: Prompt too short)`);
        }
    }
  });

  return errors;
};