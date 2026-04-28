'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { getMolecule } from '@/lib/molecules';
import {
  NEXT_QUAD, QUAD_FINAL, STACK_LABEL, TOTAL_STEPS,
  bumpQuadMaxStep, markQuadCompleted, setActiveQuad, setActiveStep, stackForStep,
  type Quad,
} from '@/lib/progress';

// ─── Types ──────────────────────────────────────────
type TabId = 'vendors' | 'partners' | 'location' | 'attendance';
type OkrColor = 'peach' | 'lavender';

interface Task { id: string; text: string; done: boolean }
interface Job  { id: string; number: string; text: string; tasks: Task[]; draft: string }
interface Kpi  { id: string; number: string; text: string; jobs: Job[]; draft: string }
interface Okr  { id: string; number: string; text: string; color: OkrColor; from?: string; kpis: Kpi[]; draft: string }
interface FinalTask { id: string; text: string; done: boolean; linkedTo: string }
interface FinalJob { id: string; number: string; text: string; linkedTo: string; finalTasks: FinalTask[]; draft: string }
interface FinalKpi { id: string; number: string; text: string; linkedTo: string; finalJobs: FinalJob[]; draft: string }
interface FinalOkr { id: string; number: string; text: string; color: OkrColor; linkedTo: string[]; finalKpis: FinalKpi[]; draft: string }
interface FileEntry { id: string; name: string; size: string }
interface TabContent { objective: string; okrs: Okr[]; finalOkrs: FinalOkr[]; files: FileEntry[] }

// ─── Icons ──────────────────────────────────────────
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
const XIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const PlusIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const EyeIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const TABS: { id: TabId; label: string; icon: ReactNode }[] = [
  { id: 'vendors',    label: 'Vendors',    icon: VendorsIcon    },
  { id: 'partners',   label: 'Partners',   icon: PartnersIcon   },
  { id: 'location',   label: 'Location',   icon: LocationIcon   },
  { id: 'attendance', label: 'Attendance', icon: AttendanceIcon },
];

// ─── Quadrant metadata ──────────────────────────────
const QUAD_FULL_TITLE: Record<Quad, string> = {
  a: 'A-Coordinate', b: 'B-Communication', c: 'C-Knowledge', d: 'D-Exchange',
};
const QUAD_INNER_STACK_LABEL: Record<Quad, string> = {
  a: 'Q-A Coordinate ( Inner Stack )',
  b: 'Q-B Communication ( Inner Stack )',
  c: 'Q-C Knowledge ( Inner Stack )',
  d: 'Q-D Exchange ( Inner Stack )',
};

interface StumpUser { id: string; name: string; initials: string; role: string; gradient: string }

const STUMP_CANDIDATES: StumpUser[] = [
  { id: 'u-1', name: 'Maria Chen',     initials: 'MC', role: 'Engineering Lead',   gradient: 'linear-gradient(135deg, var(--gold), var(--gold-lt))' },
  { id: 'u-2', name: 'James Thompson', initials: 'JT', role: 'Program Manager',    gradient: 'linear-gradient(135deg, var(--purple), #9A7FD6)' },
  { id: 'u-3', name: 'Elena Torres',   initials: 'ET', role: 'Operations Manager', gradient: 'linear-gradient(135deg, var(--cyan), #5EC8E0)' },
  { id: 'u-4', name: 'Rachel Nguyen',  initials: 'RN', role: 'Design Lead',        gradient: 'linear-gradient(135deg, var(--success), #5EC89F)' },
  { id: 'u-5', name: 'Omar Hassan',    initials: 'OH', role: 'Partner Relations',  gradient: 'linear-gradient(135deg, var(--purple), #9A7FD6)' },
  { id: 'u-6', name: 'Tyler Williams', initials: 'TW', role: 'Venue Coordinator',  gradient: 'linear-gradient(135deg, var(--warn), #F0B254)' },
  { id: 'u-7', name: 'Lena Walsh',     initials: 'LW', role: 'Floral Lead',        gradient: 'linear-gradient(135deg, #B8736A, #D48F87)' },
  { id: 'u-8', name: 'Nate Brooks',    initials: 'NB', role: 'Marketing Manager',  gradient: 'linear-gradient(135deg, #5C8A6E, #7EAE92)' },
];

const STACK_CELLS = [
  { key: 'jobs',  label: 'Jobs'  },
  { key: 'tasks', label: 'Tasks' },
  { key: 'okrs',  label: 'OKRs'  },
  { key: 'kpis',  label: 'KPIs'  },
] as const;
const STACK_PILLS = ['Locations', 'Attendance', 'Vendors', 'Partners'];

// Outer stack — shown on step 5 (Final Review). Cells map to quadrant names instead of stacks.
const OUTER_STACK_CELLS = [
  { key: 'jobs',  label: 'Knowledge'   },
  { key: 'tasks', label: 'Exchange'    },
  { key: 'okrs',  label: 'Coordinate'  },
  { key: 'kpis',  label: 'Communicate' },
] as const;

const QUAD_OUTER_STACK_LABEL: Record<Quad, string> = {
  a: 'Q-A Coordinate ( Outer Stack )',
  b: 'Q-B Communication ( Outer Stack )',
  c: 'Q-C Knowledge ( Outer Stack )',
  d: 'Q-D Exchange ( Outer Stack )',
};

// ─── Initial mock data (nested) ─────────────────────
function emptyOkr(id: string, num: string, text: string, color: OkrColor, extras?: Partial<Okr>): Okr {
  return { id, number: num, text, color, draft: '', kpis: [], ...extras };
}
function emptyKpi(id: string, num: string, text: string, extras?: Partial<Kpi>): Kpi {
  return { id, number: num, text, draft: '', jobs: [], ...extras };
}
function emptyJob(id: string, num: string, text: string, extras?: Partial<Job>): Job {
  return { id, number: num, text, draft: '', tasks: [], ...extras };
}

function emptyFinalOkr(
  id: string, num: string, text: string, color: OkrColor, linkedTo: string[],
  extras?: Partial<FinalOkr>,
): FinalOkr {
  return { id, number: num, text, color, linkedTo, draft: '', finalKpis: [], ...extras };
}

// Pre-populate finalized entries to simulate carry-over from prior quadrants' step-5 output.
//   Q-B load: finalOkrs = drafts from Q-A  (finalKpis empty — user fills them at Q-B step 5)
//   Q-C load: finalOkrs + finalKpis (Jobs empty — user fills them at Q-C step 5)
//   Q-D load: finalOkrs + finalKpis + finalJobs (Tasks empty — user fills them at Q-D step 5)
function prefilledFinalOkrs(okrs: Okr[], depth: 'okrs' | 'kpis' | 'jobs'): FinalOkr[] {
  return okrs.map((o, i) => {
    const finalKpis: FinalKpi[] = depth === 'okrs' ? [] : o.kpis.map(k => {
      const finalJobs: FinalJob[] = depth === 'kpis' ? [] : k.jobs.map(j => ({
        id: `${j.id}-final`,
        number: j.number,
        text: j.text,
        linkedTo: j.id,
        finalTasks: [],
        draft: '',
      }));
      return {
        id: `${k.id}-final`,
        number: k.number,
        text: k.text,
        linkedTo: k.id,
        finalJobs,
        draft: '',
      };
    });
    return emptyFinalOkr(
      `${o.id}-final`,
      String(i + 1).padStart(2, '0'),
      o.text,
      o.color,
      [o.id],
      { finalKpis },
    );
  });
}

