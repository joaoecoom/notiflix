import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { CurrencyCode } from '../engines/currency';
import type {
  SimulationState,
  TimelineEntry,
  BulkGeneratorConfig,
  SimulationSettings,
  SeedEntry,
  SeedBulkGeneratorConfig,
} from '../engines/simulation';
import {
  createDefaultTimeline,
  timelineToEvents,
  processEvent,
  resetMetrics,
  generateBulkTimeline,
} from '../engines/simulation';
import {
  DEFAULT_SETTINGS,
  createEmptyMetrics,
} from '../engines/simulation/types';
import {
  buildSeedNotifications,
  createDefaultSeedTimeline,
  generateBulkSeedTimeline,
} from '../engines/notification';
import {
  getDefaultEnabledPlatformIds,
  isPlatformEnabled,
} from '../engines/platform';
import type { PreviewScreen } from '../engines/platform/types';

interface SimulationActions {
  setTimeline: (timeline: TimelineEntry[]) => void;
  addTimelineEntry: (entry: Omit<TimelineEntry, 'id'>) => void;
  updateTimelineEntry: (id: string, updates: Partial<TimelineEntry>) => void;
  removeTimelineEntry: (id: string) => void;
  duplicateTimelineEntry: (id: string) => void;
  generateBulk: (config: BulkGeneratorConfig) => void;
  setSeedTimeline: (seedTimeline: SeedEntry[]) => void;
  addSeedEntry: (entry: Omit<SeedEntry, 'id'>) => void;
  updateSeedEntry: (id: string, updates: Partial<SeedEntry>) => void;
  removeSeedEntry: (id: string) => void;
  duplicateSeedEntry: (id: string) => void;
  generateBulkSeed: (config: SeedBulkGeneratorConfig) => void;
  rebuildSeedNotifications: () => void;
  updateSettings: (settings: Partial<SimulationSettings>) => void;
  startSimulation: () => void;
  stopSimulation: () => void;
  resetSimulation: () => void;
  processEventsForElapsed: (elapsedSeconds: number) => void;
  tick: (deltaMs: number) => void;
  setActiveTab: (tab: SimulationState['activeTab']) => void;
  setPreviewScreen: (screen: PreviewScreen) => void;
  togglePlatform: (platformId: string) => void;
  setEnabledPlatforms: (platformIds: string[]) => void;
  setCurrencyFilter: (filter: CurrencyCode | 'all') => void;
  dismissNotification: (id: string) => void;
  dismissAllNotifications: () => void;
  dismissSeedNotification: (id: string) => void;
}

type SimulationStore = SimulationState & SimulationActions;

const defaultTimeline = createDefaultTimeline();
const defaultSeedTimeline = createDefaultSeedTimeline();

