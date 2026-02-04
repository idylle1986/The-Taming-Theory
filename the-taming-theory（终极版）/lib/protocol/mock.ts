import { InputModel, OutputModel, Scene, JudgmentContent, CopyOutput } from './types';

export const mockJudgment = (input: InputModel): JudgmentContent => {
  const topic = input.topicInput || '未命名主题';
  const isSilence = input.mode === 'HUMAN_SILENCE';

  return {
    observedClaim: `用户主张 "${topic}" 在当前语境下被误读为单纯的${isSilence ? '静止状态' : '混乱宣泄'}。`,
    operationalMechanism: `实际上，它作为一种心理代偿机制在运作：通过${isSilence ? '剥离外部噪音' : '过度放大感官'}来重构个体对现实的掌控感。`,
    failurePoint: `张力在于，这种机制最终会${isSilence ? '因过度的自我封闭而窒息' : '因无序的扩张而解体'}，导致原本追求的平衡彻底失效。`,
    judgmentLock: `结论：${topic}不是${isSilence ? '逃避' : '狂欢'}，而是一种${isSilence ? '濒死的清醒' : '理性的崩溃'}。`
  };
};

export const mockCopy = (judgmentLock: string, input: InputModel): CopyOutput => {
  if (input.topicInput.includes('drift')) {
      return {
          narrativeSpine: "We should all Believe in yourself and look forward to a Better tomorrow. Everything will be fine if you just smile. \n\n(DRIFT SIMULATION: Generic slogan output)",
          keyLines: ["Keep smiling", "Stay positive", "Love yourself"]
      };
  }

  if (!judgmentLock) return { narrativeSpine: '', keyLines: [] };

  const isSilence = input.mode === 'HUMAN_SILENCE';
  const lockFragment = judgmentLock.length > 10 ? judgmentLock.substring(0, 15) + "..." : judgmentLock;

  if (isSilence) {
    const spine = `[人间·默剧 | 观测记录]\n\n基于锚点锁定："${judgmentLock}"\n\n1. 物理痕迹 (Traces):\n我们在日常的切片中观测到了它的存在。它不是某种宏大的概念，而是"${lockFragment}"在物体表面留下的划痕。光线是漫射的，没有强烈的阴影，一切都暴露在一种冷淡的真实中。\n\n2. 行为复现 (Routine):\n机制的运作隐藏在重复的动作里。个体通过看似无意义的微小仪式——反复确认门锁、凝视空白的墙面——来维持这一判断。这是一种安静的抵抗，没有声音，只有动作的惯性。\n\n3. 结构性失效 (Failure):\n然而，静默无法掩盖裂痕。就像那张构图完美的照片中，背景里那个不协调的污点。"${input.topicInput || '主题'}"最终在过度的克制中失去了体温，变成了标本而非生活。`;

    return {
      narrativeSpine: spine,
      keyLines: [
        `[默剧] 它就在那里，像房间里的大象，由于太过明显而被集体无视。`,
        `[默剧] 我们维持着摇摇欲坠的平衡，假装裂痕是装饰纹理。`,
        `[默剧] 真正的崩溃是无声的，就像雪崩前的最后一片雪花。`
      ]
    };
  } else {
    const spine = `[颅内·暴走 | 神经重载]\n\n基于锚点锁定："${judgmentLock}"\n\n1. 感官入侵 (Invasion):\n信号过载。"${lockFragment}"不再是一个观点，它变成了高频的噪音，直接烧灼视神经。现实的轮廓被溶解了，逻辑让位于纯粹的脉冲。我们不再是观测者，我们是被吞噬者。\n\n2. 逻辑扭曲 (Distortion):\n机制在疯狂空转。为了对抗外部的荒谬，内在的世界开始主动坍塌。思维跳跃、断裂、重组，"${input.topicInput || '主题'}"被放大成一种吞没一切的巨物。这不是思考，这是大脑的应激反应。\n\n3. 临界过热 (Overheat):\n张力点被无限拉长，直到崩断。结构无法支撑这种强度的自我指涉。我们在绝对的混乱中寻找秩序，最终发现混乱本身就是唯一的秩序。`;

    return {
      narrativeSpine: spine,
      keyLines: [
        `[暴走] 逻辑已死，感官万岁。脑内的回声震碎了玻璃。`,
        `[暴走] 世界在融化，而我们正站在岩浆中心大笑。`,
        `[暴走] 不要试图理解它，去感受那种被撕裂的快感。`
      ]
    };
  }
};

