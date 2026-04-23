'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, type ReactNode } from 'react';

type TemplateId = 'blank' | 'okr' | 'event' | 'research';
type Priority = 'high' | 'medium' | 'low';

interface Template {
  id: TemplateId;
  name: string;
  desc: string;
  iconClass: 'gold' | 'cyan' | 'green' | 'purple';
  icon: ReactNode;
}

const TEMPLATES: Template[] = [
  {
    id: 'blank', name: 'Blank', desc: 'Start from scratch', iconClass: 'purple',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="12" y1="3" x2="12" y2="21" /><line x1="3" y1="12" x2="21" y2="12" />
      </svg>
    ),
  },
  {
    id: 'okr', name: 'OKR Starter', desc: 'Pre-built OKR structure', iconClass: 'gold',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20V10M18 20V4M6 20v-4" />
      </svg>
    ),
  },
  {
    id: 'event', name: 'Event Planning', desc: 'Events & fundraisers', iconClass: 'cyan',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    ),
  },
  {
    id: 'research', name: 'Research', desc: 'Knowledge-driven projects', iconClass: 'green',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
];

const LEADS = [
  { id: 'self',   label: 'Sarah Kaplan (You — Creator as Lead)' },
  { id: 'marcus', label: 'Marcus Reeves' },
  { id: 'aisha',  label: 'Aisha Patel' },
  { id: 'lisa',   label: 'Lisa Wong' },
  { id: 'invite', label: '+ Invite new member' },
];

