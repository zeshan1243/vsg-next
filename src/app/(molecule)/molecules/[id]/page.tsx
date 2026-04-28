'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { getMolecule } from '@/lib/molecules';
import { getCompletedQuads, getQuadMaxStep, isQuadUnlocked, type Quad } from '@/lib/progress';

type PillColor = 'gold' | 'blue' | 'red' | 'green';
type QuadColor = 'red' | 'green' | 'gold' | 'blue';
interface Pill { label: string; color: PillColor; }
interface QuadDef {
  code: string;
  name: string;
  quad: Quad;
  iconCls: QuadColor;
  icon: ReactNode;
  pills: Pill[];
  route: string;
}

interface TeamMember { initials: string; gradient: string; name: string; }

const TEAM: TeamMember[] = [
  { initials: 'SK', gradient: 'linear-gradient(135deg, #FFAB00, #FFD54F)', name: 'Sarah Kaplan' },
  { initials: 'MR', gradient: 'linear-gradient(135deg, #3B82F6, #60A5FA)', name: 'Marcus Reeves' },
  { initials: 'MC', gradient: 'linear-gradient(135deg, #EF4444, #F87171)', name: 'Mike Chan' },
  { initials: 'ET', gradient: 'linear-gradient(135deg, #22C55E, #4ADE80)', name: 'Elena Torres' },
  { initials: 'DK', gradient: 'linear-gradient(135deg, #EC4899, #F9A8D4)', name: 'David Kim' },
  { initials: 'JB', gradient: 'linear-gradient(135deg, #8B5CF6, #A78BFA)', name: 'Jenna Brooks' },
  { initials: 'LW', gradient: 'linear-gradient(135deg, #0F172A, #334155)', name: 'Liam Walker' },
];

const BookIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);
const ExchangeIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
);
const GlobeIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);
const ChatIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const MOL_OBJECTIVE = "Host the city's premier wedding event, connecting attendees with top local vendors across all four operational quadrants.";
const MOL_VISION = "Become the most trusted annual wedding showcase in the region — a curated marketplace where couples meet vetted vendors, partners unlock meaningful reach, and every edition sets a higher bar for quality, experience, and inclusion.";

interface QuadInfo {
  label: string;        // 'A' | 'B' | 'C' | 'D'
  phase: string;        // 'Coordinate' | 'Communication' | 'Knowledge' | 'Exchange'
  artifact: string;     // 'OKRs' | 'KPIs' | 'Jobs' | 'Tasks'
  color: string;        // hex
  colorName: string;    // 'Yellow' | 'Blue' | 'Red' | 'Green'
  type: 'Internal' | 'External';
  workfields: string[];
  objective: string;
  lead: string;
  stump: string;
}
const QUAD_INFO: Record<Quad, QuadInfo> = {
  a: {
    label: 'A', phase: 'Coordinate',    artifact: 'OKRs',
    color: '#FFAB00', colorName: 'Yellow',
    type: 'Internal',
    workfields: ['Vendors', 'Partners', 'Location', 'Attendance'],
    objective: 'Define high-level OKRs that set direction for the molecule.',
    lead: 'Marcus Reeves', stump: 'Maria Chen',
  },
  b: {
    label: 'B', phase: 'Communication', artifact: 'KPIs',
    color: '#3B82F6', colorName: 'Blue',
    type: 'Internal',
    workfields: ['Vendors', 'Partners', 'Location', 'Attendance'],
    objective: 'Define measurable KPIs against each Coordinate OKR.',
    lead: 'Marcus Reeves', stump: 'Elena Torres',
  },
  c: {
    label: 'C', phase: 'Knowledge',     artifact: 'Jobs',
    color: '#EF4444', colorName: 'Red',
    type: 'External',
    workfields: ['Vendors', 'Partners', 'Location', 'Attendance'],
    objective: 'Break each KPI down into concrete jobs to be executed.',
    lead: 'Marcus Reeves', stump: 'Rachel Nguyen',
  },
  d: {
    label: 'D', phase: 'Exchange',      artifact: 'Tasks',
    color: '#22C55E', colorName: 'Green',
    type: 'External',
    workfields: ['Vendors', 'Partners', 'Location', 'Attendance'],
    objective: 'Execute jobs as granular, trackable tasks.',
    lead: 'Marcus Reeves', stump: 'Tyler Williams',
  },
};

