'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { getMolecule } from '@/lib/molecules';

type TabId = 'vendors' | 'partners' | 'location' | 'attendance';

interface Job {
  id: string;
  number: string; // J1, J2…
  text: string;
}

interface KpiGroup {
  id: string;
  number: string; // K1
  text: string;
  jobs: Job[];
  draft: string;
}

interface TabContent {
  kpis: KpiGroup[];
}

const VendorsIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7h18l-1 13H4L3 7z" /><path d="M8 7V5a4 4 0 0 1 8 0v2" />
  </svg>
);
const PartnersIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 17a3 3 0 0 0 4.24 0l3.54-3.54a3 3 0 1 0-4.24-4.24l-1.06 1.06" />
    <path d="M13 7a3 3 0 0 0-4.24 0L5.22 10.54a3 3 0 1 0 4.24 4.24l1.06-1.06" />
  </svg>
);
const LocationIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const AttendanceIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const TABS: { id: TabId; label: string; icon: ReactNode }[] = [
  { id: 'vendors',    label: 'Vendors',    icon: VendorsIcon },
  { id: 'partners',   label: 'Partners',   icon: PartnersIcon },
  { id: 'location',   label: 'Location',   icon: LocationIcon },
  { id: 'attendance', label: 'Attendance', icon: AttendanceIcon },
];

const INITIAL_TABS: Record<TabId, TabContent> = {
  vendors: {
    kpis: [
      {
        id: 'kpi-v1', number: 'K1',
        text: 'Track vendor response rate — target 75% within 5 days',
        jobs: [
          { id: 'job-v1-1', number: 'J1', text: 'Send initial outreach emails to 60 vendor prospects' },
          { id: 'job-v1-2', number: 'J2', text: 'Follow up with non-responsive vendors after 3 days' },
        ],
        draft: '',
      },
      {
        id: 'kpi-v2', number: 'K1',
        text: 'Signed contracts per category — minimum 6 per category',
        jobs: [
          { id: 'job-v2-1', number: 'J1', text: 'Draft vendor contract template with legal team' },
          { id: 'job-v2-2', number: 'J2', text: 'Follow up with non-responsive vendors after 3 days' },
        ],
        draft: '',
      },
    ],
  },
  partners: {
    kpis: [
      {
        id: 'kpi-p1', number: 'K1',
        text: 'Sponsor pipeline conversion rate — target 30%',
        jobs: [],
        draft: '',
      },
    ],
  },
  location: {
    kpis: [
      {
        id: 'kpi-l1', number: 'K1',
        text: 'Venue setup completion vs. schedule — within 2 days slack',
        jobs: [],
        draft: '',
      },
    ],
  },
  attendance: {
    kpis: [
      {
        id: 'kpi-a1', number: 'K1',
        text: 'Daily registration velocity — 100 sign-ups/day average',
        jobs: [],
        draft: '',
      },
    ],
  },
};

const STACK_CELLS = [
  { key: 'jobs',  label: 'Jobs'  },
  { key: 'tasks', label: 'Tasks' },
  { key: 'okrs',  label: 'OKRs'  },
  { key: 'kpis',  label: 'KPIs'  },
] as const;
const STACK_PILLS = ['Locations', 'Attendance', 'Vendors', 'Partners'];

