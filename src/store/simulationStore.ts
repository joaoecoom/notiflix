import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { CurrencyCode } from '../engines/currency';
import type {
  SimulationState,
  TimelineEntry,
  BulkGeneratorConfig,
  SimulationSettings,
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
import { createSeedNotifications } from '../engines/notification';

interface SimulationActions {
  setTimeline: (timeline: TimelineEntry[]) => void;
  addTimelineEntry: (entry: Omit<TimelineEntry, 'id'>) => void;
  updateTimelineEntry: (id: string, updates: Partial<TimelineEntry>) => void;
  removeTimelineEntry: (id: string) => void;
  duplicateTimelineEntry: (id: string) => void;
  generateBulk: (config: BulkGeneratorConfig) => void;
  updateSettings: (settings: Partial<SimulationSettings>) => void;
  startSimulation: () => void;
  stopSimulation: () => void;
  resetSimulation: () => void;
  processEventsForElapsed: (elapsedSeconds: number) => void;
  tick: (deltaMs: number) => void;
  setActiveTab: (tab: SimulationState['activeTab']) => void;
  setViewMode: (mode: SimulationState['viewMode']) => void;
  setCurrencyFilter: (filter: CurrencyCode | 'all') => void;
  dismissNotification: (id: string) => void;
  dismissAllNotifications: () => void;
  dismissSeedNotification: (id: string) => void;
}

type SimulationStore = SimulationState & SimulationActions;

const defaultTimeline = createDefaultTimeline();

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  scenario: {
    id: uuidv4(),
    name: 'Demo Scenario',
    description: 'Multi-currency payment simulation',
  },
  settings: DEFAULT_SETTINGS,
  events: timelineToEvents(defaultTimeline),
  timeline: defaultTimeline,
  metrics: createEmptyMetrics(),
  notifications: [],
  isRunning: false,
  elapsedTime: 0,
  startTime: null,
  activeTab: 'home',
  viewMode: 'stripe',
  selectedCurrencyFilter: 'all',
  seedNotifications: createSeedNotifications(),

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
      viewMode: 'iphone',
      events: get().events.map((e) => ({ ...e, processed: false })),
    });
    get().processEventsForElapsed(0);
  },

  stopSimulation: () => {
    set({ isRunning: false, startTime: null });
  },

  resetSimulation: () => {
    const timeline = get().timeline;
    set({
      isRunning: false,
      elapsedTime: 0,
      startTime: null,
      metrics: resetMetrics(),
      notifications: [],
      seedNotifications: createSeedNotifications(),
      events: timelineToEvents(timeline),
    });
  },

  processEventsForElapsed: (elapsedSeconds) => {
    const state = get();
    let { metrics, notifications, events } = state;
    const now = Date.now();
    let changed = false;

    events = events.map((event) => {
      if (!event.processed && event.offsetSeconds <= elapsedSeconds) {
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
  setViewMode: (mode) => set({ viewMode: mode }),
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
    });
  },

  dismissSeedNotification: (id) => {
    set({
      seedNotifications: get().seedNotifications.map((n) =>
        n.id === id ? { ...n, status: 'dismissed' as const } : n
      ),
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