function withSeedNotifications(seedTimeline: SeedEntry[]) {
  return buildSeedNotifications(seedTimeline);
}

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  scenario: {
    id: uuidv4(),
    name: 'Demo Scenario',
    description: 'Multi-currency payment simulation',
  },
  settings: DEFAULT_SETTINGS,
  events: timelineToEvents(defaultTimeline),
  timeline: defaultTimeline,
  seedTimeline: defaultSeedTimeline,
  metrics: createEmptyMetrics(),
  notifications: [],
  isRunning: false,
  elapsedTime: 0,
  startTime: null,
  activeTab: 'home',
  previewScreen: 'hub',
  enabledPlatformIds: getDefaultEnabledPlatformIds(),
  customPlatforms: [],
  selectedCurrencyFilter: 'all',
  seedNotifications: withSeedNotifications(defaultSeedTimeline),

  setTimeline: (timeline) => {
    set({
      timeline,
      events: timelineToEvents(timeline),
    });
  },

  addTimelineEntry: (entry) => {
    const newEntry: TimelineEntry = { ...entry, id: uuidv4() };
    const timeline = [...get().timeline, newEntry].sort(
      (a, b) => a.offsetSeconds - b.offsetSeconds
    );
    set({ timeline, events: timelineToEvents(timeline) });
  },

  updateTimelineEntry: (id, updates) => {
    const timeline = get().timeline.map((e) =>
      e.id === id ? { ...e, ...updates } : e
    );
    set({ timeline, events: timelineToEvents(timeline) });
  },

  removeTimelineEntry: (id) => {
    const timeline = get().timeline.filter((e) => e.id !== id);
    set({ timeline, events: timelineToEvents(timeline) });
  },

  duplicateTimelineEntry: (id) => {
    const entry = get().timeline.find((e) => e.id === id);
    if (!entry) return;
    const newEntry: TimelineEntry = {
      ...entry,
      id: uuidv4(),
      offsetSeconds: entry.offsetSeconds + 5,
    };
    const timeline = [...get().timeline, newEntry].sort(
      (a, b) => a.offsetSeconds - b.offsetSeconds
    );
    set({ timeline, events: timelineToEvents(timeline) });
  },

  generateBulk: (config) => {
    const timeline = generateBulkTimeline(config);
    set({ timeline, events: timelineToEvents(timeline) });
  },

  setSeedTimeline: (seedTimeline) => {
    set({
      seedTimeline,
      seedNotifications: withSeedNotifications(seedTimeline),
    });
  },

  addSeedEntry: (entry) => {
    const newEntry: SeedEntry = { ...entry, id: uuidv4() };
    const seedTimeline = [...get().seedTimeline, newEntry];
    set({
      seedTimeline,
      seedNotifications: withSeedNotifications(seedTimeline),
    });
  },

  updateSeedEntry: (id, updates) => {
    const seedTimeline = get().seedTimeline.map((e) =>
      e.id === id ? { ...e, ...updates } : e
    );
    set({
      seedTimeline,
      seedNotifications: withSeedNotifications(seedTimeline),
    });
  },

  removeSeedEntry: (id) => {
    const seedTimeline = get().seedTimeline.filter((e) => e.id !== id);
    set({
      seedTimeline,
      seedNotifications: withSeedNotifications(seedTimeline),
    });
  },

  duplicateSeedEntry: (id) => {
    const entry = get().seedTimeline.find((e) => e.id === id);
    if (!entry) return;
    const newEntry: SeedEntry = { ...entry, id: uuidv4() };
    const seedTimeline = [...get().seedTimeline, newEntry];
    set({
      seedTimeline,
      seedNotifications: withSeedNotifications(seedTimeline),
    });
  },

  generateBulkSeed: (config) => {
    const seedTimeline = generateBulkSeedTimeline(config);
    set({
      seedTimeline,
      seedNotifications: withSeedNotifications(seedTimeline),
    });
  },

  rebuildSeedNotifications: () => {
    set({ seedNotifications: withSeedNotifications(get().seedTimeline) });
  },

  updateSettings: (settings) => {
    set({ settings: { ...get().settings, ...settings } });
  },

  startSimulation: () => {
    set({
      isRunning: true,
      elapsedTime: 0,
      startTime: Date.now(),
      metrics: resetMetrics(),
      notifications: [],
      previewScreen: 'iphone',
      events: get().events.map((e) => ({ ...e, processed: false })),
    });
    get().processEventsForElapsed(0);
  },

  stopSimulation: () => {
    set({ isRunning: false, startTime: null });
  },

  resetSimulation: () => {
    const timeline = get().timeline;
    const seedTimeline = get().seedTimeline;
    set({
      isRunning: false,
      elapsedTime: 0,
      startTime: null,
      metrics: resetMetrics(),
      notifications: [],
      seedNotifications: withSeedNotifications(seedTimeline),
      events: timelineToEvents(timeline),
    });
  },

  processEventsForElapsed: (elapsedSeconds) => {
    const state = get();
    let { metrics, notifications, events } = state;
    const now = Date.now();
    let changed = false;

    const { enabledPlatformIds } = state;

    events = events.map((event) => {
      if (!event.processed && event.offsetSeconds <= elapsedSeconds) {
        if (!isPlatformEnabled(event.platformId, enabledPlatformIds)) {
          return { ...event, processed: true, timestamp: now };
        }
        const result = processEvent(event, metrics, now);
        metrics = result.metrics;
        notifications = [result.notification, ...notifications];
        changed = true;
        return { ...event, processed: true, timestamp: now };
      }
      return event;
    });

    if (changed) {
      set({ metrics, notifications, events });
    }
  },

  tick: (deltaMs) => {
    const state = get();
    if (!state.isRunning) return;

    const speed = state.settings.playbackSpeed;
    const newElapsed = state.elapsedTime + (deltaMs / 1000) * speed;
    const elapsedSeconds = Math.floor(newElapsed);

    get().processEventsForElapsed(elapsedSeconds);
    set({ elapsedTime: newElapsed });

    const { events } = get();
    if (events.length > 0 && events.every((e) => e.processed)) {
      set({ isRunning: false, startTime: null });
    }
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setPreviewScreen: (screen) => set({ previewScreen: screen }),
  togglePlatform: (platformId) => {
    const current = get().enabledPlatformIds;
    const next = current.includes(platformId)
      ? current.filter((id) => id !== platformId)
      : [...current, platformId];
    set({ enabledPlatformIds: next.length > 0 ? next : current });
  },
  setEnabledPlatforms: (platformIds) => {
    if (platformIds.length === 0) return;
    set({ enabledPlatformIds: platformIds });
  },
  setCurrencyFilter: (filter) => set({ selectedCurrencyFilter: filter }),

  dismissNotification: (id) => {
    set({
      notifications: get().notifications.map((n) =>
        n.id === id ? { ...n, status: 'dismissed' as const } : n
      ),
    });
  },

  dismissAllNotifications: () => {
    set({
      notifications: get().notifications.map((n) => ({
        ...n,
        status: 'dismissed' as const,
      })),
      seedNotifications: get().seedNotifications.map((n) => ({
        ...n,
        status: 'dismissed' as const,
      })),
    });
  },

  dismissSeedNotification: (id) => {
    set({
      seedTimeline: get().seedTimeline.filter((e) => e.id !== id),
      seedNotifications: get().seedNotifications
        .map((n) => (n.id === id ? { ...n, status: 'dismissed' as const } : n))
        .filter((n) => n.id !== id),
    });
  },
}));

