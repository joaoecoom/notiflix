import { useState } from 'react';
import { useSimulationStore } from '../../store/simulationStore';
import type { CurrencyCode } from '../../engines/currency';
import type { IntensityLevel } from '../../engines/simulation/types';
import { DEFAULT_DISTRIBUTION } from '../../engines/simulation/types';
import styles from './BulkGenerator.module.css';

export function BulkGeneratorPanel() {
  const generateBulk = useSimulationStore((s) => s.generateBulk);

  const [quantity, setQuantity] = useState(100);
  const [app, setApp] = useState('Stripe');
  const [currencies, setCurrencies] = useState<CurrencyCode[]>(['EUR', 'USD', 'BRL']);
  const [minAmount, setMinAmount] = useState(9);
  const [maxAmount, setMaxAmount] = useState(497);
  const [minInterval, setMinInterval] = useState(10);
  const [maxInterval, setMaxInterval] = useState(120);
  const [distribution, setDistribution] = useState(DEFAULT_DISTRIBUTION);
  const [autoDistribution, setAutoDistribution] = useState(true);
  const [intensity, setIntensity] = useState<IntensityLevel>('NORMAL');

  const toggleCurrency = (c: CurrencyCode) => {
    setCurrencies((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const handleGenerate = () => {
    if (currencies.length === 0) return;
    generateBulk({
      quantity,
      app,
      currencies,
      minAmount,
      maxAmount,
      minInterval,
      maxInterval,
      distribution,
      autoDistribution,
      intensity,
    });
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Generate in Bulk</h3>

      <div className={styles.field}>
        <label>Quantidade</label>
        <input
          type="number"
          value={quantity}
          min={1}
          max={1000}
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

      <div className={styles.row}>
        <div className={styles.field}>
          <label>Intervalo mín. (s)</label>
          <input
            type="number"
            value={minInterval}
            min={1}
            onChange={(e) => setMinInterval(parseInt(e.target.value) || 1)}
          />
        </div>
        <div className={styles.field}>
          <label>Intervalo máx. (s)</label>
          <input
            type="number"
            value={maxInterval}
            min={1}
            onChange={(e) => setMaxInterval(parseInt(e.target.value) || 1)}
          />
        </div>
      </div>

      <div className={styles.field}>
        <label>Distribuição</label>
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

      <div className={styles.field}>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={autoDistribution}
            onChange={(e) => setAutoDistribution(e.target.checked)}
          />
          Auto Distribution
        </label>
      </div>

      {autoDistribution && (
        <div className={styles.field}>
          <label>Intensidade</label>
          <div className={styles.intensity}>
            {(['LOW', 'NORMAL', 'HIGH', 'VIRAL'] as IntensityLevel[]).map((level) => (
              <button
                key={level}
                className={`${styles.intensityBtn} ${intensity === level ? styles.active : ''}`}
                onClick={() => setIntensity(level)}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      )}

      <button className={styles.generateBtn} onClick={handleGenerate}>
        GENERATE IN BULK
      </button>
    </div>
  );
}
