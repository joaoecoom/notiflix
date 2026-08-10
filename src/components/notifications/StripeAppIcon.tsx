interface StripeAppIconProps {
  size?: number;
}

/** Stripe app icon — #635BFF + white slash (official notification icon) */
export function StripeAppIcon({ size = 40 }: StripeAppIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect width="40" height="40" rx="10.2" fill="#635BFF" />
      <path d="M11.2 14.2 L28.8 11.2 L26.8 26.8 L9.2 29.8 Z" fill="#FFFFFF" />
    </svg>
  );
}
