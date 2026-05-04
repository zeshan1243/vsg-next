'use client';

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getMolecule } from '@/lib/molecules';
import {
  getCompletedQuads,
  getQuadMaxStep,
  getStumpAssignedQuads,
  getStumpSubmittedQuads,
  getSubStumpAssignedQuads,
  isQuadUnlocked,
  TOTAL_STEPS,
  type Quad,
} from '@/lib/progress';
import { useRole } from '@/lib/useRole';

type ViewKey = 'overview' | 'members' | 'decisions' | 'requests' | 'finalized';

interface ViewItem {
  key: ViewKey;
  slug: string;
  label: string;
  sub: string;
  cls: 'nv-ov' | 'nv-req' | 'nv-fin';
  icon: React.ReactNode;
  badge?: { text: string; bg: string; fg: string };
}

const OverviewIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="2" /><circle cx="12" cy="4" r="2" /><circle cx="12" cy="20" r="2" />
    <circle cx="4" cy="12" r="2" /><circle cx="20" cy="12" r="2" />
    <line x1="12" y1="6" x2="12" y2="10" /><line x1="12" y1="14" x2="12" y2="18" />
    <line x1="6" y1="12" x2="10" y2="12" /><line x1="14" y1="12" x2="18" y2="12" />
  </svg>
);

const MembersIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const DecisionsIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const RequestsIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const FinalizedIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
  </svg>
);

const QA_Icon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);
const QB_Icon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const QC_Icon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);
const QD_Icon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
);

