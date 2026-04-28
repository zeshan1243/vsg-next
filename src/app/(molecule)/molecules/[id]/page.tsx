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
  { initials: 'SK', gradient: 'linear-gradient(135deg, #E8B045, #F5C670)', name: 'Sarah Kaplan' },
  { initials: 'MR', gradient: 'linear-gradient(135deg, #2AB8D8, #5EC8E0)', name: 'Marcus Reeves' },
  { initials: 'MC', gradient: 'linear-gradient(135deg, #3BB87F, #5EC89F)', name: 'Mike Chan' },
  { initials: 'ET', gradient: 'linear-gradient(135deg, #4AB89E, #6ECAB5)', name: 'Elena Torres' },
  { initials: 'DK', gradient: 'linear-gradient(135deg, #3BB87F, #5EC89F)', name: 'David Kim' },
  { initials: 'JB', gradient: 'linear-gradient(135deg, #E89B2A, #F5B23E)', name: 'Jenna Brooks' },
  { initials: 'LW', gradient: 'linear-gradient(135deg, #7C5CBF, #9A7FD6)', name: 'Liam Walker' },
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
  code: string;
  name: string;
  type: 'Internal' | 'External';
  workfields: string[];
  objective: string;
}
const QUAD_INFO: Record<Quad, QuadInfo> = {
  a: {
    code: 'Quadrant A',
    name: 'Coordinate',
    type: 'Internal',
    workfields: ['Vendors', 'Partners', 'Location', 'Attendance'],
    objective: 'Define high-level OKRs that set direction for the molecule',
  },
  b: {
    code: 'Quadrant B',
    name: 'Communication',
    type: 'Internal',
    workfields: ['Vendors', 'Partners', 'Location', 'Attendance'],
    objective: 'Define measurable KPIs against each Coordinate OKR',
  },
  c: {
    code: 'Quadrant C',
    name: 'Knowledge',
    type: 'External',
    workfields: ['Vendors', 'Partners', 'Location', 'Attendance'],
    objective: 'Break each KPI down into concrete jobs to be executed',
  },
  d: {
    code: 'Quadrant D',
    name: 'Exchange',
    type: 'External',
    workfields: ['Vendors', 'Partners', 'Location', 'Attendance'],
    objective: 'Execute jobs as granular, trackable tasks',
  },
};

