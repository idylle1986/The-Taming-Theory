import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { CopyButton } from '../components/ui/CopyButton';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { useProtocol } from '../lib/protocol/context';
import { runPipelineFromCopy, translateCopy } from '../lib/protocol/geminiService';
import { CopyOutput } from '../lib/protocol/types';

const Copy: React.FC = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useProtocol();
  const { output, input, failures, viewingRunId } = state;
  const [loading, setLoading] = useState(false);
  const [regenError, setRegenError] = useState<string | null>(null);
  
  const [translation, setTranslation] = useState<CopyOutput | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [translateError, setTranslateError] = useState<string | null>(null);

  useEffect(() => {
    // Guard logic handled by components
  }, [output.judgment.confirmed]);

  const handleRegenerate = async () => {
    if (!output.judgment.confirmed) return;
    if (viewingRunId) return;

    if (!window.confirm("重新生成将保留当前的 Judgment Lock，但会完全重写文案和后续画面。确定吗？")) {
        return;
    }

    setLoading(true);
    setRegenError(null);
    setTranslation(null);
    setShowTranslation(false);
    setTranslateError(null);

    try {
        const result = await runPipelineFromCopy(input, output.judgment.confirmed);
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

  const handleTranslate = async () => {
    if (showTranslation) {
        setShowTranslation(false);
        return;
    }
    if (translation) {
        setShowTranslation(true);
        return;
    }
    
    if (!output.copy.narrativeSpine) return;
    
    setTranslating(true);
    setTranslateError(null);
    try {
        const result = await translateCopy(output.copy);
        if (!result || !result.narrativeSpine) {
           throw new Error("Translation returned empty data");
        }
        setTranslation(result);
        setShowTranslation(true);
    } catch (e) {
        console.error("Translation failed", e);
        setTranslateError("Translation service busy (503). Try again later.");
    } finally {
        setTranslating(false);
    }
  };

  const handleProceed = () => {
    navigate('/visual');
  };

  if (!output.judgment.confirmed) {
      return (
          <div className="max-w-md mx-auto text-center pt-20 space-y-4">
              <p className="text-textSecondary">需要先完成判断关确认。</p>
              <Button onClick={() => navigate('/judgment')}>返回判断关</Button>
          </div>
      );
  }

  const isSilence = input.mode === 'HUMAN_SILENCE';
  const copyFailures = failures.find(f => f.phase === 'copy');

  return (
    <ErrorBoundary fallbackTitle="Page Error">
        <div className="w-full space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
        
        <div className="flex flex-col md:flex-row justify-between items-end border-b border-white/10 pb-6 gap-6">
            <div className="space-y-1">
                <div className="flex items-center gap-4">
                  <h1 className="text-4xl font-black uppercase tracking-tighter">文案生成 (Copy Engine)</h1>
                  <Badge variant={isSilence ? 'secondary' : 'default'} className="uppercase text-[9px] tracking-[0.2em] px-3 py-1 bg-white/5 border border-white/10 rounded-none">
                      {isSilence ? 'SILENCE MODE' : 'RIOT MODE'}
                  </Badge>
                </div>
                <p className="text-[10px] font-mono text-textSecondary uppercase tracking-[0.3em]">
                    {isSilence ? 'Forensic Observation / Structural Restoration' : 'Subjective Explosion / Logical Chaos'}
                </p>
            </div>
            
            <div className="flex gap-4 items-center mb-1">
                {output.copy.narrativeSpine && (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleTranslate} 
                        disabled={translating || loading}
                        className={`h-10 px-6 font-mono text-[10px] uppercase tracking-widest border border-white/10 hover:bg-white hover:text-black ${translateError ? 'text-red-400' : 'text-textSecondary'}`}
                    >
                        {translating ? 'Wait...' : (showTranslation ? 'Hide Translation' : 'Bilingual Mode')}
                    </Button>
                )}
                {!viewingRunId && (
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleRegenerate} 
                        disabled={loading}
                        className="h-10 px-6 font-mono text-[10px] uppercase tracking-widest border-white/20 hover:bg-white/5"
                    >
                        {loading ? 'Processing...' : 'Rewrite Copy'}
                    </Button>
                )}
            </div>
        </div>

        {/* API Error Banner */}
        {regenError && (
             <div className="bg-red-600/10 border border-red-500/30 rounded-lg p-6 animate-in zoom-in-95 flex justify-between items-center">
                 <div className="flex items-center gap-6">
                    <span className="text-2xl text-red-500">⚠️</span>
                    <div className="space-y-1">
                        <span className="font-bold block text-red-500 uppercase tracking-widest text-xs">Generation Failure</span>
                        <p className="text-sm text-red-200/70">{regenError}</p>
                    </div>
                 </div>
                 <Button size="sm" variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white" onClick={handleRegenerate}>
                    Retry
                 </Button>
             </div>
        )}

        {/* Structural Drift Warning */}
        {copyFailures && !regenError && (
            <div className="bg-yellow-600/10 border border-yellow-500/30 rounded-lg p-6 animate-in zoom-in-95">
            <div className="flex items-start gap-6">
                <div className="text-2xl text-yellow-500">⚠️</div>
                <div className="space-y-2">
                    <h3 className="font-bold text-yellow-500 text-sm uppercase tracking-widest">结构偏离警告 (Structural Drift Alert)</h3>
                    <ul className="list-disc list-inside text-xs text-yellow-200/70 space-y-1">
                    {copyFailures.reasons.map((reason, i) => (
                        <li key={i}>{reason}</li>
                    ))}
                    </ul>
                    <p className="text-[9px] text-yellow-500/40 uppercase tracking-widest pt-2">
                        * The generated narrative may have disconnected from the Judgment Anchor.
                    </p>
                </div>
            </div>
            </div>
        )}

        <div className={`grid lg:grid-cols-12 gap-10 transition-opacity ${loading ? 'opacity-30 pointer-events-none' : ''}`}>
            
            {/* Narrative Spine Panel (Main View) */}
            <Card className={`lg:col-span-7 h-full bg-surface/20 border-white/5 backdrop-blur-xl shadow-2xl ${copyFailures ? 'border-yellow-500/20' : ''}`}>
                <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 px-8 py-6">
                    <CardTitle className="text-xs uppercase tracking-[0.4em] font-mono text-textSecondary">叙事主干 (Narrative Spine)</CardTitle>
                    <CopyButton 
                        text={output.copy.narrativeSpine} 
                        label="COPY ALL" 
                        size="sm" 
                        variant="ghost" 
                        className="h-6 font-mono text-[9px] text-white/40 hover:text-white uppercase"
                    />
                </CardHeader>
                <CardContent className="p-10 min-h-[500px]">
                    <div className={`prose prose-invert prose-xl max-w-none whitespace-pre-line leading-relaxed ${isSilence ? 'text-gray-300 font-light' : 'text-gray-100 font-medium'}`}>
                    {output.copy.narrativeSpine || <span className="italic opacity-30 animate-pulse font-mono text-sm uppercase">Accessing Core...</span>}
                    </div>
                    {showTranslation && translation && translation.narrativeSpine && (
                        <div className="mt-12 pt-12 border-t border-white/5">
                            <div className="prose prose-invert prose-lg max-w-none whitespace-pre-line text-textSecondary italic leading-relaxed">
                                {translation.narrativeSpine}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Resonance Lines & Anchor Panel (Right) */}
            <div className="lg:col-span-5 space-y-8">
                
                {/* Linked Anchor Display */}
                <Card className="bg-black/40 border-white/10 p-6 space-y-4">
                    <span className="text-[10px] font-mono text-textSecondary uppercase tracking-widest block">Active Anchor (Linked)</span>
                    <p className="text-lg font-black text-white/80 uppercase tracking-tighter line-clamp-2">
                        {output.judgment.confirmed?.judgmentLock}
                    </p>
                </Card>

                <Card className="h-full bg-surface/10 border-white/5">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 px-8 py-6">
                        <CardTitle className="text-xs uppercase tracking-[0.4em] font-mono text-textSecondary">共振金句 (Resonance Lines)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <ul className="space-y-6">
                        {output.copy.keyLines && output.copy.keyLines.length > 0 ? output.copy.keyLines.map((line, i) => (
                            <li key={i} className={`group relative p-6 transition-all ${isSilence ? 'bg-white/[0.02] border-l border-white/10' : 'bg-white/[0.05] border-l-4 border-white shadow-xl'}`}>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="block text-[10px] text-textSecondary font-mono uppercase tracking-widest">Line {i + 1}</span>
                                    <CopyButton 
                                        text={line} 
                                        label="" 
                                        successLabel="✅" 
                                        size="sm" 
                                        variant="ghost" 
                                        className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    />
                                </div>
                                <p className={`text-xl leading-snug tracking-tight ${isSilence ? "text-gray-300 font-light" : "text-white font-bold"}`}>{line}</p>
                                {showTranslation && translation && translation.keyLines && translation.keyLines[i] && (
                                    <p className="text-textSecondary/60 italic text-sm mt-4 border-l border-white/10 pl-4">
                                        {translation.keyLines[i]}
                                    </p>
                                )}
                            </li>
                        )) : (
                            <p className="italic opacity-30 text-xs font-mono py-20 text-center uppercase">Waiting for response...</p>
                        )}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-8 justify-between border-t border-white/10 pt-10 pb-10">
            <Button 
                variant="outline" 
                onClick={() => navigate('/judgment')}
                disabled={loading}
                className="h-14 px-10 font-mono text-[10px] uppercase tracking-widest"
            >
                ← Return to Judgment
            </Button>
            <div className="flex gap-6">
                {copyFailures && !viewingRunId && (
                    <Button variant="ghost" onClick={handleRegenerate} disabled={loading} className="text-yellow-500 font-bold uppercase text-[10px] tracking-widest hover:bg-yellow-500/10">
                        Attempt Recovery
                    </Button>
                )}
                <Button 
                    variant="primary" 
                    onClick={handleProceed}
                    className="h-14 px-16 font-black text-lg uppercase tracking-widest shadow-2xl"
                    disabled={loading}
                >
                    交付画面 (Go to Visual Board)
                </Button>
            </div>
        </div>
        </div>
    </ErrorBoundary>
  );
};

export default Copy;