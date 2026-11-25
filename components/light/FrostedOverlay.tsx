/** Frosted-glass film over the light background: fine grain (5%) and faint vertical streaks (3%). */
const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const STREAKS =
  'repeating-linear-gradient(90deg, rgba(60,45,40,1) 0 1px, transparent 1px 5px, rgba(60,45,40,0.5) 5px 6px, transparent 6px 13px, rgba(60,45,40,0.8) 13px 14px, transparent 14px 23px)';

export default function FrostedOverlay() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0" style={{ backgroundImage: NOISE, backgroundSize: '180px 180px', opacity: 0.05 }} />
      <div className="absolute inset-0" style={{ backgroundImage: STREAKS, opacity: 0.03 }} />
    </div>
  );
}
