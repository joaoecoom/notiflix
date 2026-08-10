interface StripeAppIconProps {
  size?: number;
}

/** Stripe app icon — official #635BFF circle with white slash mark */
export function StripeAppIcon({ size = 40 }: StripeAppIconProps) {
  return (
    <img
      src="/stripe-icon.png"
      alt=""
      width={size}
      height={size}
      aria-hidden
      draggable={false}
      style={{ display: 'block' }}
    />
  );
}