function makeInitialTabs(quad: Quad): Record<TabId, TabContent> {
  const prefillDepth: 'okrs' | 'kpis' | 'jobs' | null =
    quad === 'b' ? 'okrs' :
    quad === 'c' ? 'kpis' :
    quad === 'd' ? 'jobs' :
    null;

  const sharedObjective = 'Execute Premier Wedding Expo';

  const base = {
    vendors: {
      objective: sharedObjective,
      okrs: [
        emptyOkr('v-o1', '01', 'Secure 50 exhibitor vendors across 8 categories', 'peach', {
          kpis: [
            emptyKpi('v-o1-k1', 'K1', 'Track vendor response rate — target 75% within 5 days', {
              jobs: [
                emptyJob('v-o1-k1-j1', 'J1', 'Outreach campaign to 200 prospective vendors', {
                  tasks: [
                    { id: 'v-o1-k1-j1-t1', text: 'Draft outreach email template', done: true  },
                    { id: 'v-o1-k1-j1-t2', text: 'Build vendor contact list in CRM',  done: false },
                  ],
                }),
              ],
            }),
            emptyKpi('v-o1-k2', 'K2', 'Signed contracts per category — minimum 6 per category'),
          ],
        }),
        emptyOkr('v-o2', '02', 'Onboard 15 floral & decor vendors with signed contracts', 'peach', { from: 'Lena W.' }),
      ],
      files: [{ id: 'f-1', name: 'Venue_AV_Confirmation.pdf', size: '340 KB' }],
    },
    partners: {
      objective: sharedObjective,
      okrs: [emptyOkr('p-o1', '01', 'Sign 5 corporate sponsorship deals at Gold tier or above', 'peach')],
      files: [],
    },
    location: {
      objective: sharedObjective,
      okrs: [
        emptyOkr('l-o1', '01', 'Confirm Convention Hall booking by Mar 15',           'peach'),
        emptyOkr('l-o2', '02', 'Lock in catering floor plan with 5 service stations', 'peach'),
      ],
      files: [],
    },
    attendance: {
      objective: sharedObjective,
      okrs: [emptyOkr('a-o1', '01', 'Drive 5,000 confirmed attendee registrations', 'peach')],
      files: [],
    },
  };

  // Q-A: one example finalized OKR in vendors; rest empty
  // Q-B: finalOkrs pre-populated (finalKpis empty — user adds at step 5)
  // Q-C: + finalKpis pre-populated (finalJobs empty — user adds at step 5)
  // Q-D: + finalJobs pre-populated (finalTasks empty — user adds at step 5)
  return {
    vendors: {
      ...base.vendors,
      finalOkrs: prefillDepth
        ? prefilledFinalOkrs(base.vendors.okrs, prefillDepth)
        : [emptyFinalOkr('v-fo1', '01',
            'Deliver expo with 50 signed vendors & 500+ ticket pre-sales by Mar 28',
            'peach', ['v-o1'])],
    },
    partners:   { ...base.partners,   finalOkrs: prefillDepth ? prefilledFinalOkrs(base.partners.okrs,   prefillDepth) : [] },
    location:   { ...base.location,   finalOkrs: prefillDepth ? prefilledFinalOkrs(base.location.okrs,   prefillDepth) : [] },
    attendance: { ...base.attendance, finalOkrs: prefillDepth ? prefilledFinalOkrs(base.attendance.okrs, prefillDepth) : [] },
  };
}

// ─── Helpers ────────────────────────────────────────
function nextNum(items: { number: string }[], prefix = ''): string {
  const n = items.length + 1;
  return prefix ? `${prefix}${n}` : String(n).padStart(2, '0');
}

