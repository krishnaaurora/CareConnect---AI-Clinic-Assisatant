import React from 'react';

/**
 * BackgroundPattern Component
 * Inspired by Sera UI (https://seraui.com/docs/pattern) & 21st.dev
 * Renders high-craft geometric patterns (Plus, Dots, Grid) with radial gradient masks
 * for premium, realistic SaaS dashboards.
 */
export default function BackgroundPattern({
  variant = 'plus', // 'plus' | 'dots' | 'grid'
  size = 28,
  color = 'rgba(15, 91, 76, 0.08)',
  dark = false,
  glow = true,
  glowColor = 'rgba(0, 201, 167, 0.06)',
  className = '',
  style = {}
}) {
  const patternId = React.useId();

  const strokeColor = dark 
    ? 'rgba(0, 201, 167, 0.14)' 
    : color;

  return (
    <div
      aria-hidden="true"
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 0,
        ...style
      }}
    >
      {/* Ambient Radial Glow from top center */}
      {glow && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: '1200px',
            height: '420px',
            background: `radial-gradient(circle at 50% 0%, ${dark ? 'rgba(0, 201, 167, 0.12)' : glowColor} 0%, transparent 70%)`,
            filter: 'blur(32px)',
            pointerEvents: 'none'
          }}
        />
      )}

      {/* Geometric SVG Pattern with Radial Mask */}
      <svg
        width="100%"
        height="100%"
        style={{
          position: 'absolute',
          inset: 0,
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 10%, #000 40%, transparent 95%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 10%, #000 40%, transparent 95%)',
        }}
      >
        <defs>
          {variant === 'plus' && (
            <pattern
              id={patternId}
              width={size}
              height={size}
              patternUnits="userSpaceOnUse"
            >
              {/* Plus (+) Crosshair mark */}
              <path
                d={`M ${size / 2} ${(size / 2) - 3} V ${(size / 2) + 3} M ${(size / 2) - 3} ${size / 2} H ${(size / 2) + 3}`}
                stroke={strokeColor}
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </pattern>
          )}

          {variant === 'dots' && (
            <pattern
              id={patternId}
              width={size}
              height={size}
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx={size / 2}
                cy={size / 2}
                r="1"
                fill={strokeColor}
              />
            </pattern>
          )}

          {variant === 'grid' && (
            <pattern
              id={patternId}
              width={size}
              height={size}
              patternUnits="userSpaceOnUse"
            >
              <path
                d={`M ${size} 0 L 0 0 0 ${size}`}
                fill="none"
                stroke={strokeColor}
                strokeWidth="0.8"
              />
            </pattern>
          )}
        </defs>

        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
}

