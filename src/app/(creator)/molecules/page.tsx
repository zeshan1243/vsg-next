'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { MOLECULES, type Molecule } from '@/lib/molecules';

type FilterKey = 'all' | 'progress' | 'completed';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
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
const LabelsIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41L13 21a2 2 0 0 1-2.83 0L3 13.83V4h9.83L20.59 11.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
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
type LabelKey     = 'okrs' | 'kpis' | 'jobs' | 'tasks';

const WORKFIELD_FIELDS: { key: WorkfieldKey; default: string }[] = [
  { key: 'vendors',    default: 'Vendors'    },
  { key: 'partners',   default: 'Partners'   },
  { key: 'location',   default: 'Location'   },
  { key: 'attendance', default: 'Attendance' },
];
const LABEL_FIELDS: { key: LabelKey; default: string }[] = [
  { key: 'okrs',  default: 'OKRs'  },
  { key: 'kpis',  default: 'KPIs'  },
  { key: 'jobs',  default: 'Jobs'  },
  { key: 'tasks', default: 'Tasks' },
];

type WorkfieldMap = Record<WorkfieldKey, string>;
type LabelMap     = Record<LabelKey, string>;

const DEFAULT_WORKFIELDS: WorkfieldMap = {
  vendors: 'Vendors', partners: 'Partners', location: 'Location', attendance: 'Attendance',
};
const DEFAULT_LABELS: LabelMap = {
  okrs: 'OKRs', kpis: 'KPIs', jobs: 'Jobs', tasks: 'Tasks',
};

interface MoleculeExtras {
  workfields: WorkfieldMap;
  labels: LabelMap;
}

