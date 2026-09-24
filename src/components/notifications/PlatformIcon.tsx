import { getPlatform } from '../../engines/platform';
import { useSimulationStore } from '../../store/simulationStore';

interface PlatformIconProps {
  platformId: string;
  size?: number;
}

export function PlatformIcon({ platformId, size = 40 }: PlatformIconProps) {
  const customPlatforms = useSimulationStore((s) => s.customPlatforms);
  const platform = getPlatform(platformId, customPlatforms);

  return (
    <img
      src={platform.iconSrc}
      alt=""
      width={size}
      height={size}
      aria-hidden
      draggable={false}
      style={{ display: 'block', borderRadius: size * 0.22 }}
    />
  );
}
