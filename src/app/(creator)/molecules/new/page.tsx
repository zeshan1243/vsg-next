'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, type ReactNode } from 'react';

type TemplateId = 'okr' | 'event' | 'research';
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

const TEMPLATE_FIELDS: Record<TemplateId, [string, string, string, string]> = {
  okr:      ['Objective', 'Key Result 1', 'Key Result 2', 'Key Result 3'],
  event:    ['Event Name', 'Event Date', 'Venue', 'Expected Attendance'],
  research: ['Research Question', 'Methodology', 'Timeline', 'Deliverables'],
};

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
  const [objective, setObjective] = useState('');
  const [date, setDate] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [template, setTemplate] = useState<TemplateId>('okr');
  const [lead, setLead] = useState('self');
  const [submitting, setSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  const missionFilled = !!(name.trim() && objective.trim());
  const canSubmit = missionFilled && !submitting;

  const stepStatus = (s: 1 | 2 | 3): 'done' | 'active' | 'future' =>
    activeStep > s ? 'done' : activeStep === s ? 'active' : 'future';
  const s1 = stepStatus(1);
  const s2 = stepStatus(2);
  const s3 = stepStatus(3);

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

          {/* ── Main form (GCP-style stepper) ── */}
          <div>
            <div className="creator-stepper">

              {/* Step 1: Project Mission */}
              <div className={`stepper-item ${s1}`}>
                <div className="stepper-rail">
                  <div className="stepper-dot">
                    {s1 === 'done' ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : '1'}
                  </div>
                </div>
                <div className="stepper-content">
                  <div className={`stepper-header${s1 !== 'active' ? ' collapsed' : ''}`}>
                    <div className="stepper-titlewrap">
                      <div className="stepper-title">Project Mission</div>
                      <div className="stepper-desc">Define the vision and objectives for your new Molecule workspace</div>
                    </div>
                  </div>
                  {s1 === 'active' && (
                    <div className="stepper-active-body">
                      <div className="stepper-body">
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

                        <div className="fc-group">
                          <label className="fc-label" htmlFor="objective">
                            High-Level Objective <span className="req">*</span>
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
                      </div>
                      <div className="stepper-actions">
                        <button
                          type="button"
                          className="fc-btn-primary"
                          onClick={() => setActiveStep(2)}
                          disabled={!missionFilled}
                        >
                          Continue
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2: Template */}
              <div className={`stepper-item ${s2}`}>
                <div className="stepper-rail">
                  <div className="stepper-dot">
                    {s2 === 'done' ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : '2'}
                  </div>
                </div>
                <div className="stepper-content">
                  <div className={`stepper-header${s2 !== 'active' ? ' collapsed' : ''}`}>
                    <div className="stepper-titlewrap">
                      <div className="stepper-title">Template</div>
                      <div className="stepper-desc">Start with a pre-built structure or build from scratch</div>
                    </div>
                  </div>
                  {s2 === 'active' && (
                    <div className="stepper-active-body">
                      <div className="stepper-body">
                        <div className="fc-group">
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

                        <div className="tmpl-fields">
                          <div className="tmpl-fields-title">
                            {TEMPLATES.find(t => t.id === template)?.name} includes
                          </div>
                          <div className="tmpl-fields-grid">
                            {TEMPLATE_FIELDS[template].map((label, idx) => (
                              <div key={`${template}-${idx}`} className="tmpl-field-pill">
                                <span className="tmpl-field-num">{idx + 1}</span>
                                <span className="tmpl-field-label">{label}</span>
                              </div>
                            ))}
                          </div>
                          <div className="fc-hint" style={{ marginTop: 10 }}>
                            These fields are pre-configured by your admin and will be created with the molecule.
                          </div>
                        </div>
                      </div>
                      <div className="stepper-actions">
                        <button
                          type="button"
                          className="fc-btn-secondary"
                          onClick={() => setActiveStep(1)}
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          className="fc-btn-primary"
                          onClick={() => setActiveStep(3)}
                        >
                          Continue
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 3: Lead */}
              <div className={`stepper-item ${s3}`}>
                <div className="stepper-rail">
                  <div className="stepper-dot">3</div>
                </div>
                <div className="stepper-content">
                  <div className={`stepper-header${s3 !== 'active' ? ' collapsed' : ''}`}>
                    <div className="stepper-titlewrap">
                      <div className="stepper-title">Assign Lead</div>
                      <div className="stepper-desc">The Lead executes the Vision to meet Objectives. You can assign yourself or a team member.</div>
                    </div>
                  </div>
                  {s3 === 'active' && (
                    <div className="stepper-active-body">
                      <div className="stepper-body">
                        <div className="fc-group">
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
                      </div>
                      <div className="stepper-actions">
                        <button
                          type="button"
                          className="fc-btn-secondary"
                          onClick={() => setActiveStep(2)}
                        >
                          Back
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
                  )}
                </div>
              </div>

            </div>

          </div>

          {/* ── Side panel ── */}
          <div className="side-panel">

            {/* Molecule Structure — roles */}
            <div className="info-card">
              <div className="info-card-header">
                <div className="info-card-title">Roles, Hierarchy &amp; Permissions</div>
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
                <div className="info-card-title">Molecule Anatomy</div>
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

          </div>

        </div>
      </div>
    </>
  );
}