export default function MoleculesPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [molecules, setMolecules] = useState<Molecule[]>(MOLECULES);

  // Per-molecule workfields + labels — 4 fixed fields each, user can rename but not add/remove.
  const [extras, setExtras] = useState<Record<string, MoleculeExtras>>(() =>
    Object.fromEntries(MOLECULES.map(m => [m.id, {
      workfields: { ...DEFAULT_WORKFIELDS },
      labels:     { ...DEFAULT_LABELS },
    }])),
  );

  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [workfieldsTarget, setWorkfieldsTarget] = useState<Molecule | null>(null);
  const [labelsTarget, setLabelsTarget] = useState<Molecule | null>(null);
  const [leadTarget, setLeadTarget] = useState<Molecule | null>(null);
  const [leadDraft, setLeadDraft] = useState('');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return molecules.filter(m => {
      if (filter !== 'all' && m.status !== filter) return false;
      if (!q) return true;
      return m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q);
    });
  }, [molecules, query, filter]);

  const anyModalOpen = !!(workfieldsTarget || labelsTarget || leadTarget);

  // Close modals / dropdown on Escape
  useEffect(() => {
    if (!anyModalOpen && menuOpenId === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Escape') return;
      setWorkfieldsTarget(null);
      setLabelsTarget(null);
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
    setMenuOpenId(null);
  }
  function openLabels(m: Molecule) {
    setLabelsTarget(m);
    setMenuOpenId(null);
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
  function updateLabel(molId: string, key: LabelKey, value: string) {
    setExtras(prev => ({
      ...prev,
      [molId]: { ...prev[molId], labels: { ...prev[molId].labels, [key]: value } },
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
        </div>

        {/* Grid or empty state */}
        {visible.length > 0 ? (
          <div className="mol-grid">
            {visible.map(m => (
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
                    <button type="button" role="menuitem" className="mol-card-menu-item" onClick={() => openLabels(m)}>
                      {LabelsIcon}
                      Edit Labels
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
        ) : (
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
          <div className="ov-modal-overlay" onClick={() => setWorkfieldsTarget(null)}>
            <div className="ov-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
              <div className="ov-modal-header">
                <div className="ov-modal-eyebrow">Edit Workfields · {workfieldsTarget.name}</div>
                <button type="button" className="ov-modal-close" onClick={() => setWorkfieldsTarget(null)} aria-label="Close">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <div className="ov-modal-body">
                <div className="fc-hint" style={{ marginTop: 0, marginBottom: '14px' }}>
                  Rename any of the four workfields. These are the operational domains for this molecule.
                </div>
                <div className="fc-row" style={{ marginBottom: '14px' }}>
                  <div className="fc-group" style={{ marginBottom: 0 }}>
                    <label className="fc-label">{WORKFIELD_FIELDS[0].default}</label>
                    <input
                      className="fc-input" type="text"
                      value={wf[WORKFIELD_FIELDS[0].key]}
                      onChange={e => updateWorkfield(molId, WORKFIELD_FIELDS[0].key, e.target.value)}
                    />
                  </div>
                  <div className="fc-group" style={{ marginBottom: 0 }}>
                    <label className="fc-label">{WORKFIELD_FIELDS[1].default}</label>
                    <input
                      className="fc-input" type="text"
                      value={wf[WORKFIELD_FIELDS[1].key]}
                      onChange={e => updateWorkfield(molId, WORKFIELD_FIELDS[1].key, e.target.value)}
                    />
                  </div>
                </div>
                <div className="fc-row">
                  <div className="fc-group" style={{ marginBottom: 0 }}>
                    <label className="fc-label">{WORKFIELD_FIELDS[2].default}</label>
                    <input
                      className="fc-input" type="text"
                      value={wf[WORKFIELD_FIELDS[2].key]}
                      onChange={e => updateWorkfield(molId, WORKFIELD_FIELDS[2].key, e.target.value)}
                    />
                  </div>
                  <div className="fc-group" style={{ marginBottom: 0 }}>
                    <label className="fc-label">{WORKFIELD_FIELDS[3].default}</label>
                    <input
                      className="fc-input" type="text"
                      value={wf[WORKFIELD_FIELDS[3].key]}
                      onChange={e => updateWorkfield(molId, WORKFIELD_FIELDS[3].key, e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="ov-modal-foot">
                <button type="button" className="fc-btn-secondary" onClick={() => setWorkfieldsTarget(null)}>Done</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Edit Labels modal ── */}
      {labelsTarget && (() => {
        const lb = extras[labelsTarget.id]?.labels ?? DEFAULT_LABELS;
        const molId = labelsTarget.id;
        return (
          <div className="ov-modal-overlay" onClick={() => setLabelsTarget(null)}>
            <div className="ov-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
              <div className="ov-modal-header">
                <div className="ov-modal-eyebrow">Edit Labels · {labelsTarget.name}</div>
                <button type="button" className="ov-modal-close" onClick={() => setLabelsTarget(null)} aria-label="Close">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <div className="ov-modal-body">
                <div className="fc-hint" style={{ marginTop: 0, marginBottom: '14px' }}>
                  Rename any of the four stack labels. These apply across all quadrants for this molecule.
                </div>
                <div className="fc-row" style={{ marginBottom: '14px' }}>
                  <div className="fc-group" style={{ marginBottom: 0 }}>
                    <label className="fc-label">{LABEL_FIELDS[0].default}</label>
                    <input
                      className="fc-input" type="text"
                      value={lb[LABEL_FIELDS[0].key]}
                      onChange={e => updateLabel(molId, LABEL_FIELDS[0].key, e.target.value)}
                    />
                  </div>
                  <div className="fc-group" style={{ marginBottom: 0 }}>
                    <label className="fc-label">{LABEL_FIELDS[1].default}</label>
                    <input
                      className="fc-input" type="text"
                      value={lb[LABEL_FIELDS[1].key]}
                      onChange={e => updateLabel(molId, LABEL_FIELDS[1].key, e.target.value)}
                    />
                  </div>
                </div>
                <div className="fc-row">
                  <div className="fc-group" style={{ marginBottom: 0 }}>
                    <label className="fc-label">{LABEL_FIELDS[2].default}</label>
                    <input
                      className="fc-input" type="text"
                      value={lb[LABEL_FIELDS[2].key]}
                      onChange={e => updateLabel(molId, LABEL_FIELDS[2].key, e.target.value)}
                    />
                  </div>
                  <div className="fc-group" style={{ marginBottom: 0 }}>
                    <label className="fc-label">{LABEL_FIELDS[3].default}</label>
                    <input
                      className="fc-input" type="text"
                      value={lb[LABEL_FIELDS[3].key]}
                      onChange={e => updateLabel(molId, LABEL_FIELDS[3].key, e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="ov-modal-foot">
                <button type="button" className="fc-btn-secondary" onClick={() => setLabelsTarget(null)}>Done</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Change Lead modal ── */}
      {leadTarget && (
        <div className="ov-modal-overlay" onClick={() => setLeadTarget(null)}>
          <div className="ov-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" style={{ maxWidth: '480px' }}>
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
