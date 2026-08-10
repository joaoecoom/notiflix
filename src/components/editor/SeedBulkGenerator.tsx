import { useState } from 'react';
import { useSimulationStore } from '../../store/simulationStore';
import type { CurrencyCode } from '../../engines/currency';
import { DEFAULT_DISTRIBUTION } from '../../engines/simulation/types';
import styles from './BulkGenerator.module.css';

export function SeedBulkGeneratorPanel() {
  const generateBulkSeed = useSimulationStore((s) => s.generateBulkSeed);
  const retentionDays = useSimulationStore((s) => s.settings.notificationRetentionDays);

  const [quantity, setQuantity] = useState(5);
  const [app, setApp] = useState('Stripe');
  const [currencies, setCurrencies] = useState<CurrencyCode[]>(['EUR', 'USD', 'BRL']);
  const [minAmount, setMinAmount] = useState(9);
  const [maxAmount, setMaxAmount] = useState(120);
  const [minOffset, setMinOffset] = useState(1);
  const [maxOffset, setMaxOffset] = useState(Math.min(3, retentionDays));
  const [offsetUnit, setOffsetUnit] = useState<'hours' | 'days'>('days');
  const [distribution, setDistribution] = useState(DEFAULT_DISTRIBUTION);

  const toggleCurrency = (c: CurrencyCode) => {
    setCurrencies((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const handleGenerate = () => {
    if (currencies.length === 0) return;
    const cappedMax =
      offsetUnit === 'days'
        ? Math.min(maxOffset, retentionDays)
        : Math.min(maxOffset, retentionDays * 24);
    generateBulkSeed({
      quantity,
      app,
      currencies,
      minAmount,
      maxAmount,
      minOffsetValue: minOffset,
      maxOffsetValue: Math.max(minOffset, cappedMax),
      offsetUnit,
      distribution,
    });
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Bulk — notificações existentes</h3>
      <p className={styles.subtitle}>
        Gera várias no passado (máx. {retentionDays} dias — limite de retenção do iOS)
      </p>

      <div className={styles.field}>
        <label>Quantidade</label>
        <input
          type="number"
          value={quantity}
          min={1}
          max={50}
          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
        />
      </div>

      <div className={styles.field}>
        <label>Aplicação</label>
        <input type="text" value={app} onChange={(e) => setApp(e.target.value)} />
      </div>

      <div className={styles.field}>
        <label>Moedas</label>
        <div className={styles.checkboxes}>
          {(['EUR', 'USD', 'BRL'] as CurrencyCode[]).map((c) => (
            <label key={c} className={styles.checkbox}>
              <input
                type="checkbox"
                checked={currencies.includes(c)}
                onChange={() => toggleCurrency(c)}
              />
              {c}
            </label>
          ))}
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label>Valor mín.</label>
          <input
            type="number"
            value={minAmount}
            min={0}
            step={0.01}
            onChange={(e) => setMinAmount(parseFloat(e.target.value) || 0)}
          />
        </div>
        <div className={styles.field}>
          <label>Valor máx.</label>
          <input
            type="number"
            value={maxAmount}
            min={0}
            step={0.01}
            onChange={(e) => setMaxAmount(parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className={styles.field}>
        <label>Quando (passado)</label>
        <select
          value={offsetUnit}
          onChange={(e) => setOffsetUnit(e.target.value as 'hours' | 'days')}
        >
          <option value="hours">Horas atrás</option>
          <option value="days">Dias atrás</option>
        </select>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label>Mín. {offsetUnit === 'days' ? 'dias' : 'horas'}</label>
          <input
            type="number"
            value={minOffset}
            min={1}
            onChange={(e) => setMinOffset(parseInt(e.target.value) || 1)}
          />
        </div>
        <div className={styles.field}>
          <label>Máx. {offsetUnit === 'days' ? 'dias' : 'horas'}</label>
          <input
            type="number"
            value={maxOffset}
            min={1}
            onChange={(e) => setMaxOffset(parseInt(e.target.value) || 1)}
          />
        </div>
      </div>

      <div className={styles.field}>
        <label>Distribuição moedas (%)</label>
        <div className={styles.distribution}>
          {(['EUR', 'USD', 'BRL'] as CurrencyCode[]).map((c) => (
            <div key={c} className={styles.distRow}>
              <span>{c}</span>
              <input
                type="number"
                value={distribution[c]}
                min={0}
                max={100}
                onChange={(e) =>
                  setDistribution({ ...distribution, [c]: parseInt(e.target.value) || 0 })
                }
              />
              <span>%</span>
            </div>
          ))}
        </div>
      </div>

      <button className={styles.generateBtn} onClick={handleGenerate}>
        GERAR EXISTENTES EM BULK
      </button>
    </div>
  );
}
