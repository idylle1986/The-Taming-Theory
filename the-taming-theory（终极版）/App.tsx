import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Judgment from './pages/Judgment';
import Copy from './pages/Copy';
import Visual from './pages/Visual';
import Runs from './pages/Runs';
import { ProtocolProvider } from './lib/protocol/context';

const App: React.FC = () => {
  return (
    <ProtocolProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/judgment" element={<Judgment />} />
            <Route path="/copy" element={<Copy />} />
            <Route path="/visual" element={<Visual />} />
            <Route path="/runs" element={<Runs />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </ProtocolProvider>
  );
};

export default App;