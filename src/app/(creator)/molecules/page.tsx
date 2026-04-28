'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { MOLECULES, type Molecule, type MoleculeState } from '@/lib/molecules';

type FilterKey = 'all' | MoleculeState;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all',       label: 'All' },
  { key: 'draft',     label: 'Draft' },
  { key: 'active',    label: 'Active' },
  { key: 'paused',    label: 'Paused' },
  { key: 'completed', label: 'Completed' },
  { key: 'archived',  label: 'Archived' },
];

type SortKey =
  | 'default'
  | 'name-asc'
  | 'name-desc'
  | 'progress-desc'
  | 'progress-asc'
  | 'members-desc'
  | 'members-asc';

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'default',       label: 'Default order' },
  { key: 'name-asc',      label: 'Name (A → Z)' },
  { key: 'name-desc',     label: 'Name (Z → A)' },
  { key: 'progress-desc', label: 'Progress (High → Low)' },
  { key: 'progress-asc',  label: 'Progress (Low → High)' },
  { key: 'members-desc',  label: 'Members (High → Low)' },
  { key: 'members-asc',   label: 'Members (Low → High)' },
];

const TeamIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);

const CalendarIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const CheckIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const KebabIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="5"  r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="12" cy="19" r="2" />
  </svg>
);
const WorkfieldsIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="16" rx="2" /><path d="M8 2v4M16 2v4M3 10h18" />
  </svg>
);
const LeadIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);

const AVAILABLE_LEADS = [
  'M. Reeves', 'A. Patel', 'L. Walsh', 'N. Brooks',
  'E. Torres', 'S. Mitchell', 'D. Lee', 'T. Harris',
];

type WorkfieldKey = 'vendors' | 'partners' | 'location' | 'attendance';

const WORKFIELD_FIELDS: { key: WorkfieldKey; default: string }[] = [
  { key: 'vendors',    default: 'Vendors'    },
  { key: 'partners',   default: 'Partners'   },
  { key: 'location',   default: 'Location'   },
  { key: 'attendance', default: 'Attendance' },
];

type WorkfieldMap = Record<WorkfieldKey, string>;

const DEFAULT_WORKFIELDS: WorkfieldMap = {
  vendors: 'Vendors', partners: 'Partners', location: 'Location', attendance: 'Attendance',
};

interface MoleculeExtras {
  workfields: WorkfieldMap;
}