export default function NewMoleculePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [vision, setVision] = useState('');
  const [objective, setObjective] = useState('');
  const [date, setDate] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [template, setTemplate] = useState<TemplateId>('okr');
  const [lead, setLead] = useState('self');
  const [submitting, setSubmitting] = useState(false);

  const missionFilled = !!(name.trim() && vision.trim() && objective.trim());
  const canSubmit = missionFilled && !submitting;

  function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setTimeout(() => router.push('/molecules'), 900);
  }

  return (
    <>
      {/* ── Topbar ── */}
      <div className="topbar">
        <div className="topbar-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Link href="/molecules" className="topbar-back">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back
            </Link>
            <div className="page-title">Create New Molecule</div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="creator-content">
        <div className="form-layout">

          {/* ── Main form ── */}
          <div>
            <div className="panel-card">
              <div className="panel-card-header">
                <div className="panel-card-title">Project Mission</div>
                <div className="panel-card-sub">Define the vision and objectives for your new Molecule workspace</div>
              </div>
              <div className="panel-card-body">

                {/* Name */}
                <div className="fc-group">
                  <label className="fc-label" htmlFor="name">
                    Molecule Name <span className="req">*</span>
                  </label>
                  <input
                    id="name"
                    className="fc-input"
                    type="text"
                    placeholder="e.g., Q4 Product Launch, Annual Fundraiser"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                  <div className="fc-hint">Choose a clear, descriptive name for your project.</div>
                </div>

                {/* Vision */}
                <div className="fc-group">
                  <label className="fc-label" htmlFor="vision">
                    Vision Statement <span className="req">*</span>
                  </label>
                  <textarea
                    id="vision"
                    className="fc-textarea"
                    placeholder="Describe the overarching vision for this project. What does success look like?"
                    value={vision}
                    onChange={e => setVision(e.target.value)}
                  />
                  <div className="fc-hint">The vision drives all objectives, KPIs, jobs and tasks within this Molecule.</div>
                </div>

                {/* Objective */}
                <div className="fc-group">
                  <label className="fc-label" htmlFor="objective">
                    Senior-Level Objective <span className="req">*</span>
                  </label>
                  <textarea
                    id="objective"
                    className="fc-textarea"
                    placeholder="Define the primary objective that will cascade down through the organization."
                    style={{ minHeight: '80px' }}
                    value={objective}
                    onChange={e => setObjective(e.target.value)}
                  />
                </div>

                {/* Date + Priority */}
                <div className="fc-row">
                  <div className="fc-group">
                    <label className="fc-label" htmlFor="date">Target Date</label>
                    <input
                      id="date"
                      className="fc-input"
                      type="date"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                    />
                  </div>
                  <div className="fc-group">
                    <label className="fc-label" htmlFor="priority">Priority</label>
                    <select
                      id="priority"
                      className="fc-select"
                      value={priority}
                      onChange={e => setPriority(e.target.value as Priority)}
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>

                <div className="form-divider" />

                {/* Template */}
                <div className="fc-group">
                  <label className="fc-label">Template (Optional)</label>
                  <div className="fc-hint" style={{ marginTop: 0, marginBottom: '10px' }}>
                    Start with a pre-built structure or build from scratch.
                  </div>
                  <div className="tmpl-grid">
                    {TEMPLATES.map(t => (
                      <div
                        key={t.id}
                        className={`tmpl-option${template === t.id ? ' selected' : ''}`}
                        onClick={() => setTemplate(t.id)}
                      >
                        <div className={`tmpl-option-icon ${t.iconClass}`}>{t.icon}</div>
                        <div>
                          <div className="tmpl-option-name">{t.name}</div>
                          <div className="tmpl-option-desc">{t.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-divider" />

                {/* Assign Lead */}
                <div className="fc-group">
                  <label className="fc-label" htmlFor="lead">
                    Assign Lead <span className="req">*</span>
                  </label>
                  <div className="fc-hint" style={{ marginTop: 0, marginBottom: '8px' }}>
                    The Lead executes the Vision to meet Objectives. You can assign yourself or a team member.
                  </div>
                  <select
                    id="lead"
                    className="fc-select"
                    value={lead}
                    onChange={e => setLead(e.target.value)}
                  >
                    {LEADS.map(l => (
                      <option key={l.id} value={l.id}>{l.label}</option>
                    ))}
                  </select>
                </div>

                {/* Actions */}
                <div className="form-actions">
                  <button
                    type="button"
                    className="fc-btn-secondary"
                    onClick={() => router.push('/molecules')}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="fc-btn-primary"
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                    {submitting ? 'Creating…' : 'Create Molecule'}
                  </button>
                </div>

              </div>
            </div>
          </div>

          {/* ── Side panel ── */}
          <div className="side-panel">

            {/* Setup Progress */}
            <div className="info-card">
              <div className="info-card-header">
                <div className="info-card-title">Setup Progress</div>
              </div>
              <div className="info-card-body">
                <div className="setup-steps">
                  <div className={`setup-step ${missionFilled ? 'done' : 'active'}`}>
                    <div className="setup-step-dot">
                      {missionFilled ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : '1'}
                    </div>
                    <div>
                      <div className="setup-step-title">Project Mission</div>
                      <div className="setup-step-desc">Name, vision &amp; objectives</div>
                    </div>
                  </div>
                  <div className={`setup-step ${missionFilled ? 'active' : ''}`}>
                    <div className="setup-step-dot">2</div>
                    <div>
                      <div className="setup-step-title">Template &amp; Lead</div>
                      <div className="setup-step-desc">Choose structure &amp; assign lead</div>
                    </div>
                  </div>
                  <div className="setup-step">
                    <div className="setup-step-dot">3</div>
                    <div>
                      <div className="setup-step-title">Review &amp; Create</div>
                      <div className="setup-step-desc">Confirm and launch molecule</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Molecule Structure — roles */}
            <div className="info-card">
              <div className="info-card-header">
                <div className="info-card-title">Molecule Structure</div>
              </div>
              <div className="info-card-body" style={{ padding: '12px 16px' }}>
                <div className="ms-role-row">
                  <div className="ms-role-icon gold">C</div>
                  <div className="ms-role-body">
                    <div className="ms-role-name">Creator</div>
                    <div className="ms-role-desc">Creates the molecule, defines objectives &amp; assigns leads</div>
                  </div>
                  <span className="ms-badge gold">Owner</span>
                </div>
                <div className="ms-role-row">
                  <div className="ms-role-icon gold">L</div>
                  <div className="ms-role-body">
                    <div className="ms-role-name">Lead</div>
                    <div className="ms-role-desc">Oversees all 4 quadrants, reviews &amp; approves submissions</div>
                  </div>
                  <span className="ms-badge gold">All Quads</span>
                </div>
                <div className="ms-role-row">
                  <div className="ms-role-icon cyan">S</div>
                  <div className="ms-role-body">
                    <div className="ms-role-name">Stump</div>
                    <div className="ms-role-desc">Manages a single quadrant, reviews sub-stump work</div>
                  </div>
                  <span className="ms-badge cyan">Per Quad</span>
                </div>
                <div className="ms-role-row" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                  <div className="ms-role-icon purple">SS</div>
                  <div className="ms-role-body">
                    <div className="ms-role-name">Sub-Stump</div>
                    <div className="ms-role-desc">Executes tasks, submits work to Stump for review</div>
                  </div>
                  <span className="ms-badge purple">Per Quad</span>
                </div>
              </div>
            </div>

            {/* Molecule Structure — Outer Stack */}
            <div className="info-card">
              <div className="info-card-header">
                <div className="info-card-title">Molecule Structure <span style={{ fontWeight: 400, color: 'var(--muted)', fontSize: '12px' }}>( Outer Stack )</span></div>
              </div>
              <div className="info-card-body" style={{ padding: '14px 16px' }}>
                <div className="ms-quad-grid">
                  <div className="ms-quad-cell red">
                    <div className="ms-quad-label">Q·C</div>
                    <div className="ms-quad-name">Knowledge</div>
                  </div>
                  <div className="ms-quad-cell green">
                    <div className="ms-quad-label">Q·D</div>
                    <div className="ms-quad-name">Exchange</div>
                  </div>
                  <div className="ms-quad-cell gold">
                    <div className="ms-quad-label">Q·A</div>
                    <div className="ms-quad-name">Coordination</div>
                  </div>
                  <div className="ms-quad-cell blue">
                    <div className="ms-quad-label">Q·B</div>
                    <div className="ms-quad-name">Communication</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Molecule Structure — Inner Stack */}
            <div className="info-card">
              <div className="info-card-header">
                <div className="info-card-title">Molecule Structure <span style={{ fontWeight: 400, color: 'var(--muted)', fontSize: '12px' }}>( Inner Stack )</span></div>
              </div>
              <div className="info-card-body" style={{ padding: '14px 16px' }}>
                <div className="inner-stack-grid">
                  {(['jobs', 'tasks', 'okrs', 'kpis'] as const).map(key => (
                    <div key={key} className={`stack-cell ${key}`}>
                      <div className="stack-cell-label">
                        {key === 'jobs' ? 'Jobs' : key === 'tasks' ? 'Tasks' : key === 'okrs' ? 'OKRs' : 'KPIs'}
                      </div>
                      <div className="stack-pills">
                        {['Locations', 'Attendance', 'Vendors', 'Partners'].map(p => (
                          <div key={p} className="stack-pill">{p}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </>
  );
}
