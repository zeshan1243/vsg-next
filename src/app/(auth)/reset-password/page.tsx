'use client';

import { useState, useEffect } from 'react';
import LogoMark from '@/components/auth/LogoMark';

const RULES = [
  { id: 'len',     label: 'At least 8 characters',          test: (v: string) => v.length >= 8 },
  { id: 'upper',   label: 'One uppercase letter (A–Z)',      test: (v: string) => /[A-Z]/.test(v) },
  { id: 'num',     label: 'One number (0–9)',                test: (v: string) => /[0-9]/.test(v) },
  { id: 'special', label: 'One special character (!@#$…)', test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

const STRENGTH_LEVELS = [
  { label: 'Weak',   cls: 'weak',   segs: 1 },
  { label: 'Fair',   cls: 'fair',   segs: 2 },
  { label: 'Good',   cls: 'good',   segs: 3 },
  { label: 'Strong', cls: 'strong', segs: 4 },
] as const;

export default function ResetPasswordPage() {
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const score = RULES.filter(r => r.test(newPw)).length;
  const allMet = score === 4;
  const matches = newPw === confirmPw && confirmPw.length > 0;
  const canSubmit = allMet && matches;
  const strength = newPw ? STRENGTH_LEVELS[Math.max(0, score - 1)] : null;

  useEffect(() => {
    if (!submitted) return;
    const iv = setInterval(() => {
      setCountdown(n => {
        if (n <= 1) { clearInterval(iv); window.location.href = '/login'; return 0; }
        return n - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [submitted]);

  function handleReset() {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 2200);
  }

  const matchStatus = confirmPw.length === 0 ? null : matches;

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
          {/* Shield with pulse rings */}
          <div className="shield-visual">
            <div className="pulse-ring" />
            <div className="pulse-ring" />
            <div className="pulse-ring" />
            <div style={{ position: 'relative', zIndex: 2, color: 'var(--gold)' }}>
              <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
            </div>
          </div>

          {/* Live requirements checklist */}
          <div className="req-list">
            {RULES.map(rule => (
              <div key={rule.id} className={`req-item${rule.test(newPw) ? ' met' : ''}`}>
                <div className="req-check" />
                {rule.label}
              </div>
            ))}
          </div>
        </div>

        <div className="brand-bottom">
          <p className="brand-tagline">
            New password,<br /><em style={{ fontStyle: 'normal', color: 'var(--gold)' }}>fresh start.</em>
          </p>
          <p className="brand-sub">
            Choose a strong password to secure your Molecule workspace and all linked OKR data.
          </p>
        </div>
      </aside>

      {/* ── Right form panel ── */}
      <main className="form-panel">
        <div className="form-card">

          {!submitted ? (
            <>
              {/* Step bar */}
              <div className="step-bar">
                <div className="step-node">
                  <div className="step-dot-sm done">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span className="step-sl done">Email sent</span>
                </div>
                <div className="step-connector filled" />
                <div className="step-node">
                  <div className="step-dot-sm done">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span className="step-sl done">Link verified</span>
                </div>
                <div className="step-connector filled" />
                <div className="step-node">
                  <div className="step-dot-sm active">3</div>
                  <span className="step-sl active">New password</span>
                </div>
              </div>

              <div className="icon-header" style={{ marginBottom: '8px' }}>
                <div className="icon-box">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <polyline points="9 12 11 14 15 10" />
                  </svg>
                </div>
                <div>
                  <div className="icon-eyebrow">Step 3 of 3</div>
                  <h1 className="font-syne" style={{ fontSize: '28px', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-.5px' }}>
                    Reset password
                  </h1>
                </div>
              </div>

              <p className="form-desc" style={{ marginTop: '10px' }}>
                Create a new secure password for your VSG account. Make sure it meets all the requirements shown on the left.
              </p>

              {/* New password */}
              <div className="field-group">
                <label className="field-label" htmlFor="newPw">New Password</label>
                <div className="field-wrap">
                  <span className="field-icon">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    className="field-input"
                    id="newPw"
                    type={showNew ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    style={{ paddingRight: '48px' }}
                    value={newPw}
                    onChange={e => setNewPw(e.target.value)}
                  />
                  <button className="toggle-pw" type="button" onClick={() => setShowNew(!showNew)} aria-label="Toggle password">
                    {showNew ? (
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

                {/* Strength meter */}
                {newPw && strength && (
                  <div style={{ marginTop: '10px' }}>
                    <div className="strength-bar">
                      {[1, 2, 3, 4].map(i => (
                        <div
                          key={i}
                          className={`strength-seg${i <= strength.segs ? ` ${strength.cls}` : ''}`}
                        />
                      ))}
                    </div>
                    <div className={`strength-label ${strength.cls}`}>{strength.label}</div>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div className="field-group">
                <label className="field-label" htmlFor="confirmPw">Confirm Password</label>
                <div className="field-wrap">
                  <span className="field-icon">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </span>
                  <input
                    className={`field-input${matchStatus === true ? ' valid' : matchStatus === false ? ' invalid' : ''}`}
                    id="confirmPw"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Re-enter your password"
                    style={{ paddingRight: '48px' }}
                    value={confirmPw}
                    onChange={e => setConfirmPw(e.target.value)}
                  />
                  <button className="toggle-pw" type="button" onClick={() => setShowConfirm(!showConfirm)} aria-label="Toggle confirm password">
                    {showConfirm ? (
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
                {matchStatus !== null && (
                  <div className={`match-msg${matchStatus ? ' ok' : ' no'}`}>
                    {matchStatus ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </div>
                )}
              </div>

              <button
                className="btn-primary"
                onClick={handleReset}
                disabled={!canSubmit || loading}
                type="button"
                style={{ marginTop: '8px' }}
              >
                {loading ? (
                  <div className="spinner" />
                ) : (
                  <>
                    <span>Set New Password</span>
                    <div className="btn-arrow">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                      </svg>
                    </div>
                  </>
                )}
              </button>
            </>
          ) : (
            <div className="success-card">
              <div className="success-icon-lg">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
              </div>
              <h2 className="font-syne" style={{ fontSize: '26px', fontWeight: 800, color: 'var(--navy)', marginBottom: '12px' }}>
                Password updated!
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.65, marginBottom: '32px' }}>
                Your VSG password has been successfully reset. You can now sign in to your Molecule workspace with your new credentials.
              </p>

              <button className="btn-primary" onClick={() => window.location.href = '/login'} type="button">
                <span>Go to Sign In</span>
                <div className="btn-arrow">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
              </button>

              <div style={{ marginTop: '16px', fontSize: '13px', color: 'var(--muted)', textAlign: 'center' }}>
                Redirecting automatically in{' '}
                <span className="font-syne" style={{ color: 'var(--gold)', fontWeight: 600 }}>{countdown}s</span>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