export default function MoleculesPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [sort, setSort] = useState<SortKey>('default');
  const [page, setPage] = useState(1);
  const [molecules, setMolecules] = useState<Molecule[]>(MOLECULES);

  // Per-molecule workfields — 4 fixed fields, user can rename but not add/remove.
  const [extras, setExtras] = useState<Record<string, MoleculeExtras>>(() =>
    Object.fromEntries(MOLECULES.map(m => [m.id, {
      workfields: { ...DEFAULT_WORKFIELDS },
    }])),
  );

  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [workfieldsTarget, setWorkfieldsTarget] = useState<Molecule | null>(null);
  const [editingWfKey, setEditingWfKey] = useState<WorkfieldKey | null>(null);
  const [leadTarget, setLeadTarget] = useState<Molecule | null>(null);
  const [leadDraft, setLeadDraft] = useState('');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = molecules.filter(m => {
      if (filter !== 'all' && m.state !== filter) return false;
      if (!q) return true;
      return m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q);
    });
    if (sort === 'default') return filtered;
    const sorted = [...filtered];
    sorted.sort((a, b) => {
      switch (sort) {
        case 'name-asc':      return a.name.localeCompare(b.name);
        case 'name-desc':     return b.name.localeCompare(a.name);
        case 'progress-desc': return b.progress - a.progress;
        case 'progress-asc':  return a.progress - b.progress;
        case 'members-desc':  return b.members - a.members;
        case 'members-asc':   return a.members - b.members;
        default:              return 0;
      }
    });
    return sorted;
  }, [molecules, query, filter, sort]);

  const PAGE_SIZE = 6;
  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const safePage  = Math.min(page, pageCount);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageItems = visible.slice(pageStart, pageStart + PAGE_SIZE);

  // Reset to page 1 when filters/search/sort change
  useEffect(() => { setPage(1); }, [query, filter, sort]);

  const anyModalOpen = !!(workfieldsTarget || leadTarget);

  // Close modals / dropdown on Escape
  useEffect(() => {
    if (!anyModalOpen && menuOpenId === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Escape') return;
      setWorkfieldsTarget(null);
      setEditingWfKey(null);
      setLeadTarget(null);
      setMenuOpenId(null);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [anyModalOpen, menuOpenId]);

  // Close kebab dropdown on any outside click
  useEffect(() => {
    if (menuOpenId === null) return;
    function onClick() { setMenuOpenId(null); }
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, [menuOpenId]);

  function openWorkfields(m: Molecule) {
    setWorkfieldsTarget(m);
    setEditingWfKey(null);
    setMenuOpenId(null);
  }
  function closeWorkfields() {
    setWorkfieldsTarget(null);
    setEditingWfKey(null);
  }
  function openLead(m: Molecule) {
    setLeadTarget(m);
    setLeadDraft(m.leadName);
    setMenuOpenId(null);
  }

  function updateWorkfield(molId: string, key: WorkfieldKey, value: string) {
    setExtras(prev => ({
      ...prev,
      [molId]: { ...prev[molId], workfields: { ...prev[molId].workfields, [key]: value } },
    }));
  }
  function saveLead() {
    if (!leadTarget || !leadDraft.trim()) return;
    const newLead = leadDraft.trim();
    setMolecules(prev => prev.map(m => m.id === leadTarget.id
      ? { ...m, leadName: newLead, leadHint: `Lead: ${newLead}` }
      : m));
    setLeadTarget(null);
  }

  return (
    <>
      {/* ── Topbar ── */}
      <div className="topbar">
        <div className="topbar-left">
          <div className="page-title">My Molecules</div>
          <div className="page-subtitle">
            {molecules.length} molecules across your workspace
          </div>
        </div>
        <div className="topbar-actions">
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

        {/* Filters */}
        <div className="filters-bar">
          <div className="search-wrap">
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="search-input"
              type="text"
              placeholder="Search molecules…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          {FILTERS.map(f => (
            <button
              key={f.key}
              type="button"
              className={`filter-btn${filter === f.key ? ' active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
          <div className="sort-wrap">
            <svg className="sort-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M6 12h12M10 18h4" />
            </svg>
            <select
              className="sort-select"
              value={sort}
              onChange={e => setSort(e.target.value as SortKey)}
              aria-label="Sort molecules"
            >
              {SORTS.map(s => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid or empty state */}
        {visible.length > 0 ? (
          <div className="mol-grid">
            {pageItems.map(m => (
              <div
                key={m.id}
                className="mol-card"
                onClick={() => router.push(`/molecules/${m.id}`)}
              >
                <div className={`mol-card-top ${m.phaseCls}`} />
                <div className="mol-card-actions">
                  <button
                    type="button"
                    className={`mol-card-act${menuOpenId === m.id ? ' open' : ''}`}
                    onClick={e => {
                      e.stopPropagation();
                      setMenuOpenId(prev => prev === m.id ? null : m.id);
                    }}
                    aria-label={`Actions for ${m.name}`}
                    aria-haspopup="menu"
                    aria-expanded={menuOpenId === m.id}
                    title="Actions"
                  >
                    {KebabIcon}
                  </button>
                </div>
                {menuOpenId === m.id && (
                  <div
                    className="mol-card-menu"
                    role="menu"
                    onClick={e => e.stopPropagation()}
                  >
                    <button type="button" role="menuitem" className="mol-card-menu-item" onClick={() => openWorkfields(m)}>
                      {WorkfieldsIcon}
                      Edit Workfields
                    </button>
                    <button type="button" role="menuitem" className="mol-card-menu-item" onClick={() => openLead(m)}>
                      {LeadIcon}
                      Change Lead
                    </button>
                  </div>
                )}
                <div className="mol-card-body">
                  <div className={`mol-card-phase ${m.phaseCls}`}>{m.phaseLabel}</div>
                  <div className="mol-card-name">{m.name}</div>
                  <div className="mol-card-desc">{m.description}</div>
                  <div className="mol-card-meta">
                    <div className="mol-meta-item">
                      {TeamIcon}
                      <strong>{m.members}</strong>
                    </div>
                    <div className="mol-meta-item">
                      {m.status === 'completed' ? CheckIcon : CalendarIcon}
                      {m.date}
                    </div>
                    <div className="mol-progress">
                      <div className="mol-progress-bar">
                        <div
                          className="mol-progress-fill"
                          style={{ width: `${m.progress}%`, background: m.progressColor }}
                        />
                      </div>
                      <div className="mol-progress-val">{m.progress}%</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {visible.length > 0 && pageCount > 1 && (
          <div className="pagination pagination--cards">
            <div className="page-info">
              Showing <strong>{pageStart + 1}</strong>–<strong>{Math.min(pageStart + PAGE_SIZE, visible.length)}</strong> of <strong>{visible.length}</strong>
            </div>
            <div className="page-btns">
              <button
                type="button"
                className="page-btn nav-arrow"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={safePage === 1}
                aria-label="Previous page"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              {Array.from({ length: pageCount }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  type="button"
                  className={`page-btn${safePage === n ? ' active' : ''}`}
                  onClick={() => setPage(n)}
                  aria-current={safePage === n ? 'page' : undefined}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                className="page-btn nav-arrow"
                onClick={() => setPage(p => Math.min(pageCount, p + 1))}
                disabled={safePage === pageCount}
                aria-label="Next page"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {visible.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <div className="empty-title">No molecules match your filters</div>
            <div className="empty-desc">
              Try a different search term or clear the filter to see all of your molecules.
            </div>
            <button
              type="button"
              className="btn-primary-sm"
              style={{ margin: '0 auto' }}
              onClick={() => { setQuery(''); setFilter('all'); }}
            >
              Clear filters
            </button>
          </div>
        )}

      </div>

      {/* ── Edit Workfields modal ── */}
      {workfieldsTarget && (() => {
        const wf = extras[workfieldsTarget.id]?.workfields ?? DEFAULT_WORKFIELDS;
        const molId = workfieldsTarget.id;
        return (
          <div className="ov-modal-overlay" onClick={closeWorkfields}>
            <div className="ov-modal ov-modal--compact" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
              <div className="ov-modal-header">
                <div className="ov-modal-eyebrow">Workfields · {workfieldsTarget.name}</div>
                <button type="button" className="ov-modal-close" onClick={closeWorkfields} aria-label="Close">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <div className="ov-modal-body">
                <div className="fc-hint" style={{ marginTop: 0, marginBottom: '16px' }}>
                  Click the pencil to rename a workfield. Press Enter to confirm.
                </div>
                <div className="wf-edit-grid">
                  {WORKFIELD_FIELDS.map((f, idx) => {
                    const isEditing = editingWfKey === f.key;
                    return (
                      <div key={f.key} className={`wf-edit-row${isEditing ? ' editing' : ''}`}>
                        <span className="wf-edit-num">{idx + 1}</span>
                        {isEditing ? (
                          <input
                            className="wf-edit-input"
                            type="text"
                            value={wf[f.key]}
                            placeholder={f.default}
                            onChange={e => updateWorkfield(molId, f.key, e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter' || e.key === 'Escape') setEditingWfKey(null);
                            }}
                            autoFocus
                          />
                        ) : (
                          <span className="wf-edit-value">{wf[f.key]}</span>
                        )}
                        <button
                          type="button"
                          className="wf-edit-action"
                          onClick={() => setEditingWfKey(isEditing ? null : f.key)}
                          aria-label={isEditing ? `Confirm ${f.default}` : `Edit ${f.default}`}
                        >
                          {isEditing ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="ov-modal-foot">
                <button type="button" className="fc-btn-secondary" onClick={closeWorkfields}>Done</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Change Lead modal ── */}
      {leadTarget && (
        <div className="ov-modal-overlay" onClick={() => setLeadTarget(null)}>
          <div className="ov-modal ov-modal--compact" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" style={{ maxWidth: '480px' }}>
            <div className="ov-modal-header">
              <div className="ov-modal-eyebrow">Change Lead · {leadTarget.name}</div>
              <button type="button" className="ov-modal-close" onClick={() => setLeadTarget(null)} aria-label="Close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="ov-modal-body">
              <div className="fc-group">
                <label className="fc-label">Current lead</label>
                <div style={{ fontSize: '14px', color: 'var(--navy)', fontWeight: 600 }}>{leadTarget.leadName}</div>
              </div>
              <div className="fc-group">
                <label className="fc-label">Reassign to</label>
                <select
                  className="fc-select"
                  value={leadDraft}
                  onChange={e => setLeadDraft(e.target.value)}
                >
                  {AVAILABLE_LEADS.map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="ov-modal-foot">
              <button type="button" className="fc-btn-secondary" onClick={() => setLeadTarget(null)}>Cancel</button>
              <button type="button" className="fc-btn-primary" onClick={saveLead} disabled={leadDraft.trim() === leadTarget.leadName}>
                Save Lead
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
