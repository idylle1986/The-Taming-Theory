import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CopyButton } from '../components/ui/CopyButton';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { useProtocol } from '../lib/protocol/context';
import { translateJudgment } from '../lib/protocol/geminiService';
import { JudgmentContent } from '../lib/protocol/types';

const Judgment: React.FC = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useProtocol();
  const { output, viewingRunId } = state;
  
  const [translation, setTranslation] = useState<JudgmentContent | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [translateError, setTranslateError] = useState<string | null>(null);

  const handleProceed = () => {
    navigate('/copy');
  };

  const handleRegenerate = () => {
    dispatch({ type: 'GENERATE_MOCK_JUDGMENT' });
  };

  const handleTranslate = async () => {
    if (showTranslation) {
        setShowTranslation(false);
        return;
    }
    if (translation) {
        setShowTranslation(true);
        return;
    }
    
    const draft = output.judgment.confirmed || output.judgment.draft;
    if (!draft) return;
    
    setTranslating(true);
    setTranslateError(null);
    try {
        const result = await translateJudgment(draft);
        if (!result) throw new Error("Empty translation result");
        setTranslation(result);
        setShowTranslation(true);
    } catch (e) {
        console.error("Translation failed", e);
        setTranslateError("Translation unavailable. Retry?");
    } finally {
        setTranslating(false);
    }
  };

  const draft = output.judgment.confirmed || output.judgment.draft; // Prioritize confirmed for display

  return (
    <ErrorBoundary fallbackTitle="Page Error">
        <div className="w-full space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
        
        <div className="flex justify-between items-end border-b border-white/10 pb-6">
            <div className="space-y-1">
                <h1 className="text-4xl font-black uppercase tracking-tighter">判断关 (Judgment Gate)</h1>
                <p className="text-[10px] font-mono text-textSecondary uppercase tracking-[0.3em]">Structural Deconstruction & Anchor Locking</p>
            </div>
            {draft && (
                <div className="flex gap-4">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleTranslate} 
                        disabled={translating}
                        className={`h-10 px-6 font-mono text-[10px] uppercase tracking-widest border border-white/10 hover:bg-white hover:text-black ${translateError ? 'text-red-400' : 'text-textSecondary'}`}
                    >
                        {translating ? 'Translating...' : (showTranslation ? 'Hide Original' : (translateError ? 'Retry' : 'Bilingual View'))}
                    </Button>
                </div>
            )}
        </div>

        <div className="grid lg:grid-cols-12 gap-10">
          {/* Main Logic Panel */}
          <Card className="lg:col-span-8 bg-surface/20 border-white/5 backdrop-blur-xl shadow-2xl p-0 overflow-visible">
              <CardContent className="p-12 space-y-16">
              
              {draft ? (
                  <div className="space-y-16">
                      
                      {/* 1. Observed Claim */}
                      <div className="space-y-4 group">
                          <div className="flex items-center gap-4">
                            <span className="text-[10px] font-mono font-bold text-white bg-white/10 px-2 py-0.5">01</span>
                            <span className="text-[10px] font-bold text-textSecondary uppercase tracking-widest">观测主张 (Observed Claim)</span>
                          </div>
                          <div className="pl-10 border-l border-white/5 group-hover:border-white/20 transition-colors">
                            <p className="text-gray-200 text-2xl font-light leading-relaxed tracking-tight">{draft.observedClaim}</p>
                            {showTranslation && translation && (
                                <p className="text-textSecondary italic text-lg mt-4 opacity-60">
                                    {translation.observedClaim}
                                </p>
                            )}
                          </div>
                      </div>

                      {/* 2. Operational Mechanism */}
                      <div className="space-y-4 group">
                          <div className="flex items-center gap-4">
                            <span className="text-[10px] font-mono font-bold text-white bg-white/10 px-2 py-0.5">02</span>
                            <span className="text-[10px] font-bold text-textSecondary uppercase tracking-widest">运作机制 (Operational Mechanism)</span>
                          </div>
                          <div className="pl-10 border-l border-white/5 group-hover:border-white/20 transition-colors">
                            <p className="text-gray-200 text-2xl font-light leading-relaxed tracking-tight">{draft.operationalMechanism}</p>
                            {showTranslation && translation && (
                                <p className="text-textSecondary italic text-lg mt-4 opacity-60">
                                    {translation.operationalMechanism}
                                </p>
                            )}
                          </div>
                      </div>

                      {/* 3. Failure / Tension Point */}
                      <div className="space-y-4 group">
                          <div className="flex items-center gap-4">
                            <span className="text-[10px] font-mono font-bold text-white bg-white/10 px-2 py-0.5">03</span>
                            <span className="text-[10px] font-bold text-textSecondary uppercase tracking-widest">失效 / 张力点 (Failure Point)</span>
                          </div>
                          <div className="pl-10 border-l border-white/5 group-hover:border-white/20 transition-colors">
                            <p className="text-gray-200 text-2xl font-light leading-relaxed tracking-tight">{draft.failurePoint}</p>
                            {showTranslation && translation && (
                                <p className="text-textSecondary italic text-lg mt-4 opacity-60">
                                    {translation.failurePoint}
                                </p>
                            )}
                          </div>
                      </div>

                      {/* 4. Judgment Lock - HUGE HIGHLIGHT */}
                      <div className="relative group">
                          <div className="absolute -inset-4 bg-white/[0.02] border border-white/10 -z-10 rounded-lg group-hover:bg-white/[0.04] transition-all"></div>
                          <div className="space-y-6">
                              <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-4">
                                    <span className="text-[10px] font-mono font-bold bg-white text-black px-2 py-0.5">04</span>
                                    <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">判断锁定 (Judgment Lock)</span>
                                  </div>
                                  <CopyButton 
                                      text={draft.judgmentLock} 
                                      label="COPY ANCHOR" 
                                      size="sm" 
                                      variant="ghost" 
                                      className="h-6 font-mono text-[9px] text-white/40 hover:text-white uppercase"
                                  />
                              </div>
                              <p className="text-white text-4xl font-black leading-tight tracking-tighter uppercase">{draft.judgmentLock}</p>
                              {showTranslation && translation && (
                                  <p className="text-textSecondary italic text-xl mt-4 opacity-70">
                                      {translation.judgmentLock}
                                  </p>
                              )}
                              <div className="flex items-center gap-3 pt-4 opacity-40">
                                  <div className="h-px flex-1 bg-white/20"></div>
                                  <span className="text-[9px] font-mono uppercase tracking-[0.4em]">Mandatory Logic Anchor</span>
                                  <div className="h-px flex-1 bg-white/20"></div>
                              </div>
                          </div>
                      </div>

                  </div>
              ) : (
                  <div className="text-textSecondary italic py-32 text-center flex flex-col items-center gap-6">
                      <div className="w-16 h-16 border-2 border-white/10 border-t-white rounded-full animate-spin"></div>
                      <div className="space-y-1">
                        <p className="text-xl font-bold uppercase tracking-widest text-white/20">System Awaiting Injection</p>
                        <p className="text-xs opacity-50 font-mono">PLEASE EXECUTE PIPELINE FROM MISSION CONTROL</p>
                      </div>
                  </div>
              )}
              </CardContent>
          </Card>

          {/* Sidebar Info Panel */}
          <div className="lg:col-span-4 space-y-8 h-full">
             <Card className="bg-surface/10 border-white/5 p-8 space-y-8">
                <div className="space-y-2">
                    <span className="text-[10px] font-mono text-textSecondary uppercase tracking-widest block">Structural Integrity</span>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="w-[98%] h-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-[10px] font-bold text-white uppercase tracking-widest">Protocol Instructions</h3>
                    <ul className="space-y-4 text-xs text-textSecondary leading-relaxed">
                        <li className="flex gap-4">
                            <span className="font-mono text-white/40">01.</span>
                            <span>Review the deconstructed logic. If the Operational Mechanism aligns with the observed claim, proceed to confirmation.</span>
                        </li>
                        <li className="flex gap-4">
                            <span className="font-mono text-white/40">02.</span>
                            <span>The Judgment Lock acts as the non-negotiable anchor for subsequent content generation.</span>
                        </li>
                        <li className="flex gap-4">
                            <span className="font-mono text-white/40">03.</span>
                            <span>Any deviation in the next phases will be flagged as Structural Drift.</span>
                        </li>
                    </ul>
                </div>
             </Card>

             {!viewingRunId && (
                <div className="flex flex-col gap-4">
                    <Button 
                        variant="primary" 
                        onClick={handleProceed}
                        disabled={!draft}
                        className="w-full h-16 font-black text-lg uppercase tracking-widest"
                    >
                        确认并继续 (Proceed)
                    </Button>
                    <div className="grid grid-cols-2 gap-4">
                        <Button 
                            variant="outline" 
                            onClick={() => navigate('/')}
                            className="h-12 text-[10px] font-bold uppercase tracking-widest border-white/10 hover:bg-white/5"
                        >
                            编辑输入 (Abort/Edit)
                        </Button>
                        <Button 
                            variant="ghost"
                            onClick={handleRegenerate}
                            className="h-12 text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
                        >
                            重新生成 (Regen)
                        </Button>
                    </div>
                </div>
            )}
            
            {viewingRunId && (
                <Button 
                    variant="outline" 
                    onClick={() => navigate('/copy')} 
                    className="w-full h-16 border-blue-500/50 text-blue-400 font-bold uppercase tracking-widest hover:bg-blue-500 hover:text-white"
                >
                    下一阶段：文案 (Next Phase)
                </Button>
            )}
          </div>
        </div>
        </div>
    </ErrorBoundary>
  );
};

export default Judgment;