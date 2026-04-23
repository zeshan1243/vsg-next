'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { MOLECULES } from '@/lib/molecules';

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

export default function MoleculesPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOLECULES.filter(m => {
      if (filter !== 'all' && m.status !== filter) return false;
      if (!q) return true;
      return m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q);
    });
  }, [query, filter]);

  return (
    <>
      {/* ── Topbar ── */}
      <div className="topbar">
        <div className="topbar-left">
          <div className="page-title">My Molecules</div>
          <div className="page-subtitle">
            {MOLECULES.length} molecules across your workspace
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
    </>
  );
}
