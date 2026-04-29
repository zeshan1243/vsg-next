'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { getMolecule } from '@/lib/molecules';
import { useRole } from '@/lib/useRole';

type ReqStatus = 'pending' | 'approved' | 'rejected' | 'review';
type ReqType =
  | 'resource' | 'budget' | 'access' | 'leave' | 'equipment'
  | 'update' | 'meeting' | 'info' | 'feedback' | 'broadcast';
type Priority = 'High' | 'Medium' | 'Low';
type ReqCategory = 'arfd' | 'communication';

interface Person {
  name: string;
  initials: string;
  gradient: string;
  role: string;
}

interface Request {
  id: string;
  title: string;
  category: ReqCategory;
  by: Person;
  for: Person;
  type: ReqType;
  typeLabel: string;
  date: string;
  status: ReqStatus;
  statusLabel: string;
  priority: Priority;
  description: string;
  department: string;
  budget: string;
}

const STATUS_STYLES: Record<ReqStatus, { bg: string; fg: string; dot: string }> = {
  pending:  { bg: 'var(--orange-pale)',       fg: 'var(--orange)',  dot: 'var(--orange)' },
  approved: { bg: 'var(--green-pale)',        fg: 'var(--success)', dot: 'var(--success)' },
  rejected: { bg: 'rgba(224,82,82,.1)',       fg: 'var(--error)',   dot: 'var(--error)' },
  review:   { bg: 'var(--cyan-pale)',         fg: 'var(--cyan)',    dot: 'var(--cyan)' },
};

const PRIORITY_STYLES: Record<Priority, { bg: string; fg: string }> = {
  High:   { bg: 'rgba(224,82,82,.1)', fg: 'var(--error)' },
  Medium: { bg: 'var(--orange-pale)', fg: 'var(--orange)' },
  Low:    { bg: 'var(--green-pale)',  fg: 'var(--success)' },
};

const GOLD_GRAD   = 'linear-gradient(135deg,var(--quad-a),var(--gold-lt))';
const CYAN_GRAD   = 'linear-gradient(135deg,var(--quad-b),#60A5FA)';
const GREEN_GRAD  = 'linear-gradient(135deg,var(--quad-d),#4ADE80)';
const PURPLE_GRAD = 'linear-gradient(135deg,var(--purple),#A78BFA)';
const ORANGE_GRAD = 'linear-gradient(135deg,var(--quad-c),#F87171)';

