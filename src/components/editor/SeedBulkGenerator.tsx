import { useState } from 'react';
import { useSimulationStore } from '../../store/simulationStore';
import type { CurrencyCode } from '../../engines/currency';
import { DEFAULT_DISTRIBUTION } from '../../engines/simulation/types';
import { PLATFORM_IDS } from '../../engines/platform';
import styles from './BulkGenerator.module.css';

type OffsetUnit = 'minutes' | 'hours' | 'days';

const UNIT_MINUTES: Record<OffsetUnit, number> = { minutes: 1, hours: 60, days: 1440 };
const UNIT_LABEL: Record<OffsetUnit, string> = { minutes: 'min', hours: 'horas', days: 'dias' };

export function SeedBulkGeneratorPanel() {
  const generateBulkSeed = useSimulationStore((s) => s.generateBulkSeed);
  const lastUnlockMinutesAgo = useSimulationStore((s) => s.settings.lastUnlockMinutesAgo);
  const enabledPlatformIds = useSimulationStore((s) => s.enabledPlatformIds);

  const [quantity, setQuantity] = useState(5);
  const [currencies, setCurrencies] = useState<CurrencyCode[]>(['EUR', 'USD', 'BRL']);
  const [minAmount, setMinAmount] = useState(9);
  const [maxAmount, setMaxAmount] = useState(120);
  const [minOffset, setMinOffset] = useState(5);
  const [maxOffset, setMaxOffset] = useState(lastUnlockMinutesAgo);
  const [offsetUnit, setOffsetUnit] = useState<OffsetUnit>('minutes');
  const [distribution, setDistribution] = useState(DEFAULT_DISTRIBUTION);

  const unitMinutes = UNIT_MINUTES[offsetUnit];
  const maxAllowed = Math.max(1, Math.floor(lastUnlockMinutesAgo / unitMinutes));

  const toggleCurrency = (c: CurrencyCode) => {
    setCurrencies((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const handleGenerate = () => {
    if (currencies.length === 0) return;
    const cappedMax = Math.min(maxOffset, maxAllowed);
    generateBulkSeed({
      quantity,
      platformId: PLATFORM_IDS.stripe,
      platformIds: enabledPlatformIds,
      currencies,
      minAmount,
      maxAmount,
      minOffsetValue: Math.min(minOffset, cappedMax),
      maxOffsetValue: Math.max(Math.min(minOffset, cappedMax), cappedMax),
      offsetUnit,
      distribution,
    });
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Bulk — notificações existentes</h3>
      <p className={styles.subtitle}>
        Gera várias no passado, dentro do último desbloqueio (há {lastUnlockMinutesAgo} min)
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

      <p className={styles.subtitle}>
        Plataformas activas: {enabledPlatformIds.join(', ')}
      </p>

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
          onChange={(e) => {
            const unit = e.target.value as OffsetUnit;
            setOffsetUnit(unit);
            setMinOffset(unit === 'minutes' ? 5 : 1);
            setMaxOffset(Math.max(1, Math.floor(lastUnlockMinutesAgo / UNIT_MINUTES[unit])));
          }}
        >
          <option value="minutes">Minutos atrás</option>
          <option value="hours">Horas atrás</option>
          <option value="days">Dias atrás</option>
        </select>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label>Mín. {UNIT_LABEL[offsetUnit]}</label>
          <input
            type="number"
            value={minOffset}
            min={offsetUnit === 'minutes' ? 3 : 1}
            max={maxAllowed}
            onChange={(e) => setMinOffset(parseInt(e.target.value) || 1)}
          />
        </div>
        <div className={styles.field}>
          <label>Máx. {UNIT_LABEL[offsetUnit]}</label>
          <input
            type="number"
            value={maxOffset}
            min={1}
            max={maxAllowed}
            onChange={(e) => setMaxOffset(Math.min(maxAllowed, parseInt(e.target.value) || 1))}
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
