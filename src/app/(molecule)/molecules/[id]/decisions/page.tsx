'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { getMolecule } from '@/lib/molecules';
import { useRole } from '@/lib/useRole';

type DecisionStatus = 'pending' | 'approved' | 'rejected' | 'changes_requested';
type DecisionLevel = 'stump' | 'lead';
type Quadrant = 'A' | 'B' | 'C' | 'D';
type InnerPhase = 'Coordinate' | 'Communicate' | 'Curate' | 'Calibrate';

interface Person {
  name: string;
  initials: string;
  gradient: string;
  role: string;
}

interface Decision {
  id: string;
  title: string;
  level: DecisionLevel;
  quadrant: Quadrant;
  phase?: InnerPhase;
  submittedBy: Person;
  validator: Person;
  date: string;
  status: DecisionStatus;
  statusLabel: string;
  description: string;
  comments?: string;
}

const STATUS_STYLES: Record<DecisionStatus, { bg: string; fg: string; dot: string }> = {
  pending:          { bg: 'var(--orange-pale)',       fg: 'var(--orange)',  dot: 'var(--orange)' },
  approved:         { bg: 'var(--green-pale)',        fg: 'var(--success)', dot: 'var(--success)' },
  rejected:         { bg: 'rgba(224,82,82,.1)',       fg: 'var(--error)',   dot: 'var(--error)' },
  changes_requested: { bg: 'var(--cyan-pale)',        fg: 'var(--cyan)',    dot: 'var(--cyan)' },
};

const QUADRANT_COLORS: Record<Quadrant, string> = {
  A: '#FFAB00',
  B: '#3B82F6',
  C: '#EF4444',
  D: '#22C55E',
};

const GOLD_GRAD   = 'linear-gradient(135deg,var(--quad-a),var(--gold-lt))';
const CYAN_GRAD   = 'linear-gradient(135deg,var(--quad-b),#60A5FA)';
const GREEN_GRAD  = 'linear-gradient(135deg,var(--quad-d),#4ADE80)';
const PURPLE_GRAD = 'linear-gradient(135deg,var(--purple),#A78BFA)';
const ORANGE_GRAD = 'linear-gradient(135deg,var(--quad-c),#F87171)';

