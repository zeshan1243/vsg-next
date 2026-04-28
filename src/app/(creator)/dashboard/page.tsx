'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { MOLECULES, MOLECULE_STATE_CONFIG, getMoleculeStateCounts, type MoleculeState } from '@/lib/molecules';

const STATE_ORDER: MoleculeState[] = ['draft', 'active', 'paused', 'completed', 'archived'];

// Mock data for members
const MEMBER_ROLES = [
  { role: 'Creator', count: 1, color: '#FFAB00' },
  { role: 'Lead', count: 3, color: '#3B82F6' },
  { role: 'Member', count: 8, color: '#22C55E' },
  { role: 'Viewer', count: 4, color: '#94A3B8' },
];
const TOTAL_MEMBERS = MEMBER_ROLES.reduce((sum, r) => sum + r.count, 0);

// Mock data for invitations
const INVITATION_STATUS = [
  { status: 'Pending', count: 5, color: '#FFAB00' },
  { status: 'Accepted', count: 12, color: '#22C55E' },
  { status: 'Declined', count: 2, color: '#EF4444' },
  { status: 'Expired', count: 3, color: '#94A3B8' },
];
const TOTAL_INVITATIONS = INVITATION_STATUS.reduce((sum, s) => sum + s.count, 0);

// Mock data for attention required items
const ATTENTION_ITEMS = [
  {
    id: 1,
    type: 'lead-substitute' as const,
    title: 'Lead Substitute Required',
    molecule: 'Q3 Product Launch',
    moleculeId: 'q3-product-launch',
    description: 'A. Patel is unavailable. Assign a substitute lead.',
    time: '2h ago',
    priority: 'high' as const,
  },
  {
    id: 2,
    type: 'pending-invitation' as const,
    title: 'Pending Invitation',
    molecule: 'Premier Wedding Expo',
    moleculeId: 'premier-wedding-expo',
    description: 'Invitation to J. Martinez awaiting response for 3 days.',
    time: '3d ago',
    priority: 'medium' as const,
  },
  {
    id: 3,
    type: 'pending-invitation' as const,
    title: 'Pending Invitation',
    molecule: 'Community Outreach Plan',
    moleculeId: 'community-outreach-plan',
    description: 'Invitation to R. Chen awaiting response for 5 days.',
    time: '5d ago',
    priority: 'medium' as const,
  },
  {
    id: 4,
    type: 'lead-substitute' as const,
    title: 'Lead Handoff Needed',
    molecule: 'Brand Refresh 2026',
    moleculeId: 'brand-refresh-2026',
    description: 'Draft molecule needs a lead assignment to proceed.',
    time: '1d ago',
    priority: 'high' as const,
  },
];

// Mock data for audit feed
const AUDIT_FEED = [
  { id: 1, action: 'created', user: 'Sarah Kaplan', target: 'Brand Refresh 2026', type: 'molecule', time: '10 min ago', icon: 'plus' },
  { id: 2, action: 'invited', user: 'Sarah Kaplan', target: 'J. Martinez', type: 'member', time: '2h ago', icon: 'mail' },
  { id: 3, action: 'completed', user: 'Marcus Reeves', target: 'Quadrant A', type: 'quadrant', time: '3h ago', icon: 'check' },
  { id: 4, action: 'updated', user: 'Elena Torres', target: 'Q3 Product Launch', type: 'molecule', time: '5h ago', icon: 'edit' },
  { id: 5, action: 'joined', user: 'David Kim', target: 'Premier Wedding Expo', type: 'molecule', time: '1d ago', icon: 'user-plus' },
  { id: 6, action: 'submitted', user: 'Mike Chan', target: 'Vendor Contract', type: 'task', time: '1d ago', icon: 'file' },
  { id: 7, action: 'approved', user: 'Sarah Kaplan', target: 'Budget Request', type: 'request', time: '2d ago', icon: 'check-circle' },
  { id: 8, action: 'commented', user: 'Jenna Brooks', target: 'Location Selection', type: 'task', time: '2d ago', icon: 'message' },
];

