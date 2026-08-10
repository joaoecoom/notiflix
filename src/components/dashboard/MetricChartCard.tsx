import { useMemo } from 'react';
import { formatCurrency } from '../../engines/currency';
import type { CurrencyCode } from '../../engines/currency';
import type { ChartDataPoint } from '../../engines/simulation/types';
import styles from './MetricChartCard.module.css';

interface MetricChartCardProps {
  title: string;
  currentValue: number;
  comparisonValue?: number;
  currency?: CurrencyCode;
  formatAsPercent?: boolean;
  growthPercent?: number;
  chartData: ChartDataPoint[];
  currencyFilter?: CurrencyCode | 'all';
}

const PERIODS = ['set. de 2024/ago. de 2025', 'set. de 2025/ago. de 2026'];

export function MetricChartCard({
  title,
  currentValue,
  comparisonValue = 0,
  currency = 'EUR',
  formatAsPercent = false,
  growthPercent,
  chartData,
  currencyFilter = 'all',
}: MetricChartCardProps) {
  const formatValue = (val: number) => {
    if (formatAsPercent) return `${val.toFixed(2).replace('.', ',')}%`;
    if (currencyFilter !== 'all') return formatCurrency(val, currencyFilter);
    return formatCurrency(val, currency);
  };

  const displayGrowth = growthPercent ?? calculateGrowth(currentValue, comparisonValue);

  const { path, areaPath, labels } = useMemo(
    () => buildChartPaths(chartData, currencyFilter),
    [chartData, currencyFilter]
  );

  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        {displayGrowth !== 0 && (
          <span className={`${styles.badge} ${displayGrowth > 0 ? styles.positive : ''}`}>
            {displayGrowth > 0 ? '+' : ''}{displayGrowth.toFixed(1).replace('.', ',')}%
          </span>
        )}
      </div>

      <div className={styles.metrics}>
        <div className={styles.metricCol}>
          <span className={styles.metricValue}>{formatValue(currentValue)}</span>
          <span className={styles.metricPeriod}>{PERIODS[0]}</span>
        </div>
        <div className={styles.metricCol}>
          <span className={`${styles.metricValue} ${styles.purple}`}>
            {formatValue(comparisonValue > 0 ? comparisonValue : currentValue)}
          </span>
          <span className={styles.metricPeriod}>{PERIODS[1]}</span>
        </div>
      </div>

      <div className={styles.chartArea}>
        <svg viewBox="0 0 340 80" preserveAspectRatio="none" className={styles.chart}>
          {Array.from({ length: 12 }).map((_, i) => (
            <line
              key={i}
              x1={(i * 340) / 11}
              y1="0"
              x2={(i * 340) / 11}
              y2="80"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="0.5"
            />
          ))}
          {areaPath && (
            <path d={areaPath} fill="url(#purpleGradient)" opacity="0.15" />
          )}
          {path && (
            <path d={path} fill="none" stroke="var(--accent-purple)" strokeWidth="1.5" />
          )}
          <defs>
            <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent-purple)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--accent-purple)" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
        {labels.map((label, i) => (
          <span
            key={i}
            className={styles.chartLabel}
            style={{ left: `${label.x}%`, top: `${label.y}%` }}
          >
            {label.text}
          </span>
        ))}
      </div>
    </section>
  );
}

function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function buildChartPaths(
  data: ChartDataPoint[],
  filter: CurrencyCode | 'all'
): { path: string; areaPath: string; labels: { x: number; y: number; text: string }[] } {
  if (data.length === 0) {
    return {
      path: 'M0,75 L340,75',
      areaPath: 'M0,75 L340,75 L340,80 L0,80 Z',
      labels: [{ x: 2, y: 82, text: formatCurrency(0, filter === 'all' ? 'EUR' : filter) }],
    };
  }

  const values = data.map((d) => {
    if (filter === 'all') {
      return Object.values(d.cumulative).reduce((s, v) => s + (v ?? 0), 0);
    }
    return d.cumulative[filter] ?? 0;
  });

  const max = Math.max(...values, 1);
  const width = 340;
  const height = 80;
  const padding = 5;

  const points = values.map((v, i) => ({
    x: (i / Math.max(values.length - 1, 1)) * width,
    y: height - padding - ((v / max) * (height - padding * 2)),
  }));

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaPath = `${path} L${width},${height} L0,${height} Z`;

  const labels: { x: number; y: number; text: string }[] = [];
  if (points.length > 0) {
    const last = points[points.length - 1];
    const lastVal = values[values.length - 1];
    labels.push({
      x: (last.x / width) * 100 - 5,
      y: (last.y / height) * 100 - 15,
      text: filter === 'all'
        ? formatCurrency(lastVal, 'EUR')
        : formatCurrency(lastVal, filter),
    });
  }

  return { path, areaPath, labels };
}
