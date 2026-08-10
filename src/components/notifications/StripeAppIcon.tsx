/** Official Stripe wordmark path — scale inside 40×40 app icon */
const STRIPE_S_PATH =
  'M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z';

interface StripeAppIconProps {
  size?: number;
}

export function StripeAppIcon({ size = 40 }: StripeAppIconProps) {
  const radius = Math.round(size * 0.27);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="stripe-app-icon"
    >
      <defs>
        <linearGradient id="stripeIconGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4B9CF5" />
          <stop offset="45%" stopColor="#5578F7" />
          <stop offset="100%" stopColor="#6E5CE7" />
        </linearGradient>
      </defs>
      <rect width={size} height={size} rx={radius} fill="url(#stripeIconGrad)" />
      <g transform={`translate(${size * 0.19}, ${size * 0.27}) scale(${size / 40})`}>
        <path d={STRIPE_S_PATH} fill="#FFFFFF" />
      </g>
    </svg>
  );
}