export default function MoleculeSidebar() {
  const pathname = usePathname();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';
  const mol = getMolecule(id);
  const { isStump, isSubStump, roleLabel } = useRole();
  const [completed, setCompleted] = useState<Quad[]>([]);
  const [maxSteps, setMaxSteps] = useState<Record<Quad, number>>({ a: 0, b: 0, c: 0, d: 0 });
  const [stumpAssigned, setStumpAssigned] = useState<Quad[]>([]);
  const [stumpSubmitted, setStumpSubmitted] = useState<Quad[]>([]);
  const [subStumpAssigned, setSubStumpAssigned] = useState<Quad[]>([]);

  useEffect(() => {
    if (!id) return;
    // Re-read completion + per-quad step on each route change so progress
    // updates after the user advances within a quadrant or finishes one.
    setCompleted(getCompletedQuads(id));
    setMaxSteps({
      a: getQuadMaxStep(id, 'a'),
      b: getQuadMaxStep(id, 'b'),
      c: getQuadMaxStep(id, 'c'),
      d: getQuadMaxStep(id, 'd'),
    });
    setStumpAssigned(getStumpAssignedQuads());
    setStumpSubmitted(getStumpSubmittedQuads(id));
    setSubStumpAssigned(getSubStumpAssignedQuads(id));
  }, [id, pathname]);

  if (!mol) return null;

  const base = `/molecules/${id}`;

  // Per-quadrant progress: 100% when completed (or submitted by Stump),
  // otherwise scaled by highest step reached.
  function quadPct(q: Quad): number {
    if (completed.includes(q)) return 100;
    if (isStump && stumpSubmitted.includes(q)) return 100;
    const m = maxSteps[q];
    return Math.max(0, (m - 1)) * (100 / (TOTAL_STEPS - 1));
  }
  const overallPct = isStump
    ? (stumpAssigned.length === 0 ? 0 : Math.round((stumpSubmitted.filter(q => stumpAssigned.includes(q)).length / stumpAssigned.length) * 100))
    : Math.round(completed.length * 25);

  const views: ViewItem[] = [
    {
      key: 'overview', slug: '', label: 'Overview', sub: 'Molecule structure', cls: 'nv-ov', icon: OverviewIcon,
      badge: { text: `${overallPct}%`, bg: 'var(--gold-pale)', fg: 'var(--gold)' },
    },
    {
      key: 'members', slug: '/members', label: 'Assign Members', sub: 'Stump & Sub-Stump roles', cls: 'nv-ov', icon: MembersIcon,
      badge: { text: `${mol.sidebar.membersAssigned}/${mol.sidebar.membersTotal}`, bg: 'rgba(59,184,127,.1)', fg: 'var(--success)' },
    },
    {
      key: 'decisions', slug: '/decisions', label: 'Decisions', sub: 'Phase validations', cls: 'nv-req', icon: DecisionsIcon,
      badge: mol.sidebar.pendingRequests > 0
        ? { text: String(mol.sidebar.pendingRequests), bg: 'rgba(139,92,246,.1)', fg: '#8B5CF6' }
        : undefined,
    },
    {
      key: 'requests', slug: '/requests', label: 'Requests', sub: 'Communication & ARFDs', cls: 'nv-req', icon: RequestsIcon,
      badge: mol.sidebar.pendingRequests > 0
        ? { text: String(mol.sidebar.pendingRequests), bg: 'var(--orange-pale)', fg: 'var(--orange)' }
        : undefined,
    },
    { key: 'finalized', slug: '/finalized', label: 'Finalized View', sub: 'OKRs, KPIs, Jobs & Tasks', cls: 'nv-fin', icon: FinalizedIcon },
  ];

  const quadrants: Array<{
    slug: string; cls: string; label: string; sub: string;
    icon: React.ReactNode; progress: number; color: string; quad: Quad;
  }> = [
    { slug: '/quadrant-a', cls: 'nv-qa', label: 'Quadrant A', sub: 'Coordinate · OKR',    icon: QA_Icon, progress: quadPct('a'), color: '#FFAB00', quad: 'a' },
    { slug: '/quadrant-b', cls: 'nv-qb', label: 'Quadrant B', sub: 'Communication · KPI', icon: QB_Icon, progress: quadPct('b'), color: '#3B82F6', quad: 'b' },
    { slug: '/quadrant-c', cls: 'nv-qc', label: 'Quadrant C', sub: 'Knowledge · Jobs',    icon: QC_Icon, progress: quadPct('c'), color: '#EF4444', quad: 'c' },
    { slug: '/quadrant-d', cls: 'nv-qd', label: 'Quadrant D', sub: 'Exchange · Tasks',    icon: QD_Icon, progress: quadPct('d'), color: '#22C55E', quad: 'd' },
  ];

  return (
    <nav className="mol-sidebar">
      <div className="sidebar-back">
        <Link className="back-btn" href="/molecules">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
          My Molecules
        </Link>
      </div>

      <div className="sidebar-mol-id">
        <div className="mol-id-pill">
          <div className="mol-id-icon">{mol.initials}</div>
          <div>
            <div className="mol-id-name">{mol.name}</div>
            <div className="mol-id-tag">{mol.code} · {overallPct}% complete</div>
          </div>
        </div>
      </div>

      <div className="sidebar-nav">
        <div className="snl">Molecule View</div>

        {/* Stumps drop Finalized View. Sub-Stumps drop Members, Decisions and Finalized. */}
        {(isSubStump
          ? views.filter(v => v.key === 'overview' || v.key === 'requests')
          : isStump
            ? views.filter(v => v.key !== 'finalized')
            : views
        ).map(v => {
          const href = base + v.slug;
          const active = v.slug === '' ? pathname === base : pathname === href || pathname.startsWith(href + '/');
          // Finalized View is locked until every quadrant is completed.
          const locked = v.key === 'finalized' && completed.length < 4;

          if (locked) {
            return (
              <div
                key={v.key}
                className={`mol-nav-item ${v.cls} mol-nav-locked`}
                aria-disabled="true"
                title="Complete all 4 quadrants to unlock the Finalized View"
              >
                <div className="nv-icon" style={{ color: 'rgba(255,255,255,.3)' }}>{v.icon}</div>
                <div className="nv-text">
                  <div className="nv-label">{v.label}</div>
                  <div className="nv-sub">{v.sub}</div>
                </div>
                <svg className="nv-lock-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
            );
          }

          return (
            <Link key={v.key} href={href} className={`mol-nav-item ${v.cls}${active ? ' active' : ''}`}>
              <div className="nv-icon">{v.icon}</div>
              <div className="nv-text">
                <div className="nv-label">{v.label}</div>
                <div className="nv-sub">{v.sub}</div>
              </div>
              {v.badge && (
                <span className="nv-badge" style={{ background: v.badge.bg, color: v.badge.fg }}>
                  {v.badge.text}
                </span>
              )}
            </Link>
          );
        })}

        <div style={{ height: 6 }} />
        <div className="snl">Quadrants</div>

        {quadrants.map(q => {
          const href = base + q.slug;
          const active = pathname === href;
          const unlocked = isSubStump
            ? subStumpAssigned.includes(q.quad)
            : isStump
              ? stumpAssigned.includes(q.quad)
              : isQuadUnlocked(q.quad, completed);
          const lockTitle = (isStump || isSubStump)
            ? 'Locked — this Quadrant is not assigned to you'
            : `Complete Quadrant ${String.fromCharCode(q.quad.charCodeAt(0) - 1).toUpperCase()} to unlock`;

          if (!unlocked) {
            return (
              <div
                key={q.slug}
                className={`mol-nav-item ${q.cls} mol-nav-locked`}
                aria-disabled="true"
                title={lockTitle}
              >
                <div className="nv-icon" style={{ color: 'rgba(255,255,255,.3)' }}>{q.icon}</div>
                <div className="nv-text">
                  <div className="nv-label">{q.label}</div>
                  <div className="nv-sub">{q.sub}</div>
                  <div className="nv-prog">
                    <div className="nv-prog-fill" style={{ width: '0%', background: q.color }} />
                  </div>
                </div>
                <svg className="nv-lock-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
            );
          }

          return (
            <Link key={q.slug} href={href} className={`mol-nav-item ${q.cls}${active ? ' active' : ''}`}>
              <div className="nv-icon" style={{ color: 'rgba(255,255,255,.4)' }}>{q.icon}</div>
              <div className="nv-text">
                <div className="nv-label">{q.label}</div>
                <div className="nv-sub">{q.sub}</div>
                <div className="nv-prog">
                  <div className="nv-prog-fill" style={{ width: `${q.progress}%`, background: q.color }} />
                </div>
              </div>
              <div
                className="nv-dot"
                style={{
                  background: q.color,
                  animation: q.progress > 0 && q.progress < 100 ? 'pulse 2s infinite' : undefined,
                }}
              />
            </Link>
          );
        })}
      </div>

      <div className="sidebar-footer">
        <div className="footer-note">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          {isSubStump
            ? `${roleLabel} access. Execute steps in your assigned Quadrant — every submission is reviewed by your Stump.`
            : isStump
              ? `${roleLabel} access. Work on assigned Quadrants and submit to the Lead for review.`
              : `${roleLabel} access. Full control over objectives, assignments, and drill-downs.`}
        </div>
      </div>
    </nav>
  );
}
