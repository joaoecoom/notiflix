import { useSimulationStore } from '../../store/simulationStore';
import styles from './BottomNav.module.css';

const NAV_ITEMS = [
  { id: 'home' as const, label: 'Início', icon: HomeIcon },
  { id: 'payments' as const, label: 'Pagamentos', icon: PaymentsIcon },
  { id: 'balances' as const, label: 'Saldos', icon: BalancesIcon },
  { id: 'customers' as const, label: 'Clientes', icon: CustomersIcon },
  { id: 'search' as const, label: 'Pesquisar', icon: SearchIcon },
];

export function BottomNav() {
  const activeTab = useSimulationStore((s) => s.activeTab);
  const setActiveTab = useSimulationStore((s) => s.setActiveTab);

  return (
    <nav className={styles.nav}>
      {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          className={`${styles.item} ${activeTab === id ? styles.active : ''}`}
          onClick={() => setActiveTab(id)}
        >
          <Icon active={activeTab === id} />
          <span className={styles.label}>{label}</span>
        </button>
      ))}
    </nav>
  );
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V10.5z" strokeLinejoin="round" fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.15 : 0} />
    </svg>
  );
}

function PaymentsIcon({ active: _active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  );
}

function BalancesIcon({ active: _active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M3 10h18" />
      <circle cx="17" cy="15" r="1.5" fill="currentColor" />
    </svg>
  );
}

function CustomersIcon({ active: _active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="9" cy="8" r="3" />
      <path d="M2 20c0-3.3 3.1-6 7-6s7 2.7 7 6" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M20 20c0-2.5-1.8-4.5-4-5" />
    </svg>
  );
}

function SearchIcon({ active: _active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3-3" strokeLinecap="round" />
    </svg>
  );
}