export const mockVisuals = (judgmentLock: string, narrativeSpine: string, input: InputModel): Scene[] => {
   if (input.topicInput.includes('drift')) {
      const wrongStyle = input.mode === 'HUMAN_SILENCE' 
        ? "cyberpunk, neon, glitch art, surreal monster" 
        : "documentary photography, calm, natural light";
      
      return Array(4).fill(null).map((_, i) => ({
          id: (i + 1) as 1|2|3|4,
          enPrompt: `Generic scene with wrong style: ${wrongStyle}`,
          zhHint: "模拟偏离：风格与模式不符"
      }));
  }

  if (!judgmentLock || !narrativeSpine) return [];

  const isSilence = input.mode === 'HUMAN_SILENCE';
  const scenes: Scene[] = [];
  
  if (isSilence) {
    scenes.push({
      id: 1,
      enPrompt: `Close-up of a hand resting loosely on a wrinkled bedsheet, dust motes dancing in the air casting lace shadows, soft morning window light with warm tones, shot on Canon AE-1 with 50mm f/1.4 lens, warm desaturated film grain, Kodak Portra 400 --style raw --stylize 300 --v 6.0`,
      zhHint: input.visualLang === 'zh_en' ? `[默剧] 场景 1：温柔的静默。利用清晨柔光和床单褶皱的微距细节，表现"允许一切发生"的松弛感。` : undefined
    });
    scenes.push({
      id: 2,
      enPrompt: `A person slumped over a kitchen table with face hidden in arms, a half-eaten apple turning brown in a sterile kitchen, flickering overhead fluorescent light with greenish cast, shot on Leica M6 with 35mm f/1.4 lens, high ISO gritty texture, Ilford HP5 --style raw --stylize 300 --v 6.0`,
      zhHint: input.visualLang === 'zh_en' ? `[默剧] 场景 2：日常的疲惫。通过冷调荧光灯和塌陷的肢体语言，隐喻被生活机制磨损的状态。` : undefined
    });
    scenes.push({
      id: 3,
      enPrompt: `A person standing stiffly in a doorway with back to the camera and hands clenched, broken ceramic pieces on the floor, high contrast chiaroscuro lighting with deep shadows, shot on Arri Alexa Mini handheld, motion blur with claustrophobic framing --style raw --stylize 300 --v 6.0`,
      zhHint: input.visualLang === 'zh_en' ? `[默剧] 场景 3：无声的对峙。利用高对比光影和背影的紧张感，表现压抑的愤怒与冲突。` : undefined
    });
    scenes.push({
      id: 4,
      enPrompt: `A person sitting perfectly symmetrical on a park bench wearing formal wear, an overturned ice cream cone on the ground, direct flash photography with harsh shadows, shot on Hasselblad 500C with deadpan framing, cool detached color grade, Cinestill 800T --style raw --stylize 250 --v 6.0`,
      zhHint: input.visualLang === 'zh_en' ? `[默剧] 场景 4：荒诞的结局。使用直闪和呆板构图，展现一种黑色幽默式的冷静与抽离。` : undefined
    });

  } else {
    // MIND RIOT: Collision Logic + Dynamic Model Routing
    scenes.push({
      id: 1,
      enPrompt: `A classic marble statue of a weeping woman (Subject), being shattered by vibrant neon pink light rays (Action), Satoshi Kon Psychological Anime style (Art System), existential dread, --niji 6 --stylize 250`,
      zhHint: input.visualLang === 'zh_en' ? `[暴走] 场景 1：秩序初裂。采用今敏风格动画质感，表现核心判断对认知的第一次强制入侵。` : undefined
    });
    scenes.push({
      id: 2,
      enPrompt: `A businessman in a sharp grey suit (Subject), melting into a pool of iridescent black oil (Action), Dali Surrealism style (System), cognitive collapse, --v 6.0 --stylize 750 --weird 250`,
      zhHint: input.visualLang === 'zh_en' ? `[暴走] 场景 2：液态坍塌。利用 V6 模型的高风格化表现真实形体在极端意志下的溶解。` : undefined
    });
    scenes.push({
      id: 3,
      enPrompt: `An antique grandfather clock (Subject), exploding into thousands of floating mechanical gears and wireframes (Action), Cybernetic Manga / Line art style (System), time perception failure, --niji 6 --stylize 250`,
      zhHint: input.visualLang === 'zh_en' ? `[暴走] 场景 3：逻辑解体。使用 Niji 模型处理复杂的线条逻辑，表现机械秩序的彻底崩溃。` : undefined
    });
    scenes.push({
      id: 4,
      enPrompt: `A pair of human hands holding a crystal ball (Subject), being consumed by Glitch Art and datamoshing artifacts (Action), digital decay vibe, the end of reality, --v 6.0 --stylize 750 --weird 250`,
      zhHint: input.visualLang === 'zh_en' ? `[暴走] 场景 4：最后的熵增。回归 V6 摄影写实与故障艺术的碰撞，象征主客体边界的彻底消亡。` : undefined
    });
  }

  return scenes;
};

export const mockCoach = (output: OutputModel, input: InputModel) => {
  const isSilence = input.mode === 'HUMAN_SILENCE';
  return {
    didRight: isSilence
      ? "成功将“情绪内耗”物化为“停滞的日常切片”，保持了冷静的纪实底色，完全剥离了自我感动的抒情干扰。"
      : "成功实施了“模型动态路由”策略，针对不同场景风格切换了 Niji 6 与 V 6.0，确保了画面表现力与艺术风格的精确匹配。",
    visualTips: isSilence 
      ? "使用50mm标准镜头的冷眼旁观视角，配合自然光漫射，强调环境对人物的吞噬感。"
      : "在处理 2D/动漫逻辑时切换至 Niji 6 并调低 --stylize 参数，而在处理写实故障艺术时切换至 V 6.0 并调高 --stylize 以获得最大的艺术扭曲。",
    copyTips: isSilence
      ? "大量使用物理/工程名词替代情绪形容词，实现“零度叙事”的疏离感。"
      : "采用破碎的短句与重复的意象叠加，模拟大脑过载时的思维跳跃状态。",
    avoided: isSilence
      ? "坚决拒绝了暖色调的“治愈系”滤镜，维持了现实的粗砺质感。"
      : "避免了用单一模型应付所有风格，防止了“暴走”逻辑退化为平庸的视觉杂讯。",
    musicVibe: isSilence
      ? "推荐流派：Ambient / Minimalist Piano\nBGM 搜索关键词：坂本龙一, 独处, 电影感, 留白\n建议听感：建议使用带有环境白噪音（如风声、电流声）的极简钢琴曲，避免有人声的歌曲，保持疏离感。"
      : "推荐流派：Phonk / Breakcore / Industrial Techno\nBGM 搜索关键词：Death Grips, 压迫感, 故障风, 赛博朋克\n建议听感：选择节奏破碎且带有失真工业噪音的电子乐，通过高频脉冲与视觉上的故障感达成颅内同步。"
  };
};