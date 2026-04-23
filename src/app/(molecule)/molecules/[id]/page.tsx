'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { getMolecule } from '@/lib/molecules';

type PillColor = 'gold' | 'blue' | 'red' | 'green';
type QuadColor = 'red' | 'green' | 'gold' | 'blue';
interface Pill { label: string; color: PillColor; }
interface QuadDef {
  code: string;
  name: string;
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

function QuadCard({
  code, name, iconCls, icon, pills,
  selected, onSelect,
}: QuadDef & { selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      className={`ov-quad${selected ? ` ov-quad-sel ov-quad-sel-${iconCls}` : ''}`}
      onClick={onSelect}
    >
      {selected && (
        <div className="ov-quad-check">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
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
        {pills.map((p, i) => (
          <span key={`${p.label}-${i}`} className={`ov-pill pill-${p.color}`}>{p.label}</span>
        ))}
      </div>
    </button>
  );
}

export default function MoleculeOverviewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id ?? '';
  const mol = getMolecule(id);
  const [selectedQuad, setSelectedQuad] = useState<string | null>(null);

  if (!mol) return null;

  const QUADS: QuadDef[] = [
    { code: 'Q-C', name: 'Knowledge',     iconCls: 'red',   icon: BookIcon,     pills: PILLS_TOP,    route: `/molecules/${id}/quadrant-c` },
    { code: 'Q-D', name: 'Exchange',      iconCls: 'green', icon: ExchangeIcon, pills: PILLS_TOP,    route: `/molecules/${id}/quadrant-d` },
    { code: 'Q-A', name: 'Coordinate',    iconCls: 'gold',  icon: GlobeIcon,    pills: PILLS_BOTTOM, route: `/molecules/${id}/quadrant-a` },
    { code: 'Q-B', name: 'Communication', iconCls: 'blue',  icon: ChatIcon,     pills: PILLS_BOTTOM, route: `/molecules/${id}/quadrant-b` },
  ];

  const activeQuad = QUADS.find(q => q.code === selectedQuad);

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
            <p className="ov-desc">
              Host the city&apos;s premier wedding event, connecting attendees with top local vendors across all four operational quadrants.
            </p>
          </div>
          <div className="lead-pill">
            <div className="lead-label">LEAD</div>
            <div className="lead-name">Marcus Reeves</div>
            <div className="lead-hint">Assigned by Creator</div>
          </div>
        </div>

        {/* Hero: pie + quadrants */}
        <div className="ov-hero">
          <div className="ov-pie-wrap">
            <svg
              viewBox="0 0 340 340"
              width="340"
              height="340"
              style={{ display: 'block', filter: 'drop-shadow(0 8px 24px rgba(13,27,42,.1))' }}
            >
              {PIE_SECTORS.map(s => {
                const isSel = selectedQuad === s.code;
                const hasSel = selectedQuad !== null;
                return (
                  <g
                    key={s.code}
                    style={{
                      transform: isSel ? `translate(${s.dx}px, ${s.dy}px)` : 'translate(0,0)',
                      opacity: hasSel && !isSel ? 0.45 : 1,
                      transition: 'transform .22s ease, opacity .22s ease',
                      cursor: 'pointer',
                    }}
                    onClick={() => setSelectedQuad(prev => prev === s.code ? null : s.code)}
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
                      fontFamily="Syne, sans-serif"
                      fontSize="10"
                      fontWeight="700"
                      letterSpacing="1"
                      style={{ pointerEvents: 'none' }}
                    >
                      {s.code}
                    </text>
                    <text
                      x={s.lx} y={s.ly + 8}
                      textAnchor="middle"
                      fill="white"
                      fontFamily="Syne, sans-serif"
                      fontSize="11"
                      fontWeight="800"
                      style={{ pointerEvents: 'none' }}
                    >
                      {s.label}
                    </text>
                  </g>
                );
              })}
              <circle cx="170" cy="170" r="24" fill="white" style={{ pointerEvents: 'none' }} />
            </svg>
          </div>

          <div className="ov-quads">
            {QUADS.slice(0, 2).map(q => (
              <QuadCard
                key={q.code} {...q}
                selected={selectedQuad === q.code}
                onSelect={() => setSelectedQuad(prev => prev === q.code ? null : q.code)}
              />
            ))}
            <div className="ov-quad-progress">
              <div className="ov-quad-progress-fill" style={{ width: `${mol.progress}%` }} />
            </div>
            {QUADS.slice(2).map(q => (
              <QuadCard
                key={q.code} {...q}
                selected={selectedQuad === q.code}
                onSelect={() => setSelectedQuad(prev => prev === q.code ? null : q.code)}
              />
            ))}
          </div>

          {/* Enter quadrant action */}
          <div className={`ov-quad-action${activeQuad ? ' visible' : ''}`}>
            <span className="ov-quad-action-hint">
              {activeQuad ? `${activeQuad.code} · ${activeQuad.name} selected` : ''}
            </span>
            <button
              type="button"
              className="ov-quad-action-btn"
              onClick={() => activeQuad && router.push(activeQuad.route)}
            >
              Enter Quadrant
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
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
    </>
  );
}
