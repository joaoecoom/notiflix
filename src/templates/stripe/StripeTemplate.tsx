import { useSimulationStore } from '../../store/simulationStore';
import { StripeHome } from './StripeHome';
import { StripeBalances } from './StripeBalances';
import styles from './StripeTemplate.module.css';

export function StripeTemplate() {
  const activeTab = useSimulationStore((s) => s.activeTab);

  return (
    <div className={styles.template}>
      {activeTab === 'home' && <StripeHome />}
      {activeTab === 'balances' && <StripeBalances />}
      {activeTab === 'payments' && <StripeHome />}
      {activeTab === 'customers' && <StripeHome />}
      {activeTab === 'search' && <StripeHome />}
    </div>
  );
}
