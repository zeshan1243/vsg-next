interface LogoMarkProps {
  size?: number;
}

export default function LogoMark({ size = 44 }: LogoMarkProps) {
  return (
    <div style={{ width: size, height: size, flexShrink: 0 }}>
      <svg viewBox="0 0 44 44" fill="none" width={size} height={size}>
        {/* Top-left: Red (Quad C) */}
        <rect x="2" y="2" width="18" height="18" rx="3" fill="#EF4444" />
        {/* Top-right: Green (Quad D) */}
        <rect x="24" y="2" width="18" height="18" rx="3" fill="#22C55E" />
        {/* Bottom-left: Yellow (Quad A) */}
        <rect x="2" y="24" width="18" height="18" rx="3" fill="#FFAB00" />
        {/* Bottom-right: Blue (Quad B) */}
        <rect x="24" y="24" width="18" height="18" rx="3" fill="#3B82F6" />
        <circle cx="22" cy="22" r="3.5" fill="white" />
      </svg>
    </div>
  );
}
