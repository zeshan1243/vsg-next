interface LogoMarkProps {
  size?: number;
}

export default function LogoMark({ size = 44 }: LogoMarkProps) {
  return (
    <div style={{ width: size, height: size, flexShrink: 0 }}>
      <svg viewBox="0 0 44 44" fill="none" width={size} height={size}>
        {/* Top-left: Quadrant C (Red - Knowledge) */}
        <rect x="2" y="2" width="18" height="18" rx="3" fill="#E55050" fillOpacity="0.9" />
        {/* Top-right: Quadrant D (Green - Exchange) */}
        <rect x="24" y="2" width="18" height="18" rx="3" fill="#3BB87F" fillOpacity="0.85" />
        {/* Bottom-left: Quadrant A (Gold - Coordination) */}
        <rect x="2" y="24" width="18" height="18" rx="3" fill="#E8B045" fillOpacity="0.9" />
        {/* Bottom-right: Quadrant B (Blue - Communication) */}
        <rect x="24" y="24" width="18" height="18" rx="3" fill="#3E7BF5" fillOpacity="0.85" />
        <circle cx="22" cy="22" r="3.5" fill="white" opacity=".95" />
      </svg>
    </div>
  );
}
