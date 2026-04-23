'use client';

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { getMolecule } from '@/lib/molecules';

type ViewKey = 'overview' | 'members' | 'requests' | 'finalized';

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
  if (!mol) return null;

  const base = `/molecules/${id}`;

  const views: ViewItem[] = [
    {
      key: 'overview', slug: '', label: 'Overview', sub: 'Molecule structure', cls: 'nv-ov', icon: OverviewIcon,
      badge: { text: `${mol.progress}%`, bg: 'var(--gold-pale)', fg: 'var(--gold)' },
    },
    {
      key: 'members', slug: '/members', label: 'Assign Members', sub: 'Stump & Sub-Stump roles', cls: 'nv-ov', icon: MembersIcon,
      badge: { text: `${mol.sidebar.membersAssigned}/${mol.sidebar.membersTotal}`, bg: 'rgba(59,184,127,.1)', fg: 'var(--success)' },
    },
    {
      key: 'requests', slug: '/requests', label: 'Requests', sub: 'Manage all requests', cls: 'nv-req', icon: RequestsIcon,
      badge: mol.sidebar.pendingRequests > 0
        ? { text: String(mol.sidebar.pendingRequests), bg: 'var(--orange-pale)', fg: 'var(--orange)' }
        : undefined,
    },
    { key: 'finalized', slug: '/finalized', label: 'Finalized View', sub: 'OKRs, KPIs, Jobs & Tasks', cls: 'nv-fin', icon: FinalizedIcon },
  ];

  const quadrants = [
    { slug: '/quadrant-a', cls: 'nv-qa', label: 'Quadrant A', sub: 'Coordinate · OKR',     icon: QA_Icon, progress: mol.sidebar.quadA, color: 'var(--success)' },
    { slug: '/quadrant-b', cls: 'nv-qb', label: 'Quadrant B', sub: 'Communication · KPI',   icon: QB_Icon, progress: mol.sidebar.quadB, color: 'var(--success)' },
    { slug: '/quadrant-c', cls: 'nv-qc', label: 'Quadrant C', sub: 'Knowledge · Jobs',     icon: QC_Icon, progress: mol.sidebar.quadC, color: 'var(--success)' },
    { slug: '/quadrant-d', cls: 'nv-qd', label: 'Quadrant D', sub: 'Exchange · Tasks',      icon: QD_Icon, progress: mol.sidebar.quadD, color: 'var(--warn)' },
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
            <div className="mol-id-tag">{mol.code} · {mol.progress}% complete</div>
          </div>
        </div>
      </div>

      <div className="sidebar-nav">
        <div className="snl">Molecule View</div>

        {views.map(v => {
          const href = base + v.slug;
          const active = v.slug === '' ? pathname === base : pathname === href || pathname.startsWith(href + '/');
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
          Creator access. Full control over objectives, assignments, and drill-downs.
        </div>
      </div>
    </nav>
  );
}
