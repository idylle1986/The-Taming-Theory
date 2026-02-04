import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Textarea';
import { RadioGroup } from '../components/ui/RadioGroup';
import { AccordionItem } from '../components/ui/Accordion';
import { Slider } from '../components/ui/Slider';
import { Badge } from '../components/ui/Badge';
import { useProtocol } from '../lib/protocol/context';
import { InputModel } from '../lib/protocol/types';
import { runFullPipeline } from '../lib/protocol/geminiService';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useProtocol();
  const { input } = state;
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleExecute = async (useMock = false) => {
    if (!input.topicInput.trim()) {
        setError('请输入主题以开始 (Please enter a topic)');
        return;
    }
    setError('');
    setLoading(true);

    try {
        const result = await runFullPipeline(input, useMock);
        dispatch({ type: 'PIPELINE_COMPLETE', payload: result });
        navigate('/judgment');
    } catch (e: any) {
        const msg = e.message || '';
        if (msg.includes('503') || msg.includes('429')) {
             setError("AI Model Overloaded (503/429). Please wait a moment and try again.");
        } else {
             setError(e.message || "Execution Failed");
        }
    } finally {
        setLoading(false);
    }
  };

  const constraintsList = ['更克制', '更锋利', '更荒诞', '更温柔'];

  return (
    <div className="grid lg:grid-cols-12 gap-12 items-start">
      {/* Left Panel: Inputs (Occupies 40%) */}
      <div className="lg:col-span-5 space-y-12 animate-in fade-in slide-in-from-left-8 duration-700">
        <div className="border-l-4 border-white pl-8">
            <h1 className="text-5xl font-black mb-1 uppercase tracking-tighter leading-none">协议启动</h1>
            <p className="text-[11px] font-mono text-textSecondary tracking-[0.4em] uppercase opacity-70">Phase 01: Protocol Initiation</p>
        </div>

        <section className="space-y-8">
          <div className="flex items-center gap-4">
             <span className="font-mono text-[10px] text-white bg-white/10 px-2 py-1">CONFIG_01</span>
             <h2 className="text-[11px] font-bold text-textPrimary uppercase tracking-widest opacity-80">核心模式选择 (Core Operating Mode)</h2>
          </div>
          <RadioGroup
            name="mode"
            value={input.mode}
            onChange={(val) => dispatch({ type: 'SET_MODE', payload: val as InputModel['mode'] })}
            options={[
              {
                value: 'HUMAN_SILENCE',
                label: '人间·默剧 (Human Silence)',
                description: '客观记录、极致剥离、零度情感 (Objective observation, detached realism)'
              },
              {
                value: 'MIND_RIOT',
                label: '颅内·暴走 (Mind Riot)',
                description: '主观暴走、逻辑坍塌、高频重构 (Subjective explosion, high-frequency chaos)'
              }
            ]}
          />
        </section>

        <section className="space-y-8">
          <div className="flex items-center gap-4">
             <span className="font-mono text-[10px] text-white bg-white/10 px-2 py-1">INPUT_STREAM</span>
             <h2 className="text-[11px] font-bold text-textPrimary uppercase tracking-widest opacity-80">定义原始输入 (Data Injection)</h2>
          </div>
          <Textarea 
            value={input.topicInput}
            onChange={(e) => dispatch({ type: 'SET_TOPIC', payload: e.target.value })}
            placeholder="输入你想探索的核心主题、情绪、碎片或具体冲突 (Enter core topic, fragments, or specific conflict)..." 
            className="min-h-[280px] bg-surface/30 border-white/10 focus:border-white/40 transition-all text-lg leading-relaxed glass-card p-6"
          />
          {error && (
            <div className="p-4 bg-red-900/10 border border-red-500/30 rounded-none flex items-center gap-4 animate-in shake duration-300">
               <span className="text-red-500 font-bold">ERR_SIGNAL:</span>
               <p className="text-red-400 text-xs font-mono uppercase tracking-tight">{error}</p>
            </div>
          )}
        </section>

        <section className="space-y-4">
           <AccordionItem title="系统高级调参 (Advanced Systems Override)">
              <div className="space-y-10 pt-6 pb-4 px-2">
                
                <div className="space-y-5">
                  <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest">
                    <span className="text-textSecondary">强度等级 (Deconstruction Intensity)</span>
                    <span className="text-white font-bold">LVL_{input.intensity}</span>
                  </div>
                  <Slider 
                    value={input.intensity} 
                    min={1} 
                    max={5} 
                    step={1} 
                    onChange={(val) => dispatch({ type: 'SET_INTENSITY', payload: val as InputModel['intensity'] })} 
                  />
                </div>

                <div className="grid grid-cols-2 gap-10">
                   <div className="space-y-5">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-textSecondary block">输出规模 (Output Scale)</span>
                      <div className="flex flex-col gap-4">
                        <label className="flex items-center space-x-4 cursor-pointer group">
                          <input 
                            type="radio" 
                            name="scale" 
                            checked={input.outputScale === 'standard'} 
                            onChange={() => dispatch({ type: 'SET_OUTPUT_SCALE', payload: 'standard' })}
                            className="w-4 h-4 accent-white opacity-50 group-hover:opacity-100 transition-opacity"
                          />
                          <span className="text-xs font-bold uppercase tracking-widest group-hover:text-white transition-colors opacity-60 group-hover:opacity-100">Standard</span>
                        </label>
                        <label className="flex items-center space-x-4 cursor-pointer group">
                          <input 
                            type="radio" 
                            name="scale" 
                            checked={input.outputScale === 'enhanced'} 
                            onChange={() => dispatch({ type: 'SET_OUTPUT_SCALE', payload: 'enhanced' })}
                            className="w-4 h-4 accent-white opacity-50 group-hover:opacity-100 transition-opacity"
                          />
                          <span className="text-xs font-bold uppercase tracking-widest group-hover:text-white transition-colors opacity-60 group-hover:opacity-100">Enhanced</span>
                        </label>
                      </div>
                   </div>

                   <div className="space-y-5">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-textSecondary block">画面语言 (Visual Logic)</span>
                      <div className="flex flex-col gap-4">
                        <label className="flex items-center space-x-4 cursor-pointer group">
                          <input 
                            type="radio" 
                            name="lang" 
                            checked={input.visualLang === 'en'}
                            onChange={() => dispatch({ type: 'SET_VISUAL_LANG', payload: 'en' })}
                            className="w-4 h-4 accent-white opacity-50 group-hover:opacity-100 transition-opacity" 
                          />
                          <span className="text-xs font-bold uppercase tracking-widest group-hover:text-white transition-colors opacity-60 group-hover:opacity-100">Global (EN)</span>
                        </label>
                        <label className="flex items-center space-x-4 cursor-pointer group">
                          <input 
                            type="radio" 
                            name="lang"
                            checked={input.visualLang === 'zh_en'}
                            onChange={() => dispatch({ type: 'SET_VISUAL_LANG', payload: 'zh_en' })}
                            className="w-4 h-4 accent-white opacity-50 group-hover:opacity-100 transition-opacity" 
                          />
                          <span className="text-xs font-bold uppercase tracking-widest group-hover:text-white transition-colors opacity-60 group-hover:opacity-100">Bilingual (ZH)</span>
                        </label>
                      </div>
                   </div>
                </div>

                <div className="space-y-5">
                   <span className="text-[10px] font-mono uppercase tracking-widest text-textSecondary block">风格约束 (Constraint Overrides)</span>
                   <div className="flex flex-wrap gap-3">
                      {constraintsList.map((tag) => (
                        <Badge 
                          key={tag} 
                          variant="secondary" 
                          active={input.constraints.includes(tag)}
                          onClick={() => dispatch({ type: 'TOGGLE_CONSTRAINT', payload: tag })}
                          className="px-6 py-2 rounded-none font-bold uppercase tracking-widest text-[10px] border border-white/5"
                        >
                          {tag}
                        </Badge>
                      ))}
                   </div>
                </div>

              </div>
           </AccordionItem>
        </section>

        <div className="pt-10 flex flex-col sm:flex-row items-center gap-8">
          <Button 
            size="lg" 
            className="w-full h-20 bg-white text-black hover:bg-white/90 border-none transition-all shadow-[0_0_40px_rgba(255,255,255,0.15)] active:scale-95 group overflow-hidden relative"
            onClick={() => handleExecute(false)}
            disabled={loading}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            {loading ? (
                <span className="flex items-center gap-4">
                    <span className="animate-spin h-5 w-5 border-3 border-black border-t-transparent rounded-full"></span>
                    <span className="font-black uppercase tracking-[0.3em] text-sm">Processing Pipeline</span>
                </span>
            ) : (
                <span className="flex flex-col items-center leading-none">
                  <span className="text-xl font-black uppercase tracking-[0.2em]">执行协议</span>
                  <span className="text-[10px] font-mono mt-2 opacity-60 uppercase tracking-[0.3em]">Commit to Neural Engine</span>
                </span>
            )}
          </Button>
          <button
             onClick={() => handleExecute(true)}
             disabled={loading}
             className="text-[10px] font-mono text-textSecondary opacity-20 hover:opacity-100 uppercase tracking-[0.4em] transition-all whitespace-nowrap"
          >
             Use Mock Engine
          </button>
        </div>

      </div>

      {/* Right Panel: Summary Dashboard (Occupies 60%) */}
      <div className="lg:col-span-7 mt-12 lg:mt-0 h-full animate-in fade-in slide-in-from-right-8 duration-700">
        <div className="sticky top-28">
          <Card className="h-full bg-surface/10 backdrop-blur-3xl border-white/5 shadow-[0_30px_100px_rgba(0,0,0,0.5)] overflow-hidden glass-card group">
            <div className="absolute top-0 right-0 p-6 font-mono text-[10px] text-textSecondary pointer-events-none opacity-30">
               CORE_ID: {Math.random().toString(36).substring(7).toUpperCase()}
            </div>
            <CardHeader className="border-b border-white/5 px-10 py-8">
              <CardTitle className="text-[11px] uppercase tracking-[0.5em] font-mono text-textSecondary flex items-center gap-3">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                系统预演摘要 (Preview Intelligence Dashboard)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-12">
              <div className="grid md:grid-cols-2 gap-16">
                
                <div className="space-y-12">
                  <div className="space-y-4">
                      <span className="text-[10px] font-mono text-textSecondary uppercase tracking-widest block opacity-60">当前模式 (Operating Context)</span>
                      <p className="text-4xl font-black text-white uppercase tracking-tighter leading-none">
                        {input.mode === 'HUMAN_SILENCE' ? 'Human Silence' : 'Mind Riot'}
                      </p>
                      <p className="text-sm text-textSecondary font-light leading-relaxed mt-4 italic opacity-80">
                        {input.mode === 'HUMAN_SILENCE' 
                          ? 'Zero-degree recording. Strategic detachment. Focus on textural traces and forensic realism. Eliminating subjective noise for pure structural truth.' 
                          : 'Subjective tyranny. Collapse of linear logic. High-frequency sensory reconstruction and digital noise. Forcing reality to collide with internal intent.'}
                      </p>
                  </div>

                  <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-3">
                        <span className="text-[10px] font-mono text-textSecondary uppercase tracking-widest opacity-60">解构力 (Decon_Pwr)</span>
                        <div className="flex gap-1.5 pt-2 h-2">
                          {[1,2,3,4,5].map(i => (
                            <div key={i} className={`flex-1 transition-all duration-500 ${i <= input.intensity ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'bg-white/5'}`}></div>
                          ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <span className="text-[10px] font-mono text-textSecondary uppercase tracking-widest opacity-60">规模 (Output_Scale)</span>
                        <p className="text-sm font-bold uppercase tracking-widest">{input.outputScale}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-12">
                  <div className="space-y-4">
                      <span className="text-[10px] font-mono text-textSecondary uppercase tracking-widest block opacity-60">指令堆栈 (Constraint Stack)</span>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {input.constraints.length > 0 ? input.constraints.map(c => (
                          <span key={c} className="text-[10px] font-bold border border-white/20 text-white px-3 py-1 uppercase tracking-tighter bg-white/5">
                            {c}
                          </span>
                        )) : (
                          <span className="text-[10px] font-mono text-textSecondary uppercase opacity-30 italic">No Overrides Detected</span>
                        )}
                      </div>
                  </div>

                  <div className="space-y-4">
                      <span className="text-[10px] font-mono text-textSecondary uppercase tracking-widest block opacity-60">输入监测 (Data Pulse Monitor)</span>
                      <div className="relative group">
                        <div className="absolute -left-5 top-0 bottom-0 w-[2px] bg-white/10 group-hover:bg-white transition-all duration-700"></div>
                        <p className="text-base text-textPrimary leading-relaxed opacity-80 min-h-[140px] font-light">
                          {input.topicInput || <span className="italic text-textSecondary opacity-20 font-mono tracking-tighter">Waiting for data injection stream...</span>}
                        </p>
                      </div>
                  </div>
                </div>

              </div>

              <div className="mt-24 pt-10 border-t border-white/5 flex justify-between items-end">
                 <div className="space-y-3">
                    <span className="text-[9px] font-mono text-textSecondary uppercase tracking-[0.5em] block opacity-40">System Heartbeat Monitor</span>
                    <div className="flex items-end gap-1 h-12">
                       {Array(24).fill(0).map((_, i) => (
                         <div key={i} className="w-1 bg-white/10 group-hover:bg-white/30 transition-all duration-300" style={{ height: `${20 + Math.random() * 80}%` }}></div>
                       ))}
                    </div>
                 </div>
                 <div className="text-right space-y-1">
                    <span className="text-[9px] font-mono text-textSecondary uppercase tracking-widest block mb-2 opacity-50">Authorized Target Engine</span>
                    <span className="text-sm font-bold text-white uppercase tracking-tighter border-b border-white/20 pb-1">Gemini-3-Pro-Preview Protocol</span>
                    <p className="text-[8px] font-mono text-textSecondary mt-1 opacity-30">ENHANCED REASONING CAPABILITY ACTIVE</p>
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;