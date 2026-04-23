'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getMolecule } from '@/lib/molecules';

type QuadKey = 'A' | 'B' | 'C' | 'D';
type SlotType = 'stump' | 'sub';
type UserRole = 'admin' | 'user';

interface User {
  id: string;
  name: string;
  initials: string;
  color: string;
  role: UserRole;
}

interface SlotDef {
  id: string;     // e.g. "A-stump"
  quad: QuadKey;
  type: SlotType;
}

const USERS: User[] = [
  { id: 'u1',  name: 'Maria Chen',      initials: 'MC', color: 'var(--gold)',   role: 'admin' },
  { id: 'u2',  name: 'James Thompson',  initials: 'JT', color: 'var(--purple)', role: 'user' },
  { id: 'u3',  name: 'Elena Torres',    initials: 'ET', color: 'var(--cyan)',   role: 'user' },
  { id: 'u4',  name: 'Rachel Nguyen',   initials: 'RN', color: 'var(--success)',role: 'user' },
  { id: 'u5',  name: 'Omar Hassan',     initials: 'OH', color: 'var(--purple)', role: 'user' },
  { id: 'u6',  name: 'Tyler Williams',  initials: 'TW', color: 'var(--warn)',   role: 'admin' },
  { id: 'u7',  name: 'Rachel Park',     initials: 'RP', color: '#9B8EC4',        role: 'user' },
  { id: 'u8',  name: 'Tom Nguyen',      initials: 'TN', color: '#6BA3BE',        role: 'user' },
  { id: 'u9',  name: 'Nate Brooks',     initials: 'NB', color: '#5C8A6E',        role: 'user' },
  { id: 'u10', name: 'Lena Walsh',      initials: 'LW', color: '#B8736A',        role: 'user' },
];

const QUADS: { key: QuadKey; title: string; label: string; color: string }[] = [
  { key: 'A', title: 'Quadrant A', label: 'Coordinate',    color: 'var(--gold)' },
  { key: 'B', title: 'Quadrant B', label: 'Communication', color: 'var(--cyan)' },
  { key: 'C', title: 'Quadrant C', label: 'Acknowledge',   color: 'var(--success)' },
  { key: 'D', title: 'Quadrant D', label: 'Exchange',      color: 'var(--warn)' },
];

const SLOTS: SlotDef[] = QUADS.flatMap(q => [
  { id: `${q.key}-stump`, quad: q.key, type: 'stump' as const },
  { id: `${q.key}-sub`,   quad: q.key, type: 'sub' as const },
]);

const INITIAL_ASSIGNMENTS: Record<string, string | null> = {
  'A-stump': 'u1',  'A-sub':   'u2',
  'B-stump': 'u3',  'B-sub':   null,
  'C-stump': 'u4',  'C-sub':   'u5',
  'D-stump': 'u6',  'D-sub':   null,
};

function slotAvatarColor(slot: SlotDef, user: User): string {
  if (slot.type === 'sub') return 'var(--purple)';
  return user.color;
}

function slotRoleLabel(slot: SlotDef): string {
  return slot.type === 'stump' ? `Stump-${slot.quad}` : `Sub-Stump ${slot.quad}`;
}

function slotShortLabel(slot: SlotDef): string {
  return slot.type === 'stump' ? `Stump ${slot.quad}` : `Sub ${slot.quad}`;
}

const StumpIcon = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const SubStumpIcon = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" />
    <line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
  </svg>
);