const PIE_SECTORS = [
  {
    code: 'Q-D', label: 'Exchange',
    fill: '#22C55E',
    d: 'M 170 170 L 170 5 A 165 165 0 0 1 335 170 Z',
    lx: 236, ly: 104, dx: 7, dy: -7,
  },
  {
    code: 'Q-B', label: 'Communication',
    fill: '#3B82F6',
    d: 'M 170 170 L 335 170 A 165 165 0 0 1 170 335 Z',
    lx: 236, ly: 236, dx: 7, dy: 7,
  },
  {
    code: 'Q-A', label: 'Coordinate',
    fill: '#FFAB00',
    d: 'M 170 170 L 170 335 A 165 165 0 0 1 5 170 Z',
    lx: 104, ly: 236, dx: -7, dy: 7,
  },
  {
    code: 'Q-C', label: 'Knowledge',
    fill: '#EF4444',
    d: 'M 170 170 L 5 170 A 165 165 0 0 1 170 5 Z',
    lx: 104, ly: 104, dx: -7, dy: -7,
  },
] as const;

const PILLS_TOP: Pill[] = [
  { label: 'OKRs',  color: 'gold' },
  { label: 'KPIs',  color: 'blue' },
  { label: 'Jobs',  color: 'red' },
  { label: 'Tasks', color: 'green' },
];
const PILLS_BOTTOM: Pill[] = [
  { label: 'Tasks', color: 'green' },
  { label: 'Jobs',  color: 'red' },
  { label: 'KPIs',  color: 'blue' },
  { label: 'OKRs',  color: 'gold' },
];

const PILL_STEP: Record<string, number> = { OKRs: 1, KPIs: 2, Jobs: 3, Tasks: 4 };

type WorkfieldKey = 'vendors' | 'partners' | 'location' | 'attendance';
const WORKFIELD_FIELDS: { key: WorkfieldKey; default: string }[] = [
  { key: 'vendors',    default: 'Vendors'    },
  { key: 'partners',   default: 'Partners'   },
  { key: 'location',   default: 'Location'   },
  { key: 'attendance', default: 'Attendance' },
];
type WorkfieldMap = Record<WorkfieldKey, string>;
const DEFAULT_WORKFIELDS: WorkfieldMap = {
  vendors: 'Vendors', partners: 'Partners', location: 'Location', attendance: 'Attendance',
};
const AVAILABLE_LEADS = [
  'Marcus Reeves', 'A. Patel', 'L. Walsh', 'N. Brooks',
  'E. Torres', 'S. Mitchell', 'D. Lee', 'T. Harris',
];

const KebabIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="5"  r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="12" cy="19" r="2" />
  </svg>
);
const WorkfieldsIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="16" rx="2" /><path d="M8 2v4M16 2v4M3 10h18" />
  </svg>
);
const LeadIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);