const DECISIONS: Decision[] = [
  // Pending decisions
  {
    id: 'DEC-2026-001',
    title: 'Inner Coordinate Phase Output',
    level: 'stump',
    quadrant: 'A',
    phase: 'Coordinate',
    submittedBy: { name: 'Alex Kim', initials: 'AK', gradient: GOLD_GRAD, role: 'Sub-Stump' },
    validator: { name: 'John Griffin', initials: 'JG', gradient: GOLD_GRAD, role: 'Stump' },
    date: 'Dec 22, 2025',
    status: 'pending',
    statusLabel: 'Pending',
    description: 'OKR alignment document ready for validation. Objectives mapped to company strategy with measurable key results defined.',
  },
  {
    id: 'DEC-2026-002',
    title: 'Inner Communicate Phase Output',
    level: 'stump',
    quadrant: 'A',
    phase: 'Communicate',
    submittedBy: { name: 'Alex Kim', initials: 'AK', gradient: GOLD_GRAD, role: 'Sub-Stump' },
    validator: { name: 'John Griffin', initials: 'JG', gradient: GOLD_GRAD, role: 'Stump' },
    date: 'Dec 21, 2025',
    status: 'pending',
    statusLabel: 'Pending',
    description: 'KPI framework document submitted. Communication metrics established with stakeholder alignment completed.',
  },
  {
    id: 'DEC-2026-003',
    title: 'Quadrant A Boundary Validation',
    level: 'lead',
    quadrant: 'A',
    submittedBy: { name: 'John Griffin', initials: 'JG', gradient: GOLD_GRAD, role: 'Stump' },
    validator: { name: 'Sarah Kaplan', initials: 'SK', gradient: PURPLE_GRAD, role: 'Lead' },
    date: 'Dec 20, 2025',
    status: 'pending',
    statusLabel: 'Pending',
    description: 'Consolidated Outer OKR artifact for Quadrant A ready for Lead approval. All inner phases completed and validated by Stump.',
  },
  {
    id: 'DEC-2026-004',
    title: 'Inner Curate Phase Output',
    level: 'stump',
    quadrant: 'B',
    phase: 'Curate',
    submittedBy: { name: 'Lena Wong', initials: 'LW', gradient: CYAN_GRAD, role: 'Sub-Stump' },
    validator: { name: 'Mike Chen', initials: 'MC', gradient: CYAN_GRAD, role: 'Stump' },
    date: 'Dec 19, 2025',
    status: 'changes_requested',
    statusLabel: 'Changes Requested',
    description: 'Jobs documentation requires additional context on dependencies. Please add cross-functional impact assessment.',
    comments: 'Need more detail on dependencies between jobs and timeline impacts.',
  },

  // History (approved/rejected)
  {
    id: 'DEC-2026-005',
    title: 'Inner Coordinate Phase Output',
    level: 'stump',
    quadrant: 'B',
    phase: 'Coordinate',
    submittedBy: { name: 'Lena Wong', initials: 'LW', gradient: CYAN_GRAD, role: 'Sub-Stump' },
    validator: { name: 'Mike Chen', initials: 'MC', gradient: CYAN_GRAD, role: 'Stump' },
    date: 'Dec 15, 2025',
    status: 'approved',
    statusLabel: 'Approved',
    description: 'OKR alignment for Quadrant B completed. All objectives mapped with clear key results.',
  },
  {
    id: 'DEC-2026-006',
    title: 'Inner Communicate Phase Output',
    level: 'stump',
    quadrant: 'B',
    phase: 'Communicate',
    submittedBy: { name: 'Lena Wong', initials: 'LW', gradient: CYAN_GRAD, role: 'Sub-Stump' },
    validator: { name: 'Mike Chen', initials: 'MC', gradient: CYAN_GRAD, role: 'Stump' },
    date: 'Dec 14, 2025',
    status: 'approved',
    statusLabel: 'Approved',
    description: 'KPI framework validated. Communication channels established.',
  },
  {
    id: 'DEC-2026-007',
    title: 'Quadrant B Boundary Validation',
    level: 'lead',
    quadrant: 'B',
    submittedBy: { name: 'Mike Chen', initials: 'MC', gradient: CYAN_GRAD, role: 'Stump' },
    validator: { name: 'Sarah Kaplan', initials: 'SK', gradient: PURPLE_GRAD, role: 'Lead' },
    date: 'Dec 12, 2025',
    status: 'rejected',
    statusLabel: 'Rejected',
    description: 'Quadrant B submission rejected due to incomplete KPI definitions. Requires full resubmission after addressing gaps.',
    comments: 'KPI targets not aligned with Q1 business objectives. Please revise.',
  },
  {
    id: 'DEC-2026-008',
    title: 'Inner Calibrate Phase Output',
    level: 'stump',
    quadrant: 'C',
    phase: 'Calibrate',
    submittedBy: { name: 'David Kim', initials: 'DK', gradient: ORANGE_GRAD, role: 'Sub-Stump' },
    validator: { name: 'Rachel Green', initials: 'RG', gradient: ORANGE_GRAD, role: 'Stump' },
    date: 'Dec 10, 2025',
    status: 'approved',
    statusLabel: 'Approved',
    description: 'Task calibration document approved. Resource allocation finalized.',
  },
  {
    id: 'DEC-2026-009',
    title: 'Inner Coordinate Phase Output',
    level: 'stump',
    quadrant: 'D',
    phase: 'Coordinate',
    submittedBy: { name: 'Tom Harris', initials: 'TH', gradient: GREEN_GRAD, role: 'Sub-Stump' },
    validator: { name: 'Lisa Brown', initials: 'LB', gradient: GREEN_GRAD, role: 'Stump' },
    date: 'Dec 8, 2025',
    status: 'approved',
    statusLabel: 'Approved',
    description: 'Quadrant D coordination completed. Exchange protocols defined.',
  },
  {
    id: 'DEC-2026-010',
    title: 'Quadrant C Boundary Validation',
    level: 'lead',
    quadrant: 'C',
    submittedBy: { name: 'Rachel Green', initials: 'RG', gradient: ORANGE_GRAD, role: 'Stump' },
    validator: { name: 'Sarah Kaplan', initials: 'SK', gradient: PURPLE_GRAD, role: 'Lead' },
    date: 'Dec 5, 2025',
    status: 'approved',
    statusLabel: 'Approved',
    description: 'Quadrant C consolidated output approved by Lead. Knowledge artifacts finalized.',
  },
];

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
const ChangesIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);
const ViewIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);

type TabView = 'pending' | 'history';

