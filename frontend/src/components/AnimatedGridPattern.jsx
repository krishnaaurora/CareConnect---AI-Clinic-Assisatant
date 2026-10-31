import React, { useEffect, useId, useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';

/**
 * AnimatedPattern Component
 * Inspired by shadcn.io/background & seraui.com/docs/pattern
 * 
 * Supports:
 *  - patternType: 'grid' | 'dots'
 *  - Interactive cursor spotlight tracking (SeraUI interactive pattern)
 *  - Staggered twinkling / glowing accent cells/dots (Shadcn animated patterns)
 *  - Subtle medical scanner beam sweep (withScanLine)
 *  - Smooth feathered radial vignette mask for seamless background integration
 */
export default function AnimatedGridPattern({
  patternType = 'grid', // 'grid' | 'dots'
  width = 38,
  height = 38,
  numSquares = 32,
  strokeColor = 'rgba(203, 213, 225, 0.45)',
  cellFill = 'rgba(0, 201, 167, 0.22)',
  cellStroke = 'rgba(0, 135, 108, 0.4)',
  maxCellOpacity = 0.65,
  spotlight = true,
  withScanLine = true,
  className = '',
  style = {},
}) {
  const patternId = useId();
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [isHovered, setIsHovered] = useState(false);

  // Responsive container observer
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      setDimensions({
        width: el.offsetWidth || 1200,
        height: el.offsetHeight || 800,
      });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  // Track cursor position for interactive spotlight
  const handleMouseMove = (e) => {
    if (!spotlight || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Generate randomized grid cell coordinates for glowing animations
  const glowingSquares = useMemo(() => {
    const cols = Math.max(1, Math.floor(dimensions.width / width));
    const rows = Math.max(1, Math.floor(dimensions.height / height));
    const squares = [];

    const usedCoords = new Set();
    const targetCount = Math.min(numSquares, cols * rows);

    for (let i = 0; i < targetCount; i++) {
      let col, row, key;
      let attempts = 0;
      do {
        // Cluster half of the squares around the upper-center area where the headline text sits
        if (i % 2 === 0 && rows > 3) {
          row = Math.floor(1 + Math.random() * Math.min(6, rows - 1));
          const colMin = Math.floor(cols * 0.15);
          const colMax = Math.max(colMin + 1, Math.floor(cols * 0.85));
          col = Math.floor(colMin + Math.random() * (colMax - colMin));
        } else {
          col = Math.floor(Math.random() * cols);
          row = Math.floor(Math.random() * rows);
        }
        key = `${col},${row}`;
        attempts++;
      } while (usedCoords.has(key) && attempts < 25);

      usedCoords.add(key);

      squares.push({
        id: `cell-${i}-${col}-${row}`,
        x: col * width + 1,
        y: row * height + 1,
        cx: col * width + width / 2,
        cy: row * height + height / 2,
        delay: (i * 0.22) % 4.5,
        duration: 3 + (i % 3) * 1.2,
      });
    }

    return squares;
  }, [dimensions.width, dimensions.height, width, height, numSquares]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePos({ x: -1000, y: -1000 });
      }}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: spotlight ? 'auto' : 'none',
        zIndex: 0,
        ...style,
      }}
      className={`animated-grid-pattern-root ${className}`}
    >
      <style>{`
        @keyframes scanBeam {
          0% {
            top: -10%;
            opacity: 0;
          }
          15% {
            opacity: 0.65;
          }
          85% {
            opacity: 0.65;
          }
          100% {
            top: 110%;
            opacity: 0;
          }
        }
      `}</style>

      {/* ── Interactive Cursor Spotlight (SeraUI pattern effect) ── */}
      {spotlight && isHovered && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(420px circle at ${mousePos.x}px ${mousePos.y}px, rgba(0, 201, 167, 0.12), transparent 75%)`,
            pointerEvents: 'none',
            zIndex: 1,
            transition: 'opacity 0.2s ease',
          }}
        />
      )}

      {/* ── Optional Medical Radar / Scanner Sweep Line ── */}
      {withScanLine && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            width: '100%',
            height: '2px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(0, 201, 167, 0.15) 20%, rgba(0, 201, 167, 0.8) 50%, rgba(0, 201, 167, 0.15) 80%, transparent 100%)',
            boxShadow: '0 0 16px 2px rgba(0, 201, 167, 0.35)',
            animation: 'scanBeam 9s cubic-bezier(0.4, 0, 0.2, 1) infinite',
            pointerEvents: 'none',
            zIndex: 1,
            maskImage: 'radial-gradient(ellipse 70% 50% at 50% 50%, #000 35%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 70% 50% at 50% 50%, #000 35%, transparent 100%)',
          }}
        />
      )}

      {/* ── SVG Pattern + Glowing Accent Elements ── */}
      <svg
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          maskImage: 'radial-gradient(ellipse 75% 65% at 50% 45%, #000 40%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 75% 65% at 50% 45%, #000 40%, transparent 100%)',
        }}
      >
        <defs>
          <pattern
            id={patternId}
            width={width}
            height={height}
            patternUnits="userSpaceOnUse"
            x={-1}
            y={-1}
          >
            {patternType === 'dots' ? (
              <circle
                cx={width / 2}
                cy={height / 2}
                r={1.2}
                fill={strokeColor}
              />
            ) : (
              <path
                d={`M.5 ${height}V.5H${width}`}
                fill="none"
                stroke={strokeColor}
                strokeWidth={1}
              />
            )}
          </pattern>
        </defs>

        {/* Base Grid or Dot Fill */}
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />

        {/* Animated Glowing Cells or Dots */}
        <svg x={-1} y={-1} style={{ overflow: 'visible' }}>
          {glowingSquares.map((sq) => (
            patternType === 'dots' ? (
              <motion.circle
                key={sq.id}
                initial={{ opacity: 0, r: 1.5 }}
                animate={{
                  opacity: [0, maxCellOpacity, maxCellOpacity * 0.3, 0],
                  r: [1.5, 3.2, 2.5, 1.5],
                }}
                transition={{
                  duration: sq.duration,
                  repeat: Infinity,
                  delay: sq.delay,
                  ease: 'easeInOut',
                }}
                cx={sq.cx}
                cy={sq.cy}
                fill={cellFill}
                stroke={cellStroke}
                strokeWidth={1}
              />
            ) : (
              <motion.rect
                key={sq.id}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, maxCellOpacity, maxCellOpacity * 0.3, 0],
                }}
                transition={{
                  duration: sq.duration,
                  repeat: Infinity,
                  delay: sq.delay,
                  ease: 'easeInOut',
                }}
                width={width - 1}
                height={height - 1}
                x={sq.x}
                y={sq.y}
                fill={cellFill}
                stroke={cellStroke}
                strokeWidth={1}
                rx={2}
              />
            )
          ))}
        </svg>
      </svg>
    </div>
  );
}