const REQUESTS: Request[] = [
  {
    id: 'REQ-2026-001', title: 'Additional Development Resources', category: 'arfd',
    by:  { name: 'John Griffin', initials: 'JG', gradient: GOLD_GRAD, role: 'Engineering Lead' },
    for: { name: 'John Griffin', initials: 'JG', gradient: GOLD_GRAD, role: 'Engineering Lead' },
    type: 'resource', typeLabel: 'Resource Request',
    date: 'Dec 21, 2025', status: 'pending', statusLabel: 'Pending', priority: 'High',
    description: 'We need 2 additional senior developers to support the Q1 product launch sprint. Current team is at full capacity and the timeline is at risk without extra bandwidth. Estimated duration: 3 months.',
    department: 'Engineering', budget: '$45,000',
  },
  {
    id: 'REQ-2026-002', title: 'Marketing Budget Increase', category: 'arfd',
    by:  { name: 'Sarah Mitchell', initials: 'SM', gradient: CYAN_GRAD, role: 'Marketing Manager' },
    for: { name: 'Sarah Mitchell', initials: 'SM', gradient: CYAN_GRAD, role: 'Marketing Manager' },
    type: 'budget', typeLabel: 'Budget Request',
    date: 'Dec 20, 2025', status: 'pending', statusLabel: 'Pending', priority: 'Medium',
    description: 'Requesting a 20% increase to the Q1 marketing budget to fund additional social media campaigns and influencer partnerships for the Premier Wedding Expo promotion. Current budget of $25,000 is insufficient for planned reach targets.',
    department: 'Marketing', budget: '$30,000',
  },
  {
    id: 'REQ-2026-003', title: 'System Admin Access Request', category: 'arfd',
    by:  { name: 'Mike Chan', initials: 'MC', gradient: GREEN_GRAD, role: 'DevOps Engineer' },
    for: { name: 'Mike Chan', initials: 'MC', gradient: GREEN_GRAD, role: 'DevOps Engineer' },
    type: 'access', typeLabel: 'Access Request',
    date: 'Dec 21, 2025', status: 'approved', statusLabel: 'Approved', priority: 'High',
    description: 'Need system admin access to the production AWS console for deploying critical infrastructure updates. Current read-only access is blocking the deployment pipeline for the event registration system.',
    department: 'DevOps', budget: 'N/A',
  },
  {
    id: 'REQ-2026-004', title: 'Annual Leave — Holiday Season', category: 'arfd',
    by:  { name: 'Kelly Davis', initials: 'KD', gradient: PURPLE_GRAD, role: 'Project Coordinator' },
    for: { name: 'Emily Davis', initials: 'ED', gradient: PURPLE_GRAD, role: 'Event Planner' },
    type: 'leave', typeLabel: 'Leave Request',
    date: 'Dec 19, 2025', status: 'approved', statusLabel: 'Approved', priority: 'Low',
    description: 'Requesting annual leave from Dec 23, 2025 to Jan 2, 2026 for the holiday season. All pending tasks have been handed over to Alex Kim as backup. No critical deadlines fall within the leave period.',
    department: 'Operations', budget: 'N/A',
  },
  {
    id: 'REQ-2026-005', title: 'New MacBook Pro for Design Team', category: 'arfd',
    by:  { name: 'Alex Wilson', initials: 'AW', gradient: GOLD_GRAD, role: 'Design Lead' },
    for: { name: 'Alex Wilson', initials: 'AW', gradient: GOLD_GRAD, role: 'Design Lead' },
    type: 'equipment', typeLabel: 'Equipment Request',
    date: 'Dec 21, 2025', status: 'review', statusLabel: 'In Review', priority: 'Medium',
    description: 'Requesting 3x MacBook Pro M3 Max (16-inch, 64GB RAM) for the design team. Current machines are 4+ years old and struggle with large Figma files and video rendering for event promo content.',
    department: 'Design', budget: '$10,500',
  },
  {
    id: 'REQ-2026-006', title: 'Conference Room Booking System', category: 'arfd',
    by:  { name: 'Lisa Brown', initials: 'LB', gradient: CYAN_GRAD, role: 'Operations Analyst' },
    for: { name: 'Lisa Brown', initials: 'LB', gradient: CYAN_GRAD, role: 'Operations Analyst' },
    type: 'resource', typeLabel: 'Resource Request',
    date: 'Dec 18, 2025', status: 'approved', statusLabel: 'Approved', priority: 'Low',
    description: 'Request for a centralized conference room booking system to replace the current spreadsheet-based process. The system should support calendar sync, recurring bookings, and real-time availability display.',
    department: 'Operations', budget: '$8,500',
  },
  {
    id: 'REQ-2026-007', title: 'Q1 Training Budget', category: 'arfd',
    by:  { name: 'David Lee', initials: 'DL', gradient: GREEN_GRAD, role: 'HR Manager' },
    for: { name: 'David Lee', initials: 'DL', gradient: GREEN_GRAD, role: 'HR Manager' },
    type: 'budget', typeLabel: 'Budget Request',
    date: 'Dec 20, 2025', status: 'pending', statusLabel: 'Pending', priority: 'Medium',
    description: 'Budget allocation for Q1 2026 team training programs including cloud certifications, leadership workshops, and technical upskilling courses. Covers 12 team members across 3 departments.',
    department: 'Human Resources', budget: '$18,000',
  },
  {
    id: 'REQ-2026-008', title: 'VPN Access for Remote Team', category: 'arfd',
    by:  { name: 'Rachel Green', initials: 'RG', gradient: ORANGE_GRAD, role: 'Remote Ops Lead' },
    for: { name: 'Rachel Green', initials: 'RG', gradient: ORANGE_GRAD, role: 'Remote Ops Lead' },
    type: 'access', typeLabel: 'Access Request',
    date: 'Dec 16, 2025', status: 'rejected', statusLabel: 'Rejected', priority: 'High',
    description: 'Requesting VPN access for 5 remote team members to securely access internal project management tools and shared drives. This is critical for the distributed team working on the expo logistics.',
    department: 'IT Security', budget: '$2,400',
  },
  {
    id: 'REQ-2026-009', title: 'Standing Desks for Engineering', category: 'arfd',
    by:  { name: 'Tom Harris', initials: 'TH', gradient: PURPLE_GRAD, role: 'Engineering Manager' },
    for: { name: 'Tom Harris', initials: 'TH', gradient: PURPLE_GRAD, role: 'Engineering Manager' },
    type: 'equipment', typeLabel: 'Equipment Request',
    date: 'Dec 15, 2025', status: 'approved', statusLabel: 'Approved', priority: 'Low',
    description: 'Requesting 8 motorized standing desks for the engineering team. Studies show standing desks improve productivity and reduce back pain. Several team members have reported ergonomic issues.',
    department: 'Engineering', budget: '$6,400',
  },
  {
    id: 'REQ-2026-010', title: 'Parental Leave Extension', category: 'arfd',
    by:  { name: 'Nina Patel', initials: 'NP', gradient: CYAN_GRAD, role: 'Senior Designer' },
    for: { name: 'Nina Patel', initials: 'NP', gradient: CYAN_GRAD, role: 'Senior Designer' },
    type: 'leave', typeLabel: 'Leave Request',
    date: 'Dec 14, 2025', status: 'review', statusLabel: 'In Review', priority: 'Medium',
    description: 'Requesting a 4-week extension to parental leave (originally ending Jan 15). The additional time is needed for childcare transition. All design deliverables for Q1 have been pre-completed and handed off.',
    department: 'Design', budget: 'N/A',
  },

  // ── Communication requests ──
  {
    id: 'COM-2026-001', title: 'Weekly status update — Wedding Expo', category: 'communication',
    by:  { name: 'Marcus Reeves', initials: 'MR', gradient: CYAN_GRAD, role: 'Molecule Lead' },
    for: { name: 'Sarah Kaplan',  initials: 'SK', gradient: GOLD_GRAD, role: 'Creator' },
    type: 'update', typeLabel: 'Status Update',
    date: 'Dec 22, 2025', status: 'pending', statusLabel: 'Awaiting Reply', priority: 'Medium',
    description: 'Sharing weekly progress on Premier Wedding Expo. Vendor signups at 42/50, ticket pre-sales hit 380. Need Creator sign-off on Phase 2 expansion before Dec 28.',
    department: 'Operations', budget: 'N/A',
  },
  {
    id: 'COM-2026-002', title: 'Q1 roadmap review meeting', category: 'communication',
    by:  { name: 'Aisha Patel',   initials: 'AP', gradient: PURPLE_GRAD, role: 'Product Lead' },
    for: { name: 'Marcus Reeves', initials: 'MR', gradient: CYAN_GRAD,   role: 'Molecule Lead' },
    type: 'meeting', typeLabel: 'Meeting Request',
    date: 'Dec 21, 2025', status: 'approved', statusLabel: 'Confirmed', priority: 'High',
    description: 'Propose a 90-min Q1 roadmap review on Jan 8, 10:00 AM. Agenda: OKR alignment, KPI targets, risk review, resourcing. Requesting calendar confirmation.',
    department: 'Product', budget: 'N/A',
  },
  {
    id: 'COM-2026-003', title: 'Clarification on booth layout spec', category: 'communication',
    by:  { name: 'Lena Wong',     initials: 'LW', gradient: GREEN_GRAD, role: 'Venue Coordinator' },
    for: { name: 'Alex Wilson',   initials: 'AW', gradient: GOLD_GRAD,  role: 'Design Lead' },
    type: 'info', typeLabel: 'Info Request',
    date: 'Dec 20, 2025', status: 'pending', statusLabel: 'Awaiting Reply', priority: 'High',
    description: 'Need clarification on the 3m × 3m booth variant — is the corner unit spec finalized? Vendor onboarding is blocked until layout sheets are distributed.',
    department: 'Operations', budget: 'N/A',
  },
  {
    id: 'COM-2026-004', title: 'Feedback on marketing pitch deck v3', category: 'communication',
    by:  { name: 'Sarah Mitchell', initials: 'SM', gradient: CYAN_GRAD, role: 'Marketing Manager' },
    for: { name: 'Marcus Reeves',  initials: 'MR', gradient: CYAN_GRAD, role: 'Molecule Lead' },
    type: 'feedback', typeLabel: 'Feedback',
    date: 'Dec 19, 2025', status: 'review', statusLabel: 'Under Review', priority: 'Medium',
    description: 'v3 of the sponsor pitch deck attached. Specifically want feedback on slides 6–9 (ROI framing) and slide 14 (audience demographics). Targeting Jan 5 send-out.',
    department: 'Marketing', budget: 'N/A',
  },
  {
    id: 'COM-2026-005', title: 'Post-event debrief — date shift', category: 'communication',
    by:  { name: 'David Kim',      initials: 'DK', gradient: GREEN_GRAD, role: 'Ops Lead' },
    for: { name: 'All Members',    initials: 'AL', gradient: PURPLE_GRAD, role: 'Molecule Team' },
    type: 'broadcast', typeLabel: 'Announcement',
    date: 'Dec 18, 2025', status: 'approved', statusLabel: 'Sent', priority: 'Low',
    description: 'Post-event debrief moved from Apr 2 to Apr 5 to accommodate the leadership offsite. Same time, same room. Calendar invites re-sent with the update.',
    department: 'Operations', budget: 'N/A',
  },
  {
    id: 'COM-2026-006', title: 'Vendor comms cadence question', category: 'communication',
    by:  { name: 'Jenna Brooks',   initials: 'JB', gradient: ORANGE_GRAD, role: 'Partnerships' },
    for: { name: 'Marcus Reeves',  initials: 'MR', gradient: CYAN_GRAD,   role: 'Molecule Lead' },
    type: 'info', typeLabel: 'Info Request',
    date: 'Dec 17, 2025', status: 'approved', statusLabel: 'Answered', priority: 'Low',
    description: 'Should vendor check-ins move from weekly to bi-weekly after Jan 15? Current weekly cadence feels heavy given most onboarding is completed. Would like a ruling before next planning round.',
    department: 'Partnerships', budget: 'N/A',
  },
];

