'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { getMolecule } from '@/lib/molecules';

type TabId = 'vendors' | 'partners' | 'location' | 'attendance';
type OkrColor = 'peach' | 'lavender';

interface OKR {
  id: string;
  number: string;
  text: string;
  color: OkrColor;
  from?: string;
}

interface FileEntry {
  id: string;
  name: string;
  size: string;
}

interface TabContent {
  objective: string;
  okrs: OKR[];
  files: FileEntry[];
}

const VendorsIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7h18l-1 13H4L3 7z" />
    <path d="M8 7V5a4 4 0 0 1 8 0v2" />
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
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
const AttendanceIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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
    objective: 'Execute Premier Wedding Expo',
    okrs: [
      { id: 'v-1', number: '01', text: 'Secure 50 exhibitor vendors across 8 categories',                       color: 'peach' },
      { id: 'v-2', number: '02', text: 'Onboard 15 floral & decor vendors with signed contracts', from: 'Lena W.', color: 'lavender' },
    ],
    files: [
      { id: 'f-1', name: 'Venue_AV_Confirmation.pdf', size: '340 KB' },
    ],
  },
  partners: {
    objective: 'Strategic Partner Engagement',
    okrs: [
      { id: 'p-1', number: '01', text: 'Sign 5 corporate sponsorship deals at Gold tier or above', color: 'peach' },
    ],
    files: [],
  },
  location: {
    objective: 'Venue Logistics & Setup',
    okrs: [
      { id: 'l-1', number: '01', text: 'Confirm Convention Hall booking by Mar 15',           color: 'peach' },
      { id: 'l-2', number: '02', text: 'Lock in catering floor plan with 5 service stations', color: 'lavender' },
    ],
    files: [],
  },
  attendance: {
    objective: 'Attendee Acquisition',
    okrs: [
      { id: 'a-1', number: '01', text: 'Drive 5,000 confirmed attendee registrations', color: 'peach' },
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

export default function QuadrantAPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';
  const mol = getMolecule(id);

  const [activeTab, setActiveTab] = useState<TabId>('vendors');
  const [tabs, setTabs] = useState<Record<TabId, TabContent>>(INITIAL_TABS);
  const [draft, setDraft] = useState('');

  const tab = tabs[activeTab];

  function addOkr() {
    const text = draft.trim();
    if (!text) return;
    setTabs(prev => {
      const list = prev[activeTab].okrs;
      const nextNum = String(list.length + 1).padStart(2, '0');
      return {
        ...prev,
        [activeTab]: {
          ...prev[activeTab],
          okrs: [
            ...list,
            { id: `${activeTab}-${Date.now()}`, number: nextNum, text, color: 'peach' as OkrColor },
          ],
        },
      };
    });
    setDraft('');
  }

  function removeOkr(okrId: string) {
    setTabs(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        okrs: prev[activeTab].okrs.filter(o => o.id !== okrId),
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

  if (!mol) return null;

  const tabLabel = TABS.find(t => t.id === activeTab)?.label ?? 'Vendors';

  return (
    <>
      <div className="topbar">
        <div className="breadcrumb">
          <Link href="/dashboard">Dashboard</Link>
          <span className="sep">›</span>
          <Link href={`/molecules/${id}`}>{mol.name}</Link>
          <span className="sep">›</span>
          <span className="cur">Quadrant A-Coordinate — OKRs</span>
        </div>
      </div>

      <div className="creator-content">

        <h1 className="qa-title">OKRs</h1>

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
            <div className="qa-obj-head">
              <div className="qa-obj-badge">OBJ</div>
              <div className="qa-obj-title">{tab.objective}</div>
            </div>

            {/* OKRs section */}
            <div className="qa-section">
              <div className="qa-section-label">OKRs</div>
              {tab.okrs.map(okr => (
                <div key={okr.id} className={`qa-okr-row ${okr.color}`}>
                  <div className={`qa-okr-num ${okr.color}`}>{okr.number}</div>
                  <div className="qa-okr-text">
                    {okr.text}
                    {okr.from && <span className="qa-okr-from"> (from {okr.from})</span>}
                  </div>
                  <button type="button" className="qa-okr-x" onClick={() => removeOkr(okr.id)} aria-label="Remove OKR">
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
                  placeholder={`Add a new OKR for Internal ${tabLabel}...`}
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addOkr(); }}
                />
                <button type="button" className="qa-add-btn" onClick={addOkr}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add OKR
                </button>
              </div>
            </div>

            {/* Files section */}
            <div className="qa-section">
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

            {/* Submit */}
            <button type="button" className="qa-submit">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Submit Work to Auto Improve
            </button>
          </div>

          {/* ── Right side ── */}
          <div className="qa-side">

            {/* Molecule Info */}
            <div className="qa-side-card">
              <div className="qa-side-card-title">Molecule Info</div>
              <div className="qa-info-row"><span className="qa-info-key">Molecule</span><span className="qa-info-val">{mol.name}</span></div>
              <div className="qa-info-row"><span className="qa-info-key">Quad</span><span className="qa-info-val">A-Coordinate</span></div>
              <div className="qa-info-row"><span className="qa-info-key">Stack</span><span className="qa-info-val">Inner</span></div>
              <div className="qa-info-row"><span className="qa-info-key">Objective</span><span className="qa-info-val">OKRs</span></div>
            </div>

            {/* Inner Stack */}
            <div className="qa-side-card">
              <div className="qa-side-card-title">Q-A Coordinate ( Inner Stack )</div>
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

            {/* My Stump */}
            <div className="qa-side-card">
              <div className="qa-side-card-title">My Stump</div>
              <button type="button" className="qa-stump-empty">
                <div className="qa-stump-empty-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </div>
                <span className="qa-stump-empty-text">Click to assign Stump</span>
              </button>
            </div>

          </div>
        </div>

      </div>
    </>
  );
}