const PIE_SECTORS = [
  {
    code: 'Q-D', label: 'Exchange',
    fill: '#3BB87F',
    d: 'M 170 170 L 170 5 A 165 165 0 0 1 335 170 Z',
    lx: 236, ly: 104, dx: 7, dy: -7,
  },
  {
    code: 'Q-B', label: 'Communication',
    fill: '#3E7BF5',
    d: 'M 170 170 L 335 170 A 165 165 0 0 1 170 335 Z',
    lx: 236, ly: 236, dx: 7, dy: 7,
  },
  {
    code: 'Q-A', label: 'Coordinate',
    fill: '#E8B045',
    d: 'M 170 170 L 170 335 A 165 165 0 0 1 5 170 Z',
    lx: 104, ly: 236, dx: -7, dy: 7,
  },
  {
    code: 'Q-C', label: 'Knowledge',
    fill: '#E55050',
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

  useEffect(() => {
    if (!infoOpen && quadModal === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Escape') return;
      setInfoOpen(false);
      setQuadModal(null);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [infoOpen, quadModal]);

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
          <div className="lead-pill">
            <div className="lead-label">LEAD</div>
            <div className="lead-name">Marcus Reeves</div>
            <div className="lead-hint">Assigned by Creator</div>
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
              {/* Outer progress ring — 25% per completed quadrant */}
              {(() => {
                const r = 178;
                const circumference = 2 * Math.PI * r;
                const progressPct = completedQuads.length * 25;
                const pct = Math.max(0, Math.min(100, progressPct)) / 100;
                const dashOffset = circumference * (1 - pct);
                return (
                  <g transform="rotate(-90 170 170)">
                    <circle
                      cx="170" cy="170" r={r}
                      fill="none"
                      stroke="var(--border)"
                      strokeWidth="6"
                    />
                    <circle
                      cx="170" cy="170" r={r}
                      fill="none"
                      stroke="var(--gold)"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={dashOffset}
                      style={{ transition: 'stroke-dashoffset .4s ease' }}
                    />
                  </g>
                );
              })()}

              {/* Progress label bubble at top of ring */}
              <g>
                <circle cx="170" cy="-8" r="20" fill="var(--navy)" />
                <text
                  x="170" y="-4"
                  textAnchor="middle"
                  fontFamily="var(--font-sans)"
                  fontSize="11"
                  fontWeight="700"
                  fill="white"
                >{completedQuads.length * 25}%</text>
              </g>

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
        return (
          <div className="ov-modal-overlay" onClick={() => setQuadModal(null)}>
            <div className="ov-modal ov-modal--wide" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
              <div className="ov-modal-header">
                <div className="ov-modal-eyebrow">{info.code}</div>
                <button
                  type="button"
                  className="ov-modal-close"
                  onClick={() => setQuadModal(null)}
                  aria-label="Close"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div className="ov-modal-body">
                <div className="ov-modal-field">
                  <div className="ov-modal-field-label">Name</div>
                  <div className="ov-modal-field-value ov-modal-field-value--title">{info.name}</div>
                </div>

                <div className="ov-modal-grid">
                  <div className="ov-modal-field">
                    <div className="ov-modal-field-label">Type</div>
                    <div className="ov-modal-field-value">{info.type}</div>
                  </div>
                  <div className="ov-modal-field">
                    <div className="ov-modal-field-label">Workfields</div>
                    <div className="ov-modal-workfields">
                      {info.workfields.map(w => (
                        <span key={w} className="ov-modal-chip">{w}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="ov-modal-field">
                  <div className="ov-modal-field-label">Objective</div>
                  <div className="ov-modal-field-value">{info.objective}</div>
                </div>

                {/* Molecule Structure — Outer Stack */}
                <div className="ov-modal-section">
                  <div className="ov-modal-section-title">
                    Molecule Structure <span style={{ fontWeight: 400, color: 'var(--muted)', fontSize: '12px' }}>( Outer Stack )</span>
                  </div>
                  <div className="ms-quad-grid" style={{ marginTop: '10px' }}>
                    <div className="ms-quad-cell red">
                      <div className="ms-quad-label">Q·C</div>
                      <div className="ms-quad-name">Knowledge</div>
                    </div>
                    <div className="ms-quad-cell green">
                      <div className="ms-quad-label">Q·D</div>
                      <div className="ms-quad-name">Exchange</div>
                    </div>
                    <div className="ms-quad-cell gold">
                      <div className="ms-quad-label">Q·A</div>
                      <div className="ms-quad-name">Coordination</div>
                    </div>
                    <div className="ms-quad-cell blue">
                      <div className="ms-quad-label">Q·B</div>
                      <div className="ms-quad-name">Communication</div>
                    </div>
                  </div>
                </div>

                {/* Molecule Structure — Inner Stack */}
                <div className="ov-modal-section">
                  <div className="ov-modal-section-title">
                    Molecule Structure <span style={{ fontWeight: 400, color: 'var(--muted)', fontSize: '12px' }}>( Inner Stack )</span>
                  </div>
                  <div className="inner-stack-grid" style={{ marginTop: '10px' }}>
                    {(['jobs', 'tasks', 'okrs', 'kpis'] as const).map(key => (
                      <div key={key} className={`stack-cell ${key}`}>
                        <div className="stack-cell-label">
                          {key === 'jobs' ? 'Jobs' : key === 'tasks' ? 'Tasks' : key === 'okrs' ? 'OKRs' : 'KPIs'}
                        </div>
                        <div className="stack-pills">
                          {['Locations', 'Attendance', 'Vendors', 'Partners'].map(p => (
                            <div key={p} className="stack-pill">{p}</div>
                          ))}
                        </div>
                      </div>
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
    </>
  );
}