function QuadCard({
  code, name, iconCls, icon, pills,
  disabled, maxStep, onPillClick,
}: QuadDef & {
  disabled: boolean;
  maxStep: number;
  onPillClick: (step: number) => void;
}) {
  return (
    <div
      className={`ov-quad${disabled ? ' ov-quad-locked' : ''}`}
      aria-disabled={disabled}
    >
      {disabled && (
        <div className="ov-quad-lock">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
      )}
      <div className="ov-quad-head">
        <div className={`ov-quad-icon ${iconCls}`}>{icon}</div>
        <div>
          <div className="ov-quad-code">{code}</div>
          <div className="ov-quad-name">{name}</div>
        </div>
      </div>
      <div className="ov-quad-pills">
        {pills.map((p, i) => {
          const pillStep = PILL_STEP[p.label] ?? 1;
          // OKRs (step 1) is always enabled when the card is unlocked.
          // Later stacks require the corresponding step to have been reached.
          const pillEnabled = !disabled && (pillStep === 1 || maxStep >= pillStep);
          return (
            <button
              key={`${p.label}-${i}`}
              type="button"
              className={`ov-pill pill-${p.color}${pillEnabled ? '' : ' ov-pill--locked'}`}
              disabled={!pillEnabled}
              onClick={() => pillEnabled && onPillClick(pillStep)}
            >
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function MoleculeOverviewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id ?? '';
  const mol = getMolecule(id);
  const [completedQuads, setCompletedQuads] = useState<Quad[]>([]);
  const [maxSteps, setMaxSteps] = useState<Record<Quad, number>>({ a: 0, b: 0, c: 0, d: 0 });
  const [infoOpen, setInfoOpen] = useState(false);
  const [quadModal, setQuadModal] = useState<Quad | null>(null);
  const [showCards, setShowCards] = useState(false);

  const [leadName, setLeadName] = useState('Marcus Reeves');
  const [workfields, setWorkfields] = useState<WorkfieldMap>({ ...DEFAULT_WORKFIELDS });
  const [actionsOpen, setActionsOpen] = useState(false);
  const [wfModal, setWfModal] = useState(false);
  const [editingWfKey, setEditingWfKey] = useState<WorkfieldKey | null>(null);
  const [leadModal, setLeadModal] = useState(false);
  const [leadDraft, setLeadDraft] = useState('');

  useEffect(() => {
    if (!infoOpen && quadModal === null && !wfModal && !leadModal) return;
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Escape') return;
      setInfoOpen(false);
      setQuadModal(null);
      setWfModal(false);
      setEditingWfKey(null);
      setLeadModal(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [infoOpen, quadModal, wfModal, leadModal]);

  useEffect(() => {
    if (!actionsOpen) return;
    function onClick() { setActionsOpen(false); }
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, [actionsOpen]);

  function openWfModal()   { setWfModal(true); setEditingWfKey(null); setActionsOpen(false); }
  function closeWfModal()  { setWfModal(false); setEditingWfKey(null); }
  function updateWorkfield(key: WorkfieldKey, value: string) {
    setWorkfields(prev => ({ ...prev, [key]: value }));
  }
  function openLeadModal() { setLeadDraft(leadName); setLeadModal(true); setActionsOpen(false); }
  function closeLeadModal(){ setLeadModal(false); }
  function saveLead() {
    if (!leadDraft.trim()) return;
    setLeadName(leadDraft.trim());
    setLeadModal(false);
  }

  useEffect(() => {
    if (!id) return;
    setCompletedQuads(getCompletedQuads(id));
    setMaxSteps({
      a: getQuadMaxStep(id, 'a'),
      b: getQuadMaxStep(id, 'b'),
      c: getQuadMaxStep(id, 'c'),
      d: getQuadMaxStep(id, 'd'),
    });
  }, [id]);

  if (!mol) return null;

  const QUADS: QuadDef[] = [
    { code: 'Q-C', name: 'Knowledge',     quad: 'c', iconCls: 'red',   icon: BookIcon,     pills: PILLS_TOP,    route: `/molecules/${id}/quadrant-c` },
    { code: 'Q-D', name: 'Exchange',      quad: 'd', iconCls: 'green', icon: ExchangeIcon, pills: PILLS_TOP,    route: `/molecules/${id}/quadrant-d` },
    { code: 'Q-A', name: 'Coordinate',    quad: 'a', iconCls: 'gold',  icon: GlobeIcon,    pills: PILLS_BOTTOM, route: `/molecules/${id}/quadrant-a` },
    { code: 'Q-B', name: 'Communication', quad: 'b', iconCls: 'blue',  icon: ChatIcon,     pills: PILLS_BOTTOM, route: `/molecules/${id}/quadrant-b` },
  ];

  function goToStep(q: QuadDef, step: number) {
    router.push(step > 1 ? `${q.route}?step=${step}` : q.route);
  }

  return (
    <>
      <div className="topbar">
        <div className="breadcrumb">
          <Link href="/dashboard">Dashboard</Link>
          <span className="sep">›</span>
          <Link href="/molecules">My Molecules</Link>
          <span className="sep">›</span>
          <span className="cur">{mol.name} — Overview</span>
        </div>
      </div>

      <div className="creator-content">

        {/* Header */}
        <div className="ov-header">
          <div>
            <h1 className="ov-title">{mol.name}</h1>
            <p className="ov-desc">{MOL_OBJECTIVE}</p>
          </div>
          <div className="ov-header-right">
            <div className="lead-pill">
              <div className="lead-label">LEAD</div>
              <div className="lead-name">{leadName}</div>
              <div className="lead-hint">Assigned by Creator</div>
            </div>
            <div className="ov-actions">
              <button
                type="button"
                className={`ov-actions-btn${actionsOpen ? ' open' : ''}`}
                onClick={e => { e.stopPropagation(); setActionsOpen(v => !v); }}
                aria-haspopup="menu"
                aria-expanded={actionsOpen}
                aria-label="Molecule actions"
                title="Actions"
              >
                {KebabIcon}
              </button>
              {actionsOpen && (
                <div className="ov-actions-menu" role="menu" onClick={e => e.stopPropagation()}>
                  <button type="button" role="menuitem" className="ov-actions-item" onClick={openWfModal}>
                    {WorkfieldsIcon}
                    Edit Workfields
                  </button>
                  <button type="button" role="menuitem" className="ov-actions-item" onClick={openLeadModal}>
                    {LeadIcon}
                    Change Lead
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hero: pie + quadrants */}
        <div className={`ov-hero${showCards ? '' : ' ov-hero--pie-only'}`}>
          <div className="ov-pie-wrap">
            <svg
              viewBox="-20 -20 380 380"
              width="380"
              height="380"
              style={{ display: 'block', filter: 'drop-shadow(0 8px 24px rgba(13,27,42,.1))' }}
            >
              {/* Segmented progress ring — one arc per quad */}
              {(() => {
                const cx = 170, cy = 170, r = 178;
                const toRad = (deg: number) => (deg * Math.PI) / 180;
                function arcPath(startDeg: number, endDeg: number) {
                  const s = { x: cx + r * Math.cos(toRad(startDeg)), y: cy + r * Math.sin(toRad(startDeg)) };
                  const e = { x: cx + r * Math.cos(toRad(endDeg)),   y: cy + r * Math.sin(toRad(endDeg)) };
                  const large = endDeg - startDeg > 180 ? 1 : 0;
                  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
                }
                const SEGS = [
                  { quad: 'a' as const, start: 93,  end: 177, color: '#FFAB00' },
                  { quad: 'b' as const, start: 3,   end: 87,  color: '#3B82F6' },
                  { quad: 'c' as const, start: 183, end: 267, color: '#EF4444' },
                  { quad: 'd' as const, start: 273, end: 357, color: '#22C55E' },
                ];
                return (
                  <g>
                    {SEGS.map(seg => (
                      <path
                        key={seg.quad}
                        d={arcPath(seg.start, seg.end)}
                        fill="none"
                        stroke="var(--border)"
                        strokeWidth="6"
                        strokeLinecap="round"
                      />
                    ))}
                    {SEGS.filter(seg => completedQuads.includes(seg.quad)).map(seg => (
                      <path
                        key={seg.quad}
                        d={arcPath(seg.start, seg.end)}
                        fill="none"
                        stroke={seg.color}
                        strokeWidth="6"
                        strokeLinecap="round"
                        style={{ transition: 'stroke .3s ease' }}
                      />
                    ))}
                  </g>
                );
              })()}


              {PIE_SECTORS.map(s => {
                const quadKey = s.code.slice(-1).toLowerCase() as Quad;
                const isCompleted = completedQuads.includes(quadKey);
                return (
                  <g
                    key={s.code}
                    style={{
                      opacity: isCompleted ? 1 : 0.5,
                      transition: 'opacity .22s ease',
                      cursor: 'pointer',
                    }}
                    onClick={() => setQuadModal(quadKey)}
                  >
                    <path
                      d={s.d}
                      fill={s.fill}
                      stroke="white"
                      strokeWidth="3"
                    />
                    <text
                      x={s.lx} y={s.ly - 7}
                      textAnchor="middle"
                      fill="rgba(255,255,255,.75)"
                      fontFamily="var(--font-sans)"
                      fontSize="10"
                      fontWeight="600"
                      letterSpacing="1"
                      style={{ pointerEvents: 'none' }}
                    >
                      {s.code}
                    </text>
                    <text
                      x={s.lx} y={s.ly + 8}
                      textAnchor="middle"
                      fill="white"
                      fontFamily="var(--font-sans)"
                      fontSize="11"
                      fontWeight="700"
                      style={{ pointerEvents: 'none' }}
                    >
                      {s.label}
                    </text>
                  </g>
                );
              })}
              <g style={{ cursor: 'pointer' }} onClick={() => setInfoOpen(true)}>
                <circle cx="170" cy="170" r="24" fill="white" />
                <circle cx="170" cy="170" r="24" fill="transparent" stroke="var(--border)" strokeWidth="1" />
                <text
                  x="170" y="174"
                  textAnchor="middle"
                  fontFamily="var(--font-sans)"
                  fontSize="13"
                  fontWeight="700"
                  fill="var(--navy)"
                >i</text>
              </g>
            </svg>

            <button
              type="button"
              className="ov-toggle-cards"
              onClick={() => setShowCards(v => !v)}
              aria-expanded={showCards}
            >
              {showCards ? 'Hide Inner Structure' : 'Show Inner Structure'}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                style={{ transform: showCards ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {showCards && (
            <div className="ov-quads">
              {QUADS.slice(0, 2).map(q => (
                <QuadCard
                  key={q.code} {...q}
                  disabled={!isQuadUnlocked(q.quad, completedQuads)}
                  maxStep={maxSteps[q.quad]}
                  onPillClick={step => goToStep(q, step)}
                />
              ))}
              <div className="ov-quad-progress">
                <div className="ov-quad-progress-fill" style={{ width: `${completedQuads.length * 25}%` }} />
              </div>
              {QUADS.slice(2).map(q => (
                <QuadCard
                  key={q.code} {...q}
                  disabled={!isQuadUnlocked(q.quad, completedQuads)}
                  maxStep={maxSteps[q.quad]}
                  onPillClick={step => goToStep(q, step)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Bottom: team + details */}
        <div className="ov-bottom">
          <div className="panel-card">
            <div className="panel-card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div className="panel-card-title">Team · {TEAM.length} Members</div>
              <button type="button" className="btn-sm" onClick={() => { /* TODO: assign flow */ }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Assign
              </button>
            </div>
            <div className="team-avatars">
              {TEAM.map(m => (
                <div
                  key={m.initials}
                  className="team-av"
                  style={{ background: m.gradient }}
                  title={m.name}
                >
                  {m.initials}
                </div>
              ))}
            </div>
          </div>

          <div className="panel-card">
            <div className="panel-card-header">
              <div className="panel-card-title">Details</div>
            </div>
            <div className="details-body">
              <div className="details-row"><span className="details-key">Initiated</span><span className="details-val">Jan 12, 2026</span></div>
              <div className="details-row"><span className="details-key">Target</span><span className="details-val">Mar 28, 2026</span></div>
              <div className="details-row"><span className="details-key">Template</span><span className="details-val">Event OKR Starter</span></div>
              <div className="details-row"><span className="details-key">Tasks done</span><span className="details-val">9 / 12</span></div>
            </div>
          </div>
        </div>

      </div>

      {quadModal !== null && (() => {
        const info = QUAD_INFO[quadModal];
        const isCompleted  = completedQuads.includes(quadModal);
        const isInProgress = !isCompleted && maxSteps[quadModal] > 0;
        const statusLabel  = isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Not Started';
        const statusCls    = isCompleted ? 'qm-status--done' : isInProgress ? 'qm-status--progress' : 'qm-status--idle';

        return (
          <div className="ov-modal-overlay" onClick={() => setQuadModal(null)}>
            <div className="ov-modal ov-modal--wide" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">

              {/* Header */}
              <div className="ov-modal-header">
                <div className="ov-modal-eyebrow">Quadrant {info.label}</div>
                <button type="button" className="ov-modal-close" onClick={() => setQuadModal(null)} aria-label="Close">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div className="ov-modal-body">

                {/* Identity hero row */}
                <div className="qm-hero">
                  <div className="qm-color-swatch" style={{ background: info.color }} />
                  <div className="qm-hero-main">
                    <div className="qm-hero-name">
                      <span className="qm-name-letter" style={{ color: info.color }}>{info.label}</span>
                      <span className="qm-name-sep">·</span>
                      <span className="qm-name-phase">{info.phase}</span>
                    </div>
                    <div className="qm-hero-sub">{info.type} · {info.colorName}</div>
                  </div>
                  <span className={`qm-status ${statusCls}`}>
                    <span className="qm-status-dot" />
                    {statusLabel}
                  </span>
                </div>

                {/* Key fields grid */}
                <div className="qm-fields">
                  <div className="qm-field">
                    <div className="qm-field-label">Name</div>
                    <div className="qm-field-value">{info.label}</div>
                  </div>
                  <div className="qm-field">
                    <div className="qm-field-label">Phase</div>
                    <div className="qm-field-value">{info.phase}</div>
                  </div>
                  <div className="qm-field">
                    <div className="qm-field-label">Artifact</div>
                    <div className="qm-field-value">
                      <span className="qm-artifact-chip" style={{ background: `${info.color}18`, color: info.color, borderColor: `${info.color}30` }}>
                        {info.artifact}
                      </span>
                    </div>
                  </div>
                  <div className="qm-field">
                    <div className="qm-field-label">Type</div>
                    <div className="qm-field-value">{info.type}</div>
                  </div>
                  <div className="qm-field">
                    <div className="qm-field-label">Color</div>
                    <div className="qm-field-value" style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <span style={{ width: 12, height: 12, borderRadius: '50%', background: info.color, display: 'inline-block', flexShrink: 0 }} />
                      {info.colorName}
                    </div>
                  </div>
                  <div className="qm-field">
                    <div className="qm-field-label">Status</div>
                    <div className="qm-field-value">
                      <span className={`qm-status qm-status--inline ${statusCls}`}>
                        <span className="qm-status-dot" />
                        {statusLabel}
                        {isInProgress && maxSteps[quadModal] > 0 && (
                          <span style={{ opacity: .6 }}> · Step {maxSteps[quadModal]}/5</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Assignees */}
                <div className="qm-section">
                  <div className="qm-section-title">Assignees</div>
                  <div className="qm-assignees">
                    <div className="qm-assignee">
                      <span className="qm-assignee-role">Lead</span>
                      <div className="qm-assignee-user">
                        <div className="qm-assignee-av" style={{ background: 'linear-gradient(135deg,#3B82F6,#60A5FA)' }}>
                          {info.lead.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="qm-assignee-name">{info.lead}</span>
                      </div>
                    </div>
                    <div className="qm-assignee">
                      <span className="qm-assignee-role">Stump</span>
                      <div className="qm-assignee-user">
                        <div className="qm-assignee-av" style={{ background: info.color }}>
                          {info.stump.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="qm-assignee-name">{info.stump}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Objective */}
                <div className="qm-section">
                  <div className="qm-section-title">Objective</div>
                  <div className="qm-objective">{info.objective}</div>
                </div>

                {/* Workfields */}
                <div className="qm-section" style={{ marginBottom: 0 }}>
                  <div className="qm-section-title">Workfields</div>
                  <div className="ov-modal-workfields">
                    {info.workfields.map(w => (
                      <span key={w} className="ov-modal-chip">{w}</span>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        );
      })()}

      {infoOpen && (
        <div className="ov-modal-overlay" onClick={() => setInfoOpen(false)}>
          <div className="ov-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="ov-modal-header">
              <div className="ov-modal-eyebrow">Molecule Summary</div>
              <button
                type="button"
                className="ov-modal-close"
                onClick={() => setInfoOpen(false)}
                aria-label="Close"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="ov-modal-body">
              <div className="ov-modal-field">
                <div className="ov-modal-field-label">Molecule Name</div>
                <div className="ov-modal-field-value ov-modal-field-value--title">{mol.name}</div>
              </div>
              <div className="ov-modal-field">
                <div className="ov-modal-field-label">Objective</div>
                <div className="ov-modal-field-value">{MOL_OBJECTIVE}</div>
              </div>
              <div className="ov-modal-field">
                <div className="ov-modal-field-label">Vision Statement</div>
                <div className="ov-modal-field-value">{MOL_VISION}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Workfields modal ── */}
      {wfModal && (
        <div className="ov-modal-overlay" onClick={closeWfModal}>
          <div className="ov-modal ov-modal--compact" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="ov-modal-header">
              <div className="ov-modal-eyebrow">Workfields · {mol.name}</div>
              <button type="button" className="ov-modal-close" onClick={closeWfModal} aria-label="Close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="ov-modal-body">
              <div className="fc-hint" style={{ marginTop: 0, marginBottom: '16px' }}>
                Click the pencil to rename a workfield. Press Enter to confirm.
              </div>
              <div className="wf-edit-grid">
                {WORKFIELD_FIELDS.map((f, idx) => {
                  const isEditing = editingWfKey === f.key;
                  return (
                    <div key={f.key} className={`wf-edit-row${isEditing ? ' editing' : ''}`}>
                      <span className="wf-edit-num">{idx + 1}</span>
                      {isEditing ? (
                        <input
                          className="wf-edit-input"
                          type="text"
                          value={workfields[f.key]}
                          placeholder={f.default}
                          onChange={e => updateWorkfield(f.key, e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === 'Escape') setEditingWfKey(null);
                          }}
                          autoFocus
                        />
                      ) : (
                        <span className="wf-edit-value">{workfields[f.key]}</span>
                      )}
                      <button
                        type="button"
                        className="wf-edit-action"
                        onClick={() => setEditingWfKey(isEditing ? null : f.key)}
                        aria-label={isEditing ? `Confirm ${f.default}` : `Edit ${f.default}`}
                      >
                        {isEditing ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="ov-modal-foot">
              <button type="button" className="fc-btn-secondary" onClick={closeWfModal}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Change Lead modal ── */}
      {leadModal && (
        <div className="ov-modal-overlay" onClick={closeLeadModal}>
          <div className="ov-modal ov-modal--compact" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" style={{ maxWidth: '480px' }}>
            <div className="ov-modal-header">
              <div className="ov-modal-eyebrow">Change Lead · {mol.name}</div>
              <button type="button" className="ov-modal-close" onClick={closeLeadModal} aria-label="Close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="ov-modal-body">
              <div className="fc-group">
                <label className="fc-label">Current lead</label>
                <div style={{ fontSize: '14px', color: 'var(--navy)', fontWeight: 600 }}>{leadName}</div>
              </div>
              <div className="fc-group">
                <label className="fc-label">Reassign to</label>
                <select
                  className="fc-select"
                  value={leadDraft}
                  onChange={e => setLeadDraft(e.target.value)}
                >
                  {AVAILABLE_LEADS.map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="ov-modal-foot">
              <button type="button" className="fc-btn-secondary" onClick={closeLeadModal}>Cancel</button>
              <button type="button" className="fc-btn-primary" onClick={saveLead} disabled={leadDraft.trim() === leadName}>
                Save Lead
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
