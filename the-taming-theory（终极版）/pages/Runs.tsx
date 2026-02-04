import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useProtocol } from '../lib/protocol/context';

const Runs: React.FC = () => {
  const { state, dispatch } = useProtocol();
  const navigate = useNavigate();
  const { runs } = state;

  const handleView = (id: string) => {
    dispatch({ type: 'VIEW_RUN', payload: id });
    navigate('/judgment');
  };

  const handleReuseInput = (id: string) => {
    if (window.confirm('将覆盖当前输入，确定吗？')) {
        dispatch({ type: 'REUSE_INPUT', payload: id });
        navigate('/');
    }
  };

  const handleReuseJudgment = (id: string) => {
    if (window.confirm('将使用历史 Judgment 重新开始文案生成，确定吗？')) {
        dispatch({ type: 'REUSE_JUDGMENT', payload: id });
        navigate('/copy');
    }
  };

  const handleDelete = (id: string) => {
      if (window.confirm('Delete this run?')) {
          dispatch({ type: 'DELETE_RUN', payload: id });
      }
  }

  if (runs.length === 0) {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">历史记录 (Runs)</h1>
        <Card className="min-h-[400px] flex items-center justify-center border-dashed bg-transparent">
            <CardContent className="text-center">
                <div className="h-12 w-12 rounded-full bg-surfaceHighlight flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl text-textSecondary">?</span>
                </div>
                <h3 className="text-lg font-medium text-textPrimary">暂无记录</h3>
                <p className="text-textSecondary mt-1 text-sm">执行协议后记录将自动保存在此处</p>
            </CardContent>
        </Card>
        </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
         <h1 className="text-2xl font-bold tracking-tight">历史记录 (Runs)</h1>
         <span className="text-textSecondary text-sm">{runs.length} Records</span>
      </div>
      
      <div className="grid gap-6">
        {runs.map((run) => (
            <Card key={run.id} className="bg-surface border border-border hover:border-border/80 transition-colors">
                <div className="p-6 flex flex-col md:flex-row gap-6">
                    {/* Status & Info */}
                    <div className="w-full md:w-1/4 space-y-4 border-b md:border-b-0 md:border-r border-border pb-4 md:pb-0 md:pr-4">
                        <div className="flex items-center gap-2">
                             <div className={`w-2 h-2 rounded-full ${run.status === 'COMPLETED' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                             <span className="text-sm font-bold tracking-tight">{run.status}</span>
                        </div>
                        <div className="text-xs text-textSecondary space-y-1">
                            <p className="font-mono">{new Date(run.createdAt).toLocaleString()}</p>
                            <Badge variant="secondary" className="mt-2 inline-flex">
                                {run.input.mode === 'HUMAN_SILENCE' ? '人间·默剧' : '颅内·暴走'}
                            </Badge>
                        </div>
                    </div>

                    {/* Content Preview */}
                    <div className="flex-1 space-y-3">
                         <h3 className="text-sm font-bold text-textSecondary uppercase tracking-wider">Input Topic</h3>
                         <p className="text-sm text-textPrimary line-clamp-2 opacity-80">{run.input.topicInput}</p>
                         
                         <h3 className="text-sm font-bold text-textSecondary uppercase tracking-wider pt-2">Judgment Lock</h3>
                         <p className="text-sm font-mono text-gray-400 bg-surfaceHighlight/50 p-2 rounded line-clamp-2">
                             {run.output.judgment.confirmed?.judgmentLock || 'N/A'}
                         </p>
                    </div>

                    {/* Actions */}
                    <div className="w-full md:w-auto flex md:flex-col gap-2 justify-center min-w-[140px]">
                        <Button size="sm" variant="outline" onClick={() => handleView(run.id)}>
                            查看 (View)
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleReuseInput(run.id)}>
                            复用输入
                        </Button>
                        {run.output.judgment.confirmed && (
                             <Button size="sm" variant="ghost" onClick={() => handleReuseJudgment(run.id)}>
                                复用 Judgment
                             </Button>
                        )}
                         <Button size="sm" variant="ghost" className="text-red-900 hover:text-red-500 hover:bg-red-900/10" onClick={() => handleDelete(run.id)}>
                            删除
                         </Button>
                    </div>
                </div>
            </Card>
        ))}
      </div>
    </div>
  );
};

export default Runs;