export default function QuadrantCPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';
  const mol = getMolecule(id);

  const [activeTab, setActiveTab] = useState<TabId>('vendors');
  const [tabs, setTabs] = useState<Record<TabId, TabContent>>(INITIAL_TABS);

  if (!mol) return null;

  const tab = tabs[activeTab];
  const tabLabel = TABS.find(t => t.id === activeTab)?.label ?? 'Vendors';

  function setKpiDraft(kpiId: string, value: string) {
    setTabs(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        kpis: prev[activeTab].kpis.map(k => k.id === kpiId ? { ...k, draft: value } : k),
      },
    }));
  }

  function addJob(kpiId: string) {
    setTabs(prev => {
      const next = { ...prev };
      next[activeTab] = {
        ...next[activeTab],
        kpis: next[activeTab].kpis.map(k => {
          if (k.id !== kpiId) return k;
          const text = k.draft.trim();
          if (!text) return k;
          const nextNum = `J${k.jobs.length + 1}`;
          return {
            ...k,
            jobs: [...k.jobs, { id: `${kpiId}-j-${Date.now()}`, number: nextNum, text }],
            draft: '',
          };
        }),
      };
      return next;
    });
  }

  function removeJob(kpiId: string, jobId: string) {
    setTabs(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        kpis: prev[activeTab].kpis.map(k =>
          k.id === kpiId ? { ...k, jobs: k.jobs.filter(j => j.id !== jobId) } : k
        ),
      },
    }));
  }

  return (
    <>
      <div className="topbar">
        <div className="breadcrumb">
          <Link href="/dashboard">Dashboard</Link>
          <span className="sep">›</span>
          <Link href={`/molecules/${id}`}>{mol.name}</Link>
          <span className="sep">›</span>
          <span className="cur">Quadrant C-Knowledge — Jobs</span>
        </div>
      </div>

      <div className="creator-content">

        <h1 className="qa-title">Jobs Against KPIs</h1>

        {/* Tabs */}
        <div className="qa-tabs">
          {TABS.map(t => (
            <button
              key={t.id}
              type="button"
              className={`qa-tab${activeTab === t.id ? ' active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* 2-column layout */}
        <div className="qa-layout">

          {/* ── Main card ── */}
          <div className="qa-main">

            {/* Input from Communicate banner (cyan) */}
            <div className="qc-input-banner">
              <div className="qc-input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <div className="qc-input-text">Input from Communicate</div>
            </div>

            {/* KPI cards (read-only, from Q-B) with Jobs section inside */}
            {tab.kpis.map(kpi => (
              <div key={kpi.id} className="qc-kpi-card">
                <div className="qc-kpi-head">
                  <div className="qc-kpi-num">{kpi.number}</div>
                  <div className="qc-kpi-text">{kpi.text}</div>
                </div>
                <div className="qc-kpi-body">
                  <div className="qc-jobs-label">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <polyline points="9 11 12 14 17 9" />
                    </svg>
                    Jobs
                  </div>

                  {kpi.jobs.map(job => (
                    <div key={job.id} className="qc-job-row">
                      <div className="qc-job-num">{job.number}</div>
                      <div className="qc-job-text">{job.text}</div>
                      <button type="button" className="qa-okr-x" onClick={() => removeJob(kpi.id, job.id)} aria-label="Remove job">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  ))}

                  <div className="qa-add-row">
                    <input
                      className="qa-add-input"
                      type="text"
                      placeholder={`Add a Job for Internal ${tabLabel}...`}
                      value={kpi.draft}
                      onChange={e => setKpiDraft(kpi.id, e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') addJob(kpi.id); }}
                    />
                    <button type="button" className="qc-add-job-btn" onClick={() => addJob(kpi.id)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Add Job
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <button type="button" className="qa-submit">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Submit Work to Auto Improve
            </button>
          </div>

          {/* ── Right side ── */}
          <div className="qa-side">

            <div className="qa-side-card">
              <div className="qa-side-card-title">Molecule Info</div>
              <div className="qa-info-row"><span className="qa-info-key">Molecule</span><span className="qa-info-val">{mol.name}</span></div>
              <div className="qa-info-row"><span className="qa-info-key">Quad</span><span className="qa-info-val">C-Knowledge</span></div>
              <div className="qa-info-row"><span className="qa-info-key">Stack</span><span className="qa-info-val">Inner</span></div>
              <div className="qa-info-row"><span className="qa-info-key">Objective</span><span className="qa-info-val">Jobs</span></div>
            </div>

            <div className="qa-side-card">
              <div className="qa-side-card-title">Q-C Knowledge ( Inner Stack )</div>
              <div className="inner-stack-grid">
                {STACK_CELLS.map(cell => (
                  <div key={cell.key} className={`stack-cell ${cell.key}`}>
                    <div className="stack-cell-label">{cell.label}</div>
                    <div className="stack-pills">
                      {STACK_PILLS.map(p => (
                        <div key={p} className="stack-pill">{p}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="qa-side-card">
              <div className="qa-side-card-title">My Stump</div>
              <div className="qb-stump-assigned">
                <div className="qb-stump-av">AR</div>
                <div className="qb-stump-info">
                  <div className="qb-stump-name">Amy Rodriguez</div>
                  <div className="qb-stump-meta">Approved</div>
                </div>
                <span className="qb-stump-done">Done</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </>
  );
}
