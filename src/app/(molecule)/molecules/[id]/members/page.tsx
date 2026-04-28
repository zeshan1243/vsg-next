'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { getMolecule } from '@/lib/molecules';

type MemberStatus = 'active' | 'pending' | 'expired' | 'revoked';
type MemberRole   = 'creator' | 'lead' | 'stump' | 'sub-stump';
type QuadKey      = 'A' | 'B' | 'C' | 'D' | 'all' | null;
type SortField    = 'name' | 'role' | 'status' | 'date';
type InviteRole   = 'lead' | 'stump' | 'sub-stump';

interface Member {
  id: string;
  name: string;
  email: string;
  initials: string;
  gradient: string;
  role: MemberRole;
  quad: QuadKey;
  status: MemberStatus;
  date: string;
  invitedBy?: string;
  moleculeId: string; // 'current' = this molecule; other = platform user on another molecule
}

interface InviteForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: InviteRole;
}

const EMPTY_INVITE: InviteForm = { firstName: '', lastName: '', email: '', phone: '', role: 'stump' };

const INITIAL_MEMBERS: Member[] = [
  { id: 'm1',  name: 'Sarah Kaplan',   email: 'sarah@vsg.io',       initials: 'SK', gradient: 'linear-gradient(135deg,#FFAB00,#FFD54F)', role: 'creator',   quad: 'all', status: 'active',  date: '2024-01-15', moleculeId: 'current' },
  { id: 'm2',  name: 'Marcus Reeves',  email: 'marcus@vsg.io',      initials: 'MR', gradient: 'linear-gradient(135deg,#3B82F6,#60A5FA)', role: 'lead',      quad: 'all', status: 'active',  date: '2024-01-20', moleculeId: 'current' },
  { id: 'm3',  name: 'Maria Chen',     email: 'maria@vsg.io',       initials: 'MC', gradient: 'linear-gradient(135deg,#FFAB00,#FFD54F)', role: 'stump',     quad: 'A',   status: 'active',  date: '2024-02-01', moleculeId: 'current' },
  { id: 'm4',  name: 'James Thompson', email: 'james@vsg.io',       initials: 'JT', gradient: 'linear-gradient(135deg,#38BDF8,#7DD3FC)', role: 'sub-stump', quad: 'A',   status: 'active',  date: '2024-02-05', moleculeId: 'current' },
  { id: 'm5',  name: 'Elena Torres',   email: 'elena@vsg.io',       initials: 'ET', gradient: 'linear-gradient(135deg,#3BB87F,#4ADE80)', role: 'stump',     quad: 'B',   status: 'active',  date: '2024-02-10', moleculeId: 'current' },
  { id: 'm6',  name: 'Rachel Nguyen',  email: 'rachel@vsg.io',      initials: 'RN', gradient: 'linear-gradient(135deg,#EF4444,#F87171)', role: 'stump',     quad: 'C',   status: 'active',  date: '2024-02-15', moleculeId: 'current' },
  { id: 'm7',  name: 'Omar Hassan',    email: 'omar@vsg.io',        initials: 'OH', gradient: 'linear-gradient(135deg,#EC4899,#F9A8D4)', role: 'sub-stump', quad: 'C',   status: 'active',  date: '2024-02-18', moleculeId: 'current' },
  { id: 'm8',  name: 'Tyler Williams', email: 'tyler@vsg.io',       initials: 'TW', gradient: 'linear-gradient(135deg,#FFAB00,#FF8C00)', role: 'stump',     quad: 'D',   status: 'active',  date: '2024-02-20', moleculeId: 'current' },
  { id: 'm9',  name: 'Jenna Brooks',   email: 'jenna@company.com',  initials: 'JB', gradient: 'linear-gradient(135deg,#8B5CF6,#A78BFA)', role: 'sub-stump', quad: 'B',   status: 'pending', date: '2024-03-10', invitedBy: 'Sarah Kaplan', moleculeId: 'current' },
  { id: 'm10', name: 'David Kim',      email: 'david@company.com',  initials: 'DK', gradient: 'linear-gradient(135deg,#64748B,#94A3B8)', role: 'sub-stump', quad: 'D',   status: 'pending', date: '2024-03-12', invitedBy: 'Sarah Kaplan', moleculeId: 'current' },
  { id: 'm11', name: 'Lisa Wong',      email: 'lisa@company.com',   initials: 'LW', gradient: 'linear-gradient(135deg,#0F172A,#334155)', role: 'stump',     quad: 'B',   status: 'expired', date: '2024-02-28', invitedBy: 'Sarah Kaplan', moleculeId: 'current' },
  { id: 'm12', name: 'Aisha Patel',    email: 'aisha@company.com',  initials: 'AP', gradient: 'linear-gradient(135deg,#0EA5E9,#38BDF8)', role: 'lead',      quad: null,  status: 'expired', date: '2024-02-20', invitedBy: 'Sarah Kaplan', moleculeId: 'current' },
  { id: 'm13', name: 'Chris Park',     email: 'chris@company.com',  initials: 'CP', gradient: 'linear-gradient(135deg,#94A3B8,#CBD5E1)', role: 'sub-stump', quad: 'A',   status: 'revoked', date: '2024-02-22', invitedBy: 'Sarah Kaplan', moleculeId: 'current' },
  // Platform users on other molecules — visible when "this molecule only" is off
  { id: 'm14', name: 'Nate Brooks',    email: 'nate@company.com',   initials: 'NB', gradient: 'linear-gradient(135deg,#64748B,#94A3B8)', role: 'lead',      quad: 'all', status: 'active',  date: '2024-01-10', moleculeId: 'other-1' },
  { id: 'm15', name: 'Lena Walsh',     email: 'lena@company.com',   initials: 'LW', gradient: 'linear-gradient(135deg,#EC4899,#F9A8D4)', role: 'stump',     quad: 'A',   status: 'active',  date: '2024-01-25', moleculeId: 'other-1' },
  { id: 'm16', name: 'Tom Nguyen',     email: 'tom@company.com',    initials: 'TN', gradient: 'linear-gradient(135deg,#8B5CF6,#A78BFA)', role: 'sub-stump', quad: 'C',   status: 'active',  date: '2024-02-08', moleculeId: 'other-2' },
];