export default function DecisionsPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';
  const mol = getMolecule(id);
  const { roleLabel } = useRole();

  const [activeTab, setActiveTab] = useState<TabView>('pending');
  const [statusFilter, setStatusFilter] = useState<'all' | DecisionStatus>('all');
  const [levelFilter, setLevelFilter] = useState<'all' | DecisionLevel>('all');
  const [quadrantFilter, setQuadrantFilter] = useState<'all' | Quadrant>('all');
  const [search, setSearch] = useState('');
  const [drawer, setDrawer] = useState<Decision | null>(null);

  const pendingDecisions = useMemo(
    () => DECISIONS.filter(d => d.status === 'pending' || d.status === 'changes_requested'),
    [],
  );

  const historyDecisions = useMemo(
    () => DECISIONS.filter(d => d.status === 'approved' || d.status === 'rejected'),
    [],
  );

  const tabBase = activeTab === 'pending' ? pendingDecisions : historyDecisions;

  const tabCounts = useMemo(() => ({
    pending: pendingDecisions.length,
    history: historyDecisions.length,
  }), [pendingDecisions, historyDecisions]);

  const counts = useMemo(() => ({
    pending:  DECISIONS.filter(d => d.status === 'pending').length,
    approved: DECISIONS.filter(d => d.status === 'approved').length,
    rejected: DECISIONS.filter(d => d.status === 'rejected').length,
    changes:  DECISIONS.filter(d => d.status === 'changes_requested').length,
  }), []);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tabBase.filter(d => {
      if (statusFilter !== 'all' && d.status !== statusFilter) return false;
      if (levelFilter !== 'all' && d.level !== levelFilter) return false;
      if (quadrantFilter !== 'all' && d.quadrant !== quadrantFilter) return false;
      if (!q) return true;
      return (
        d.title.toLowerCase().includes(q) ||
        d.submittedBy.name.toLowerCase().includes(q) ||
        d.validator.name.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q)
      );
    });
  }, [tabBase, statusFilter, levelFilter, quadrantFilter, search]);

  function handleTabChange(tab: TabView) {
    setActiveTab(tab);
    setStatusFilter('all');
    setLevelFilter('all');
    setQuadrantFilter('all');
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
          <span className="cur">Decisions</span>
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
            aria-selected={activeTab === 'pending'}
            className={`req-tab${activeTab === 'pending' ? ' active' : ''}`}
            onClick={() => handleTabChange('pending')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            Pending
            <span className="req-tab-count">{tabCounts.pending}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'history'}
            className={`req-tab${activeTab === 'history' ? ' active' : ''}`}
            onClick={() => handleTabChange('history')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" />
            </svg>
            History
            <span className="req-tab-count">{tabCounts.history}</span>
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
              <div className="stat-label">Pending Validations</div>
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
            className={`stat-card${statusFilter === 'changes_requested' ? ' active-filter' : ''}`}
            onClick={() => setStatusFilter(s => s === 'changes_requested' ? 'all' : 'changes_requested')}
          >
            <div className="stat-icon" style={{ background: 'var(--cyan-pale)', color: 'var(--cyan)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </div>
            <div className="stat-body">
              <div className="stat-num">{counts.changes}</div>
              <div className="stat-label">Changes Requested</div>
            </div>
          </button>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <select
            className="filter-select"
            value={levelFilter}
            onChange={e => setLevelFilter(e.target.value as typeof levelFilter)}
          >
            <option value="all">All Levels</option>
            <option value="stump">Stump-level (Inner)</option>
            <option value="lead">Lead-level (Boundary)</option>
          </select>
          <select
            className="filter-select"
            value={quadrantFilter}
            onChange={e => setQuadrantFilter(e.target.value as typeof quadrantFilter)}
          >
            <option value="all">All Quadrants</option>
            <option value="A">Quadrant A</option>
            <option value="B">Quadrant B</option>
            <option value="C">Quadrant C</option>
            <option value="D">Quadrant D</option>
          </select>
          <div className="search-wrap" style={{ maxWidth: '280px' }}>
            <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="search-input"
              type="text"
              placeholder="Search validations..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ height: '38px' }}
            />
          </div>
        </div>

        {/* Table */}
        <div className="req-table-wrap">
          <table className="req-table">
            <thead>
              <tr>
                <th>Validation</th>
                <th>Submitted By</th>
                <th>Validator</th>
                <th>Level</th>
                <th>Quadrant</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(d => {
                const ss = STATUS_STYLES[d.status];
                const canAct = d.status === 'pending' || d.status === 'changes_requested';
                const qColor = QUADRANT_COLORS[d.quadrant];
                return (
                  <tr key={d.id} onClick={() => setDrawer(d)}>
                    <td>
                      <div className="req-title-cell">
                        <div className="req-title">{d.title}</div>
                        <div className="req-id">{d.id}</div>
                      </div>
                    </td>
                    <td>
                      <div className="person-cell">
                        <div className="person-av" style={{ background: d.submittedBy.gradient }}>{d.submittedBy.initials}</div>
                        <div className="person-name">{d.submittedBy.name}</div>
                      </div>
                    </td>
                    <td>
                      <div className="person-cell">
                        <div className="person-av" style={{ background: d.validator.gradient }}>{d.validator.initials}</div>
                        <div className="person-name">{d.validator.name}</div>
                      </div>
                    </td>
                    <td>
                      <span className={`type-badge ${d.level}`}>
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="5" /></svg>
                        {d.level === 'stump' ? 'Stump' : 'Lead'}
                      </span>
                    </td>
                    <td>
                      <span className="quadrant-badge" style={{ background: `${qColor}15`, color: qColor }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: qColor, marginRight: 6 }} />
                        Q{d.quadrant}
                        {d.phase && <span style={{ opacity: 0.7, marginLeft: 4 }}>· {d.phase}</span>}
                      </span>
                    </td>
                    <td><div className="date-cell">{d.date}</div></td>
                    <td>
                      <span className={`status-badge ${d.status}`}>
                        <div className="status-dot" style={{ background: ss.dot }} />
                        {d.statusLabel}
                      </span>
                    </td>
                    <td>
                      <div
                        className="action-btns"
                        onClick={e => e.stopPropagation()}
                      >
                        {canAct && activeTab === 'pending' && (
                          <>
                            <button type="button" className="action-btn approve-btn" title="Approve">{ApproveIcon}</button>
                            <button type="button" className="action-btn reject-btn" title="Reject">{RejectIcon}</button>
                            <button type="button" className="action-btn changes-btn" title="Request Changes">{ChangesIcon}</button>
                          </>
                        )}
                        <button type="button" className="action-btn view-btn" title="View" onClick={() => setDrawer(d)}>{ViewIcon}</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
                    No validations match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination">
            <div className="page-info">Showing <strong>{visible.length}</strong> of <strong>{DECISIONS.length}</strong> validations</div>
            <div className="page-btns">
              <button type="button" className="page-btn nav-arrow" title="Previous">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button type="button" className="page-btn active">1</button>
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
                  const qColor = QUADRANT_COLORS[drawer.quadrant];
                  return (
                    <>
                      <span className="status-badge" style={{ background: ss.bg, color: ss.fg }}>
                        <div className="status-dot" style={{ background: ss.dot }} />
                        {drawer.statusLabel}
                      </span>
                      <span className={`type-badge ${drawer.level}`}>
                        {drawer.level === 'stump' ? 'Stump-level' : 'Lead-level'}
                      </span>
                      <span className="quadrant-badge" style={{ background: `${qColor}15`, color: qColor }}>
                        Quadrant {drawer.quadrant}
                        {drawer.phase && ` · ${drawer.phase}`}
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
                    <div className="ds-field-label">Submitted By</div>
                    <div className="ds-person">
                      <div className="ds-person-av" style={{ background: drawer.submittedBy.gradient }}>{drawer.submittedBy.initials}</div>
                      <div>
                        <div className="ds-person-name">{drawer.submittedBy.name}</div>
                        <div className="ds-person-role">{drawer.submittedBy.role}</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="ds-field-label">Validator</div>
                    <div className="ds-person">
                      <div className="ds-person-av" style={{ background: drawer.validator.gradient }}>{drawer.validator.initials}</div>
                      <div>
                        <div className="ds-person-name">{drawer.validator.name}</div>
                        <div className="ds-person-role">{drawer.validator.role}</div>
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

              {drawer.comments && (
                <div className="detail-section">
                  <div className="ds-label">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    Validator Comments
                  </div>
                  <div className="ds-desc" style={{ background: 'var(--cyan-pale)', padding: '12px', borderRadius: '8px', color: 'var(--cyan)' }}>
                    {drawer.comments}
                  </div>
                </div>
              )}

              <div className="detail-section">
                <div className="ds-label">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  Details
                </div>
                <div className="ds-meta-row"><span className="ds-meta-key">Level</span><span className="ds-meta-val">{drawer.level === 'stump' ? 'Stump-level (Inner)' : 'Lead-level (Boundary)'}</span></div>
                <div className="ds-meta-row"><span className="ds-meta-key">Quadrant</span><span className="ds-meta-val">Quadrant {drawer.quadrant}</span></div>
                {drawer.phase && <div className="ds-meta-row"><span className="ds-meta-key">Phase</span><span className="ds-meta-val">{drawer.phase}</span></div>}
                <div className="ds-meta-row"><span className="ds-meta-key">Status</span><span className="ds-meta-val">{drawer.statusLabel}</span></div>
                <div className="ds-meta-row"><span className="ds-meta-key">Date Submitted</span><span className="ds-meta-val">{drawer.date}</span></div>
              </div>
            </div>

            <div className="drawer-foot">
              {(drawer.status === 'pending' || drawer.status === 'changes_requested') && (
                <>
                  <button type="button" className="btn-approve">{ApproveIcon}Approve</button>
                  <button type="button" className="btn-reject">{RejectIcon}Reject</button>
                  <button type="button" className="btn-sm" style={{ background: 'var(--cyan-pale)', color: 'var(--cyan)' }}>
                    {ChangesIcon}
                    Request Changes
                  </button>
                </>
              )}
              <button type="button" className="btn-sm" style={{ marginLeft: 'auto' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Add Comment
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
