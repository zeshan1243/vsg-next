'use client';

import { useEffect, useRef, useState, type ChangeEvent } from 'react';

interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  organization: string;
  phone: string;
}

const INITIAL_INFO: PersonalInfo = {
  firstName: 'Sarah',
  lastName: 'Kaplan',
  email: 'sarah@company.com',
  organization: 'Kaplan Ventures LLC',
  phone: '(970) 555-0142',
};

const PencilIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
  </svg>
);

const CameraIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const LockIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const CloseIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

interface PasswordDraft {
  current: string;
  next: string;
  confirm: string;
}

const EMPTY_PASSWORD: PasswordDraft = { current: '', next: '', confirm: '' };

export default function ProfilePage() {
  const [info, setInfo] = useState<PersonalInfo>(INITIAL_INFO);
  const [draft, setDraft] = useState<PersonalInfo>(INITIAL_INFO);
  const [editing, setEditing] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [pwDrawer, setPwDrawer] = useState(false);
  const [pw, setPw] = useState<PasswordDraft>(EMPTY_PASSWORD);
  const [twoFa, setTwoFa] = useState(true);

  useEffect(() => {
    return () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl);
    };
  }, [photoUrl]);

  useEffect(() => {
    if (!pwDrawer) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closePwDrawer();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pwDrawer]);

  function startEdit() { setDraft(info); setEditing(true); }
  function cancelEdit() { setDraft(info); setEditing(false); }
  function saveEdit() { setInfo(draft); setEditing(false); }

  function onPhotoSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    setPhotoUrl(URL.createObjectURL(file));
    e.target.value = '';
  }

  function openPwDrawer() {
    setPw(EMPTY_PASSWORD);
    setPwDrawer(true);
  }
  function closePwDrawer() {
    setPwDrawer(false);
    setPw(EMPTY_PASSWORD);
  }
  const pwValid =
    pw.current.length > 0 &&
    pw.next.length >= 8 &&
    pw.next === pw.confirm;
  function submitPw() {
    if (!pwValid) return;
    closePwDrawer();
  }

  const initials = `${info.firstName[0] ?? ''}${info.lastName[0] ?? ''}`.toUpperCase();
  const fullName = `${info.firstName} ${info.lastName}`.trim();

  return (
    <>
      {/* ── Topbar ── */}
      <div className="topbar">
        <div className="topbar-left">
          <div className="page-title">Settings &amp; Profile</div>
          <div className="page-subtitle">Manage your account and preferences</div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="creator-content">
        <div className="profile-layout">

          {/* ── Left column ── */}
          <div className="profile-col-left">

            {/* Avatar card */}
            <div className="avatar-card">
              <div
                className="avatar-xl"
                style={photoUrl ? {
                  backgroundImage: `url(${photoUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  color: 'transparent',
                } : undefined}
              >
                {!photoUrl && initials}
              </div>
              <div className="avatar-name-display">{fullName}</div>
              <div className="avatar-role-badge">Creator</div>
              <div className="avatar-stats-row">
                <div className="avatar-stat">
                  <div className="avatar-stat-val">5</div>
                  <div className="avatar-stat-label">Molecules</div>
                </div>
                <div className="avatar-stat">
                  <div className="avatar-stat-val">12</div>
                  <div className="avatar-stat-label">Team</div>
                </div>
                <div className="avatar-stat">
                  <div className="avatar-stat-val">42</div>
                  <div className="avatar-stat-label">Tasks Done</div>
                </div>
              </div>
              <button
                className="btn-change-photo"
                type="button"
                onClick={() => fileRef.current?.click()}
              >
                {CameraIcon}
                <span>{photoUrl ? 'Replace Photo' : 'Change Photo'}</span>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={onPhotoSelect}
              />
            </div>

            {/* Account details card */}
            <div className="profile-info-card">
              <div className="info-card-header">
                <div className="info-card-title">Account Details</div>
              </div>
              <div className="info-row">
                <span className="info-row-label">Role</span>
                <span className="info-row-value">Creator</span>
              </div>
              <div className="info-row">
                <span className="info-row-label">Joined</span>
                <span className="info-row-value">Jan 15, 2026</span>
              </div>
              <div className="info-row">
                <span className="info-row-label">Last Login</span>
                <span className="info-row-value">Today, 9:12 AM</span>
              </div>
              <div className="info-row">
                <span className="info-row-label">2FA</span>
                <div className="info-row-2fa">
                  <span
                    className="info-row-value"
                    style={{ color: twoFa ? 'var(--success)' : 'var(--muted)' }}
                  >
                    {twoFa ? 'Enabled' : 'Disabled'}
                  </span>
                  <button
                    type="button"
                    className={`toggle-sw${twoFa ? ' on' : ''}`}
                    onClick={() => setTwoFa(v => !v)}
                    aria-label={twoFa ? 'Disable 2FA' : 'Enable 2FA'}
                    aria-pressed={twoFa}
                  />
                </div>
              </div>
            </div>

          </div>

          {/* ── Right column ── */}
          <div className="profile-col-right">

            {/* Personal information */}
            <div className="profile-form-card" style={{ animationDelay: '.08s' }}>
              <div className="panel-card-header profile-card-header">
                <div>
                  <div className="panel-card-title">Personal Information</div>
                  <div className="panel-card-sub">
                    {editing ? 'Update your personal details' : 'Your saved personal details'}
                  </div>
                </div>
                {!editing && (
                  <button type="button" className="btn-edit-section" onClick={startEdit}>
                    {PencilIcon}
                    <span>Edit</span>
                  </button>
                )}
              </div>

              <div className="panel-card-body">
                {editing ? (
                  <>
                    <div className="fc-row" style={{ marginBottom: '22px' }}>
                      <div>
                        <label className="fc-label">First Name</label>
                        <input
                          className="fc-input"
                          type="text"
                          value={draft.firstName}
                          onChange={e => setDraft(d => ({ ...d, firstName: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="fc-label">Last Name</label>
                        <input
                          className="fc-input"
                          type="text"
                          value={draft.lastName}
                          onChange={e => setDraft(d => ({ ...d, lastName: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="fc-group">
                      <label className="fc-label">Email Address</label>
                      <input
                        className="fc-input"
                        type="email"
                        value={draft.email}
                        onChange={e => setDraft(d => ({ ...d, email: e.target.value }))}
                      />
                    </div>
                    <div className="fc-group">
                      <label className="fc-label">Organization</label>
                      <input
                        className="fc-input"
                        type="text"
                        value={draft.organization}
                        onChange={e => setDraft(d => ({ ...d, organization: e.target.value }))}
                      />
                    </div>
                    <div className="fc-group">
                      <label className="fc-label">Phone</label>
                      <input
                        className="fc-input"
                        type="tel"
                        value={draft.phone}
                        onChange={e => setDraft(d => ({ ...d, phone: e.target.value }))}
                      />
                    </div>
                    <div className="form-actions">
                      <button className="fc-btn-secondary" type="button" onClick={cancelEdit}>Cancel</button>
                      <button className="fc-btn-primary" type="button" onClick={saveEdit}>Save Changes</button>
                    </div>
                  </>
                ) : (
                  <div className="profile-readonly-grid">
                    <div className="profile-readonly-row">
                      <span className="profile-readonly-label">First Name</span>
                      <span className="profile-readonly-value">{info.firstName}</span>
                    </div>
                    <div className="profile-readonly-row">
                      <span className="profile-readonly-label">Last Name</span>
                      <span className="profile-readonly-value">{info.lastName}</span>
                    </div>
                    <div className="profile-readonly-row">
                      <span className="profile-readonly-label">Email Address</span>
                      <span className="profile-readonly-value">{info.email}</span>
                    </div>
                    <div className="profile-readonly-row">
                      <span className="profile-readonly-label">Organization</span>
                      <span className="profile-readonly-value">{info.organization}</span>
                    </div>
                    <div className="profile-readonly-row">
                      <span className="profile-readonly-label">Phone</span>
                      <span className="profile-readonly-value">{info.phone}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Security */}
            <div className="profile-form-card" style={{ animationDelay: '.16s' }}>
              <div className="panel-card-header">
                <div className="panel-card-title">Security</div>
                <div className="panel-card-sub">Update your password and security settings</div>
              </div>
              <div className="panel-card-body">
                <div className="security-row">
                  <div className="security-row-icon">{LockIcon}</div>
                  <div className="security-row-body">
                    <div className="security-row-title">Password</div>
                    <div className="security-row-desc">
                      Last changed 2 months ago. Use a strong, unique password.
                    </div>
                  </div>
                  <button type="button" className="btn-edit-section" onClick={openPwDrawer}>
                    {LockIcon}
                    <span>Change Password</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Change Password drawer ── */}
      {pwDrawer && (
        <div
          className="drawer-overlay show"
          onClick={closePwDrawer}
          role="presentation"
        >
          <div
            className="drawer pw-drawer"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="pw-drawer-title"
          >
            <div className="drawer-head">
              <div className="drawer-head-top">
                <div>
                  <div className="drawer-title" id="pw-drawer-title">Change Password</div>
                  <div className="drawer-id">Use at least 8 characters with a mix of letters and numbers.</div>
                </div>
                <button
                  type="button"
                  className="drawer-close"
                  onClick={closePwDrawer}
                  aria-label="Close"
                >
                  {CloseIcon}
                </button>
              </div>
            </div>

            <div className="drawer-body">
              <div className="pw-drawer-body">
                <div className="fc-group">
                  <label className="fc-label">Current Password</label>
                  <input
                    className="fc-input"
                    type="password"
                    placeholder="Enter current password"
                    value={pw.current}
                    onChange={e => setPw(p => ({ ...p, current: e.target.value }))}
                    autoFocus
                  />
                </div>
                <div className="fc-group">
                  <label className="fc-label">New Password</label>
                  <input
                    className="fc-input"
                    type="password"
                    placeholder="At least 8 characters"
                    value={pw.next}
                    onChange={e => setPw(p => ({ ...p, next: e.target.value }))}
                  />
                </div>
                <div className="fc-group">
                  <label className="fc-label">Confirm New Password</label>
                  <input
                    className="fc-input"
                    type="password"
                    placeholder="Re-enter new password"
                    value={pw.confirm}
                    onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))}
                  />
                  {pw.confirm.length > 0 && pw.next !== pw.confirm && (
                    <div className="fc-hint" style={{ color: 'var(--error)' }}>
                      Passwords do not match.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="drawer-foot">
              <button type="button" className="fc-btn-secondary" onClick={closePwDrawer}>
                Cancel
              </button>
              <button
                type="button"
                className="fc-btn-primary"
                onClick={submitPw}
                disabled={!pwValid}
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
