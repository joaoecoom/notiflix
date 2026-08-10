import { useState } from 'react';
import { MobileCanvas } from './components/mobile/MobileCanvas';
import { StatusBar } from './components/mobile/StatusBar';
import { BottomNav } from './components/mobile/BottomNav';
import { HomeIndicator } from './components/mobile/HomeIndicator';
import { IPhoneLockScreen, useSimulationLoop } from './components/mobile/IPhoneLockScreen';
import { ControlPanel } from './components/editor/ControlPanel';
import { TimelineEditor } from './components/editor/TimelineEditor';
import { BulkGeneratorPanel } from './components/editor/BulkGenerator';
import { StripeTemplate } from './templates/stripe/StripeTemplate';
import { useSimulationStore } from './store/simulationStore';
import styles from './App.module.css';

function App() {
  useSimulationLoop();
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);

  const viewMode = useSimulationStore((s) => s.viewMode);

  return (
    <div className={styles.app}>
      <aside className={styles.sidebar}>
        <header className={styles.sidebarHeader}>
          <h1 className={styles.logo}>NotiFlix</h1>
          <span className={styles.badge}>Prototype</span>
        </header>

        <ControlPanel />

        <div className={styles.divider} />

        <TimelineEditor />

        <div className={styles.divider} />

        <BulkGeneratorPanel />
      </aside>

      <main className={styles.preview}>
        <MobileCanvas showFrame={viewMode === 'stripe'}>
          {viewMode === 'iphone' ? (
            <IPhoneLockScreen />
          ) : (
            <>
              <StatusBar />
              <StripeTemplate />
              <BottomNav />
              <HomeIndicator />
            </>
          )}
        </MobileCanvas>

        <button
          className={styles.mobileFab}
          onClick={() => setMobilePanelOpen(true)}
          aria-label="Controlos"
        >
          ⚙
        </button>
      </main>

      {mobilePanelOpen && (
        <div className={styles.mobileOverlay} onClick={() => setMobilePanelOpen(false)}>
          <div className={styles.mobileSheet} onClick={(e) => e.stopPropagation()}>
            <div className={styles.sheetHandle} />
            <header className={styles.sidebarHeader}>
              <h1 className={styles.logo}>NotiFlix</h1>
              <button className={styles.closeBtn} onClick={() => setMobilePanelOpen(false)}>
                ✕
              </button>
            </header>
            <ControlPanel />
            <div className={styles.divider} />
            <TimelineEditor />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