// Mock data for active users
const ACTIVE_USERS = [
  { id: 1, name: 'Sarah Kaplan', initials: 'SK', role: 'Creator', gradient: 'linear-gradient(135deg, #FFAB00, #FFD54F)', online: true },
  { id: 2, name: 'Marcus Reeves', initials: 'MR', role: 'Lead', gradient: 'linear-gradient(135deg, #3B82F6, #60A5FA)', online: true },
  { id: 3, name: 'Elena Torres', initials: 'ET', role: 'Member', gradient: 'linear-gradient(135deg, #22C55E, #4ADE80)', online: true },
  { id: 4, name: 'Mike Chan', initials: 'MC', role: 'Member', gradient: 'linear-gradient(135deg, #EF4444, #F87171)', online: true },
  { id: 5, name: 'David Kim', initials: 'DK', role: 'Member', gradient: 'linear-gradient(135deg, #EC4899, #F9A8D4)', online: false },
  { id: 6, name: 'Jenna Brooks', initials: 'JB', role: 'Viewer', gradient: 'linear-gradient(135deg, #8B5CF6, #A78BFA)', online: true },
  { id: 7, name: 'Liam Walker', initials: 'LW', role: 'Viewer', gradient: 'linear-gradient(135deg, #0F172A, #334155)', online: false },
];

function formatToday(): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  }).format(new Date());
}

