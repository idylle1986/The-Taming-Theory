import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { CopyButton } from '../components/ui/CopyButton';
import { useProtocol } from '../lib/protocol/context';
import { runPipelineFromVisual, runSceneRegeneration } from '../lib/protocol/geminiService';

const Visual: React.FC = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useProtocol();
  const { output, input, failures, status, viewingRunId } = state;
  const [loading, setLoading] = useState(false);
  const [regenError, setRegenError] = useState<string | null>(null);
  const [regeneratingSceneId, setRegeneratingSceneId] = useState<number | null>(null);

  useEffect(() => {
  }, [output.copy.narrativeSpine, output.visual.scenes.length, dispatch, viewingRunId]);

  const handleRegenerateAll = async () => {
      if (!output.judgment.confirmed || !output.copy.narrativeSpine) return;
      
      setLoading(true);
      setRegenError(null);
      try {
        const result = await runPipelineFromVisual(input, output.judgment.confirmed, output.copy);
        dispatch({ type: 'PIPELINE_COMPLETE', payload: result });
      } catch (e: any) {
        const msg = e.message || '';
        if (msg.includes('503') || msg.includes('429')) {
             setRegenError("AI Model Overloaded (503). Retries failed. Previous results kept.");
        } else {
             setRegenError("Regeneration failed: " + msg);
        }
      } finally {
        setLoading(false);
      }
  };

  const handleRegenerateScene = async (sceneId: number) => {
      if (!output.judgment.confirmed || !output.copy.narrativeSpine) return;
      
      setRegeneratingSceneId(sceneId);
      setRegenError(null);
      try {
          const result = await runSceneRegeneration(
              input, 
              output.judgment.confirmed, 
              output.copy, 
              output.visual.scenes, 
              sceneId
          );
          dispatch({ type: 'PIPELINE_COMPLETE', payload: result });
      } catch (e: any) {
         console.warn(e);
         const msg = e.message || '';
         if (msg.includes('503')) {
            alert("Single scene regen failed: Model busy (503). Please wait and click retry.");
         } else {
            alert("Scene regen failed: " + msg);
         }
      } finally {
          setRegeneratingSceneId(null);
      }
  };

  const handleExport = () => {
      if (status === 'failed') return;
      if (status === 'warning') {
          if (!window.confirm("当前生成存在结构偏离警告，确定要导出吗？")) return;
      }

      const data = {
          runId: Date.now().toString(),
          timestamp: new Date().toISOString(),
          mode: input.mode,
          judgmentLock: output.judgment.confirmed?.judgmentLock,
          narrativeSpine: output.copy.narrativeSpine,
          visuals: output.visual.scenes,
          coach: output.coach
      };

      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `taming-protocol-${input.mode}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };

  const allPrompts = output.visual.scenes.map(s => `[SCENE ${s.id}]\n${s.enPrompt}`).join('\n\n');

  if (!output.copy.narrativeSpine) {
    return (
        <div className="max-w-md mx-auto text-center pt-20 space-y-4">
            <p className="text-textSecondary">需要先完成文案生成。</p>
            <Button onClick={() => navigate('/copy')}>返回文案关</Button>
        </div>
    );
  }

  const isSilence = input.mode === 'HUMAN_SILENCE';
  const visualFailure = failures.find(f => f.phase === 'visual');
  const copyFailures = failures.find(f => f.phase === 'copy');
  const hasCopyWarning = !!copyFailures;
  const isFailed = status === 'failed';
  const canRegenerateScene = !isSilence && !isFailed && !viewingRunId;

  return (
    <div className="w-full space-y-16 animate-in fade-in slide-in-from-bottom-12 duration-1000">
      
      {/* Cinematic Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-white/10 pb-10 gap-10">
        <div className="space-y-3">
           <div className="flex items-center gap-8">
             <h1 className="text-6xl font-black uppercase tracking-tighter leading-none">画面分镜 (Visual Board)</h1>
             <Badge variant={isSilence ? 'secondary' : 'default'} className="uppercase text-[10px] font-mono tracking-[0.4em] px-6 py-2 bg-white text-black rounded-none shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                {isSilence ? 'Human Silence' : 'Mind Riot'}
             </Badge>
           </div>
           <p className="text-base font-mono text-textSecondary uppercase tracking-[0.5em] opacity-60">
              {isSilence ? 'Forensic Photography / Cinematic Textures / Soft Realism' : 'Chaos Reconstruction / Subjective Invasion / Paradoxical Collision'}
           </p>
        </div>
        <div className="flex gap-4">
            <CopyButton 
                text={allPrompts} 
                label="COPY ALL PROMPTS" 
                successLabel="ALL COPIED ✅" 
                size="sm" 
                variant="outline"
                disabled={output.visual.scenes.length === 0}
                className="h-14 px-10 font-mono text-[10px] uppercase tracking-[0.2em] border-white/10 hover:bg-white hover:text-black transition-all"
            />
            {!viewingRunId && (
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRegenerateAll} 
                    disabled={loading || isFailed}
                    className="h-14 px-10 font-mono text-[10px] uppercase tracking-[0.2em] border-white/10 hover:bg-white/5"
                >
                    {loading ? 'Processing...' : 'Global Repaint'}
                </Button>
            )}
            <Button 
                variant="primary" 
                size="sm" 
                disabled={isFailed} 
                onClick={handleExport}
                className="h-14 px-12 font-black text-xs uppercase tracking-[0.3em] shadow-[0_10px_40px_rgba(0,0,0,0.5)] bg-white text-black hover:bg-white/80"
            >
                Export JSON
            </Button>
        </div>
      </div>

       {/* API Error Banner */}
       {regenError && (
             <div className="bg-red-600/10 border border-red-500/30 rounded-none p-8 flex justify-between items-center animate-in zoom-in-95 glass-card">
                 <div className="flex items-center gap-10">
                    <span className="text-4xl text-red-500 font-bold">!</span>
                    <div className="space-y-2">
                        <span className="font-bold block text-red-500 uppercase tracking-[0.3em] text-[11px]">System Pipeline Stalled</span>
                        <p className="text-base text-red-200/70 font-light">{regenError}</p>
                    </div>
                 </div>
                 <Button size="sm" variant="outline" className="h-12 border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white" onClick={handleRegenerateAll}>
                    RETRY_GLOBAL_SIGNAL
                 </Button>
             </div>
        )}

      {/* Failure Error Banner */}
      {isFailed && visualFailure && !regenError && (
        <div className="bg-red-600/10 border border-red-500/50 rounded-none p-12 flex flex-col md:flex-row gap-12 items-center animate-in zoom-in-95 glass-card">
            <div className="flex-1 space-y-6">
                <div className="flex items-center gap-6">
                    <span className="text-5xl">⛔</span>
                    <h3 className="font-black text-red-500 text-4xl uppercase tracking-tighter">
                        交付拒绝 (Protocol Blockage)
                    </h3>
                </div>
                <div className="text-red-100/70 text-xl space-y-3 pl-16 leading-relaxed font-light">
                    {visualFailure.reasons.map((reason, i) => (
                        <p key={i}>• {reason}</p>
                    ))}
                </div>
                <p className="text-[11px] font-mono text-red-500/40 pl-16 pt-6 uppercase tracking-[0.4em]">
                    CRITICAL FAILURE: STRUCTURAL INTEGRITY BELOW SAFETY THRESHOLD.
                </p>
            </div>
            {!viewingRunId && (
                <div className="flex flex-col gap-4 min-w-[240px]">
                    <Button variant="outline" className="h-14 border-red-800 text-red-400 uppercase tracking-widest text-[10px] font-bold hover:bg-red-900/20" onClick={() => navigate('/judgment')}>
                        Back to Judgment
                    </Button>
                    <Button variant="primary" className="h-16 bg-red-600 hover:bg-red-500 border-none text-white font-black uppercase tracking-[0.2em] shadow-[0_20px_50px_rgba(220,38,38,0.3)]" onClick={handleRegenerateAll}>
                        Force Override
                    </Button>
                </div>
            )}
        </div>
      )}

      {/* 4-Card Wide Grid - Enhanced Spacing */}
      <div className={`grid md:grid-cols-2 xl:grid-cols-4 gap-12 ${isFailed || loading ? 'opacity-20 pointer-events-none' : ''}`}>
        {output.visual.scenes.map((scene) => (
          <Card key={scene.id} className={`flex flex-col h-full bg-surface/10 border-white/5 backdrop-blur-3xl hover:border-white/20 transition-all duration-500 group relative ${!isSilence && 'border-l-8 border-l-white shadow-[0_20px_80px_rgba(0,0,0,0.6)]'}`}>
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
                <div className="flex flex-col">
                    <span className="font-mono text-[11px] font-bold uppercase tracking-[0.4em] text-textSecondary opacity-50 mb-1">Index</span>
                    <span className="font-black text-2xl text-white">0{scene.id}</span>
                </div>
                <div className="flex items-center gap-6">
                    {canRegenerateScene && (
                         <button 
                            className="text-[10px] font-mono text-textSecondary hover:text-white uppercase tracking-[0.3em] transition-all opacity-30 group-hover:opacity-100 underline underline-offset-4"
                            onClick={() => handleRegenerateScene(scene.id)}
                            disabled={!!regeneratingSceneId}
                         >
                            {regeneratingSceneId === scene.id ? 'Repainting...' : 'Repaint'}
                         </button>
                    )}
                    <div className={`h-3 w-3 rounded-full ${isSilence ? 'bg-white/10' : 'bg-white shadow-[0_0_15px_rgba(255,255,255,1)] animate-pulse'}`}></div>
                </div>
            </div>
            <CardContent className="flex-1 p-10 space-y-8">
               <div className="bg-black/80 rounded-none p-6 min-h-[220px] text-sm font-mono text-gray-400 leading-relaxed break-words relative overflow-hidden group border border-white/5">
                 <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                 <span className="block text-[10px] font-bold text-textSecondary uppercase tracking-[0.4em] mb-4 opacity-40">System_Prompt (EN)</span>
                 {scene.enPrompt}
               </div>
               {scene.zhHint && (
                <div className="text-base text-textSecondary font-light leading-relaxed border-l-2 border-white/10 pl-6 italic opacity-70">
                    {scene.zhHint}
                </div>
               )}
            </CardContent>
            <div className="p-10 pt-0 mt-auto">
                <CopyButton 
                    text={scene.enPrompt} 
                    label="COPY_PROMPT" 
                    size="sm" 
                    variant="ghost" 
                    className="w-full h-12 text-[10px] font-mono font-bold uppercase tracking-[0.4em] border border-white/10 hover:bg-white hover:text-black transition-all" 
                />
            </div>
          </Card>
        ))}
        {output.visual.scenes.length === 0 && !loading && (
            <div className="col-span-4 text-center py-60 text-textSecondary flex flex-col items-center gap-10">
                <div className="w-16 h-16 border-4 border-white/5 border-t-white/40 rounded-full animate-spin"></div>
                <span className="text-xs font-mono uppercase tracking-[0.8em] opacity-40">Accessing Visual Core Memory...</span>
            </div>
        )}
      </div>

      {/* Retrospective Dashboard (Coach Log) */}
      <section className={`border-t border-white/10 pt-20 pb-20 ${loading ? 'opacity-20' : ''}`}>
        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-16">
            <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">教练日志 · 深度复盘 (System Retrospective)</h2>
            <div className="h-[2px] flex-1 bg-white/5 hidden md:block"></div>
            <span className="text-[11px] font-mono text-textSecondary uppercase tracking-[0.4em] bg-surfaceHighlight px-4 py-2 border border-white/10">Log_Session: #{viewingRunId ? viewingRunId.slice(-4) : 'CURR'}</span>
        </div>
        
        <div className="grid md:grid-cols-5 gap-12">
            <div className="space-y-6">
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white border-b border-white/10 pb-4">01. 核心正确逻辑</h3>
                <p className="text-base text-textSecondary leading-relaxed font-light opacity-80">{output.coach.didRight || 'Calculating data points...'}</p>
            </div>
            <div className="space-y-6">
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white border-b border-white/10 pb-4">02. 画面借鉴要点</h3>
                <p className="text-base text-textSecondary leading-relaxed font-light opacity-80">{output.coach.visualTips || 'Extracting parameters...'}</p>
            </div>
            <div className="space-y-6">
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white border-b border-white/10 pb-4">03. 文案核心张力</h3>
                <p className="text-base text-textSecondary leading-relaxed font-light opacity-80">{output.coach.copyTips || 'Analyzing semantic load...'}</p>
            </div>
            <div className="space-y-6">
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white border-b border-white/10 pb-4">04. 刻意回避陷阱</h3>
                <p className="text-base text-textSecondary leading-relaxed font-light opacity-80">{output.coach.avoided || 'Scanning for clichés...'}</p>
            </div>
            
            <Card className={`space-y-6 p-10 border-none transition-all shadow-[0_40px_120px_rgba(0,0,0,0.8)] glass-card ${isSilence ? 'bg-blue-600/5 border-blue-500/20' : 'bg-white/5 border-white/10'}`}>
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white">05. 听觉通感推荐</h3>
                    <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></div>
                </div>
                <div className="text-[13px] whitespace-pre-line text-gray-300 font-mono leading-relaxed opacity-90 tracking-tight">
                    {output.coach.musicVibe || 'Synthesizing audio spectrum...'}
                </div>
                <div className="pt-8">
                   <CopyButton 
                        text={output.coach.musicVibe} 
                        label="COPY_MUSIC_SPECS" 
                        size="sm" 
                        variant="ghost" 
                        className="h-10 text-[10px] w-full border border-white/10 hover:bg-white hover:text-black font-mono uppercase tracking-[0.3em] transition-all"
                    />
                </div>
            </Card>
        </div>
      </section>

      {/* Navigation Footer */}
      <div className="flex justify-start pt-12 pb-24 border-t border-white/5">
        <Button 
          variant="outline" 
          onClick={() => navigate('/copy')}
          className="h-16 px-12 font-mono text-[11px] font-bold uppercase tracking-[0.4em] border-white/10 hover:bg-white/5"
        >
          ← Return to Semantic Layer
        </Button>
      </div>
    </div>
  );
};

export default Visual;