export default function AssignMembersPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';
  const mol = getMolecule(id);

  const [assignments, setAssignments] = useState<Record<string, string | null>>(INITIAL_ASSIGNMENTS);
  const [poolSearch, setPoolSearch] = useState('');
  const [dropdown, setDropdown] = useState<{ slotId: string; top: number; left: number } | null>(null);
  const [ddSearch, setDdSearch] = useState('');
  const slotRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Close dropdown on Escape
  useEffect(() => {
    if (!dropdown) return;
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setDropdown(null); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dropdown]);

  // Assignments map: userId -> list of slot short labels
  const userAssignmentMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    Object.entries(assignments).forEach(([slotId, userId]) => {
      if (!userId) return;
      const slot = SLOTS.find(s => s.id === slotId)!;
      if (!map[userId]) map[userId] = [];
      map[userId].push(slotShortLabel(slot));
    });
    return map;
  }, [assignments]);

  const filledCount = Object.values(assignments).filter(Boolean).length;
  const filteredUsers = useMemo(() => {
    const q = poolSearch.trim().toLowerCase();
    if (!q) return USERS;
    return USERS.filter(u => u.name.toLowerCase().includes(q));
  }, [poolSearch]);

  function openDropdown(slotId: string) {
    const el = slotRefs.current[slotId];
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setDropdown({ slotId, top: rect.bottom + 6, left: rect.left });
    setDdSearch('');
  }

  function closeDropdown() { setDropdown(null); }

  function assign(slotId: string, userId: string) {
    setAssignments(prev => ({ ...prev, [slotId]: userId }));
    closeDropdown();
  }

  function unassign(slotId: string) {
    setAssignments(prev => ({ ...prev, [slotId]: null }));
  }

  const ddFiltered = useMemo(() => {
    const q = ddSearch.trim().toLowerCase();
    if (!q) return USERS;
    return USERS.filter(u => u.name.toLowerCase().includes(q));
  }, [ddSearch]);

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
          <span className="cur">Assign Members</span>
        </div>
        <div className="topbar-right">
          <span className="creator-tag">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Creator
          </span>
        </div>
      </div>

      <div className="creator-content">

        <div className="am-header">
          <div>
            <div className="am-title">Assign Members</div>
            <div className="am-desc">Assign users to Stump and Sub-Stump roles across all four quadrants.</div>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--muted)', textAlign: 'right' }}>
            <strong style={{ color: 'var(--navy)' }}>{filledCount}</strong> of <strong style={{ color: 'var(--navy)' }}>8</strong> roles assigned
            {filledCount < 8 && <span style={{ color: 'var(--warn)' }}> · {8 - filledCount} empty slot{8 - filledCount > 1 ? 's' : ''}</span>}
            {filledCount === 8 && <span style={{ color: 'var(--success)' }}> · All slots filled</span>}
          </div>
        </div>

        <div className="am-layout">

          {/* Users pool */}
          <div className="users-pool">
            <div className="pool-head">
              <div className="pool-title">All Users</div>
              <div className="pool-count">{USERS.length} users</div>
            </div>
            <div className="pool-search">
              <input
                type="text"
                className="pool-search-input"
                placeholder="Search users..."
                value={poolSearch}
                onChange={e => setPoolSearch(e.target.value)}
              />
            </div>
            <div className="pool-list">
              {filteredUsers.map(u => {
                const tags = userAssignmentMap[u.id] ?? [];
                return (
                  <div key={u.id} className="pool-user">
                    <div className="pu-av" style={{ background: u.color }}>{u.initials}</div>
                    <div className="pu-info">
                      <div className="pu-name">{u.name}</div>
                      <div className="pu-meta">
                        <span className={`pu-role-tag ${u.role}`}>{u.role === 'admin' ? 'Admin' : 'User'}</span>
                      </div>
                    </div>
                    <div className="pu-tags">
                      {tags.map(t => (
                        <span key={t} className="pu-assignment assigned">{t}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
              {filteredUsers.length === 0 && (
                <div style={{ padding: '24px 18px', textAlign: 'center', color: 'var(--muted)', fontSize: '12.5px' }}>
                  No users match your search.
                </div>
              )}
            </div>
          </div>

          {/* Quadrant assignment cards */}
          <div className="quad-assign-grid">
            {QUADS.map(q => (
              <div key={q.key} className={`quad-assign-card q${q.key}`}>
                <div className="qac-head">
                  <div className="qac-dot" style={{ background: q.color }} />
                  <div className="qac-title">{q.title}</div>
                  <span className={`qac-badge q${q.key}`}>{q.label}</span>
                </div>
                <div className="qac-body">
                  {(['stump', 'sub'] as SlotType[]).map(type => {
                    const slot: SlotDef = { id: `${q.key}-${type}`, quad: q.key, type };
                    const userId = assignments[slot.id];
                    const user = userId ? USERS.find(u => u.id === userId) : null;

                    return (
                      <div key={type} className="role-slot">
                        <div className="rs-label">
                          {type === 'stump' ? StumpIcon : SubStumpIcon}
                          {type === 'stump' ? 'Stump' : 'Sub-Stump'}
                        </div>
                        {user ? (
                          <div className="rs-assigned">
                            <div className="rs-av" style={{ background: slotAvatarColor(slot, user) }}>{user.initials}</div>
                            <div className="rs-info">
                              <div className="rs-name">{user.name}</div>
                              <div className="rs-role-meta">
                                {user.role === 'admin' ? 'Admin' : 'User'} · {slotRoleLabel(slot)}
                              </div>
                            </div>
                            <button type="button" className="rs-remove" onClick={() => unassign(slot.id)} title="Remove">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="rs-empty"
                            ref={el => { slotRefs.current[slot.id] = el; }}
                            onClick={() => openDropdown(slot.id)}
                          >
                            <div className="rs-empty-icon">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                              </svg>
                            </div>
                            <span className="rs-empty-text">
                              Click to assign {type === 'stump' ? 'Stump' : 'Sub-Stump'}
                            </span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Assign dropdown */}
      {dropdown && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 40 }}
            onClick={closeDropdown}
          />
          <div
            className="rs-dropdown"
            style={{ position: 'fixed', zIndex: 41, width: '260px', top: dropdown.top, left: dropdown.left }}
          >
            <div className="rs-dd-search">
              <input
                type="text"
                className="rs-dd-input"
                placeholder="Search available users..."
                autoFocus
                value={ddSearch}
                onChange={e => setDdSearch(e.target.value)}
              />
            </div>
            <div className="rs-dd-list">
              {ddFiltered.map(u => (
                <button
                  key={u.id}
                  type="button"
                  className="rs-dd-item"
                  onClick={() => assign(dropdown.slotId, u.id)}
                >
                  <div className="rs-dd-av" style={{ background: u.color }}>{u.initials}</div>
                  <div style={{ flex: 1 }}>
                    <div className="rs-dd-name">{u.name}</div>
                    <div className="rs-dd-role">{u.role === 'admin' ? 'Admin' : 'User'}</div>
                  </div>
                </button>
              ))}
              {ddFiltered.length === 0 && (
                <div style={{ padding: '16px 12px', textAlign: 'center', color: 'var(--muted)', fontSize: '12px' }}>
                  No users match.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
