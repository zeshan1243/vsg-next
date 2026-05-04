'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRole } from '@/lib/useRole';

// ─── Types ──────────────────────────────────────────────────────────────
type PlatformRole = 'creator' | 'admin';
type PlatformStatus = 'active' | 'inactive' | 'pending' | 'expired' | 'revoked';
type ActionModal = 'invite' | 'deactivate' | 'activate' | 'resend' | 'revoke' | 'remove' | null;
type SortField = 'name' | 'role' | 'status' | 'date';

interface PlatformUser {
  id: string;
  name: string;
  email: string;
  initials: string;
  gradient: string;
  role: PlatformRole;
  status: PlatformStatus;
  date: string;
  invitedBy?: string;
  molecules?: number;
  members?: number;
  lastActive?: string;
}

interface InviteForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: PlatformRole;
}

const EMPTY_INVITE: InviteForm = { firstName: '', lastName: '', email: '', phone: '', role: 'creator' };

// ─── Seed data ──────────────────────────────────────────────────────────
const INITIAL_USERS: PlatformUser[] = [
  // Creators
  { id: 'u1', name: 'Sarah Kaplan',   email: 'sarah@vsg.io',   initials: 'SK', gradient: 'linear-gradient(135deg, #FFAB00, #FFD54F)', role: 'creator', status: 'active',   date: '2024-01-15', molecules: 5, members: 24, lastActive: 'just now' },
  { id: 'u2', name: 'Daniel Park',    email: 'daniel@vsg.io',  initials: 'DP', gradient: 'linear-gradient(135deg, #3B82F6, #60A5FA)', role: 'creator', status: 'active',   date: '2024-03-04', molecules: 3, members: 12, lastActive: '2h ago' },
  { id: 'u3', name: 'Priya Nair',     email: 'priya@vsg.io',   initials: 'PN', gradient: 'linear-gradient(135deg, #22C55E, #4ADE80)', role: 'creator', status: 'active',   date: '2024-04-22', molecules: 4, members: 18, lastActive: 'yesterday' },
  { id: 'u4', name: 'Aisha Patel',    email: 'aisha@vsg.io',   initials: 'AP', gradient: 'linear-gradient(135deg, #EC4899, #F9A8D4)', role: 'creator', status: 'inactive', date: '2024-06-10', molecules: 2, members: 8,  lastActive: '30d ago' },
  { id: 'u5', name: 'Tomás Alvarez',  email: 'tomas@vsg.io',   initials: 'TA', gradient: 'linear-gradient(135deg, #8B5CF6, #A78BFA)', role: 'creator', status: 'active',   date: '2023-11-02', molecules: 6, members: 31, lastActive: '4h ago' },
  { id: 'u6', name: 'Yara Sayegh',    email: 'yara@vsg.io',    initials: 'YS', gradient: 'linear-gradient(135deg, #F59E0B, #FCD34D)', role: 'creator', status: 'pending',  date: '2026-04-29', invitedBy: 'Super Admin' },
  // Platform Admins
  { id: 'u7', name: 'Jordan Lee',     initials: 'JL', email: 'jordan@vsg.io',  gradient: 'linear-gradient(135deg, #0F172A, #334155)', role: 'admin',   status: 'active',   date: '2023-09-12', lastActive: 'just now' },
  { id: 'u8', name: 'Maya Chen',      initials: 'MC', email: 'maya@vsg.io',    gradient: 'linear-gradient(135deg, #EF4444, #F87171)', role: 'admin',   status: 'active',   date: '2024-02-18', lastActive: '1h ago' },
  { id: 'u9', name: 'Riya Mehta',     initials: 'RM', email: 'riya@vsg.io',    gradient: 'linear-gradient(135deg, #38BDF8, #7DD3FC)', role: 'admin',   status: 'active',   date: '2024-05-30', lastActive: '12h ago' },
  { id: 'u10', name: 'Felix Romero',  initials: 'FR', email: 'felix@vsg.io',   gradient: 'linear-gradient(135deg, #14B8A6, #5EEAD4)', role: 'admin',   status: 'pending',  date: '2026-04-25', invitedBy: 'Super Admin' },
  { id: 'u11', name: 'Lana Rivera',   initials: 'LR', email: 'lana@vsg.io',    gradient: 'linear-gradient(135deg, #64748B, #94A3B8)', role: 'admin',   status: 'expired',  date: '2026-03-05', invitedBy: 'Super Admin' },
];