export function useFilteredMetrics() {
  const metrics = useSimulationStore((s) => s.metrics);
  const filter = useSimulationStore((s) => s.selectedCurrencyFilter);

  if (filter === 'all') return metrics;

  return {
    ...metrics,
    byCurrency: {
      EUR: filter === 'EUR' ? metrics.byCurrency.EUR : { ...metrics.byCurrency.EUR, revenue: 0, payments: 0, customers: 0, balance: 0 },
      USD: filter === 'USD' ? metrics.byCurrency.USD : { ...metrics.byCurrency.USD, revenue: 0, payments: 0, customers: 0, balance: 0 },
      BRL: filter === 'BRL' ? metrics.byCurrency.BRL : { ...metrics.byCurrency.BRL, revenue: 0, payments: 0, customers: 0, balance: 0 },
    },
  };
}

export function useTodayMetrics() {
  const metrics = useSimulationStore((s) => s.metrics);
  const filter = useSimulationStore((s) => s.selectedCurrencyFilter);

  let volume = 0;
  let payments = 0;
  let customers = 0;

  const currencies: CurrencyCode[] =
    filter === 'all' ? ['EUR', 'USD', 'BRL'] : [filter];

  for (const c of currencies) {
    volume += metrics.byCurrency[c].revenue;
    payments += metrics.byCurrency[c].payments;
    customers += metrics.byCurrency[c].customers;
  }

  return { volume, payments, customers, byCurrency: metrics.byCurrency };
}