const TYPE_LABELS: Record<ReqType | 'all', string> = {
  all: 'All Types',
  resource: 'Resource Request',
  budget: 'Budget Request',
  access: 'Access Request',
  leave: 'Leave Request',
  equipment: 'Equipment Request',
  update: 'Status Update',
  meeting: 'Meeting Request',
  info: 'Info Request',
  feedback: 'Feedback',
  broadcast: 'Announcement',
};

const APPROVAL_TYPES: ReqType[] = ['resource', 'budget', 'access', 'leave', 'equipment'];
const COMM_TYPES: ReqType[] = ['update', 'meeting', 'info', 'feedback', 'broadcast'];

const ApproveIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const RejectIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const ViewIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);
const DotIcon = <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="5" /></svg>;

export default function RequestsPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';
  const mol = getMolecule(id);
  const { roleLabel } = useRole();

  const [activeTab, setActiveTab] = useState<ReqCategory>('communication');
  const [statusFilter, setStatusFilter] = useState<'all' | ReqStatus>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | ReqType>('all');
  const [search, setSearch] = useState('');
  const [drawer, setDrawer] = useState<Request | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Reset type filter when switching tabs (the relevant types differ per category).
  const tabBase = useMemo(
    () => REQUESTS.filter(r => r.category === activeTab),
    [activeTab],
  );

  const tabCounts = useMemo(() => ({
    arfd:          REQUESTS.filter(r => r.category === 'arfd').length,
    communication: REQUESTS.filter(r => r.category === 'communication').length,
  }), []);

  const counts = useMemo(() => ({
    pending:  tabBase.filter(r => r.status === 'pending').length,
    approved: tabBase.filter(r => r.status === 'approved').length,
    rejected: tabBase.filter(r => r.status === 'rejected').length,
    total:    tabBase.length,
  }), [tabBase]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tabBase.filter(r => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (typeFilter !== 'all' && r.type !== typeFilter) return false;
      if (!q) return true;
      return (
        r.title.toLowerCase().includes(q) ||
        r.by.name.toLowerCase().includes(q) ||
        r.for.name.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
      );
    });
  }, [tabBase, statusFilter, typeFilter, search]);

  const relevantTypes = activeTab === 'arfd' ? APPROVAL_TYPES : COMM_TYPES;

  function handleTabChange(tab: ReqCategory) {
    setActiveTab(tab);
    setStatusFilter('all');
    setTypeFilter('all');
    setSearch('');
  }

  return (
    <>
      {/* ── Topbar ── */}
      <div className="topbar">
        <div className="breadcrumb">
          <Link href="/dashboard">Dashboard</Link>
          <span className="sep">›</span>
          <Link href="/molecules">My Molecules</Link>
          <span className="sep">›</span>
          <Link href={`/molecules/${id}`}>{mol?.name ?? 'Molecule'}</Link>
          <span className="sep">›</span>
          <span className="cur">Requests</span>
        </div>
        <div className="topbar-right">
          <span className="creator-tag">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {roleLabel}
          </span>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="creator-content">

        {/* Tabs */}
        <div className="req-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'communication'}
            className={`req-tab${activeTab === 'communication' ? ' active' : ''}`}
            onClick={() => handleTabChange('communication')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Communication
            <span className="req-tab-count">{tabCounts.communication}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'arfd'}
            className={`req-tab${activeTab === 'arfd' ? ' active' : ''}`}
            onClick={() => handleTabChange('arfd')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 11 12 14 22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            ARFDs
            <span className="req-tab-count">{tabCounts.arfd}</span>
          </button>
        </div>

        {/* Stats row */}
        <div className="stats-row">
          <button
            type="button"
            className={`stat-card${statusFilter === 'pending' ? ' active-filter' : ''}`}
            onClick={() => setStatusFilter(s => s === 'pending' ? 'all' : 'pending')}
          >
            <div className="stat-icon" style={{ background: 'var(--orange-pale)', color: 'var(--orange)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="stat-body">
              <div className="stat-num">{counts.pending}</div>
              <div className="stat-label">Pending Requests</div>
            </div>
          </button>

          <button
            type="button"
            className={`stat-card${statusFilter === 'approved' ? ' active-filter' : ''}`}
            onClick={() => setStatusFilter(s => s === 'approved' ? 'all' : 'approved')}
          >
            <div className="stat-icon" style={{ background: 'var(--green-pale)', color: 'var(--success)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div className="stat-body">
              <div className="stat-num">{counts.approved}</div>
              <div className="stat-label">Approved</div>
            </div>
          </button>

          <button
            type="button"
            className={`stat-card${statusFilter === 'rejected' ? ' active-filter' : ''}`}
            onClick={() => setStatusFilter(s => s === 'rejected' ? 'all' : 'rejected')}
          >
            <div className="stat-icon" style={{ background: 'rgba(224,82,82,.1)', color: 'var(--error)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <div className="stat-body">
              <div className="stat-num">{counts.rejected}</div>
              <div className="stat-label">Rejected</div>
            </div>
          </button>

          <button
            type="button"
            className={`stat-card${statusFilter === 'all' ? ' active-filter' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            <div className="stat-icon" style={{ background: 'var(--gold-pale)', color: 'var(--gold)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <div className="stat-body">
              <div className="stat-num">{counts.total}</div>
              <div className="stat-label">Total Requests</div>
            </div>
          </button>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <select
            className="filter-select"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="review">In Review</option>
          </select>
          <select
            className="filter-select"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as typeof typeFilter)}
          >
            <option value="all">All Types</option>
            {relevantTypes.map(t => (
              <option key={t} value={t}>{TYPE_LABELS[t]}</option>
            ))}
          </select>
          <select className="filter-select" defaultValue="all">
            <option value="all">All Time</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
          <div className="search-wrap" style={{ maxWidth: '280px' }}>
            <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="search-input"
              type="text"
              placeholder="Search requests..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ height: '38px' }}
            />
          </div>
          <button type="button" className="btn-gold-sm" onClick={() => setModalOpen(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Generate Request
          </button>
        </div>

        {/* Table */}
        <div className="req-table-wrap">
          <table className="req-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Requested By</th>
                <th>Requested For</th>
                <th>Type</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(r => {
                const ss = STATUS_STYLES[r.status];
                const canAct = r.status === 'pending' || r.status === 'review';
                return (
                  <tr key={r.id} onClick={() => setDrawer(r)}>
                    <td>
                      <div className="req-title-cell">
                        <div className="req-title">{r.title}</div>
                        <div className="req-id">{r.id}</div>
                      </div>
                    </td>
                    <td>
                      <div className="person-cell">
                        <div className="person-av" style={{ background: r.by.gradient }}>{r.by.initials}</div>
                        <div className="person-name">{r.by.name}</div>
                      </div>
                    </td>
                    <td>
                      <div className="person-cell">
                        <div className="person-av" style={{ background: r.for.gradient }}>{r.for.initials}</div>
                        <div className="person-name">{r.for.name}</div>
                      </div>
                    </td>
                    <td>
                      <span className={`type-badge ${r.type}`}>{DotIcon}{r.typeLabel}</span>
                    </td>
                    <td><div className="date-cell">{r.date}</div></td>
                    <td>
                      <span className={`status-badge ${r.status}`}>
                        <div className="status-dot" style={{ background: ss.dot }} />
                        {r.statusLabel}
                      </span>
                    </td>
                    <td>
                      <div
                        className="action-btns"
                        onClick={e => e.stopPropagation()}
                      >
                        {canAct && (
                          <>
                            <button type="button" className="action-btn approve-btn" title="Approve">{ApproveIcon}</button>
                            <button type="button" className="action-btn reject-btn" title="Reject">{RejectIcon}</button>
                          </>
                        )}
                        <button type="button" className="action-btn view-btn" title="View" onClick={() => setDrawer(r)}>{ViewIcon}</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
                    No requests match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination">
            <div className="page-info">Showing <strong>{visible.length}</strong> of <strong>{REQUESTS.length}</strong> requests</div>
            <div className="page-btns">
              <button type="button" className="page-btn nav-arrow" title="Previous">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button type="button" className="page-btn active">1</button>
              <button type="button" className="page-btn">2</button>
              <button type="button" className="page-btn">3</button>
              <button type="button" className="page-btn nav-arrow" title="Next">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Drawer ── */}
      {drawer && (
        <div className="drawer-overlay show" onClick={() => setDrawer(null)}>
          <div className="drawer" onClick={e => e.stopPropagation()}>
            <div className="drawer-head">
              <div className="drawer-head-top">
                <div>
                  <div className="drawer-title">{drawer.title}</div>
                  <div className="drawer-id">{drawer.id}</div>
                </div>
                <button type="button" className="drawer-close" onClick={() => setDrawer(null)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <div className="drawer-badges">
                {(() => {
                  const ss = STATUS_STYLES[drawer.status];
                  const ps = PRIORITY_STYLES[drawer.priority];
                  return (
                    <>
                      <span className="status-badge" style={{ background: ss.bg, color: ss.fg }}>
                        <div className="status-dot" style={{ background: ss.dot }} />
                        {drawer.statusLabel}
                      </span>
                      <span className={`type-badge ${drawer.type}`}>{drawer.typeLabel}</span>
                      <span className="status-badge" style={{ background: ps.bg, color: ps.fg }}>
                        Priority: {drawer.priority}
                      </span>
                    </>
                  );
                })()}
              </div>
            </div>

            <div className="drawer-body">
              <div className="detail-section">
                <div className="ds-label">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                  </svg>
                  People
                </div>
                <div className="ds-grid">
                  <div>
                    <div className="ds-field-label">Requested By</div>
                    <div className="ds-person">
                      <div className="ds-person-av" style={{ background: drawer.by.gradient }}>{drawer.by.initials}</div>
                      <div>
                        <div className="ds-person-name">{drawer.by.name}</div>
                        <div className="ds-person-role">{drawer.by.role}</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="ds-field-label">Requested For</div>
                    <div className="ds-person">
                      <div className="ds-person-av" style={{ background: drawer.for.gradient }}>{drawer.for.initials}</div>
                      <div>
                        <div className="ds-person-name">{drawer.for.name}</div>
                        <div className="ds-person-role">{drawer.for.role}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <div className="ds-label">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  Description
                </div>
                <div className="ds-desc">{drawer.description}</div>
              </div>

              <div className="detail-section">
                <div className="ds-label">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  Details
                </div>
                <div className="ds-meta-row"><span className="ds-meta-key">Type</span><span className="ds-meta-val">{drawer.typeLabel}</span></div>
                <div className="ds-meta-row"><span className="ds-meta-key">Status</span><span className="ds-meta-val">{drawer.statusLabel}</span></div>
                <div className="ds-meta-row"><span className="ds-meta-key">Priority</span><span className="ds-meta-val">{drawer.priority}</span></div>
                <div className="ds-meta-row"><span className="ds-meta-key">Date Submitted</span><span className="ds-meta-val">{drawer.date}</span></div>
                <div className="ds-meta-row"><span className="ds-meta-key">Department</span><span className="ds-meta-val">{drawer.department}</span></div>
                <div className="ds-meta-row"><span className="ds-meta-key">Estimated Budget</span><span className="ds-meta-val">{drawer.budget}</span></div>
              </div>
            </div>

            <div className="drawer-foot">
              {(drawer.status === 'pending' || drawer.status === 'review') && (
                <>
                  <button type="button" className="btn-approve">{ApproveIcon}Approve</button>
                  <button type="button" className="btn-reject">{RejectIcon}Reject</button>
                </>
              )}
              <button type="button" className="btn-sm" style={{ marginLeft: 'auto' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Comment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── New request modal ── */}
      {modalOpen && (
        <div
          onClick={() => setModalOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(13,27,42,.5)',
            zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--surface)', borderRadius: '16px', width: '520px',
              maxHeight: '80vh', overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(13,27,42,.2)',
            }}
          >
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div className="font-syne" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--navy)' }}>
                Generate New Request
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{
                  width: '32px', height: '32px', borderRadius: '8px', border: 'none',
                  background: 'var(--off)', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', color: 'var(--muted)',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <div className="fc-group">
                <label className="fc-label">Request Title</label>
                <input className="fc-input" type="text" placeholder="Enter request title" />
              </div>
              <div className="fc-group">
                <label className="fc-label">Request Type</label>
                <select className="fc-select" defaultValue="arfd">
                  <option value="arfd">ARFD</option>
                  <option value="communication">Communication</option>
                </select>
              </div>
              <div className="fc-group">
                <label className="fc-label">Requested For</label>
                <input className="fc-input" type="text" placeholder="Person or team name" />
              </div>
              <div className="fc-group">
                <label className="fc-label">Description</label>
                <textarea className="fc-textarea" placeholder="Describe your request..." />
              </div>
            </div>
            <div className="ov-modal-foot">
              <button type="button" className="btn-sm" onClick={() => setModalOpen(false)}>Cancel</button>
              <button type="button" className="btn-gold-sm" onClick={() => setModalOpen(false)}>Submit Request</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
