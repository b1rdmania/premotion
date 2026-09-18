import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import SplashPage from './pages/SplashPage.jsx';
import IntakeFlow from './pages/IntakeFlow.jsx';
import BriefPage from './pages/BriefPage.jsx';
import DemoList from './pages/DemoList.jsx';
import MobileNotice from './pages/MobileNotice.jsx';

const AppShell = ({ children }) => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (isMobile) return <MobileNotice />;
  return children;
};

// The Render backend was shut down in September 2026. While this is true no
// page calls the API: the intake and live-brief routes go to the example
// briefs, which are static.
const ARCHIVED = true;

const ArchiveStrip = () => (
  <p
    style={{
      position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 1000, margin: 0,
      padding: '8px 16px', background: '#111', color: '#fff', textAlign: 'center',
      fontSize: '13px', lineHeight: 1.4, fontFamily: 'system-ui, sans-serif',
    }}
  >
    This was an experiment. The backend is no longer live, so new cases cannot run.
    The example briefs still work.{' '}
    <a href="https://github.com/b1rdmania/premotion" style={{ color: '#fff' }}>Source on GitHub</a>
  </p>
);

const App = () => {
  if (ARCHIVED) {
    return (
      <>
        <Routes>
          <Route path="/" element={<SplashPage />} />
          <Route path="/demo" element={<DemoList />} />
          <Route path="/demo/:demoId" element={<BriefPage isDemo />} />
          <Route path="/start" element={<Navigate to="/demo" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ArchiveStrip />
      </>
    );
  }
  return (
    <Routes>
      <Route path="/" element={<SplashPage />} />
      <Route path="/start" element={<AppShell><IntakeFlow /></AppShell>} />
      <Route path="/brief/:caseId" element={<AppShell><BriefPage /></AppShell>} />
      {/* Demo routes skip AppShell's mobile gate — shareable for non-technical readers. */}
      <Route path="/demo" element={<DemoList />} />
      <Route path="/demo/:demoId" element={<BriefPage isDemo />} />
      <Route path="/mobile-notice" element={<MobileNotice />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