const PAGE_SIZE = 8;

const ROLE_ORDER: Record<PlatformRole, number> = { creator: 0, admin: 1 };
const STATUS_ORDER: Record<PlatformStatus, number> = { active: 0, pending: 1, inactive: 2, expired: 3, revoked: 4 };

const ROLE_LABELS: Record<PlatformRole, string> = { creator: 'Creator', admin: 'Platform Admin' };
const STATUS_LABELS: Record<PlatformStatus, string> = {
  active: 'Active', inactive: 'Inactive', pending: 'Pending', expired: 'Expired', revoked: 'Revoked',
};

function formatDate(d: string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(d));
}

// ─── Page ───────────────────────────────────────────────────────────────
export default function PlatformUsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { roleLabel, isSuperAdmin, isPlatformAdmin } = useRole();
  // Platform Admins see the same User Manager but can't invite or take actions.
  const canManage = isSuperAdmin;
  const canView = isSuperAdmin || isPlatformAdmin;

  const [users,        setUsers]        = useState<PlatformUser[]>(INITIAL_USERS);
  const [search,       setSearch]       = useState('');
  const [roleFilter,   setRoleFilter]   = useState<'all' | PlatformRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | PlatformStatus>('all');
  const [sortField,    setSortField]    = useState<SortField>('role');
  const [sortDir,      setSortDir]      = useState<'asc' | 'desc'>('asc');
  const [page,         setPage]         = useState(1);
  const [actionModal,  setActionModal]  = useState<ActionModal>(null);
  const [selected,     setSelected]     = useState<PlatformUser | null>(null);
  const [invite,       setInvite]       = useState<InviteForm>(EMPTY_INVITE);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Open invite modal automatically when redirected from the dashboard
  // (e.g. /users?invite=creator or /users?invite=admin) — Super Admin only.
  useEffect(() => {
    const qp = searchParams?.get('invite');
    if (canManage && (qp === 'creator' || qp === 'admin')) {
      setInvite({ ...EMPTY_INVITE, role: qp });
      setActionModal('invite');
    }
    // Pre-filter the table when arriving from a Creator row on the dashboard.
    const focus = searchParams?.get('focus');
    if (focus) setSearch(focus);
  }, [searchParams, canManage]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!openDropdown) return;
    const onClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [openDropdown]);

  // Close modals on Escape
  useEffect(() => {
    if (!actionModal) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [actionModal]);

  function openModalFor(user: PlatformUser, kind: ActionModal) {
    setSelected(user);
    setActionModal(kind);
    setOpenDropdown(null);
  }
  function closeModal() {
    setActionModal(null);
    setSelected(null);
    // Strip the ?invite= query param so the modal doesn't re-open on back/forward.
    if (searchParams?.get('invite')) router.replace('/users');
  }

  const inviteValid = invite.firstName.trim() !== '' && invite.lastName.trim() !== '' && invite.email.trim() !== '';

  function submitInvite() {
    if (!inviteValid) return;
    const id = `u-${Date.now()}`;
    const initials = `${invite.firstName[0] ?? ''}${invite.lastName[0] ?? ''}`.toUpperCase();
    const newUser: PlatformUser = {
      id,
      name: `${invite.firstName.trim()} ${invite.lastName.trim()}`,
      email: invite.email.trim(),
      initials,
      gradient: 'linear-gradient(135deg, #64748B, #94A3B8)',
      role: invite.role,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      invitedBy: 'Super Admin',
    };
    setUsers(prev => [newUser, ...prev]);
    setInvite(EMPTY_INVITE);
    closeModal();
  }

  function applyDeactivate() {
    if (!selected) return;
    setUsers(prev => prev.map(u => u.id === selected.id ? { ...u, status: 'inactive' as const } : u));
    closeModal();
  }
  function applyActivate() {
    if (!selected) return;
    setUsers(prev => prev.map(u => u.id === selected.id ? { ...u, status: 'active' as const, lastActive: 'just now' } : u));
    closeModal();
  }
  function applyResend() {
    if (!selected) return;
    setUsers(prev => prev.map(u => u.id === selected.id
      ? { ...u, status: 'pending' as const, date: new Date().toISOString().split('T')[0] }
      : u));
    closeModal();
  }
  function applyRevoke() {
    if (!selected) return;
    setUsers(prev => prev.map(u => u.id === selected.id ? { ...u, status: 'revoked' as const } : u));
    closeModal();
  }
  function applyRemove() {
    if (!selected) return;
    setUsers(prev => prev.filter(u => u.id !== selected.id));
    closeModal();
  }

  const isFiltered = search.trim() !== '' || roleFilter !== 'all' || statusFilter !== 'all';
  function resetFilters() { setSearch(''); setRoleFilter('all'); setStatusFilter('all'); setPage(1); }

  function toggleSort(f: SortField) {
    if (sortField === f) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(f); setSortDir('asc'); }
    setPage(1);
  }

  const filtered = useMemo(() => {
    let list = users;
    const q = search.trim().toLowerCase();
    if (q) list = list.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    if (roleFilter   !== 'all') list = list.filter(u => u.role   === roleFilter);
    if (statusFilter !== 'all') list = list.filter(u => u.status === statusFilter);
    return [...list].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'name')   cmp = a.name.localeCompare(b.name);
      if (sortField === 'role')   cmp = ROLE_ORDER[a.role]     - ROLE_ORDER[b.role];
      if (sortField === 'status') cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
      if (sortField === 'date')   cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [users, search, roleFilter, statusFilter, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const roleCounts = useMemo(() => ({
    all:     users.length,
    creator: users.filter(u => u.role === 'creator').length,
    admin:   users.filter(u => u.role === 'admin').length,
  }), [users]);

  const statusCounts = useMemo(() => ({
    all:      users.length,
    active:   users.filter(u => u.status === 'active').length,
    pending:  users.filter(u => u.status === 'pending').length,
    inactive: users.filter(u => u.status === 'inactive').length,
    expired:  users.filter(u => u.status === 'expired').length,
    revoked:  users.filter(u => u.status === 'revoked').length,
  }), [users]);

  // Only Super Admin and Platform Admin can see this page; others get a soft block.
  if (!canView) {
    return (
      <>
        <div className="topbar">
          <div className="breadcrumb">
            <Link href="/dashboard">Dashboard</Link>
            <span className="sep">›</span>
            <span className="cur">User Manager</span>
          </div>
        </div>
        <div className="creator-content">
          <div className="um-card" style={{ padding: 36, textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>
              Restricted to Super Admins
            </div>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>
              You're signed in as <strong>{roleLabel}</strong>. Only Super Admins and Platform Admins can access the platform-wide User Manager.
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="topbar">
        <div className="breadcrumb">
          <Link href="/dashboard">Dashboard</Link>
          <span className="sep">›</span>
          <span className="cur">User Manager</span>
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

      <div className="creator-content">

        {/* Header */}
        <div className="um-header">
          <div>
            <div className="um-title">User Manager</div>
            <div className="um-desc">
              Platform-wide · {canManage
                ? 'Manage Creators and Platform Admins'
                : `${roleLabel} access — Read-only roster of every Creator and Platform Admin`}
            </div>
          </div>
          {canManage && (
            <div className="um-header-actions">
              <button
                type="button"
                className="btn-gold-sm"
                onClick={() => { setInvite({ ...EMPTY_INVITE, role: 'creator' }); setActionModal('invite'); }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
                </svg>
                Invite User
              </button>
            </div>
          )}
        </div>

        {/* Filter bar */}
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
            {(['all', 'creator', 'admin'] as const).map(r => (
              <button
                key={r}
                type="button"
                className={`um-pill${roleFilter === r ? ' active' : ''}`}
                onClick={() => { setRoleFilter(r); setPage(1); }}
              >
                {r === 'all' ? 'All' : ROLE_LABELS[r as PlatformRole]}
                <span className="um-pill-count">{roleCounts[r]}</span>
              </button>
            ))}
          </div>

          <div className="um-filter-divider" />

          <div className="um-filter-group">
            <span className="um-filter-group-label">Status</span>
            {(['all', 'active', 'pending', 'inactive', 'expired', 'revoked'] as const).map(s => (
              <button
                key={s}
                type="button"
                className={`um-pill${statusFilter === s ? ' active' : ''}${s !== 'all' ? ` um-pill-${s}` : ''}`}
                onClick={() => { setStatusFilter(s); setPage(1); }}
              >
                {s === 'all' ? 'All' : STATUS_LABELS[s as PlatformStatus]}
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

        {/* Table card */}
        <div className="um-card">
          <div className="um-card-meta">
            <span className="um-result-count">
              <strong>{filtered.length}</strong> {filtered.length === 1 ? 'user' : 'users'}
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

          <div className="um-table-wrap">
            <table className="um-table">
              <thead>
                <tr>
                  <th style={{ width: '34%' }}>User</th>
                  <th style={{ width: '14%' }}>Role</th>
                  <th style={{ width: '14%' }}>Stats</th>
                  <th style={{ width: '12%' }}>Status</th>
                  <th style={{ width: '14%' }}>Date</th>
                  <th style={{ width: '12%', textAlign: 'right' }}>Actions</th>
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
                {paginated.map(u => (
                  <tr key={u.id} className="um-row">
                    <td>
                      <div className="um-user-cell">
                        <div className="um-avatar" style={{ background: u.gradient }}>{u.initials}</div>
                        <div className="um-user-info">
                          <div className="um-user-name">{u.name}</div>
                          <div className="um-user-email">{u.email}</div>
                          {u.invitedBy && (
                            <div className="um-invited-by">
                              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                              Invited by {u.invitedBy}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`um-role-badge r-${u.role}`}>{ROLE_LABELS[u.role]}</span>
                    </td>
                    <td>
                      {u.role === 'creator' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <div style={{ fontSize: 12, color: 'var(--navy)', fontWeight: 600 }}>{u.molecules ?? 0} molecules</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{u.members ?? 0} members</div>
                        </div>
                      ) : u.lastActive ? (
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>Last active: {u.lastActive}</div>
                      ) : (
                        <span style={{ color: 'var(--muted)', fontSize: 12 }}>—</span>
                      )}
                    </td>
                    <td>
                      <span className={`um-status-badge s-${u.status}`}>
                        <span className="um-status-dot" />
                        {STATUS_LABELS[u.status]}
                      </span>
                    </td>
                    <td>
                      <div className="um-date-cell">
                        <span className="um-date-type">{u.status === 'active' || u.status === 'inactive' ? 'Joined' : 'Invited'}</span>
                        <span className="um-date-val">{formatDate(u.date)}</span>
                      </div>
                    </td>
                    <td>
                      <div className="um-actions">
                        {!canManage ? (
                          <span className="um-act-owner">—</span>
                        ) : (
                        <div className="um-dropdown-wrap" ref={openDropdown === u.id ? dropdownRef : null}>
                          <button
                            type="button"
                            className="um-dropdown-trigger"
                            onClick={() => setOpenDropdown(openDropdown === u.id ? null : u.id)}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" />
                            </svg>
                          </button>
                          {openDropdown === u.id && (
                            <div className="um-dropdown">
                              {(u.status === 'pending' || u.status === 'expired') && (
                                <button type="button" className="um-dropdown-item" onClick={() => openModalFor(u, 'resend')}>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                                  </svg>
                                  Resend Invitation
                                </button>
                              )}
                              {u.status === 'pending' && (
                                <button type="button" className="um-dropdown-item um-dropdown-item--danger" onClick={() => openModalFor(u, 'revoke')}>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                                  </svg>
                                  Revoke Invitation
                                </button>
                              )}
                              {u.status === 'active' && (
                                <button type="button" className="um-dropdown-item um-dropdown-item--danger" onClick={() => openModalFor(u, 'deactivate')}>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                                  </svg>
                                  Deactivate User
                                </button>
                              )}
                              {u.status === 'inactive' && (
                                <button type="button" className="um-dropdown-item" onClick={() => openModalFor(u, 'activate')}>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                  Reactivate User
                                </button>
                              )}
                              <div className="um-dropdown-divider" />
                              <button type="button" className="um-dropdown-item um-dropdown-item--danger" onClick={() => openModalFor(u, 'remove')}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                                Remove User
                              </button>
                            </div>
                          )}
                        </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination">
            <div className="page-info">Showing <strong>{paginated.length}</strong> of <strong>{filtered.length}</strong> users</div>
            <div className="page-btns">
              <button
                type="button"
                className="page-btn nav-arrow"
                title="Previous"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  type="button"
                  className={`page-btn${page === n ? ' active' : ''}`}
                  onClick={() => setPage(n)}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                className="page-btn nav-arrow"
                title="Next"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Invite User modal ── */}
      {actionModal === 'invite' && (
        <div className="ov-modal-overlay" onClick={closeModal}>
          <div className="ov-modal ov-modal--wide" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="ov-modal-header">
              <div className="ov-modal-eyebrow">Invite User</div>
              <button type="button" className="ov-modal-close" onClick={closeModal} aria-label="Close">
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
                  onChange={e => setInvite(p => ({ ...p, role: e.target.value as PlatformRole }))}>
                  <option value="creator">Creator</option>
                  <option value="admin">Platform Admin</option>
                </select>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>
                  Creators run their own molecules. Platform Admins help oversee the platform alongside Super Admins.
                </div>
              </div>
            </div>
            <div className="ov-modal-foot">
              <button type="button" className="fc-btn-secondary" onClick={closeModal}>Cancel</button>
              <button type="button" className="fc-btn-primary" onClick={submitInvite} disabled={!inviteValid}>
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Deactivate ── */}
      {actionModal === 'deactivate' && selected && (
        <ConfirmModal
          title="Deactivate User"
          danger
          subject={selected}
          message={<>Are you sure you want to deactivate <strong>{selected.name}</strong>? They will lose access to their workspace until reactivated.</>}
          confirmLabel="Deactivate"
          onClose={closeModal}
          onConfirm={applyDeactivate}
        />
      )}

      {/* ── Activate ── */}
      {actionModal === 'activate' && selected && (
        <ConfirmModal
          title="Reactivate User"
          subject={selected}
          message={<>Reactivate <strong>{selected.name}</strong>? They'll regain access to their workspace immediately.</>}
          confirmLabel="Reactivate"
          onClose={closeModal}
          onConfirm={applyActivate}
        />
      )}

      {/* ── Resend ── */}
      {actionModal === 'resend' && selected && (
        <ConfirmModal
          title="Resend Invitation"
          subject={selected}
          message={<>Resend the invitation email to <strong>{selected.name}</strong>?</>}
          confirmLabel="Resend Invitation"
          onClose={closeModal}
          onConfirm={applyResend}
        />
      )}

      {/* ── Revoke ── */}
      {actionModal === 'revoke' && selected && (
        <ConfirmModal
          title="Revoke Invitation"
          danger
          subject={selected}
          message={<>Revoke the invitation for <strong>{selected.name}</strong>? Their pending invitation link will stop working immediately.</>}
          confirmLabel="Revoke Invitation"
          onClose={closeModal}
          onConfirm={applyRevoke}
        />
      )}

      {/* ── Remove ── */}
      {actionModal === 'remove' && selected && (
        <ConfirmModal
          title="Remove User"
          danger
          subject={selected}
          message={<>Remove <strong>{selected.name}</strong> from the platform? This cannot be undone.</>}
          confirmLabel="Remove User"
          onClose={closeModal}
          onConfirm={applyRemove}
        />
      )}
    </>
  );
}

// ─── Small confirm modal helper ─────────────────────────────────────────
function ConfirmModal({
  title, message, subject, confirmLabel, danger, onClose, onConfirm,
}: {
  title: string;
  message: React.ReactNode;
  subject: PlatformUser;
  confirmLabel: string;
  danger?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="ov-modal-overlay" onClick={onClose}>
      <div className="ov-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="ov-modal-header">
          <div className="ov-modal-eyebrow">{title}</div>
          <button type="button" className="ov-modal-close" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="ov-modal-body">
          <div className="um-modal-user">
            <div className="um-avatar" style={{ background: subject.gradient }}>{subject.initials}</div>
            <div>
              <div className="um-modal-user-name">{subject.name}</div>
              <div className="um-modal-user-email">{subject.email}</div>
            </div>
          </div>
          <p className={`um-modal-text${danger ? ' um-modal-text--warning' : ''}`}>{message}</p>
        </div>
        <div className="ov-modal-foot">
          <button type="button" className="fc-btn-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className={danger ? 'fc-btn-danger' : 'fc-btn-primary'} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
