'use client';

import { useState } from 'react';

interface NotifState {
  molecules: boolean;
  flags: boolean;
  team: boolean;
  digest: boolean;
}

export default function ProfilePage() {
  const [notifs, setNotifs] = useState<NotifState>({
    molecules: true,
    flags: true,
    team: true,
    digest: false,
  });

  function toggle(key: keyof NotifState) {
    setNotifs(prev => ({ ...prev, [key]: !prev[key] }));
  }

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
              <div className="avatar-xl">SK</div>
              <div className="avatar-name-display">Sarah Kaplan</div>
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
              <button className="btn-change-photo" type="button">Change Photo</button>
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
                <span className="info-row-value" style={{ color: 'var(--success)' }}>Enabled</span>
              </div>
            </div>

          </div>

          {/* ── Right column ── */}
          <div className="profile-col-right">

            {/* Personal information */}
            <div className="profile-form-card" style={{ animationDelay: '.08s' }}>
              <div className="panel-card-header">
                <div className="panel-card-title">Personal Information</div>
                <div className="panel-card-sub">Update your personal details</div>
              </div>
              <div className="panel-card-body">
                <div className="fc-row" style={{ marginBottom: '22px' }}>
                  <div>
                    <label className="fc-label">First Name</label>
                    <input className="fc-input" type="text" defaultValue="Sarah" />
                  </div>
                  <div>
                    <label className="fc-label">Last Name</label>
                    <input className="fc-input" type="text" defaultValue="Kaplan" />
                  </div>
                </div>
                <div className="fc-group">
                  <label className="fc-label">Email Address</label>
                  <input className="fc-input" type="email" defaultValue="sarah@company.com" />
                </div>
                <div className="fc-group">
                  <label className="fc-label">Organization</label>
                  <input className="fc-input" type="text" defaultValue="Kaplan Ventures LLC" />
                </div>
                <div className="fc-group">
                  <label className="fc-label">Phone</label>
                  <input className="fc-input" type="tel" defaultValue="(970) 555-0142" />
                </div>
                <div className="form-actions">
                  <button className="fc-btn-secondary" type="button">Cancel</button>
                  <button className="fc-btn-primary" type="button">Save Changes</button>
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="profile-form-card" style={{ animationDelay: '.16s' }}>
              <div className="panel-card-header">
                <div className="panel-card-title">Security</div>
                <div className="panel-card-sub">Update your password and security settings</div>
              </div>
              <div className="panel-card-body">
                <div className="fc-group">
                  <label className="fc-label">Current Password</label>
                  <input className="fc-input" type="password" placeholder="Enter current password" />
                </div>
                <div className="fc-row" style={{ marginBottom: '22px' }}>
                  <div>
                    <label className="fc-label">New Password</label>
                    <input className="fc-input" type="password" placeholder="New password" />
                  </div>
                  <div>
                    <label className="fc-label">Confirm Password</label>
                    <input className="fc-input" type="password" placeholder="Confirm new password" />
                  </div>
                </div>
                <div className="form-actions">
                  <button className="fc-btn-primary" type="button">Update Password</button>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="profile-form-card" style={{ animationDelay: '.24s' }}>
              <div className="panel-card-header">
                <div className="panel-card-title">Notifications</div>
                <div className="panel-card-sub">Choose how you&apos;d like to be notified</div>
              </div>
              <div className="panel-card-body">
                <div className="toggle-row">
                  <div className="toggle-text">
                    <div className="toggle-label">Molecule Updates</div>
                    <div className="toggle-desc">Get notified when molecules progress to new phases</div>
                  </div>
                  <button
                    type="button"
                    className={`toggle-sw${notifs.molecules ? ' on' : ''}`}
                    onClick={() => toggle('molecules')}
                    aria-pressed={notifs.molecules}
                  />
                </div>
                <div className="toggle-row">
                  <div className="toggle-text">
                    <div className="toggle-label">Flag &amp; Warning Alerts</div>
                    <div className="toggle-desc">Immediate alerts when flags or warnings are raised</div>
                  </div>
                  <button
                    type="button"
                    className={`toggle-sw${notifs.flags ? ' on' : ''}`}
                    onClick={() => toggle('flags')}
                    aria-pressed={notifs.flags}
                  />
                </div>
                <div className="toggle-row">
                  <div className="toggle-text">
                    <div className="toggle-label">Team Activity</div>
                    <div className="toggle-desc">Notifications when team members join or change roles</div>
                  </div>
                  <button
                    type="button"
                    className={`toggle-sw${notifs.team ? ' on' : ''}`}
                    onClick={() => toggle('team')}
                    aria-pressed={notifs.team}
                  />
                </div>
                <div className="toggle-row">
                  <div className="toggle-text">
                    <div className="toggle-label">Email Digest</div>
                    <div className="toggle-desc">Weekly summary of all workspace activity</div>
                  </div>
                  <button
                    type="button"
                    className={`toggle-sw${notifs.digest ? ' on' : ''}`}
                    onClick={() => toggle('digest')}
                    aria-pressed={notifs.digest}
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
