import { useState } from 'react';
import { MobileCanvas } from './components/mobile/MobileCanvas';
import { BottomNav } from './components/mobile/BottomNav';
import { HomeIndicator } from './components/mobile/HomeIndicator';
import { IPhoneLockScreen } from './components/mobile/IPhoneLockScreen';
import { PlatformHub } from './components/hub/PlatformHub';
import { useSimulationLoop } from './hooks/useSimulationLoop';
import { ControlPanel } from './components/editor/ControlPanel';
import { TimelineEditor } from './components/editor/TimelineEditor';
import { BulkGeneratorPanel } from './components/editor/BulkGenerator';
import { SeedTimelineEditor } from './components/editor/SeedTimelineEditor';
import { SeedBulkGeneratorPanel } from './components/editor/SeedBulkGenerator';
import { StripeTemplate } from './templates/stripe/StripeTemplate';
import { useSimulationStore } from './store/simulationStore';
import styles from './App.module.css';

function App() {
  useSimulationLoop();
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);

  const previewScreen = useSimulationStore((s) => s.previewScreen);

  const handleSimulationStart = () => {
    setMobilePanelOpen(false);
  };

  return (
    <div className={styles.app}>
      <aside className={styles.sidebar}>
        <header className={styles.sidebarHeader}>
          <h1 className={styles.logo}>NotiFlix</h1>
          <span className={styles.badge}>Prototype</span>
        </header>

        <ControlPanel onSimulationStart={handleSimulationStart} />

        <div className={styles.divider} />

        <TimelineEditor />

        <div className={styles.divider} />

        <BulkGeneratorPanel />

        <div className={styles.divider} />

        <SeedTimelineEditor />

        <div className={styles.divider} />

        <SeedBulkGeneratorPanel />
      </aside>

      <main className={styles.preview}>
        <MobileCanvas showFrame={previewScreen === 'stripe'}>
          {previewScreen === 'hub' && <PlatformHub />}
          {previewScreen === 'iphone' && <IPhoneLockScreen />}
          {previewScreen === 'stripe' && (
            <>
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
            <ControlPanel onSimulationStart={handleSimulationStart} />
            <div className={styles.divider} />
            <TimelineEditor />
            <div className={styles.divider} />
            <SeedTimelineEditor />
            <div className={styles.divider} />
            <SeedBulkGeneratorPanel />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
