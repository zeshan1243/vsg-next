'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { getMolecule } from '@/lib/molecules';

type TabId = 'vendors' | 'partners' | 'location' | 'attendance';

interface KPI {
  id: string;
  number: string; // K1, K2…
  text: string;
}

interface OkrGroup {
  id: string;
  number: string; // O1
  text: string;
  kpis: KPI[];
  draft: string;
}

interface FileEntry {
  id: string;
  name: string;
  size: string;
}

interface TabContent {
  okrs: OkrGroup[];
  files: FileEntry[];
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
    okrs: [
      {
        id: 'okr-v1', number: 'O1',
        text: 'Secure 50 exhibitor vendors across 8 categories',
        kpis: [
          { id: 'kpi-v1-1', number: 'K1', text: 'Track vendor response rate — target 75% within 5 days' },
          { id: 'kpi-v1-2', number: 'K2', text: 'Signed contracts per category — minimum 6 per category' },
        ],
        draft: '',
      },
      {
        id: 'okr-v2', number: 'O1',
        text: 'Sell 500+ tickets with 80% pre-sale target',
        kpis: [
          { id: 'kpi-v2-1', number: 'K1', text: 'Weekly ticket sales velocity — 80 tickets/week average' },
        ],
        draft: '',
      },
    ],
    files: [
      { id: 'f-1', name: 'Venue_AV_Confirmation.pdf', size: '340 KB' },
    ],
  },
  partners: {
    okrs: [
      {
        id: 'okr-p1', number: 'O1',
        text: 'Sign 5 corporate sponsorship deals at Gold tier or above',
        kpis: [],
        draft: '',
      },
    ],
    files: [],
  },
  location: {
    okrs: [
      {
        id: 'okr-l1', number: 'O1',
        text: 'Confirm Convention Hall booking by Mar 15',
        kpis: [],
        draft: '',
      },
    ],
    files: [],
  },
  attendance: {
    okrs: [
      {
        id: 'okr-a1', number: 'O1',
        text: 'Drive 5,000 confirmed attendee registrations',
        kpis: [],
        draft: '',
      },
    ],
    files: [],
  },
};

const STACK_CELLS = [
  { key: 'jobs',  label: 'Jobs'  },
  { key: 'tasks', label: 'Tasks' },
  { key: 'okrs',  label: 'OKRs'  },
  { key: 'kpis',  label: 'KPIs'  },
] as const;
const STACK_PILLS = ['Locations', 'Attendance', 'Vendors', 'Partners'];

export default function QuadrantBPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';
  const mol = getMolecule(id);

  const [activeTab, setActiveTab] = useState<TabId>('vendors');
  const [tabs, setTabs] = useState<Record<TabId, TabContent>>(INITIAL_TABS);

  if (!mol) return null;

  const tab = tabs[activeTab];
  const tabLabel = TABS.find(t => t.id === activeTab)?.label ?? 'Vendors';

  function setOkrDraft(okrId: string, value: string) {
    setTabs(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        okrs: prev[activeTab].okrs.map(o => o.id === okrId ? { ...o, draft: value } : o),
      },
    }));
  }

  function addKpi(okrId: string) {
    setTabs(prev => {
      const next = { ...prev };
      next[activeTab] = {
        ...next[activeTab],
        okrs: next[activeTab].okrs.map(o => {
          if (o.id !== okrId) return o;
          const text = o.draft.trim();
          if (!text) return o;
          const nextNum = `K${o.kpis.length + 1}`;
          return {
            ...o,
            kpis: [...o.kpis, { id: `${okrId}-k-${Date.now()}`, number: nextNum, text }],
            draft: '',
          };
        }),
      };
      return next;
    });
  }

  function removeKpi(okrId: string, kpiId: string) {
    setTabs(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        okrs: prev[activeTab].okrs.map(o =>
          o.id === okrId ? { ...o, kpis: o.kpis.filter(k => k.id !== kpiId) } : o
        ),
      },
    }));
  }

  function removeFile(fileId: string) {
    setTabs(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        files: prev[activeTab].files.filter(f => f.id !== fileId),
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
          <span className="cur">Quadrant B-Communication — KPIs</span>
        </div>
      </div>

      <div className="creator-content">

        <h1 className="qa-title">KPIs Against OKRs</h1>

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

            {/* Input from Coordinate banner */}
            <div className="qb-input-banner">
              <div className="qb-input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <div className="qb-input-text">Input from Coordinate</div>
            </div>

            {/* OKR cards (read-only OKRs from Q-A) with KPIs section */}
            {tab.okrs.map(okr => (
              <div key={okr.id} className="qb-okr-card">
                <div className="qb-okr-head">
                  <div className="qb-okr-num">{okr.number}</div>
                  <div className="qb-okr-text">{okr.text}</div>
                </div>
                <div className="qb-okr-body">
                  <div className="qb-kpis-label">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 17 9 11 13 15 21 7" /><polyline points="14 7 21 7 21 14" />
                    </svg>
                    KPIs
                  </div>

                  {okr.kpis.map(kpi => (
                    <div key={kpi.id} className="qb-kpi-row">
                      <div className="qb-kpi-num">{kpi.number}</div>
                      <div className="qb-kpi-text">{kpi.text}</div>
                      <button type="button" className="qa-okr-x" onClick={() => removeKpi(okr.id, kpi.id)} aria-label="Remove KPI">
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
                      placeholder={`Add a KPI for Internal ${tabLabel}...`}
                      value={okr.draft}
                      onChange={e => setOkrDraft(okr.id, e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') addKpi(okr.id); }}
                    />
                    <button type="button" className="qb-add-kpi-btn" onClick={() => addKpi(okr.id)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Add KPI
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Supporting Files */}
            <div className="qa-section" style={{ marginTop: '8px' }}>
              <div className="qa-section-label">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                </svg>
                Supporting Files
              </div>
              {tab.files.map(file => (
                <div key={file.id} className="qa-file-row">
                  <div className="qa-file-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <div className="qa-file-name">{file.name}</div>
                  <div className="qa-file-size">{file.size}</div>
                  <button type="button" className="qa-okr-x" onClick={() => removeFile(file.id)} aria-label="Remove file">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}

              <button type="button" className="qa-upload">
                <div className="qa-upload-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <div className="qa-upload-text">
                  Upload more files <span>— PDF, XLSX, images, contracts</span>
                </div>
              </button>
            </div>

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
              <div className="qa-info-row"><span className="qa-info-key">Quad</span><span className="qa-info-val">B-Communication</span></div>
              <div className="qa-info-row"><span className="qa-info-key">Stack</span><span className="qa-info-val">Inner</span></div>
              <div className="qa-info-row"><span className="qa-info-key">Objective</span><span className="qa-info-val">KPIs</span></div>
            </div>

            <div className="qa-side-card">
              <div className="qa-side-card-title">Q-B Communication ( Inner Stack )</div>
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
