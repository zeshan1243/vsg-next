'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { getMolecule } from '@/lib/molecules';

type Status = 'done' | 'progress';
type TaskState = 'done' | 'progress' | 'todo';

interface Assignee { name: string; bg: string; fg: string; }
interface Task { id: string; text: string; state: TaskState; assignee: Assignee; }
interface Job {
  id: string; title: string; meta: string;
  status: Status; statusLabel: string; dotColor: string;
  tasks: Task[];
}
interface KPI {
  id: string; name: string;
  target: string; actual: string; hit: boolean;
  progressPct: number; progressColor: string;
  jobs: Job[];
}
interface OKR {
  id: string; code: string; title: string; desc: string;
  status: Status; statusLabel: string; progress: number;
  kpis: KPI[];
}

const A = {
  alex:   { name: 'Alex Kim',         bg: 'rgba(59,184,127,.1)',  fg: '#3BB87F' },
  maria:  { name: 'Maria Rodriguez',  bg: 'rgba(42,184,216,.1)',  fg: '#2AB8D8' },
  david:  { name: 'David Wang',       bg: 'rgba(124,92,191,.1)',  fg: '#7C5CBF' },
  james:  { name: 'James Liu',        bg: 'rgba(200,151,58,.1)',  fg: '#C8973A' },
  tina:   { name: 'Tina Park',        bg: 'rgba(232,155,42,.1)',  fg: '#E89B2A' },
};

