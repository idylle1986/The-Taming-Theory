import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useProtocol } from '../lib/protocol/context';
import { Button } from './ui/Button';

const Layout: React.FC = () => {
  const { state, dispatch } = useProtocol();
  const { viewingRunId } = state;

  const navItems = [
    { path: '/', label: '首页' },
    { path: '/judgment', label: '判断关' },
    { path: '/copy', label: '文案关' },
    { path: '/visual', label: '画面板' },
    { path: '/runs', label: '记录' },
  ];

  const handleExitReplay = () => {
      dispatch({ type: 'EXIT_REPLAY' });
  };

  return (
    <div className="min-h-screen bg-background text-textPrimary font-sans flex flex-col selection:bg-white selection:text-black">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="w-full max-w-[95%] xl:max-w-[1800px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-sm flex items-center justify-center text-black font-black rotate-3 hover:rotate-0 transition-transform cursor-pointer">
              T
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xl font-bold tracking-tighter uppercase">驯化论</span>
              <span className="text-[9px] text-textSecondary uppercase tracking-[0.2em] font-mono">Mission Control</span>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-10">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `text-xs font-bold uppercase tracking-widest transition-all hover:text-white relative py-2 ${
                    isActive ? 'text-white after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-white' : 'text-textSecondary'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-4">
             <div className="hidden lg:flex flex-col items-end mr-4">
                <span className="text-[10px] text-textSecondary font-mono uppercase">System Status</span>
                <span className="text-[10px] text-green-500 font-mono animate-pulse uppercase">Active / Online</span>
             </div>
             <div className="md:hidden">
                <span className="text-textSecondary text-xs font-mono">MENU</span>
             </div>
          </div>
        </div>
      </header>

      {/* Replay Mode Banner */}
      {viewingRunId && (
          <div className="bg-blue-600/20 border-b border-blue-500/30 text-blue-200 py-2.5 px-4 text-center text-[10px] font-mono uppercase tracking-widest flex items-center justify-center gap-6 animate-in slide-in-from-top duration-300">
              <span className="flex items-center gap-2"><span className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></span> 🔍 回放模式 (Replay Mode) - 仅供查阅</span>
              <Button size="sm" variant="outline" className="h-6 px-4 text-[9px] bg-blue-500/10 border-blue-500/50 hover:bg-blue-500 text-blue-100" onClick={handleExitReplay}>
                  退出回放
              </Button>
          </div>
      )}

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[95%] xl:max-w-[1800px] mx-auto px-4 py-10">
        <Outlet />
      </main>
      
      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="w-full max-w-[95%] xl:max-w-[1800px] mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-mono text-textSecondary uppercase tracking-widest">
          <p>© 2025 The Taming Theory Protocol. Authorized Personnel Only.</p>
          <div className="flex gap-6">
            <span>Lat: 37.7749° N</span>
            <span>Long: 122.4194° W</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;