export default function DashboardPage() {
  const router = useRouter();
  const [today, setToday] = useState('');
  const [chartExpanded, setChartExpanded] = useState(false);
  const [membersExpanded, setMembersExpanded] = useState(false);
  const [invitationsExpanded, setInvitationsExpanded] = useState(false);
  const [stateFilter, setStateFilter] = useState<MoleculeState | 'all'>('all');
  const stateCounts = getMoleculeStateCounts();
  const totalMolecules = MOLECULES.length;

  // Calculate pie arcs for members
  let memberCumulativeAngle = 0;
  const memberArcs = MEMBER_ROLES.map(item => {
    const percentage = (item.count / TOTAL_MEMBERS) * 100;
    const startAngle = memberCumulativeAngle;
    const sweepAngle = (percentage / 100) * 360;
    memberCumulativeAngle += sweepAngle;
    return { ...item, percentage, startAngle, sweepAngle };
  });

  // Calculate pie arcs for invitations
  let invitationCumulativeAngle = 0;
  const invitationArcs = INVITATION_STATUS.map(item => {
    const percentage = (item.count / TOTAL_INVITATIONS) * 100;
    const startAngle = invitationCumulativeAngle;
    const sweepAngle = (percentage / 100) * 360;
    invitationCumulativeAngle += sweepAngle;
    return { ...item, percentage, startAngle, sweepAngle };
  });

  const filteredMolecules = stateFilter === 'all'
    ? MOLECULES
    : MOLECULES.filter(m => m.state === stateFilter);

  useEffect(() => { setToday(formatToday()); }, []);

  // Calculate pie chart segments
  const pieSegments = STATE_ORDER.map((state, idx) => {
    const count = stateCounts[state];
    const percentage = totalMolecules > 0 ? (count / totalMolecules) * 100 : 0;
    return { state, count, percentage, config: MOLECULE_STATE_CONFIG[state] };
  }).filter(s => s.count > 0);

  // Calculate cumulative angles for pie chart
  let cumulativeAngle = 0;
  const pieArcs = pieSegments.map(segment => {
    const startAngle = cumulativeAngle;
    const sweepAngle = (segment.percentage / 100) * 360;
    cumulativeAngle += sweepAngle;
    return { ...segment, startAngle, sweepAngle };
  });

  function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
    const angleRad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
  }

  function describeArc(cx: number, cy: number, r: number, startAngle: number, sweepAngle: number) {
    if (sweepAngle >= 360) {
      return `M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy} A ${r} ${r} 0 1 1 ${cx - r} ${cy}`;
    }
    const start = polarToCartesian(cx, cy, r, startAngle);
    const end = polarToCartesian(cx, cy, r, startAngle + sweepAngle);
    const largeArc = sweepAngle > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
  }

  return (
    <>
      {/* ── Topbar ── */}
      <div className="topbar">
        <div className="topbar-left">
          <div className="page-title">Creator Dashboard</div>
          <div className="page-subtitle">
            {today ? `${today} · Your workspace overview` : 'Your workspace overview'}
          </div>
        </div>
        <div className="topbar-actions">
          <div className="btn-icon" title="Notifications">
            <div className="notif-dot" />
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <button className="btn-primary-sm" type="button" onClick={() => router.push('/molecules/new')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Molecule
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="creator-content">

        {/* Welcome Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #334155 100%)',
            borderRadius: '16px',
            padding: '28px 32px',
            marginBottom: '20px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 4px 24px rgba(13,27,42,.15)',
          }}
        >
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#FFAB00', letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: '10px' }}>Good morning, Sarah</div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.4px', lineHeight: 1.2, marginBottom: '8px' }}>Your workspace is performing well.</div>
            <div style={{ fontSize: '14px', fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>You have {stateCounts.active} active Molecules.</div>
          </div>
        </div>

        {/* Metrics Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>

          {/* Molecules Card */}
          <div
            onClick={() => setChartExpanded(!chartExpanded)}
            style={{
              background: chartExpanded ? 'var(--gold-pale)' : 'var(--surface)',
              border: chartExpanded ? '1.5px solid var(--gold)' : '1px solid var(--border)',
              borderRadius: '14px',
              padding: '20px 24px',
              cursor: 'pointer',
              transition: 'all .2s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #22C55E 0%, #4ADE80 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <circle cx="12" cy="12" r="8" />
                  <line x1="12" y1="2" x2="12" y2="4" />
                  <line x1="12" y1="20" x2="12" y2="22" />
                  <line x1="2" y1="12" x2="4" y2="12" />
                  <line x1="20" y1="12" x2="22" y2="12" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--navy)', lineHeight: 1, letterSpacing: '-1px' }}>{totalMolecules}</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--muted)', marginTop: '4px' }}>Total Molecules</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: chartExpanded ? 'rotate(180deg)' : 'none', transition: 'transform .25s ease' }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          {/* Members Card */}
          <div
            onClick={() => setMembersExpanded(!membersExpanded)}
            style={{
              background: membersExpanded ? 'var(--cyan-pale)' : 'var(--surface)',
              border: membersExpanded ? '1.5px solid var(--cyan)' : '1px solid var(--border)',
              borderRadius: '14px',
              padding: '20px 24px',
              cursor: 'pointer',
              transition: 'all .2s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--navy)', lineHeight: 1, letterSpacing: '-1px' }}>{TOTAL_MEMBERS}</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--muted)', marginTop: '4px' }}>Account Members</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: membersExpanded ? 'rotate(180deg)' : 'none', transition: 'transform .25s ease' }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          {/* Invitations Card */}
          <div
            onClick={() => setInvitationsExpanded(!invitationsExpanded)}
            style={{
              background: invitationsExpanded ? 'var(--gold-pale)' : 'var(--surface)',
              border: invitationsExpanded ? '1.5px solid var(--gold)' : '1px solid var(--border)',
              borderRadius: '14px',
              padding: '20px 24px',
              cursor: 'pointer',
              transition: 'all .2s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #FFAB00 0%, #FFD54F 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--navy)', lineHeight: 1, letterSpacing: '-1px' }}>{TOTAL_INVITATIONS}</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--muted)', marginTop: '4px' }}>Total Invitations</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: invitationsExpanded ? 'rotate(180deg)' : 'none', transition: 'transform .25s ease' }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
        </div>

        {/* Expanded Charts Panel - Shows all expanded charts side by side */}
        {(chartExpanded || membersExpanded || invitationsExpanded) && (
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '14px',
              padding: '24px',
              marginBottom: '20px',
              display: 'grid',
              gridTemplateColumns: `repeat(${[chartExpanded, membersExpanded, invitationsExpanded].filter(Boolean).length}, 1fr)`,
              gap: '24px',
            }}
          >
            {/* Molecules Chart */}
            {chartExpanded && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px', background: 'var(--off)', borderRadius: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--navy)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Molecules by Status</div>
                <svg viewBox="0 0 160 160" width="140" height="140" style={{ marginBottom: '16px' }}>
                  {pieArcs.map((arc) => (
                    <path
                      key={arc.state}
                      d={describeArc(80, 80, 65, arc.startAngle, arc.sweepAngle)}
                      fill={arc.config.color}
                      stroke="white"
                      strokeWidth="2"
                      style={{ transition: 'all 0.3s ease' }}
                    />
                  ))}
                  <circle cx="80" cy="80" r="38" fill="var(--off)" />
                  <text x="80" y="76" textAnchor="middle" fontSize="22" fontWeight="800" fill="var(--navy)">{totalMolecules}</text>
                  <text x="80" y="92" textAnchor="middle" fontSize="8" fontWeight="600" fill="var(--muted)">TOTAL</text>
                </svg>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
                  {pieSegments.map(seg => (
                    <div key={seg.state} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 10px', background: 'var(--surface)', borderRadius: '6px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: seg.config.color }} />
                      <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--ink)', flex: 1 }}>{seg.config.label}</span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--navy)' }}>{seg.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Members Chart */}
            {membersExpanded && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px', background: 'var(--off)', borderRadius: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--navy)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Members by Role</div>
                <svg viewBox="0 0 160 160" width="140" height="140" style={{ marginBottom: '16px' }}>
                  {memberArcs.map((arc) => (
                    <path
                      key={arc.role}
                      d={describeArc(80, 80, 65, arc.startAngle, arc.sweepAngle)}
                      fill={arc.color}
                      stroke="white"
                      strokeWidth="2"
                    />
                  ))}
                  <circle cx="80" cy="80" r="38" fill="var(--off)" />
                  <text x="80" y="76" textAnchor="middle" fontSize="22" fontWeight="800" fill="var(--navy)">{TOTAL_MEMBERS}</text>
                  <text x="80" y="92" textAnchor="middle" fontSize="8" fontWeight="600" fill="var(--muted)">TOTAL</text>
                </svg>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
                  {MEMBER_ROLES.map(item => (
                    <div key={item.role} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 10px', background: 'var(--surface)', borderRadius: '6px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: item.color }} />
                      <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--ink)', flex: 1 }}>{item.role}</span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--navy)' }}>{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Invitations Chart */}
            {invitationsExpanded && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px', background: 'var(--off)', borderRadius: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--navy)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Invitations by Status</div>
                <svg viewBox="0 0 160 160" width="140" height="140" style={{ marginBottom: '16px' }}>
                  {invitationArcs.map((arc) => (
                    <path
                      key={arc.status}
                      d={describeArc(80, 80, 65, arc.startAngle, arc.sweepAngle)}
                      fill={arc.color}
                      stroke="white"
                      strokeWidth="2"
                    />
                  ))}
                  <circle cx="80" cy="80" r="38" fill="var(--off)" />
                  <text x="80" y="76" textAnchor="middle" fontSize="22" fontWeight="800" fill="var(--navy)">{TOTAL_INVITATIONS}</text>
                  <text x="80" y="92" textAnchor="middle" fontSize="8" fontWeight="600" fill="var(--muted)">TOTAL</text>
                </svg>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
                  {INVITATION_STATUS.map(item => (
                    <div key={item.status} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 10px', background: 'var(--surface)', borderRadius: '6px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: item.color }} />
                      <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--ink)', flex: 1 }}>{item.status}</span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--navy)' }}>{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Molecules table */}
        <div className="dash-card" style={{ animationDelay: '.08s', marginBottom: '24px' }}>
          <div className="dash-card-header">
            <div>
              <div className="dash-card-title">My Molecules</div>
              <div className="dash-card-subtitle">All projects under your account</div>
            </div>
            <Link className="dash-card-link" href="/molecules">View all →</Link>
          </div>

          {/* Status Filter */}
          <div className="mol-filter-bar">
            <button
              type="button"
              className={`mol-filter-btn${stateFilter === 'all' ? ' active' : ''}`}
              onClick={() => setStateFilter('all')}
            >
              All <span className="mol-filter-count">{totalMolecules}</span>
            </button>
            {STATE_ORDER.map(state => {
              const config = MOLECULE_STATE_CONFIG[state];
              const count = stateCounts[state];
              if (count === 0) return null;
              return (
                <button
                  key={state}
                  type="button"
                  className={`mol-filter-btn${stateFilter === state ? ' active' : ''}`}
                  onClick={() => setStateFilter(state)}
                  style={{ '--filter-color': config.color } as React.CSSProperties}
                >
                  <span className="mol-filter-dot" style={{ background: config.color }} />
                  {config.label} <span className="mol-filter-count">{count}</span>
                </button>
              );
            })}
          </div>

          <div className="mol-table">
            <div className="mol-row mol-row-6 mol-head">
              <div className="mol-col">Molecule</div>
              <div className="mol-col mol-col-center">Status</div>
              <div className="mol-col mol-col-center">Phase</div>
              <div className="mol-col mol-col-center">Progress</div>
              <div className="mol-col mol-col-center">Lead</div>
              <div className="mol-col mol-col-right">Updated</div>
            </div>
            {filteredMolecules.map(m => {
              const stateConfig = MOLECULE_STATE_CONFIG[m.state];
              return (
                <div
                  key={m.id}
                  className="mol-row mol-row-6"
                  onClick={() => router.push(`/molecules/${m.id}`)}
                >
                  <div className="mol-name-wrap">
                    <div className="mol-dot" style={{ background: m.dotColor }} />
                    <div>
                      <div className="mol-name">{m.name}</div>
                      <div className="mol-lead-text">{m.code}</div>
                    </div>
                  </div>
                  <div className="mol-col-center">
                    <span
                      className="mol-status-badge"
                      style={{ background: stateConfig.bgColor, color: stateConfig.color }}
                    >
                      {stateConfig.label}
                    </span>
                  </div>
                  <div className="mol-col-center">
                    <span className={`phase-badge ${m.phaseCls}`}>{m.phaseLabel}</span>
                  </div>
                  <div className="mol-col-center">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                      <div className="progress-mini">
                        <div className="progress-fill" style={{ width: `${m.progress}%`, background: m.progressColor }} />
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>{m.progress}%</span>
                    </div>
                  </div>
                  <div className="mol-col-center" style={{ fontSize: '13px', color: 'var(--ink)', fontWeight: 500 }}>
                    {m.leadName}
                  </div>
                  <div className="mol-col-right" style={{ fontSize: '12px', color: 'var(--muted)' }}>{m.updated}</div>
                </div>
              );
            })}
            {filteredMolecules.length === 0 && (
              <div className="mol-empty">No molecules found</div>
            )}
          </div>
        </div>

        {/* Two Column Layout: Audit Feed + Active Users */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>

          {/* Audit Feed */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '320px' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--navy)' }}>Recent Activity</span>
              <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--muted)' }}>Last 7 days</span>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {AUDIT_FEED.map(item => (
                <div key={item.id} style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                    background: 'var(--off)', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {item.icon === 'plus' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>}
                    {item.icon === 'mail' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>}
                    {item.icon === 'check' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>}
                    {item.icon === 'edit' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>}
                    {item.icon === 'user-plus' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>}
                    {item.icon === 'file' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><polyline points="13 2 13 9 20 9" /></svg>}
                    {item.icon === 'check-circle' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>}
                    {item.icon === 'message' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', color: 'var(--ink)', lineHeight: 1.5 }}>
                      <span style={{ fontWeight: 600, color: 'var(--navy)' }}>{item.user}</span>
                      <span style={{ color: 'var(--muted)' }}> {item.action} </span>
                      <span style={{ fontWeight: 600, color: 'var(--cyan)' }}>{item.target}</span>
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '4px' }}>{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Users */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '320px' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--navy)' }}>Team Online</span>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E' }} />
                {ACTIVE_USERS.filter(u => u.online).length} online
              </span>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
              {/* User List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {ACTIVE_USERS.map(user => (
                  <div key={user.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', background: 'var(--off)', borderRadius: '8px' }}>
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: user.gradient,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '11px', fontWeight: 700, color: 'white',
                      }}>
                        {user.initials}
                      </div>
                      <div style={{
                        position: 'absolute', bottom: '-1px', right: '-1px',
                        width: '10px', height: '10px', borderRadius: '50%',
                        background: user.online ? '#22C55E' : '#94A3B8',
                        border: '2px solid var(--off)',
                      }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--navy)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
                      <div style={{ fontSize: '10px', color: 'var(--muted)' }}>{user.role}</div>
                    </div>
                    <div style={{
                      fontSize: '9px', fontWeight: 600, textTransform: 'uppercase',
                      color: user.online ? '#22C55E' : 'var(--muted)',
                    }}>
                      {user.online ? 'Online' : 'Offline'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Attention Required - Full Width */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden', marginBottom: '24px' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--navy)' }}>Attention Required</span>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--white)', background: '#EF4444', padding: '2px 8px', borderRadius: '10px' }}>{ATTENTION_ITEMS.length}</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '0' }}>
            {ATTENTION_ITEMS.map(item => (
              <div
                key={item.id}
                onClick={() => router.push(`/molecules/${item.moleculeId}`)}
                style={{
                  padding: '14px 20px',
                  borderBottom: '1px solid var(--border)',
                  borderRight: '1px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'background .15s',
                  background: item.priority === 'high' ? 'rgba(239,68,68,0.04)' : 'transparent',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--gold-pale)'}
                onMouseLeave={e => e.currentTarget.style.background = item.priority === 'high' ? 'rgba(239,68,68,0.04)' : 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                    background: item.type === 'lead-substitute' ? 'linear-gradient(135deg, #EF4444, #F87171)' : 'linear-gradient(135deg, #FFAB00, #FFD54F)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {item.type === 'lead-substitute' ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--navy)' }}>{item.title}</span>
                      {item.priority === 'high' && (
                        <span style={{ fontSize: '9px', fontWeight: 700, color: '#EF4444', background: 'rgba(239,68,68,0.1)', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>Urgent</span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>{item.description}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--cyan)' }}>{item.molecule}</span>
                      <span style={{ fontSize: '10px', color: 'var(--muted)' }}>·</span>
                      <span style={{ fontSize: '10px', color: 'var(--muted)' }}>{item.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}
