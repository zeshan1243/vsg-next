'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { getMolecule } from '@/lib/molecules';

type TabId = 'vendors' | 'partners' | 'location' | 'attendance';

interface Task {
  id: string;
  number: string; // T1, T2…
  text: string;
}

interface JobGroup {
  id: string;
  number: string; // J1, J2
  text: string;
  tasks: Task[];
  draft: string;
}

interface TabContent {
  jobs: JobGroup[];
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
    jobs: [
      {
        id: 'job-v1', number: 'J1',
        text: 'Send initial outreach emails to 60 vendor prospects',
        tasks: [
          { id: 'task-v1-1', number: 'T1', text: 'Draft personalized email templates for each vendor category' },
          { id: 'task-v1-2', number: 'T2', text: 'Build vendor CRM tracker with follow-up automation' },
        ],
        draft: '',
      },
      {
        id: 'job-v2', number: 'J2',
        text: 'Set up Eventbrite ticketing page with tiered pricing',
        tasks: [
          { id: 'task-v2-1', number: 'T1', text: 'Configure 3 ticket tiers: Early Bird, Standard, VIP' },
          { id: 'task-v2-2', number: 'T2', text: 'Design landing page with countdown timer & social proof' },
        ],
        draft: '',
      },
    ],
  },
  partners: {
    jobs: [
      {
        id: 'job-p1', number: 'J1',
        text: 'Lock in 5 corporate sponsor commitments',
        tasks: [],
        draft: '',
      },
    ],
  },
  location: {
    jobs: [
      {
        id: 'job-l1', number: 'J1',
        text: 'Coordinate venue setup with operations team',
        tasks: [],
        draft: '',
      },
    ],
  },
  attendance: {
    jobs: [
      {
        id: 'job-a1', number: 'J1',
        text: 'Run final-week registration push campaign',
        tasks: [],
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

export default function QuadrantDPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';
  const mol = getMolecule(id);

  const [activeTab, setActiveTab] = useState<TabId>('vendors');
  const [tabs, setTabs] = useState<Record<TabId, TabContent>>(INITIAL_TABS);

  if (!mol) return null;

  const tab = tabs[activeTab];
  const tabLabel = TABS.find(t => t.id === activeTab)?.label ?? 'Vendors';

  function setJobDraft(jobId: string, value: string) {
    setTabs(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        jobs: prev[activeTab].jobs.map(j => j.id === jobId ? { ...j, draft: value } : j),
      },
    }));
  }

  function addTask(jobId: string) {
    setTabs(prev => {
      const next = { ...prev };
      next[activeTab] = {
        ...next[activeTab],
        jobs: next[activeTab].jobs.map(j => {
          if (j.id !== jobId) return j;
          const text = j.draft.trim();
          if (!text) return j;
          const nextNum = `T${j.tasks.length + 1}`;
          return {
            ...j,
            tasks: [...j.tasks, { id: `${jobId}-t-${Date.now()}`, number: nextNum, text }],
            draft: '',
          };
        }),
      };
      return next;
    });
  }

  function removeTask(jobId: string, taskId: string) {
    setTabs(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        jobs: prev[activeTab].jobs.map(j =>
          j.id === jobId ? { ...j, tasks: j.tasks.filter(t => t.id !== taskId) } : j
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
          <span className="cur">Quadrant D-Exchange — Tasks</span>
        </div>
      </div>

      <div className="creator-content">

        <h1 className="qa-title">Tasks Against Jobs</h1>

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

            {/* Input from Knowledge banner (red/coral) */}
            <div className="qd-input-banner">
              <div className="qd-input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <polyline points="9 11 12 14 17 9" />
                </svg>
              </div>
              <div className="qd-input-text">Input from Knowledge</div>
            </div>

            {/* Job cards (read-only, from Q-C) with Tasks section inside */}
            {tab.jobs.map(job => (
              <div key={job.id} className="qd-job-card">
                <div className="qd-job-head">
                  <div className="qd-job-num">{job.number}</div>
                  <div className="qd-job-text">{job.text}</div>
                </div>
                <div className="qd-job-body">
                  <div className="qd-tasks-label">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <polyline points="18.5 2.5 21.5 5.5 12 15 8 16 9 12 18.5 2.5" />
                    </svg>
                    Tasks
                  </div>

                  {job.tasks.map(task => (
                    <div key={task.id} className="qd-task-row">
                      <div className="qd-task-num">{task.number}</div>
                      <div className="qd-task-text">{task.text}</div>
                      <button type="button" className="qa-okr-x" onClick={() => removeTask(job.id, task.id)} aria-label="Remove task">
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
                      placeholder={`Add a Task for Internal ${tabLabel}...`}
                      value={job.draft}
                      onChange={e => setJobDraft(job.id, e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') addTask(job.id); }}
                    />
                    <button type="button" className="qd-add-task-btn" onClick={() => addTask(job.id)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Add Task
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
              <div className="qa-info-row"><span className="qa-info-key">Quad</span><span className="qa-info-val">D-Exchange</span></div>
              <div className="qa-info-row"><span className="qa-info-key">Stack</span><span className="qa-info-val">Inner</span></div>
              <div className="qa-info-row"><span className="qa-info-key">Objective</span><span className="qa-info-val">Tasks</span></div>
            </div>

            <div className="qa-side-card">
              <div className="qa-side-card-title">Q-D Exchange ( Inner Stack )</div>
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