const OKRS: OKR[] = [
  {
    id: 'okr-01', code: 'OKR-01',
    title: 'Establish vendor partnerships',
    desc: 'Build and maintain strong relationships with premium vendors to ensure high-quality event offerings.',
    status: 'done', statusLabel: 'Completed', progress: 100,
    kpis: [
      {
        id: 'kpi-1-1', name: 'Vendor satisfaction score',
        target: 'Target: 90%', actual: 'Actual: 94%', hit: true,
        progressPct: 100, progressColor: '#3BB87F',
        jobs: [
          {
            id: 'job-1-1-1', title: 'Vendor onboarding & contracts',
            meta: 'Alex Kim · Stump-C · Due: Mar 10, 2026',
            status: 'done', statusLabel: 'Completed', dotColor: '#3BB87F',
            tasks: [
              { id: 't-1-1-1-1', text: 'Draft vendor contract templates', state: 'done', assignee: A.alex },
              { id: 't-1-1-1-2', text: 'Negotiate terms with 10 vendors', state: 'done', assignee: A.alex },
              { id: 't-1-1-1-3', text: 'Collect signed agreements',       state: 'done', assignee: A.david },
            ],
          },
          {
            id: 'job-1-1-2', title: 'Vendor satisfaction survey',
            meta: 'Maria Rodriguez · Stump-B · Due: Apr 02, 2026',
            status: 'done', statusLabel: 'Completed', dotColor: '#3BB87F',
            tasks: [
              { id: 't-1-1-2-1', text: 'Design survey questionnaire', state: 'done', assignee: A.maria },
              { id: 't-1-1-2-2', text: 'Send surveys to all vendors',  state: 'done', assignee: A.maria },
              { id: 't-1-1-2-3', text: 'Compile satisfaction report',  state: 'done', assignee: A.david },
            ],
          },
        ],
      },
      {
        id: 'kpi-1-2', name: 'Contract turnaround time',
        target: 'Target: < 5 days', actual: 'Actual: 3 days', hit: true,
        progressPct: 100, progressColor: '#3BB87F',
        jobs: [
          {
            id: 'job-1-2-1', title: 'Streamline legal review process',
            meta: 'James Liu · Lead Q-A · Due: Mar 05, 2026',
            status: 'done', statusLabel: 'Completed', dotColor: '#3BB87F',
            tasks: [
              { id: 't-1-2-1-1', text: 'Create standardized contract templates', state: 'done', assignee: A.james },
              { id: 't-1-2-1-2', text: 'Set up digital signing workflow',        state: 'done', assignee: A.david },
            ],
          },
        ],
      },
      {
        id: 'kpi-1-3', name: 'Vendor retention rate',
        target: 'Target: 85%', actual: 'Actual: 92%', hit: true,
        progressPct: 100, progressColor: '#3BB87F',
        jobs: [
          {
            id: 'job-1-3-1', title: 'Vendor relationship management',
            meta: 'Maria Rodriguez · Stump-B · Due: Mar 25, 2026',
            status: 'done', statusLabel: 'Completed', dotColor: '#3BB87F',
            tasks: [
              { id: 't-1-3-1-1', text: 'Weekly vendor check-in calls', state: 'done', assignee: A.maria },
              { id: 't-1-3-1-2', text: 'Resolve vendor escalations',   state: 'done', assignee: A.maria },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'okr-02', code: 'OKR-02',
    title: 'Maximize marketing reach & registrations',
    desc: 'Drive awareness and attendee registrations through strategic multi-channel marketing campaigns.',
    status: 'progress', statusLabel: 'In Progress', progress: 85,
    kpis: [
      {
        id: 'kpi-2-1', name: 'Social media impressions',
        target: 'Target: 50K', actual: 'Actual: 47K', hit: false,
        progressPct: 94, progressColor: '#E89B2A',
        jobs: [
          {
            id: 'job-2-1-1', title: 'Social media campaign execution',
            meta: 'Maria Rodriguez · Stump-B · Due: Apr 10, 2026',
            status: 'progress', statusLabel: 'In Progress', dotColor: '#E89B2A',
            tasks: [
              { id: 't-2-1-1-1', text: 'Create content calendar',     state: 'done',     assignee: A.maria },
              { id: 't-2-1-1-2', text: 'Design post graphics & reels', state: 'done',     assignee: A.david },
              { id: 't-2-1-1-3', text: 'Run paid ad boost campaign',   state: 'progress', assignee: A.maria },
            ],
          },
        ],
      },
      {
        id: 'kpi-2-2', name: 'Email open rate',
        target: 'Target: 25%', actual: 'Actual: 28%', hit: true,
        progressPct: 100, progressColor: '#3BB87F',
        jobs: [
          {
            id: 'job-2-2-1', title: 'Email marketing automation',
            meta: 'James Liu · Lead Q-A · Due: Apr 01, 2026',
            status: 'done', statusLabel: 'Completed', dotColor: '#3BB87F',
            tasks: [
              { id: 't-2-2-1-1', text: 'Segment email audience lists',        state: 'done', assignee: A.james },
              { id: 't-2-2-1-2', text: 'Design email templates & A/B tests',  state: 'done', assignee: A.david },
              { id: 't-2-2-1-3', text: 'Launch drip campaign sequence',       state: 'done', assignee: A.james },
            ],
          },
        ],
      },
      {
        id: 'kpi-2-3', name: 'Total event registrations',
        target: 'Target: 5,000', actual: 'Actual: 4,200', hit: false,
        progressPct: 84, progressColor: '#E89B2A',
        jobs: [
          {
            id: 'job-2-3-1', title: 'Registration push & outreach',
            meta: 'Tina Park · Stump-D · Due: Apr 12, 2026',
            status: 'progress', statusLabel: 'In Progress', dotColor: '#E89B2A',
            tasks: [
              { id: 't-2-3-1-1', text: 'Set up registration landing page', state: 'done',     assignee: A.tina },
              { id: 't-2-3-1-2', text: 'Send invites to past attendees',   state: 'done',     assignee: A.tina },
              { id: 't-2-3-1-3', text: 'Run last-week promotion blitz',    state: 'progress', assignee: A.tina },
              { id: 't-2-3-1-4', text: 'Partner cross-promotion posts',    state: 'todo',     assignee: A.maria },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'okr-03', code: 'OKR-03',
    title: 'Ensure operational excellence',
    desc: 'Deliver flawless event execution through rigorous operational planning and coordination.',
    status: 'progress', statusLabel: 'In Progress', progress: 65,
    kpis: [
      {
        id: 'kpi-3-1', name: 'Budget utilization',
        target: 'Target: < 100%', actual: 'Actual: 92%', hit: true,
        progressPct: 92, progressColor: '#3BB87F',
        jobs: [
          {
            id: 'job-3-1-1', title: 'Final vendor payments processing',
            meta: 'Tina Park · Stump-D · Due: Apr 10, 2026',
            status: 'progress', statusLabel: 'In Progress', dotColor: '#E89B2A',
            tasks: [
              { id: 't-3-1-1-1', text: 'Catering deposit paid — $12,500',     state: 'done',     assignee: A.tina },
              { id: 't-3-1-1-2', text: 'Venue balance due — $18,000',          state: 'progress', assignee: A.tina },
              { id: 't-3-1-1-3', text: 'Photography final invoice — $3,200',   state: 'todo',     assignee: A.tina },
              { id: 't-3-1-1-4', text: 'Floral arrangements paid — $4,800',    state: 'done',     assignee: A.tina },
              { id: 't-3-1-1-5', text: 'AV rental settlement — $2,100',        state: 'todo',     assignee: A.tina },
            ],
          },
        ],
      },
      {
        id: 'kpi-3-2', name: 'Issue resolution time',
        target: 'Target: < 2 hrs', actual: 'Actual: 1.5 hrs', hit: true,
        progressPct: 100, progressColor: '#3BB87F',
        jobs: [
          {
            id: 'job-3-2-1', title: 'Venue setup & logistics coordination',
            meta: 'Alex Kim · Stump-C · Due: Apr 13, 2026',
            status: 'done', statusLabel: 'Completed', dotColor: '#3BB87F',
            tasks: [
              { id: 't-3-2-1-1', text: 'Floor plan walkthrough & approval',   state: 'done', assignee: A.alex },
              { id: 't-3-2-1-2', text: 'AV equipment testing & sign-off',     state: 'done', assignee: A.alex },
              { id: 't-3-2-1-3', text: 'Setup signage & wayfinding',           state: 'done', assignee: A.alex },
              { id: 't-3-2-1-4', text: 'Coordinate volunteer briefing',        state: 'done', assignee: A.maria },
            ],
          },
        ],
      },
    ],
  },
];

const DEFAULT_OPEN = new Set(['okr-01', 'kpi-1-1', 'job-1-1-1']);

const statusStyle = (s: Status) =>
  s === 'done'
    ? { bg: 'rgba(59,184,127,.1)',  fg: '#3BB87F' }
    : { bg: 'rgba(232,155,42,.1)',  fg: '#E89B2A' };

const ChevronDown = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const ChevronDownSm = (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const ChevronDownXs = (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

function TaskIcon({ state }: { state: TaskState }) {
  if (state === 'done') {
    return (
      <div className="task-check" style={{ background: 'rgba(59,184,127,.1)', color: '#3BB87F' }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
    );
  }
  if (state === 'progress') {
    return (
      <div className="task-check" style={{ background: 'rgba(232,155,42,.1)', color: '#E89B2A' }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="6" />
        </svg>
      </div>
    );
  }
  return (
    <div className="task-check" style={{ background: 'rgba(138,153,170,.08)', color: '#8A99AA' }}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
      </svg>
    </div>
  );
}

export default function FinalizedViewPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';
  const mol = getMolecule(id);
  const [open, setOpen] = useState<Set<string>>(DEFAULT_OPEN);

  const toggle = (key: string) =>
    setOpen(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });

  if (!mol) return null;

  return (
    <>
      <div className="topbar">
        <div className="breadcrumb">
          <Link href="/dashboard">Dashboard</Link>
          <span className="sep">›</span>
          <Link href="/molecules">My Molecules</Link>
          <span className="sep">›</span>
          <Link href={`/molecules/${id}`}>{mol.name}</Link>
          <span className="sep">›</span>
          <span className="cur">Finalized View</span>
        </div>
        <div className="topbar-right">
          <span className="creator-tag">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Creator
          </span>
          <button type="button" className="btn-sm">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export
          </button>
          <button type="button" className="btn-sm">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" />
            </svg>
            Print
          </button>
        </div>
      </div>

      <div className="creator-content">

        {/* Objective banner */}
        <div className="objective-banner">
          <div className="ob-glow" />
          <div className="ob-glow-2" />
          <div className="ob-content">
            <div className="ob-eyebrow">
              <span className="ob-id">{mol.code}</span>
              <span className="ob-status" style={{ background: 'rgba(232,155,42,.15)', color: '#E89B2A' }}>In Progress</span>
            </div>
            <div className="ob-name">{mol.name}</div>
            <div className="ob-objective">
              Deliver a world-class wedding expo bringing together 200+ premium vendors, creating an unforgettable experience for 5,000+ attendees while establishing the brand as the leading event in the region.
            </div>

            <div className="ob-people">
              <div className="ob-person">
                <div className="ob-person-av" style={{ background: 'linear-gradient(135deg,var(--gold),var(--gold-lt))' }}>SM</div>
                <div>
                  <div className="ob-person-name">Sarah Mitchell</div>
                  <div className="ob-person-role" style={{ color: 'var(--gold)' }}>Creator</div>
                </div>
              </div>
              <div className="ob-person">
                <div className="ob-person-av" style={{ background: 'linear-gradient(135deg,var(--gold-lt),#C8973A)' }}>JL</div>
                <div>
                  <div className="ob-person-name">James Liu</div>
                  <div className="ob-person-role" style={{ color: 'var(--gold-lt)' }}>Lead</div>
                </div>
              </div>
            </div>

            <div className="ob-meta">
              <div className="ob-meta-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Deadline: Apr 15, 2026
              </div>
              <div className="ob-meta-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                {mol.members} Members
              </div>
              <div className="ob-meta-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
                Created: Feb 12, 2026
              </div>
            </div>

            <div className="ob-progress-wrap">
              <div className="ob-progress-bar">
                <div className="ob-progress-fill" style={{ width: `${mol.progress}%` }} />
              </div>
              <span className="ob-progress-text">{mol.progress}% Complete</span>
            </div>
          </div>
        </div>

        {/* OKR tree */}
        <div className="okr-tree">
          {OKRS.map(okr => {
            const okrOpen = open.has(okr.id);
            const okrSt = statusStyle(okr.status);
            return (
              <div key={okr.id} className="okr-block">
                <div className="okr-head" onClick={() => toggle(okr.id)}>
                  <div className="okr-badge">{okr.code}</div>
                  <div className="okr-info">
                    <div className="okr-title">{okr.title}</div>
                    <div className="okr-desc">{okr.desc}</div>
                  </div>
                  <div className="okr-right">
                    <span className="status-pill" style={{ background: okrSt.bg, color: okrSt.fg }}>{okr.statusLabel}</span>
                    <span className="okr-pct">{okr.progress}%</span>
                  </div>
                  <div className={`expand-arrow${okrOpen ? ' open' : ''}`}>{ChevronDown}</div>
                </div>

                {okrOpen && (
                  <div className="kpi-list">
                    {okr.kpis.map(kpi => {
                      const kpiOpen = open.has(kpi.id);
                      const kpiSt = kpi.hit
                        ? { bg: 'rgba(59,184,127,.1)', fg: '#3BB87F', label: 'Hit' }
                        : { bg: 'rgba(232,155,42,.1)', fg: '#E89B2A', label: 'Missed' };
                      return (
                        <div key={kpi.id} className="kpi-block">
                          <div className="kpi-head" onClick={() => toggle(kpi.id)}>
                            <div className="kpi-badge">KPI</div>
                            <div className="kpi-info">
                              <div className="kpi-name">{kpi.name}</div>
                              <div className="kpi-score-row">
                                <div className="kpi-score-bar">
                                  <div className="kpi-score-fill" style={{ width: `${kpi.progressPct}%`, background: kpi.progressColor }} />
                                </div>
                                <div className="kpi-score-vals">
                                  <span className="kpi-target">{kpi.target}</span>
                                  <span className="kpi-arrow-icon">→</span>
                                  <span className="kpi-actual" style={{ color: kpi.progressColor }}>{kpi.actual}</span>
                                </div>
                              </div>
                            </div>
                            <span className="status-pill" style={{ background: kpiSt.bg, color: kpiSt.fg }}>{kpiSt.label}</span>
                            <div className={`kpi-expand${kpiOpen ? ' open' : ''}`}>{ChevronDownSm}</div>
                          </div>

                          {kpiOpen && (
                            <div className="job-list" style={{ borderTop: '1px solid var(--border)' }}>
                              <div className="depth-label job-label">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <rect x="2" y="7" width="20" height="14" rx="2" />
                                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                                </svg>
                                Jobs
                              </div>
                              {kpi.jobs.map(job => {
                                const jobOpen = open.has(job.id);
                                const jobSt = statusStyle(job.status);
                                return (
                                  <div key={job.id} className="job-block">
                                    <div className="job-head" onClick={() => toggle(job.id)}>
                                      <div className="job-badge">JOB</div>
                                      <div className="job-dot" style={{ background: job.dotColor }} />
                                      <div className="job-info">
                                        <div className="job-title">{job.title}</div>
                                        <div className="job-meta">{job.meta}</div>
                                      </div>
                                      <span className="status-pill-sm" style={{ background: jobSt.bg, color: jobSt.fg }}>{job.statusLabel}</span>
                                      <div className={`job-expand${jobOpen ? ' open' : ''}`}>{ChevronDownXs}</div>
                                    </div>

                                    {jobOpen && (
                                      <div className="task-list">
                                        <div className="depth-label task-label">
                                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <polyline points="9 11 12 14 22 4" />
                                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                                          </svg>
                                          Tasks
                                        </div>
                                        {job.tasks.map(task => (
                                          <div key={task.id} className="task-row">
                                            <TaskIcon state={task.state} />
                                            <span className={`task-text${task.state === 'done' ? ' done' : ''}`}>{task.text}</span>
                                            <span className="task-assignee" style={{ background: task.assignee.bg, color: task.assignee.fg }}>
                                              {task.assignee.name}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </>
  );
}
