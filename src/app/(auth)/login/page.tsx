'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LogoMark from '@/components/auth/LogoMark';

type Role = 'lead' | 'stump' | 'admin';

// Rendered into a 2-col CSS grid: row 1 = C, D · row 2 = A, B
const QUAD_CELLS = [
  ['Quadrant C', 'Knowledge'],
  ['Quadrant D', 'Exchange'],
  ['Quadrant A', 'Coordination'],
  ['Quadrant B', 'Communication'],
] as const;

const HIER_PILLS = [
  { level: 'L1', label: 'OKR', delay: '.15s' },
  { level: 'L2', label: 'KPI', delay: '.25s' },
  { level: 'L3', label: 'Job', delay: '.35s' },
  { level: 'L4', label: 'Task', delay: '.45s' },
];

export default function LoginPage() {
  const [activeRole, setActiveRole] = useState<Role>('lead');
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
    if (!email || !password) { showToast('Please fill in all fields.', false); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast('Enter a valid email address.', false); return; }
    setLoading(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 1800);
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
            Strategy meets<br /><em style={{ fontStyle: 'normal', color: 'var(--gold)' }}>execution.</em><br />Verified.
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {HIER_PILLS.map(({ level, label, delay }) => (
              <div key={level} className="hier-pill" style={{ animationDelay: delay }}>
                <span className="hier-level">{level}</span>
                {label}
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* ── Right form panel ── */}
      <main className="form-panel">
        <div className="form-card">

          <div style={{ marginBottom: '36px' }}>
            <div className="form-head-eyebrow">
              <span className="eyebrow-line" />
              Secure Access
            </div>
            <h1 className="font-syne" style={{ fontSize: '34px', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-.6px', lineHeight: 1.1, marginBottom: '10px' }}>
              Welcome back.
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.55 }}>
              Sign in to your Molecule workspace and continue where you left off.
            </p>
          </div>

          {/* Role tabs */}
          <div className="role-tabs">
            {(['lead', 'stump', 'admin'] as Role[]).map((role) => (
              <div
                key={role}
                className={`role-tab${activeRole === role ? ' active' : ''}`}
                onClick={() => setActiveRole(role)}
              >
                {role === 'lead' ? 'Lead' : role === 'stump' ? 'Stump' : 'Platform Admin'}
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '26px' }}>
            <label
              style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--muted)', cursor: 'pointer', userSelect: 'none' }}
              onClick={() => setRemembered(!remembered)}
            >
              <div className={`custom-cb${remembered ? ' checked' : ''}`} />
              Remember me
            </label>
            <Link
              href="/forgot-password"
              style={{ fontSize: '13px', fontWeight: 500, color: 'var(--gold)', textDecoration: 'none' }}
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
