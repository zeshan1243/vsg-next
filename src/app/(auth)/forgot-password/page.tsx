'use client';

import { useState } from 'react';
import Link from 'next/link';
import LogoMark from '@/components/auth/LogoMark';

const STEPS = [
  { label: 'Submit Email', desc: 'Enter your registered address', active: true },
  { label: 'Check Inbox', desc: 'Receive secure reset link', active: false },
  { label: 'Reset & Return', desc: 'Set new password, sign in', active: false },
];

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [toast, setToast] = useState({ msg: '', ok: false, visible: false });

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok, visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3500);
  }

  function handleSend() {
    if (!email.trim()) { showToast('Please enter your email address.', false); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast('Enter a valid email address.', false); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 2000);
  }

  function handleResend() {
    const next = resendCount + 1;
    if (next > 2) { showToast('Too many attempts. Please contact support.', false); return; }
    setResendCount(next);
    setResending(true);
    setTimeout(() => {
      setResending(false);
      showToast('Reset link resent successfully!', true);
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
          {/* Animated lock rings */}
          <div className="lock-visual">
            <div className="ring-outer" />
            <div className="ring-mid" />
            <div className="lock-core">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(200,151,58,.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                <circle cx="12" cy="16" r="1.5" fill="rgba(200,151,58,.8)" stroke="none" />
              </svg>
            </div>
          </div>

          {/* 3-step recovery process */}
          <div className="steps-track">
            {STEPS.map(({ label, desc, active }, i) => (
              <div key={label} className={`step-item${i === 0 ? ' current' : ''}`}>
                <div className={`step-dot ${active ? 'active' : 'pending'}`}>{i + 1}</div>
                <div className="step-info">
                  <div className="s-label">{label}</div>
                  <div className="s-desc">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="brand-bottom">
          <p className="brand-tagline">
            Secure access,<br /><em style={{ fontStyle: 'normal', color: 'var(--gold)' }}>always.</em>
          </p>
          <p className="brand-sub">
            Your Molecule workspace is protected with enterprise-grade security. Reset links expire in 15 minutes.
          </p>
        </div>
      </aside>

      {/* ── Right form panel ── */}
      <main className="form-panel">
        <div className="form-card">

          {!submitted ? (
            <>
              <Link href="/login" className="back-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform .2s' }}>
                  <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                </svg>
                Back to Sign In
              </Link>

              <div className="icon-header">
                <div className="icon-box">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                    <circle cx="12" cy="16" r="1" fill="currentColor" />
                  </svg>
                </div>
                <div>
                  <div className="icon-eyebrow">Account Recovery</div>
                  <h1 className="font-syne" style={{ fontSize: '28px', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-.5px' }}>
                    Forgot password?
                  </h1>
                </div>
              </div>

              <p className="form-desc" style={{ marginBottom: '32px' }}>
                No problem — it happens. Enter your <strong style={{ color: 'var(--ink)', fontWeight: 600 }}>registered email address</strong> below and we&apos;ll send you a secure link to reset your VSG password.
              </p>

              <div className="info-pill">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}>
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p>
                  The reset link will be valid for <strong style={{ color: 'var(--ink)' }}>15 minutes</strong> and can only be used once.{' '}
                  <span style={{ color: 'var(--muted)' }}>Check your spam folder if you don&apos;t see it.</span>
                </p>
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="email">Registered Email Address</label>
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
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                  />
                </div>
              </div>

              <button className="btn-primary" onClick={handleSend} disabled={loading} type="button">
                {loading ? (
                  <div className="spinner" />
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <div className="btn-arrow">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                      </svg>
                    </div>
                  </>
                )}
              </button>

              <div style={{ marginTop: '14px', textAlign: 'center', fontSize: '13px', color: 'var(--muted)' }}>
                Remembered it?{' '}
                <Link href="/login" style={{ color: 'var(--gold)', fontWeight: 600, textDecoration: 'none' }}>
                  Sign in instead →
                </Link>
              </div>
            </>
          ) : (
            <div className="success-card">
              <div className="success-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h2 className="font-syne" style={{ fontSize: '26px', fontWeight: 800, color: 'var(--navy)', marginBottom: '12px' }}>
                Check your inbox
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.65, marginBottom: '32px' }}>
                We&apos;ve sent a password reset link to{' '}
                <strong style={{ color: 'var(--ink)' }}>{email}</strong>.
                Follow the instructions in the email to regain access to your Molecule workspace.
              </p>

              <button className="btn-primary" onClick={() => window.location.href = '/login'} type="button">
                <span>Return to Sign In</span>
                <div className="btn-arrow">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
              </button>

              <div style={{ marginTop: '22px', textAlign: 'center', fontSize: '13px', color: 'var(--muted)' }}>
                Didn&apos;t receive it?{' '}
                <button
                  onClick={handleResend}
                  disabled={resending}
                  style={{ background: 'none', border: 'none', color: 'var(--gold)', fontWeight: 600, fontFamily: 'inherit', fontSize: '13px', cursor: 'pointer' }}
                >
                  {resending ? 'Sending…' : 'Resend email'}
                </button>
              </div>
            </div>
          )}

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
