'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { MOLECULES } from '@/lib/molecules';

const DASHBOARD_MOLECULES = MOLECULES.filter(m => m.status === 'progress').slice(0, 3);

function formatToday(): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  }).format(new Date());
}

export default function DashboardPage() {
  const router = useRouter();
  const [today, setToday] = useState('');

  useEffect(() => { setToday(formatToday()); }, []);

  return (
    <>
      {/* ── Topbar ── */}
      <div className="topbar">
        <div className="topbar-left">
          <div className="page-title">Creator Dashboard</div>
          <div className="page-subtitle">
            {today ? `${today} · Your workspace overview` : 'Your workspace overview'}
          </div>
        </div>
        <div className="topbar-actions">
          <div className="btn-icon" title="Notifications">
            <div className="notif-dot" />
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <button className="btn-primary-sm" type="button" onClick={() => router.push('/molecules/new')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Molecule
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="creator-content">

        {/* Welcome banner */}
        <div className="welcome-banner">
          <div className="wb-content">
            <div className="wb-eyebrow">Good morning, Sarah</div>
            <div className="wb-title">Your workspace is performing well.</div>
            <div className="wb-sub">You have 5 active Molecules.</div>
            <div className="wb-stats">
              <div><div className="wb-stat-val">7</div><div className="wb-stat-label">Total Molecules</div></div>
              <div><div className="wb-stat-val">5</div><div className="wb-stat-label">Active Molecules</div></div>
              <div><div className="wb-stat-val">2</div><div className="wb-stat-label">Completed Molecules</div></div>
            </div>
          </div>
        </div>

        {/* Molecules table */}
        <div className="dash-card" style={{ animationDelay: '.08s', marginBottom: '24px' }}>
          <div className="dash-card-header">
            <div>
              <div className="dash-card-title">My Molecules</div>
              <div className="dash-card-subtitle">All projects under your account</div>
            </div>
            <Link className="dash-card-link" href="/molecules">View all →</Link>
          </div>
          <div className="mol-table">
            <div className="mol-row mol-head">
              <div className="mol-col">Molecule</div>
              <div className="mol-col mol-col-center">Phase</div>
              <div className="mol-col mol-col-center">Progress</div>
              <div className="mol-col mol-col-center">Lead</div>
              <div className="mol-col mol-col-right">Updated</div>
            </div>
            {DASHBOARD_MOLECULES.map(m => (
              <div
                key={m.id}
                className="mol-row"
                onClick={() => router.push(`/molecules/${m.id}`)}
              >
                <div className="mol-name-wrap">
                  <div className="mol-dot" style={{ background: m.dotColor }} />
                  <div>
                    <div className="mol-name">{m.name}</div>
                    <div className="mol-lead-text">{m.leadHint}</div>
                  </div>
                </div>
                <div className="mol-col-center">
                  <span className={`phase-badge ${m.phaseCls}`}>{m.phaseLabel}</span>
                </div>
                <div className="mol-col-center">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                    <div className="progress-mini">
                      <div className="progress-fill" style={{ width: `${m.progress}%`, background: m.progressColor }} />
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>{m.progress}%</span>
                  </div>
                </div>
                <div className="mol-col-center" style={{ fontSize: '13px', color: 'var(--ink)', fontWeight: 500 }}>
                  {m.leadName}
                </div>
                <div className="mol-col-right" style={{ fontSize: '12px', color: 'var(--muted)' }}>{m.updated}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="dash-card" style={{ animationDelay: '.14s', maxWidth: '480px' }}>
          <div className="dash-card-header">
            <div className="dash-card-title">Quick Actions</div>
          </div>
          <div className="quick-grid">
            <button className="quick-btn" type="button" onClick={() => router.push('/molecules/new')}>
              <div className="q-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
                </svg>
              </div>
              <div className="q-label">Create Molecule</div>
              <div className="q-desc">Start a new project</div>
            </button>
            <button className="quick-btn" type="button" onClick={() => router.push('/team')}>
              <div className="q-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
                </svg>
              </div>
              <div className="q-label">Invite Member</div>
              <div className="q-desc">Add team & assign roles</div>
            </button>
            <button className="quick-btn" type="button" onClick={() => router.push('/molecules')}>
              <div className="q-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="2" /><circle cx="12" cy="4" r="2" /><circle cx="20" cy="12" r="2" />
                  <circle cx="12" cy="20" r="2" /><circle cx="4" cy="12" r="2" />
                  <line x1="12" y1="6" x2="12" y2="10" /><line x1="14" y1="12" x2="18" y2="12" />
                </svg>
              </div>
              <div className="q-label">View Molecules</div>
              <div className="q-desc">Browse all projects</div>
            </button>
            <button className="quick-btn" type="button">
              <div className="q-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" />
                </svg>
              </div>
              <div className="q-label">View Requests</div>
              <div className="q-desc">Browse all requests</div>
            </button>
          </div>
        </div>

      </div>
    </>
  );
}
