interface LogoMarkProps {
  size?: number;
}

export default function LogoMark({ size = 44 }: LogoMarkProps) {
  return (
    <div style={{ width: size, height: size, flexShrink: 0 }}>
      <svg viewBox="0 0 44 44" fill="none" width={size} height={size}>
        <rect x="2" y="2" width="18" height="18" rx="3" fill="rgba(200,151,58,.9)" />
        <rect x="24" y="2" width="18" height="18" rx="3" fill="rgba(42,184,216,.7)" />
        <rect x="2" y="24" width="18" height="18" rx="3" fill="rgba(42,184,216,.6)" />
        <rect x="24" y="24" width="18" height="18" rx="3" fill="rgba(200,151,58,.55)" />
        <circle cx="22" cy="22" r="3.5" fill="white" opacity=".9" />
      </svg>
    </div>
  );
}
