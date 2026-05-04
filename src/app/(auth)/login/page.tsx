'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LogoMark from '@/components/auth/LogoMark';
import { type UserRole } from '@/lib/useRole';

type Role = UserRole;

const ROLES: { key: Role; label: string; enabled: boolean }[] = [
  { key: 'creator', label: 'Creator', enabled: true },
  { key: 'lead', label: 'Lead', enabled: true },
  { key: 'stump', label: 'Stump', enabled: true },
  { key: 'sub-stump', label: 'Sub-Stump', enabled: true },
  { key: 'admin', label: 'Platform Admin', enabled: false },
];

// Rendered into a 2-col CSS grid: row 1 = C, D · row 2 = A, B
const QUAD_CELLS = [
  ['Quadrant C', 'Knowledge'],
  ['Quadrant D', 'Exchange'],
  ['Quadrant A', 'Coordination'],
  ['Quadrant B', 'Communication'],
] as const;

const HIER_PILLS = [
  { level: 'L1', label: 'OKR', delay: '.15s', color: 'var(--quad-a)' },
  { level: 'L2', label: 'KPI', delay: '.25s', color: 'var(--quad-b)' },
  { level: 'L3', label: 'Job', delay: '.35s', color: 'var(--quad-c)' },
  { level: 'L4', label: 'Task', delay: '.45s', color: 'var(--quad-d)' },
];

export default function LoginPage() {
  const [activeRole, setActiveRole] = useState<Role>('creator');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [remembered, setRemembered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ msg: '', ok: false, visible: false });
  const router = useRouter();

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok, visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3500);
  }

  function handleLogin() {
    // For enabled roles (Creator, Lead), no credentials needed for now
    const currentRole = ROLES.find(r => r.key === activeRole);
    if (!currentRole?.enabled) {
      showToast('This role is not available yet.', false);
      return;
    }
    setLoading(true);
    // Save role to localStorage
    localStorage.setItem('vsg-role', activeRole);
    setTimeout(() => {
      router.push('/dashboard');
    }, 1200);
  }

  return (
    <div className="auth-shell">

      {/* ── Left brand panel ── */}
      <aside className="brand">
        <div className="grid-overlay" />

        <div className="brand-logo">
          <LogoMark size={44} />
          <div className="logo-text">
            Veracity <span style={{ color: 'var(--gold)' }}>Space</span>
          </div>
        </div>

        <div className="brand-centre">
          <div className="quad-grid">
            {QUAD_CELLS.map(([qlabel, qtitle]) => (
              <div key={qlabel} className="quad-cell">
                <div className="q-label">{qlabel}</div>
                <div className="q-title">{qtitle}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="brand-bottom">
          <p className="brand-tagline">
            Strategy meets<br /><span style={{ color: 'var(--quad-a)' }}>execution.</span>
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {HIER_PILLS.map(({ level, label, delay, color }) => (
              <div key={level} className="hier-pill" style={{ animationDelay: delay }}>
                <span className="hier-level" style={{ color }}>{level}</span>
                {label}
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* ── Right form panel ── */}
      <main className="form-panel">
        <div className="form-card">

          <div style={{ marginBottom: '32px' }}>
            <p className="text-xs-medium" style={{ color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
              Secure Access
            </p>
            <h1 className="display-xs-semibold" style={{ color: 'var(--navy)', marginBottom: '8px' }}>
              Welcome back
            </h1>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              Sign in to continue to your workspace
            </p>
          </div>

          {/* Role tabs */}
          <div className="role-tabs">
            {ROLES.map(({ key, label, enabled }) => (
              <div
                key={key}
                className={`role-tab${activeRole === key ? ' active' : ''}${!enabled ? ' disabled' : ''}`}
                onClick={() => enabled && setActiveRole(key)}
                title={!enabled ? 'Coming soon' : undefined}
              >
                {label}
                {!enabled && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: 4, opacity: 0.5 }}>
                    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                )}
              </div>
            ))}
          </div>

          {/* Email */}
          <div className="field-group">
            <label className="field-label" htmlFor="email">Email Address</label>
            <div className="field-wrap">
              <span className="field-icon">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </span>
              <input
                className="field-input"
                id="email"
                type="email"
                placeholder="you@organization.com"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
            </div>
          </div>

          {/* Password */}
          <div className="field-group">
            <label className="field-label" htmlFor="password">Password</label>
            <div className="field-wrap">
              <span className="field-icon">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                className="field-input"
                id="password"
                type={showPw ? 'text' : 'password'}
                placeholder="Enter your password"
                autoComplete="current-password"
                style={{ paddingRight: '48px' }}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
              <button className="toggle-pw" type="button" onClick={() => setShowPw(!showPw)} aria-label="Toggle password">
                {showPw ? (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Meta row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
            <label
              className="text-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)', cursor: 'pointer', userSelect: 'none' }}
              onClick={() => setRemembered(!remembered)}
            >
              <div className={`custom-cb${remembered ? ' checked' : ''}`} />
              Remember me
            </label>
            <Link
              href="/forgot-password"
              className="text-sm-medium"
              style={{ color: 'var(--navy)', textDecoration: 'none', transition: 'color .2s' }}
              onMouseOver={(e) => e.currentTarget.style.color = 'var(--quad-b)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--navy)'}
            >
              Forgot password?
            </Link>
          </div>

          {/* Login button */}
          <button className="btn-primary" onClick={handleLogin} disabled={loading} type="button">
            {loading ? (
              <div className="spinner" />
            ) : (
              <>
                <span>Sign In to VSG</span>
                <div className="btn-arrow">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
              </>
            )}
          </button>


        </div>
      </main>

      {/* Toast */}
      <div className={`toast${toast.visible ? ' show' : ''}`}>
        <div className={`toast-dot${toast.ok ? ' ok' : ''}`} />
        <span>{toast.msg}</span>
      </div>
    </div>
  );
}