const PAGE_SIZE = 8;

const ROLE_ORDER: Record<MemberRole, number>   = { creator: 0, lead: 1, stump: 2, 'sub-stump': 3 };
const STATUS_ORDER: Record<MemberStatus, number> = { active: 0, pending: 1, expired: 2, revoked: 3 };

const ROLE_LABELS: Record<MemberRole, string>     = { creator: 'Creator', lead: 'Lead', stump: 'Stump', 'sub-stump': 'Sub-Stump' };
const STATUS_LABELS: Record<MemberStatus, string> = { active: 'Active', pending: 'Pending', expired: 'Expired', revoked: 'Revoked' };

function quadLabel(q: QuadKey): string {
  if (!q) return '—';
  return q === 'all' ? 'All' : `Q·${q}`;
}
function formatDate(d: string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(d));
}

export default function MembersPage() {
  const params = useParams<{ id: string }>();
  const id     = params?.id ?? '';
  const mol    = getMolecule(id);

  const [members,      setMembers]      = useState<Member[]>(INITIAL_MEMBERS);
  const [search,       setSearch]       = useState('');
  const [roleFilter,   setRoleFilter]   = useState<'all' | MemberRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | MemberStatus>('all');
  const [thisMolOnly,  setThisMolOnly]  = useState(true);
  const [sortField,    setSortField]    = useState<SortField>('role');
  const [sortDir,      setSortDir]      = useState<'asc' | 'desc'>('asc');
  const [page,         setPage]         = useState(1);
  const [inviteOpen,   setInviteOpen]   = useState(false);
  const [invite,       setInvite]       = useState<InviteForm>(EMPTY_INVITE);

  useEffect(() => {
    if (!inviteOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setInviteOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [inviteOpen]);

  const inviteValid = invite.firstName.trim() !== '' && invite.lastName.trim() !== '' && invite.email.trim() !== '';

  function submitInvite() {
    if (!inviteValid) return;
    const newMember: Member = {
      id: `m-${Date.now()}`,
      name: `${invite.firstName.trim()} ${invite.lastName.trim()}`,
      email: invite.email.trim(),
      initials: `${invite.firstName[0]}${invite.lastName[0]}`.toUpperCase(),
      gradient: 'linear-gradient(135deg,#64748B,#94A3B8)',
      role: invite.role,
      quad: null,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      invitedBy: 'Sarah Kaplan',
      moleculeId: 'current',
    };
    setMembers(prev => [newMember, ...prev]);
    setInviteOpen(false);
    setInvite(EMPTY_INVITE);
  }

  function revokeInvitation(memberId: string) {
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, status: 'revoked' as const } : m));
  }
  function resendInvitation(memberId: string) {
    setMembers(prev => prev.map(m =>
      m.id === memberId ? { ...m, status: 'pending' as const, date: new Date().toISOString().split('T')[0] } : m,
    ));
  }
  function removeMember(memberId: string) {
    setMembers(prev => prev.filter(m => m.id !== memberId));
  }

  const isFiltered = search.trim() !== '' || roleFilter !== 'all' || statusFilter !== 'all';
  function resetFilters() { setSearch(''); setRoleFilter('all'); setStatusFilter('all'); setPage(1); }

  function toggleSort(field: SortField) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
    setPage(1);
  }

  const baseList = useMemo(
    () => thisMolOnly ? members.filter(m => m.moleculeId === 'current') : members,
    [members, thisMolOnly],
  );

  const filtered = useMemo(() => {
    let list = baseList;
    const q = search.trim().toLowerCase();
    if (q) list = list.filter(m => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q));
    if (roleFilter   !== 'all') list = list.filter(m => m.role   === roleFilter);
    if (statusFilter !== 'all') list = list.filter(m => m.status === statusFilter);
    return [...list].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'name')   cmp = a.name.localeCompare(b.name);
      if (sortField === 'role')   cmp = ROLE_ORDER[a.role]   - ROLE_ORDER[b.role];
      if (sortField === 'status') cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
      if (sortField === 'date')   cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [baseList, search, roleFilter, statusFilter, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const roleCounts = useMemo(() => ({
    all:         baseList.length,
    creator:     baseList.filter(m => m.role === 'creator').length,
    lead:        baseList.filter(m => m.role === 'lead').length,
    stump:       baseList.filter(m => m.role === 'stump').length,
    'sub-stump': baseList.filter(m => m.role === 'sub-stump').length,
  }), [baseList]);

  const statusCounts = useMemo(() => ({
    all:     baseList.length,
    active:  baseList.filter(m => m.status === 'active').length,
    pending: baseList.filter(m => m.status === 'pending').length,
    expired: baseList.filter(m => m.status === 'expired').length,
    revoked: baseList.filter(m => m.status === 'revoked').length,
  }), [baseList]);

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
          <span className="cur">User Manager</span>
        </div>
      </div>

      <div className="creator-content">

        {/* ── Header ── */}
        <div className="um-header">
          <div>
            <div className="um-title">User Manager</div>
            <div className="um-desc">{mol.name} · Manage members, roles, and invitations</div>
          </div>
          <div className="um-header-actions">
            <label className="um-mol-toggle">
              <input
                type="checkbox"
                checked={thisMolOnly}
                onChange={e => { setThisMolOnly(e.target.checked); setPage(1); }}
              />
              <span className="um-toggle-track"><span className="um-toggle-thumb" /></span>
              <span className="um-toggle-label">This molecule only</span>
            </label>
            <button type="button" className="btn-gold-sm" onClick={() => setInviteOpen(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
              </svg>
              Invite User
            </button>
          </div>
        </div>

        {/* ── Filter bar ── */}
        <div className="um-filters">
          <div className="um-search-wrap">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="um-search-icon">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="um-search"
              placeholder="Search by name or email…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
            {search && (
              <button type="button" className="um-search-clear" onClick={() => { setSearch(''); setPage(1); }} aria-label="Clear search">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            )}
          </div>

          <div className="um-filter-divider" />

          <div className="um-filter-group">
            <span className="um-filter-group-label">Role</span>
            {(['all', 'creator', 'lead', 'stump', 'sub-stump'] as const).map(r => (
              <button
                key={r}
                type="button"
                className={`um-pill${roleFilter === r ? ' active' : ''}`}
                onClick={() => { setRoleFilter(r); setPage(1); }}
              >
                {r === 'all' ? 'All' : ROLE_LABELS[r as MemberRole]}
                <span className="um-pill-count">{roleCounts[r]}</span>
              </button>
            ))}
          </div>

          <div className="um-filter-divider" />

          <div className="um-filter-group">
            <span className="um-filter-group-label">Status</span>
            {(['all', 'active', 'pending', 'expired', 'revoked'] as const).map(s => (
              <button
                key={s}
                type="button"
                className={`um-pill${statusFilter === s ? ' active' : ''}${s !== 'all' ? ` um-pill-${s}` : ''}`}
                onClick={() => { setStatusFilter(s); setPage(1); }}
              >
                {s === 'all' ? 'All' : STATUS_LABELS[s as MemberStatus]}
                <span className="um-pill-count">{statusCounts[s]}</span>
              </button>
            ))}
          </div>

          {isFiltered && (
            <button type="button" className="um-reset-btn" onClick={resetFilters}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4"/></svg>
              Reset filters
            </button>
          )}
        </div>

        {/* ── Table card ── */}
        <div className="um-card">

          {/* Meta row: count + sort */}
          <div className="um-card-meta">
            <span className="um-result-count">
              <strong>{filtered.length}</strong> {filtered.length === 1 ? 'user' : 'users'}
              {thisMolOnly && <span className="um-mol-chip">{mol.name}</span>}
            </span>
            <div className="um-sort-row">
              <span className="um-sort-label">Sort</span>
              {(['name', 'role', 'status', 'date'] as SortField[]).map(f => (
                <button
                  key={f}
                  type="button"
                  className={`um-sort-btn${sortField === f ? ' active' : ''}`}
                  onClick={() => toggleSort(f)}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                  {sortField === f && (
                    <svg
                      width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                      style={{ transform: sortDir === 'desc' ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}
                    >
                      <polyline points="18 15 12 9 6 15" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="um-table-wrap">
            <table className="um-table">
              <thead>
                <tr>
                  <th style={{ width: '32%' }}>User</th>
                  <th style={{ width: '13%' }}>Role</th>
                  <th style={{ width: '9%'  }}>Quad</th>
                  <th style={{ width: '12%' }}>Status</th>
                  <th style={{ width: '16%' }}>Date</th>
                  <th style={{ width: '18%', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={6} className="um-empty">
                      No users match the current filters.
                      {isFiltered && (
                        <button type="button" className="um-empty-reset" onClick={resetFilters}>Reset filters</button>
                      )}
                    </td>
                  </tr>
                )}
                {paginated.map(m => (
                  <tr key={m.id} className="um-row">
                    {/* User */}
                    <td>
                      <div className="um-user-cell">
                        <div className="um-avatar" style={{ background: m.gradient }}>{m.initials}</div>
                        <div className="um-user-info">
                          <div className="um-user-name">{m.name}</div>
                          <div className="um-user-email">{m.email}</div>
                          {m.invitedBy && (
                            <div className="um-invited-by">
                              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                              Invited by {m.invitedBy}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    {/* Role */}
                    <td>
                      <span className={`um-role-badge r-${m.role}`}>{ROLE_LABELS[m.role]}</span>
                    </td>
                    {/* Quad */}
                    <td>
                      <span className={`um-quad-badge${m.quad ? ` q-${m.quad}` : ' q-none'}`}>{quadLabel(m.quad)}</span>
                    </td>
                    {/* Status */}
                    <td>
                      <span className={`um-status-badge s-${m.status}`}>
                        <span className="um-status-dot" />
                        {STATUS_LABELS[m.status]}
                      </span>
                    </td>
                    {/* Date */}
                    <td>
                      <div className="um-date-cell">
                        <span className="um-date-type">{m.status === 'active' ? 'Joined' : 'Invited'}</span>
                        <span className="um-date-val">{formatDate(m.date)}</span>
                      </div>
                    </td>
                    {/* Actions */}
                    <td>
                      <div className="um-actions">
                        {m.status === 'active' && m.role !== 'creator' && (
                          <button type="button" className="um-act um-act-danger" onClick={() => removeMember(m.id)}>Remove</button>
                        )}
                        {m.status === 'pending' && (
                          <>
                            <button type="button" className="um-act" onClick={() => resendInvitation(m.id)}>Resend</button>
                            <button type="button" className="um-act um-act-danger" onClick={() => revokeInvitation(m.id)}>Revoke</button>
                          </>
                        )}
                        {m.status === 'expired' && (
                          <>
                            <button type="button" className="um-act um-act-primary" onClick={() => resendInvitation(m.id)}>Resend</button>
                            <button type="button" className="um-act um-act-muted" onClick={() => removeMember(m.id)}>Remove</button>
                          </>
                        )}
                        {m.status === 'revoked' && (
                          <button type="button" className="um-act um-act-muted" onClick={() => removeMember(m.id)}>Remove</button>
                        )}
                        {m.status === 'active' && m.role === 'creator' && (
                          <span className="um-act-owner">Owner</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="um-pagination">
              <button
                type="button"
                className="um-page-btn"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Prev
              </button>
              <div className="um-page-nums">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    type="button"
                    className={`um-page-num${page === n ? ' active' : ''}`}
                    onClick={() => setPage(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="um-page-btn"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Invite User modal ── */}
      {inviteOpen && (
        <div className="ov-modal-overlay" onClick={() => setInviteOpen(false)}>
          <div className="ov-modal ov-modal--wide" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="ov-modal-header">
              <div className="ov-modal-eyebrow">Invite User · {mol.name}</div>
              <button type="button" className="ov-modal-close" onClick={() => setInviteOpen(false)} aria-label="Close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="ov-modal-body">
              <div className="fc-row">
                <div className="fc-group">
                  <label className="fc-label">First Name <span className="req">*</span></label>
                  <input className="fc-input" type="text" placeholder="Jane"
                    value={invite.firstName} onChange={e => setInvite(p => ({ ...p, firstName: e.target.value }))} />
                </div>
                <div className="fc-group">
                  <label className="fc-label">Last Name <span className="req">*</span></label>
                  <input className="fc-input" type="text" placeholder="Doe"
                    value={invite.lastName} onChange={e => setInvite(p => ({ ...p, lastName: e.target.value }))} />
                </div>
              </div>
              <div className="fc-group">
                <label className="fc-label">Email <span className="req">*</span></label>
                <input className="fc-input" type="email" placeholder="jane@company.com"
                  value={invite.email} onChange={e => setInvite(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="fc-group">
                <label className="fc-label">Phone <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span></label>
                <input className="fc-input" type="tel" placeholder="(555) 123-4567"
                  value={invite.phone} onChange={e => setInvite(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <div className="fc-group">
                <label className="fc-label">Role <span className="req">*</span></label>
                <select className="fc-select" value={invite.role}
                  onChange={e => setInvite(p => ({ ...p, role: e.target.value as InviteRole }))}>
                  <option value="lead">Lead</option>
                  <option value="stump">Stump</option>
                  <option value="sub-stump">Sub-Stump</option>
                </select>
              </div>
            </div>
            <div className="ov-modal-foot">
              <button type="button" className="fc-btn-secondary" onClick={() => setInviteOpen(false)}>Cancel</button>
              <button type="button" className="fc-btn-primary" onClick={submitInvite} disabled={!inviteValid}>
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