// ─── Main component ─────────────────────────────────
export default function QuadrantFlow({ quad }: { quad: Quad }) {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id ?? '';
  const mol = getMolecule(id);

  const [activeTab, setActiveTab] = useState<TabId>('vendors');
  const [tabSteps, setTabSteps] = useState<Record<TabId, number>>({
    vendors: 1, partners: 1, location: 1, attendance: 1,
  });
  const [tabs, setTabs] = useState<Record<TabId, TabContent>>(() => makeInitialTabs(quad));
  const [draft, setDraft] = useState('');
  const [stumpOpen, setStumpOpen] = useState(false);
  const [assignedStump, setAssignedStump] = useState<StumpUser | null>(null);
  const [stumpSearch, setStumpSearch] = useState('');
  const [molInfoOpen, setMolInfoOpen] = useState(false);

  const step = tabSteps[activeTab];
  const stack = stackForStep(quad, step);
  const stackLabel = STACK_LABEL[stack];

  useEffect(() => {
    if (!stumpOpen && !molInfoOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setStumpOpen(false);
        setMolInfoOpen(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [stumpOpen, molInfoOpen]);

  useEffect(() => {
    if (!id) return;
    setActiveQuad(id, quad);
    setActiveStep(id, step);
    bumpQuadMaxStep(id, quad, step);
  }, [id, quad, step]);

  function advance() {
    if (step < TOTAL_STEPS) {
      bumpQuadMaxStep(id, quad, step + 1);
      setTabSteps(prev => ({ ...prev, [activeTab]: step + 1 }));
    } else {
      markQuadCompleted(id, quad);
      const next = NEXT_QUAD[quad];
      setActiveQuad(id, next);
      setActiveStep(id, 1);
      bumpQuadMaxStep(id, next, 1);
      router.push(`/molecules/${id}/quadrant-${next}`);
    }
  }

  // ─── Mutators ───────────────────────────────────
  function patchTab(fn: (t: TabContent) => TabContent) {
    setTabs(prev => ({ ...prev, [activeTab]: fn(prev[activeTab]) }));
  }
  function patchOkrs(fn: (okrs: Okr[]) => Okr[]) {
    patchTab(t => ({ ...t, okrs: fn(t.okrs) }));
  }
  function patchOkr(okrId: string, fn: (o: Okr) => Okr) {
    patchOkrs(okrs => okrs.map(o => o.id === okrId ? fn(o) : o));
  }
  function patchKpi(okrId: string, kpiId: string, fn: (k: Kpi) => Kpi) {
    patchOkr(okrId, o => ({ ...o, kpis: o.kpis.map(k => k.id === kpiId ? fn(k) : k) }));
  }
  function patchJob(okrId: string, kpiId: string, jobId: string, fn: (j: Job) => Job) {
    patchKpi(okrId, kpiId, k => ({ ...k, jobs: k.jobs.map(j => j.id === jobId ? fn(j) : j) }));
  }

  function addOkr() {
    const text = draft.trim();
    if (!text) return;
    patchOkrs(okrs => [
      ...okrs,
      emptyOkr(`${activeTab}-o-${Date.now()}`, nextNum(okrs), text, 'peach'),
    ]);
    setDraft('');
  }
  function removeOkr(okrId: string) {
    patchOkrs(okrs => okrs.filter(o => o.id !== okrId));
  }
  function addKpi(okrId: string) {
    patchOkr(okrId, o => {
      const t = o.draft.trim();
      if (!t) return o;
      return {
        ...o,
        draft: '',
        kpis: [...o.kpis, emptyKpi(`${okrId}-k-${Date.now()}`, nextNum(o.kpis, 'K'), t)],
      };
    });
  }
  function removeKpi(okrId: string, kpiId: string) {
    patchOkr(okrId, o => ({ ...o, kpis: o.kpis.filter(k => k.id !== kpiId) }));
  }
  function addJob(okrId: string, kpiId: string) {
    patchKpi(okrId, kpiId, k => {
      const t = k.draft.trim();
      if (!t) return k;
      return {
        ...k,
        draft: '',
        jobs: [...k.jobs, emptyJob(`${kpiId}-j-${Date.now()}`, nextNum(k.jobs, 'J'), t)],
      };
    });
  }
  function removeJob(okrId: string, kpiId: string, jobId: string) {
    patchKpi(okrId, kpiId, k => ({ ...k, jobs: k.jobs.filter(j => j.id !== jobId) }));
  }
  function addTask(okrId: string, kpiId: string, jobId: string) {
    patchJob(okrId, kpiId, jobId, j => {
      const t = j.draft.trim();
      if (!t) return j;
      return {
        ...j,
        draft: '',
        tasks: [...j.tasks, { id: `${jobId}-t-${Date.now()}`, text: t, done: false }],
      };
    });
  }
  function removeTask(okrId: string, kpiId: string, jobId: string, taskId: string) {
    patchJob(okrId, kpiId, jobId, j => ({ ...j, tasks: j.tasks.filter(t => t.id !== taskId) }));
  }
  function toggleTask(okrId: string, kpiId: string, jobId: string, taskId: string) {
    patchJob(okrId, kpiId, jobId, j => ({
      ...j,
      tasks: j.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t),
    }));
  }
  function removeFile(fileId: string) {
    patchTab(t => ({ ...t, files: t.files.filter(f => f.id !== fileId) }));
  }
  function addFinalOkr(text: string, linkedTo: string[]) {
    patchTab(t => ({
      ...t,
      finalOkrs: [
        ...t.finalOkrs,
        emptyFinalOkr(`${activeTab}-fo-${Date.now()}`, nextNum(t.finalOkrs), text, 'peach', linkedTo),
      ],
    }));
  }
  function removeFinalOkr(foId: string) {
    patchTab(t => ({ ...t, finalOkrs: t.finalOkrs.filter(f => f.id !== foId) }));
  }
  function patchFinalOkr(foId: string, fn: (fo: FinalOkr) => FinalOkr) {
    patchTab(t => ({ ...t, finalOkrs: t.finalOkrs.map(f => f.id === foId ? fn(f) : f) }));
  }
  function addFinalKpi(foId: string, text: string) {
    patchFinalOkr(foId, fo => ({
      ...fo,
      draft: '',
      finalKpis: [
        ...fo.finalKpis,
        {
          id: `${foId}-fk-${Date.now()}`,
          number: nextNum(fo.finalKpis, 'K'),
          text,
          linkedTo: '',
          finalJobs: [],
          draft: '',
        },
      ],
    }));
  }

  function patchFinalKpi(foId: string, fkId: string, fn: (fk: FinalKpi) => FinalKpi) {
    patchFinalOkr(foId, fo => ({ ...fo, finalKpis: fo.finalKpis.map(k => k.id === fkId ? fn(k) : k) }));
  }
  function patchFinalJob(foId: string, fkId: string, fjId: string, fn: (fj: FinalJob) => FinalJob) {
    patchFinalKpi(foId, fkId, fk => ({ ...fk, finalJobs: fk.finalJobs.map(j => j.id === fjId ? fn(j) : j) }));
  }
  function setFinalKpiDraft(foId: string, fkId: string, draft: string) {
    patchFinalKpi(foId, fkId, fk => ({ ...fk, draft }));
  }
  function setFinalJobDraft(foId: string, fkId: string, fjId: string, draft: string) {
    patchFinalJob(foId, fkId, fjId, fj => ({ ...fj, draft }));
  }
  function addFinalJob(foId: string, fkId: string, text: string) {
    patchFinalKpi(foId, fkId, fk => ({
      ...fk,
      draft: '',
      finalJobs: [
        ...fk.finalJobs,
        {
          id: `${fkId}-fj-${Date.now()}`,
          number: nextNum(fk.finalJobs, 'J'),
          text,
          linkedTo: '',
          finalTasks: [],
          draft: '',
        },
      ],
    }));
  }
  function removeFinalJob(foId: string, fkId: string, fjId: string) {
    patchFinalKpi(foId, fkId, fk => ({ ...fk, finalJobs: fk.finalJobs.filter(j => j.id !== fjId) }));
  }
  function addFinalTask(foId: string, fkId: string, fjId: string, text: string) {
    patchFinalJob(foId, fkId, fjId, fj => ({
      ...fj,
      draft: '',
      finalTasks: [
        ...fj.finalTasks,
        { id: `${fjId}-ft-${Date.now()}`, text, done: false, linkedTo: '' },
      ],
    }));
  }
  function removeFinalTask(foId: string, fkId: string, fjId: string, ftId: string) {
    patchFinalJob(foId, fkId, fjId, fj => ({ ...fj, finalTasks: fj.finalTasks.filter(t => t.id !== ftId) }));
  }
  function toggleFinalTask(foId: string, fkId: string, fjId: string, ftId: string) {
    patchFinalJob(foId, fkId, fjId, fj => ({
      ...fj,
      finalTasks: fj.finalTasks.map(t => t.id === ftId ? { ...t, done: !t.done } : t),
    }));
  }
  function removeFinalKpi(foId: string, fkId: string) {
    patchFinalOkr(foId, fo => ({ ...fo, finalKpis: fo.finalKpis.filter(k => k.id !== fkId) }));
  }
  function setFinalOkrDraft(foId: string, draft: string) {
    patchFinalOkr(foId, fo => ({ ...fo, draft }));
  }

  if (!mol) return null;

  const tab = tabs[activeTab];
  const tabLabel = TABS.find(t => t.id === activeTab)?.label ?? 'Vendors';
  const nextStack = step < TOTAL_STEPS ? STACK_LABEL[stackForStep(quad, step + 1)] : null;
  const finalStack = STACK_LABEL[QUAD_FINAL[quad]];
  const headingLabel = step === TOTAL_STEPS ? `Finalize ${finalStack}` : stackLabel;

  return (
    <>
      <div className="topbar">
        <div className="breadcrumb">
          <Link href="/dashboard">Dashboard</Link>
          <span className="sep">›</span>
          <Link href={`/molecules/${id}`}>{mol.name}</Link>
          <span className="sep">›</span>
          <span className="cur">Quadrant {QUAD_FULL_TITLE[quad]} — {headingLabel}</span>
        </div>
      </div>

      <div className="creator-content">

        <div className="qa-title-row">
          <h1 className="qa-title">{headingLabel}</h1>
          <div className="qa-step-indicator">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map(n => (
              <span
                key={n}
                className={`qa-step-dot${n === step ? ' active' : ''}${n < step ? ' done' : ''}`}
                data-step={n}
              />
            ))}
            <span className="qa-step-text">Step {step} of {TOTAL_STEPS}</span>
          </div>
        </div>

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

        <div className="qa-layout">
          <div className="qa-main">
            <div className="qa-obj-head">
              <div className="qa-obj-badge">OBJ</div>
              <div className="qa-obj-title">{tab.objective}</div>
            </div>

            {/* Step-dependent body */}
            {step === 1 && (
              <Step1Okrs
                okrs={tab.okrs}
                tabLabel={tabLabel}
                draft={draft}
                setDraft={setDraft}
                onAdd={addOkr}
                onRemove={removeOkr}
              />
            )}

            {step === 2 && (
              <Step2Kpis
                okrs={tab.okrs}
                tabLabel={tabLabel}
                onDraft={(okrId, v) => patchOkr(okrId, o => ({ ...o, draft: v }))}
                onAdd={addKpi}
                onRemove={removeKpi}
              />
            )}

            {step === 3 && (
              <Step3Jobs
                okrs={tab.okrs}
                tabLabel={tabLabel}
                onDraft={(okrId, kpiId, v) => patchKpi(okrId, kpiId, k => ({ ...k, draft: v }))}
                onAdd={addJob}
                onRemove={removeJob}
              />
            )}

            {step === 4 && (
              <Step4Tasks
                okrs={tab.okrs}
                tabLabel={tabLabel}
                onDraft={(okrId, kpiId, jobId, v) => patchJob(okrId, kpiId, jobId, j => ({ ...j, draft: v }))}
                onAdd={addTask}
                onRemove={removeTask}
                onToggle={toggleTask}
              />
            )}

            {step === TOTAL_STEPS && quad === 'a' && (
              <Step5Finalize
                okrs={tab.okrs}
                finalOkrs={tab.finalOkrs}
                tabLabel={tabLabel}
                quad={quad}
                finalStack={finalStack}
                onAdd={addFinalOkr}
                onRemove={removeFinalOkr}
              />
            )}

            {step === TOTAL_STEPS && quad === 'b' && (
              <Step5FinalizeKpis
                finalOkrs={tab.finalOkrs}
                tabLabel={tabLabel}
                onDraft={setFinalOkrDraft}
                onAdd={addFinalKpi}
                onRemove={removeFinalKpi}
              />
            )}

            {step === TOTAL_STEPS && quad === 'c' && (
              <Step5FinalizeJobs
                finalOkrs={tab.finalOkrs}
                tabLabel={tabLabel}
                onDraft={setFinalKpiDraft}
                onAdd={addFinalJob}
                onRemove={removeFinalJob}
              />
            )}

            {step === TOTAL_STEPS && quad === 'd' && (
              <Step5FinalizeTasks
                finalOkrs={tab.finalOkrs}
                tabLabel={tabLabel}
                onDraft={setFinalJobDraft}
                onAdd={addFinalTask}
                onRemove={removeFinalTask}
                onToggle={toggleFinalTask}
              />
            )}

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
                  <button type="button" className="qa-okr-x" onClick={() => removeFile(file.id)} aria-label="Remove file">{XIcon}</button>
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
            <button type="button" className="qa-submit" onClick={advance}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              {nextStack
                ? `Submit ${stackLabel} — Next: ${nextStack}`
                : `Submit & Continue to Quadrant ${NEXT_QUAD[quad].toUpperCase()}`}
            </button>
          </div>

          {/* Right side */}
          <div className="qa-side">
            <div className="qa-side-card">
              <div className="qa-side-card-header">
                <div className="qa-side-card-title">Molecule Info</div>
                <button
                  type="button"
                  className="qa-side-card-eye"
                  onClick={() => setMolInfoOpen(true)}
                  aria-label="View full molecule details"
                  title="View details"
                >
                  {EyeIcon}
                </button>
              </div>
              <div className="qa-info-row"><span className="qa-info-key">Molecule</span><span className="qa-info-val">{mol.name}</span></div>
              <div className="qa-info-row"><span className="qa-info-key">Quad</span><span className="qa-info-val">{QUAD_FULL_TITLE[quad]}</span></div>
              <div className="qa-info-row"><span className="qa-info-key">Stack</span><span className="qa-info-val">{step === TOTAL_STEPS ? 'Outer' : 'Inner'}</span></div>
              <div className="qa-info-row"><span className="qa-info-key">Objective</span><span className="qa-info-val">{headingLabel}</span></div>
            </div>

            <div className="qa-side-card">
              <div className="qa-side-card-title">
                {step === TOTAL_STEPS ? QUAD_OUTER_STACK_LABEL[quad] : QUAD_INNER_STACK_LABEL[quad]}
              </div>
              <div className="inner-stack-grid">
                {(step === TOTAL_STEPS ? OUTER_STACK_CELLS : STACK_CELLS).map(cell => {
                  // Inner stack order: okrs (step 1) → kpis (step 2) → jobs (step 3) → tasks (step 4)
                  const stepOrder: Record<string, number> = { okrs: 1, kpis: 2, jobs: 3, tasks: 4 };
                  const cellStep = stepOrder[cell.key] ?? 5;
                  const isVisible = step >= cellStep;
                  const isActive = step === cellStep;

                  // For outer stack (step 5), highlight based on quad
                  const outerActiveKey = QUAD_FINAL[quad];
                  const isOuterActive = step === TOTAL_STEPS && cell.key === outerActiveKey;

                  return (
                    <div key={cell.key} className={`stack-cell ${cell.key}${isVisible || step === TOTAL_STEPS ? ' visible' : ''}${isActive ? ' active' : ''}${isOuterActive ? ' active' : ''}`}>
                      <div className="stack-cell-label">{cell.label}</div>
                      {step !== TOTAL_STEPS && (
                        <div className="stack-pills">
                          {STACK_PILLS.map(p => (
                            <div key={p} className="stack-pill">{p}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {step === 1 && (
              <div className="qa-side-card">
                <div className="qa-side-card-title">My Stump</div>
                {assignedStump ? (
                  <div className="qa-stump-assigned-row">
                    <div className="qa-stump-row-av" style={{ background: assignedStump.gradient }}>
                      {assignedStump.initials}
                    </div>
                    <div className="qa-stump-row-info">
                      <div className="qa-stump-row-name">{assignedStump.name}</div>
                      <div className="qa-stump-row-meta">{assignedStump.role}</div>
                    </div>
                    <button
                      type="button"
                      className="qa-stump-row-action"
                      onClick={() => setStumpOpen(true)}
                      aria-label="Change Stump"
                      title="Change"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <button type="button" className="qa-stump-empty" onClick={() => setStumpOpen(true)}>
                    <div className="qa-stump-empty-icon">{PlusIcon}</div>
                    <span className="qa-stump-empty-text">Click to assign Stump</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Assign Stump modal ── */}
      {stumpOpen && (() => {
        const query = stumpSearch.trim().toLowerCase();
        const filtered = query
          ? STUMP_CANDIDATES.filter(u =>
              u.name.toLowerCase().includes(query) || u.role.toLowerCase().includes(query))
          : STUMP_CANDIDATES;
        return (
          <div className="ov-modal-overlay" onClick={() => setStumpOpen(false)}>
            <div className="ov-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
              <div className="ov-modal-header">
                <div className="ov-modal-eyebrow">Assign Stump · Quadrant {quad.toUpperCase()}</div>
                <button type="button" className="ov-modal-close" onClick={() => setStumpOpen(false)} aria-label="Close">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <div className="ov-modal-body">
                <div className="fc-group">
                  <input
                    className="fc-input"
                    type="text"
                    placeholder="Search by name or role…"
                    value={stumpSearch}
                    onChange={e => setStumpSearch(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="stump-user-list">
                  {filtered.length === 0 && (
                    <div style={{ padding: '18px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
                      No users match your search.
                    </div>
                  )}
                  {filtered.map(u => {
                    const isSelected = assignedStump?.id === u.id;
                    return (
                      <button
                        key={u.id}
                        type="button"
                        className={`stump-user-row${isSelected ? ' selected' : ''}`}
                        onClick={() => { setAssignedStump(u); setStumpOpen(false); setStumpSearch(''); }}
                      >
                        <div className="stump-user-av" style={{ background: u.gradient }}>{u.initials}</div>
                        <div className="stump-user-info">
                          <div className="stump-user-name">{u.name}</div>
                          <div className="stump-user-role">{u.role}</div>
                        </div>
                        {isSelected && (
                          <div className="stump-user-check">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="ov-modal-foot">
                {assignedStump && (
                  <button
                    type="button"
                    className="fc-btn-secondary"
                    style={{ marginRight: 'auto', color: 'var(--error)', borderColor: 'rgba(224,82,82,.3)' }}
                    onClick={() => { setAssignedStump(null); setStumpOpen(false); }}
                  >
                    Remove Stump
                  </button>
                )}
                <button type="button" className="fc-btn-secondary" onClick={() => setStumpOpen(false)}>Cancel</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Molecule Info modal ── */}
      {molInfoOpen && (
        <div className="ov-modal-overlay" onClick={() => setMolInfoOpen(false)}>
          <div className="ov-modal ov-modal--wide" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" style={{ maxWidth: '820px' }}>
            <div className="ov-modal-header">
              <div className="ov-modal-eyebrow">Molecule Details</div>
              <button type="button" className="ov-modal-close" onClick={() => setMolInfoOpen(false)} aria-label="Close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="ov-modal-body" style={{ padding: '20px 24px' }}>
              {/* Header with name and progress */}
              <div className="mol-detail-header">
                <div className="mol-detail-name">{mol.name}</div>
                <div className="mol-detail-progress">
                  <div className="mol-detail-progress-bar">
                    <div className="mol-detail-progress-fill" style={{ width: `${mol.progress}%` }} />
                  </div>
                  <span className="mol-detail-progress-text">{mol.progress}%</span>
                </div>
              </div>

              <div className="mol-detail-grid">
                {/* Left column */}
                <div className="mol-detail-main">
                  <div className="mol-detail-section">
                    <div className="mol-detail-label">Vision Statement</div>
                    <div className="mol-detail-value">Drive organizational excellence through structured goal alignment and cross-functional collaboration across all quadrants.</div>
                  </div>
                  <div className="mol-detail-section">
                    <div className="mol-detail-label">High-Level Objective</div>
                    <div className="mol-detail-value">{tab.objective}</div>
                  </div>
                  <div className="mol-detail-meta">
                    <div className="mol-detail-chip">
                      <span className="mol-detail-chip-label">Quadrant</span>
                      <span className="mol-detail-chip-value">{QUAD_FULL_TITLE[quad]}</span>
                    </div>
                    <div className="mol-detail-chip">
                      <span className="mol-detail-chip-label">Stack</span>
                      <span className="mol-detail-chip-value">{step === TOTAL_STEPS ? 'Outer' : 'Inner'}</span>
                    </div>
                    <div className="mol-detail-chip">
                      <span className="mol-detail-chip-label">Step</span>
                      <span className="mol-detail-chip-value">{step} of {TOTAL_STEPS}</span>
                    </div>
                  </div>

                  {/* Molecule Structure - Roles */}
                  <div className="mol-detail-roles">
                    <div className="mol-detail-label">Team Structure</div>
                    <div className="mol-detail-roles-grid">
                      <div className="mol-role-item">
                        <div className="mol-role-icon gold">C</div>
                        <div className="mol-role-info">
                          <div className="mol-role-name">Creator</div>
                          <div className="mol-role-desc">Create and manage molecule</div>
                        </div>
                      </div>
                      <div className="mol-role-item">
                        <div className="mol-role-icon gold">L</div>
                        <div className="mol-role-info">
                          <div className="mol-role-name">Lead</div>
                          <div className="mol-role-desc">Manage assigned molecule</div>
                        </div>
                      </div>
                      <div className="mol-role-item">
                        <div className="mol-role-icon cyan">S</div>
                        <div className="mol-role-info">
                          <div className="mol-role-name">Stump</div>
                          <div className="mol-role-desc">Manage assigned quads</div>
                        </div>
                      </div>
                      <div className="mol-role-item">
                        <div className="mol-role-icon purple">SS</div>
                        <div className="mol-role-info">
                          <div className="mol-role-name">Sub-Stump</div>
                          <div className="mol-role-desc">Manage assigned tasks</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right column - Stack diagrams */}
                <div className="mol-detail-aside">
                  <div className="mol-detail-card">
                    <div className="mol-detail-card-title">Outer Stack</div>
                    <div className="ms-quad-grid">
                      <div className={`ms-quad-cell red${quad === 'c' ? ' active' : ''}`}><div className="ms-quad-label">Q·C</div><div className="ms-quad-name">Knowledge</div></div>
                      <div className={`ms-quad-cell green${quad === 'd' ? ' active' : ''}`}><div className="ms-quad-label">Q·D</div><div className="ms-quad-name">Exchange</div></div>
                      <div className={`ms-quad-cell gold${quad === 'a' ? ' active' : ''}`}><div className="ms-quad-label">Q·A</div><div className="ms-quad-name">Coordination</div></div>
                      <div className={`ms-quad-cell blue${quad === 'b' ? ' active' : ''}`}><div className="ms-quad-label">Q·B</div><div className="ms-quad-name">Communication</div></div>
                    </div>
                  </div>
                  <div className="mol-detail-card">
                    <div className="mol-detail-card-title">Inner Stack</div>
                    <div className="inner-stack-grid">
                      {STACK_CELLS.map(cell => {
                        const stepOrder: Record<string, number> = { okrs: 1, kpis: 2, jobs: 3, tasks: 4 };
                        const isVisible = step >= stepOrder[cell.key];
                        return (
                          <div key={cell.key} className={`stack-cell ${cell.key}${isVisible ? ' visible' : ''}`}>
                            <div className="stack-cell-label">{cell.label}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="ov-modal-foot">
              <button type="button" className="fc-btn-secondary" onClick={() => setMolInfoOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Step 1: Flat OKRs ──────────────────────────────
function Step1Okrs({
  okrs, tabLabel, draft, setDraft, onAdd, onRemove,
}: {
  okrs: Okr[]; tabLabel: string; draft: string;
  setDraft: (v: string) => void; onAdd: () => void; onRemove: (okrId: string) => void;
}) {
  return (
    <div className="qa-section">
      <div className="qa-section-label">OKRs</div>
      {okrs.map(okr => (
        <div key={okr.id} className={`qa-okr-row ${okr.color}`}>
          <div className={`qa-okr-num ${okr.color}`}>{okr.number}</div>
          <div className="qa-okr-text">
            {okr.text}
            {okr.from && <span className="qa-okr-from"> (from {okr.from})</span>}
          </div>
          <button type="button" className="qa-okr-x" onClick={() => onRemove(okr.id)} aria-label="Remove OKR">{XIcon}</button>
        </div>
      ))}
      <div className="qa-add-row">
        <input
          className="qa-add-input"
          type="text"
          placeholder={`Add a new OKR for Internal ${tabLabel}...`}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') onAdd(); }}
        />
        <button type="button" className="qa-add-btn" onClick={onAdd}>
          {PlusIcon}
          Add OKR
        </button>
      </div>
    </div>
  );
}

// ─── Step 2: OKRs with KPIs against each ────────────
function Step2Kpis({
  okrs, tabLabel, onDraft, onAdd, onRemove,
}: {
  okrs: Okr[]; tabLabel: string;
  onDraft: (okrId: string, v: string) => void;
  onAdd: (okrId: string) => void;
  onRemove: (okrId: string, kpiId: string) => void;
}) {
  return (
    <>
      <div className="qb-input-banner">
        <div className="qb-input-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
        <div className="qb-input-text">Input from OKRs — add KPIs against each objective</div>
      </div>

      {okrs.map(okr => (
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
                <button type="button" className="qa-okr-x" onClick={() => onRemove(okr.id, kpi.id)} aria-label="Remove KPI">{XIcon}</button>
              </div>
            ))}
            <div className="qa-add-row">
              <input
                className="qa-add-input"
                type="text"
                placeholder={`Add a KPI for Internal ${tabLabel}...`}
                value={okr.draft}
                onChange={e => onDraft(okr.id, e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') onAdd(okr.id); }}
              />
              <button type="button" className="qb-add-kpi-btn" onClick={() => onAdd(okr.id)}>
                {PlusIcon}
                Add KPI
              </button>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

// ─── Step 3: KPIs with Jobs against each ────────────
function Step3Jobs({
  okrs, tabLabel, onDraft, onAdd, onRemove,
}: {
  okrs: Okr[]; tabLabel: string;
  onDraft: (okrId: string, kpiId: string, v: string) => void;
  onAdd: (okrId: string, kpiId: string) => void;
  onRemove: (okrId: string, kpiId: string, jobId: string) => void;
}) {
  const kpiPairs = okrs.flatMap(o => o.kpis.map(k => ({ okr: o, kpi: k })));
  return (
    <>
      <div className="qc-input-banner">
        <div className="qc-input-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 17 9 11 13 15 21 7" /><polyline points="14 7 21 7 21 14" />
          </svg>
        </div>
        <div className="qc-input-text">Input from KPIs — add Jobs against each KPI</div>
      </div>

      {kpiPairs.length === 0 && (
        <div className="qa-section" style={{ color: 'var(--muted)', fontSize: '13px' }}>
          No KPIs yet — complete Step 2 first.
        </div>
      )}
      {kpiPairs.map(({ okr, kpi }) => (
        <div key={kpi.id} className="qc-kpi-card">
          <div className="qc-kpi-head">
            <div className="qc-kpi-num">{kpi.number}</div>
            <div className="qc-kpi-text">
              {kpi.text}
              <span className="qa-okr-from"> (from {okr.number})</span>
            </div>
          </div>
          <div className="qc-kpi-body">
            <div className="qc-jobs-label">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="16" rx="2" /><path d="M8 2v4M16 2v4M3 10h18" />
              </svg>
              Jobs
            </div>
            {kpi.jobs.map(job => (
              <div key={job.id} className="qc-job-row">
                <div className="qc-job-num">{job.number}</div>
                <div className="qc-job-text">{job.text}</div>
                <button type="button" className="qa-okr-x" onClick={() => onRemove(okr.id, kpi.id, job.id)} aria-label="Remove Job">{XIcon}</button>
              </div>
            ))}
            <div className="qa-add-row">
              <input
                className="qa-add-input"
                type="text"
                placeholder={`Add a Job for Internal ${tabLabel}...`}
                value={kpi.draft}
                onChange={e => onDraft(okr.id, kpi.id, e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') onAdd(okr.id, kpi.id); }}
              />
              <button type="button" className="qc-add-job-btn" onClick={() => onAdd(okr.id, kpi.id)}>
                {PlusIcon}
                Add Job
              </button>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

// ─── Step 4: Jobs with Tasks against each ───────────
function Step4Tasks({
  okrs, tabLabel, onDraft, onAdd, onRemove, onToggle,
}: {
  okrs: Okr[]; tabLabel: string;
  onDraft: (okrId: string, kpiId: string, jobId: string, v: string) => void;
  onAdd: (okrId: string, kpiId: string, jobId: string) => void;
  onRemove: (okrId: string, kpiId: string, jobId: string, taskId: string) => void;
  onToggle: (okrId: string, kpiId: string, jobId: string, taskId: string) => void;
}) {
  const jobRows = okrs.flatMap(o => o.kpis.flatMap(k => k.jobs.map(j => ({ okr: o, kpi: k, job: j }))));
  return (
    <>
      <div className="qd-input-banner">
        <div className="qd-input-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="16" rx="2" /><path d="M8 2v4M16 2v4M3 10h18" />
          </svg>
        </div>
        <div className="qd-input-text">Input from Jobs — add Tasks against each Job</div>
      </div>

      {jobRows.length === 0 && (
        <div className="qa-section" style={{ color: 'var(--muted)', fontSize: '13px' }}>
          No Jobs yet — complete Step 3 first.
        </div>
      )}
      {jobRows.map(({ okr, kpi, job }) => (
        <div key={job.id} className="qd-job-card">
          <div className="qd-job-head">
            <div className="qd-job-num">{job.number}</div>
            <div className="qd-job-text">
              {job.text}
              <span className="qa-okr-from"> (from {kpi.number})</span>
            </div>
          </div>
          <div className="qd-job-body">
            <div className="qd-tasks-label">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
              Tasks
            </div>
            {job.tasks.map(task => (
              <div key={task.id} className={`qd-task-row${task.done ? ' completed' : ''}`}>
                <div className="qd-task-num">{job.number}.{job.tasks.indexOf(task) + 1}</div>
                <div className="qd-task-text">
                  {task.text}
                </div>
                <button
                  type="button"
                  className={`qd-task-toggle${task.done ? ' done' : ''}`}
                  onClick={() => onToggle(okr.id, kpi.id, job.id, task.id)}
                >
                  {task.done ? (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Completed
                    </>
                  ) : 'Mark Complete'}
                </button>
                <button type="button" className="qa-okr-x" onClick={() => onRemove(okr.id, kpi.id, job.id, task.id)} aria-label="Remove task">{XIcon}</button>
              </div>
            ))}
            <div className="qa-add-row">
              <input
                className="qa-add-input"
                type="text"
                placeholder={`Add a Task for Internal ${tabLabel}...`}
                value={job.draft}
                onChange={e => onDraft(okr.id, kpi.id, job.id, e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') onAdd(okr.id, kpi.id, job.id); }}
              />
              <button type="button" className="qd-add-task-btn" onClick={() => onAdd(okr.id, kpi.id, job.id)}>
                {PlusIcon}
                Add Task
              </button>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

// ─── Step 5: Finalize OKRs (flat, linked to step-1 drafts) ─
function Step5Finalize({
  okrs, finalOkrs, tabLabel, quad, finalStack, onAdd, onRemove,
}: {
  okrs: Okr[];
  finalOkrs: FinalOkr[];
  tabLabel: string;
  quad: Quad;
  finalStack: string;
  onAdd: (text: string, linkedTo: string[]) => void;
  onRemove: (foId: string) => void;
}) {
  const [draft, setDraft] = useState('');
  const [linkedTo, setLinkedTo] = useState<string[]>(okrs[0] ? [okrs[0].id] : []);
  const [linkDropdownOpen, setLinkDropdownOpen] = useState(false);

  function toggleLink(okrId: string) {
    setLinkedTo(prev =>
      prev.includes(okrId)
        ? prev.filter(id => id !== okrId)
        : [...prev, okrId]
    );
  }

  function submit() {
    const text = draft.trim();
    if (!text || linkedTo.length === 0) return;
    onAdd(text, linkedTo);
    setDraft('');
    setLinkedTo(okrs[0] ? [okrs[0].id] : []);
  }

  const linkedOkrNumbers = linkedTo
    .map(id => okrs.find(o => o.id === id)?.number)
    .filter(Boolean)
    .join(', ');

  return (
    <>
      <div className="qb-input-banner" style={{ background: 'var(--gold-pale)', borderColor: 'var(--gold)' }}>
        <div className="qb-input-icon" style={{ background: 'var(--gold)', color: 'var(--white)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div className="qb-input-text">
          Finalize — write polished OKRs for Quadrant {quad.toUpperCase()} ({finalStack} focus) and link to one or more Step 1 drafts
        </div>
      </div>

      {/* Originals reference */}
      <div className="qa-section">
        <div className="qa-section-label" style={{ opacity: .7 }}>Originals from Step 1 — reference</div>
        {okrs.length === 0 && (
          <div style={{ fontSize: '13px', color: 'var(--muted)' }}>No drafts yet — complete Step 1 first.</div>
        )}
        {okrs.map(o => (
          <div key={o.id} className={`qa-okr-row ${o.color}`} style={{ opacity: .75 }}>
            <div className={`qa-okr-num ${o.color}`}>{o.number}</div>
            <div className="qa-okr-text">
              {o.text}
              {o.from && <span className="qa-okr-from"> (from {o.from})</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Finalized editor */}
      <div className="qa-section">
        <div className="qa-section-label">Finalized OKRs</div>
        {finalOkrs.map(fo => {
          const linkedOkrs = fo.linkedTo
            .map(id => okrs.find(o => o.id === id))
            .filter(Boolean) as Okr[];
          return (
            <div key={fo.id} className={`qa-okr-row ${fo.color}`}>
              <div className={`qa-okr-num ${fo.color}`}>{fo.number}</div>
              <div className="qa-okr-text">
                {fo.text}
                {linkedOkrs.length > 0
                  ? <span className="qa-okr-from"> (linked to OKR {linkedOkrs.map(o => o.number).join(', ')})</span>
                  : <span className="qa-okr-from" style={{ color: 'var(--muted)' }}> (unlinked)</span>}
              </div>
              <button type="button" className="qa-okr-x" onClick={() => onRemove(fo.id)} aria-label="Remove finalized OKR">{XIcon}</button>
            </div>
          );
        })}

        <div className="qa-add-row" style={{ flexWrap: 'wrap', gap: '10px' }}>
          {/* Multi-select dropdown for linking OKRs */}
          <div className="qa-link-dropdown" style={{ position: 'relative', minWidth: '200px' }}>
            <button
              type="button"
              className="qa-link-trigger"
              onClick={() => setLinkDropdownOpen(!linkDropdownOpen)}
              disabled={okrs.length === 0}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              {linkedTo.length === 0
                ? 'Select OKRs to link'
                : `Linked: OKR ${linkedOkrNumbers}`}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto' }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {linkDropdownOpen && (
              <div className="qa-link-menu">
                {okrs.map(o => {
                  const isSelected = linkedTo.includes(o.id);
                  return (
                    <button
                      key={o.id}
                      type="button"
                      className={`qa-link-option${isSelected ? ' selected' : ''}`}
                      onClick={() => toggleLink(o.id)}
                    >
                      <div className={`qa-link-check${isSelected ? ' checked' : ''}`}>
                        {isSelected && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                      <span className="qa-link-num">{o.number}</span>
                      <span className="qa-link-text">{o.text.length > 40 ? `${o.text.slice(0, 40)}…` : o.text}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <input
            className="qa-add-input"
            type="text"
            placeholder={`Add a finalized OKR for ${tabLabel}...`}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') submit(); }}
            onFocus={() => setLinkDropdownOpen(false)}
            disabled={okrs.length === 0}
            style={{ flex: 1, minWidth: '200px' }}
          />
          <button type="button" className="qa-add-btn" onClick={submit} disabled={okrs.length === 0 || !draft.trim() || linkedTo.length === 0}>
            {PlusIcon}
            Finalize
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Q-B Step 5: KPIs against each Finalized OKR (mirrors step 2) ─
function Step5FinalizeKpis({
  finalOkrs, tabLabel, onDraft, onAdd, onRemove,
}: {
  finalOkrs: FinalOkr[];
  tabLabel: string;
  onDraft: (foId: string, v: string) => void;
  onAdd: (foId: string, text: string) => void;
  onRemove: (foId: string, fkId: string) => void;
}) {
  function submit(fo: FinalOkr) {
    const text = fo.draft.trim();
    if (!text) return;
    onAdd(fo.id, text);
  }

  return (
    <>
      <div className="qb-input-banner" style={{ background: 'var(--gold-pale)', borderColor: 'var(--gold)' }}>
        <div className="qb-input-icon" style={{ background: 'var(--gold)', color: 'var(--white)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div className="qb-input-text">
          Final Review — add KPIs against each Finalized OKR from Quadrant A
        </div>
      </div>

      {finalOkrs.length === 0 && (
        <div className="qa-section" style={{ color: 'var(--muted)', fontSize: '13px' }}>
          No finalized OKRs yet — finalize OKRs in Quadrant A first.
        </div>
      )}

      {finalOkrs.map(fo => (
          <div key={fo.id} className="qb-okr-card">
            <div className="qb-okr-head">
              <div className="qb-okr-num">{fo.number}</div>
              <div className="qb-okr-text">{fo.text}</div>
            </div>
            <div className="qb-okr-body">
              <div className="qb-kpis-label">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 17 9 11 13 15 21 7" /><polyline points="14 7 21 7 21 14" />
                </svg>
                KPIs
              </div>

              {fo.finalKpis.map(fk => (
                <div key={fk.id} className="qb-kpi-row">
                  <div className="qb-kpi-num">{fk.number}</div>
                  <div className="qb-kpi-text">{fk.text}</div>
                  <button type="button" className="qa-okr-x" onClick={() => onRemove(fo.id, fk.id)} aria-label="Remove KPI">{XIcon}</button>
                </div>
              ))}

              <div className="qa-add-row">
                <input
                  className="qa-add-input"
                  type="text"
                  placeholder={`Add a KPI for Internal ${tabLabel}...`}
                  value={fo.draft}
                  onChange={e => onDraft(fo.id, e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') submit(fo); }}
                />
                <button type="button" className="qb-add-kpi-btn" onClick={() => submit(fo)} disabled={!fo.draft.trim()}>
                  {PlusIcon}
                  Add KPI
                </button>
              </div>
            </div>
          </div>
        ))}
    </>
  );
}

// ─── Q-C Step 5: Jobs against each Finalized KPI (mirrors step 3) ─
function Step5FinalizeJobs({
  finalOkrs, tabLabel, onDraft, onAdd, onRemove,
}: {
  finalOkrs: FinalOkr[];
  tabLabel: string;
  onDraft: (foId: string, fkId: string, v: string) => void;
  onAdd: (foId: string, fkId: string, text: string) => void;
  onRemove: (foId: string, fkId: string, fjId: string) => void;
}) {
  const finalKpiPairs = finalOkrs.flatMap(fo => fo.finalKpis.map(fk => ({ fo, fk })));

  function submit(fo: FinalOkr, fk: FinalKpi) {
    const text = fk.draft.trim();
    if (!text) return;
    onAdd(fo.id, fk.id, text);
  }

  return (
    <>
      <div className="qc-input-banner" style={{ background: 'var(--gold-pale)', borderColor: 'var(--gold)' }}>
        <div className="qc-input-icon" style={{ background: 'var(--gold)', color: 'var(--white)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div className="qc-input-text">
          Final Review — add Jobs against each Finalized KPI from Quadrant B
        </div>
      </div>

      {finalKpiPairs.length === 0 && (
        <div className="qa-section" style={{ color: 'var(--muted)', fontSize: '13px' }}>
          No finalized KPIs yet — finalize KPIs in Quadrant B first.
        </div>
      )}

      {finalKpiPairs.map(({ fo, fk }) => (
        <div key={fk.id} className="qc-kpi-card">
          <div className="qc-kpi-head">
            <div className="qc-kpi-num">{fk.number}</div>
            <div className="qc-kpi-text">{fk.text}</div>
          </div>
          <div className="qc-kpi-body">
            <div className="qc-jobs-label">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="16" rx="2" /><path d="M8 2v4M16 2v4M3 10h18" />
              </svg>
              Jobs
            </div>

            {fk.finalJobs.map(fj => (
              <div key={fj.id} className="qc-job-row">
                <div className="qc-job-num">{fj.number}</div>
                <div className="qc-job-text">{fj.text}</div>
                <button type="button" className="qa-okr-x" onClick={() => onRemove(fo.id, fk.id, fj.id)} aria-label="Remove Job">{XIcon}</button>
              </div>
            ))}

            <div className="qa-add-row">
              <input
                className="qa-add-input"
                type="text"
                placeholder={`Add a Job for Internal ${tabLabel}...`}
                value={fk.draft}
                onChange={e => onDraft(fo.id, fk.id, e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') submit(fo, fk); }}
              />
              <button type="button" className="qc-add-job-btn" onClick={() => submit(fo, fk)} disabled={!fk.draft.trim()}>
                {PlusIcon}
                Add Job
              </button>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

// ─── Q-D Step 5: Tasks against each Finalized Job (mirrors step 4) ─
function Step5FinalizeTasks({
  finalOkrs, tabLabel, onDraft, onAdd, onRemove, onToggle,
}: {
  finalOkrs: FinalOkr[];
  tabLabel: string;
  onDraft: (foId: string, fkId: string, fjId: string, v: string) => void;
  onAdd: (foId: string, fkId: string, fjId: string, text: string) => void;
  onRemove: (foId: string, fkId: string, fjId: string, ftId: string) => void;
  onToggle: (foId: string, fkId: string, fjId: string, ftId: string) => void;
}) {
  const finalJobTriples = finalOkrs.flatMap(fo =>
    fo.finalKpis.flatMap(fk => fk.finalJobs.map(fj => ({ fo, fk, fj })))
  );

  function submit(fo: FinalOkr, fk: FinalKpi, fj: FinalJob) {
    const text = fj.draft.trim();
    if (!text) return;
    onAdd(fo.id, fk.id, fj.id, text);
  }

  return (
    <>
      <div className="qd-input-banner" style={{ background: 'var(--gold-pale)', borderColor: 'var(--gold)' }}>
        <div className="qd-input-icon" style={{ background: 'var(--gold)', color: 'var(--white)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div className="qd-input-text">
          Final Review — add Tasks against each Finalized Job from Quadrant C
        </div>
      </div>

      {finalJobTriples.length === 0 && (
        <div className="qa-section" style={{ color: 'var(--muted)', fontSize: '13px' }}>
          No finalized Jobs yet — finalize Jobs in Quadrant C first.
        </div>
      )}

      {finalJobTriples.map(({ fo, fk, fj }) => (
        <div key={fj.id} className="qd-job-card">
          <div className="qd-job-head">
            <div className="qd-job-num">{fj.number}</div>
            <div className="qd-job-text">{fj.text}</div>
          </div>
          <div className="qd-job-body">
            <div className="qd-tasks-label">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
              Tasks
            </div>

            {fj.finalTasks.map(ft => (
              <div key={ft.id} className={`qd-task-row${ft.done ? ' completed' : ''}`}>
                <div className="qd-task-num">{fj.number}.{fj.finalTasks.indexOf(ft) + 1}</div>
                <div className="qd-task-text">
                  {ft.text}
                </div>
                <button
                  type="button"
                  className={`qd-task-toggle${ft.done ? ' done' : ''}`}
                  onClick={() => onToggle(fo.id, fk.id, fj.id, ft.id)}
                >
                  {ft.done ? (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Completed
                    </>
                  ) : 'Mark Complete'}
                </button>
                <button type="button" className="qa-okr-x" onClick={() => onRemove(fo.id, fk.id, fj.id, ft.id)} aria-label="Remove task">{XIcon}</button>
              </div>
            ))}

            <div className="qa-add-row">
              <input
                className="qa-add-input"
                type="text"
                placeholder={`Add a Task for Internal ${tabLabel}...`}
                value={fj.draft}
                onChange={e => onDraft(fo.id, fk.id, fj.id, e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') submit(fo, fk, fj); }}
              />
              <button type="button" className="qd-add-task-btn" onClick={() => submit(fo, fk, fj)} disabled={!fj.draft.trim()}>
                {PlusIcon}
                Add Task
              </button>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
