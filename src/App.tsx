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
  const [settingsFabVisible, setSettingsFabVisible] = useState(true);

  const previewScreen = useSimulationStore((s) => s.previewScreen);

  const handleSimulationStart = () => {
    setMobilePanelOpen(false);
  };

  const toggleSettingsFab = () => {
    setSettingsFabVisible((visible) => {
      if (visible) setMobilePanelOpen(false);
      return !visible;
    });
  };

  const handlePreviewDoubleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button, a, input, select, textarea, [role="button"]')) {
      return;
    }
    toggleSettingsFab();
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

      <main className={styles.preview} onDoubleClick={handlePreviewDoubleClick}>
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
          type="button"
          className={`${styles.mobileFab} ${settingsFabVisible ? '' : styles.mobileFabHidden}`}
          onClick={() => setMobilePanelOpen(true)}
          onDoubleClick={(e) => e.stopPropagation()}
          aria-label="Controlos"
          aria-hidden={!settingsFabVisible}
          tabIndex={settingsFabVisible ? 0 : -1}
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
