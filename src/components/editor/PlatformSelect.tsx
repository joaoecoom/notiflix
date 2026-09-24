import { getBuiltinPlatforms, resolvePlatformId } from '../../engines/platform';
import { useSimulationStore } from '../../store/simulationStore';
import styles from './TimelineEditor.module.css';

interface PlatformSelectProps {
  value: string;
  onChange: (platformId: string) => void;
  enabledOnly?: boolean;
}

export function PlatformSelect({ value, onChange, enabledOnly = true }: PlatformSelectProps) {
  const enabledPlatformIds = useSimulationStore((s) => s.enabledPlatformIds);
  const platforms = getBuiltinPlatforms().filter(
    (p) => !enabledOnly || enabledPlatformIds.includes(p.id)
  );

  return (
    <select
      className={styles.select}
      value={resolvePlatformId(value)}
      onChange={(e) => onChange(e.target.value)}
    >
      {platforms.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </select>
  );
}
