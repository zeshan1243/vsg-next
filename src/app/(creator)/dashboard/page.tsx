'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MOLECULES, MOLECULE_STATE_CONFIG, getMoleculeStateCounts, type MoleculeState } from '@/lib/molecules';
import {
  getStumpAssignedQuads,
  getStumpSubmittedQuads,
  getSubStumpAssignments,
  getSubStumpSubmittedSteps,
  TOTAL_STEPS,
  type Quad,
  type SubStumpAssignment,
} from '@/lib/progress';
import { useRole } from '@/lib/useRole';

const STATE_ORDER: MoleculeState[] = ['draft', 'active', 'paused', 'completed', 'archived'];

function BarChart({ rows, total }: { rows: { label: string; count: number; color: string }[]; total: number }) {
  return (
    <div className="dash-bars">
      {rows.map(row => {
        const pct = total > 0 ? (row.count / total) * 100 : 0;
        return (
          <div key={row.label} className="dash-bar-row">
            <div className="dash-bar-label">{row.label}</div>
            <div className="dash-bar-track">
              <div
                className="dash-bar-fill"
                style={{
                  width: `${pct}%`,
                  background: row.color,
                  minWidth: row.count > 0 ? '6px' : '0',
                }}
              />
            </div>
            <div className="dash-bar-count">{row.count}</div>
            <div className="dash-bar-pct">{pct > 0 ? `${Math.round(pct)}%` : '—'}</div>
          </div>
        );
      })}
    </div>
  );
}

const MEMBER_ROLES = [
  { role: 'Creator', count: 1, color: '#FFAB00' },
  { role: 'Lead',    count: 3, color: '#38BDF8' },
  { role: 'Member',  count: 8, color: '#3BB87F' },
  { role: 'Viewer',  count: 4, color: '#64748B' },
];
const TOTAL_MEMBERS = MEMBER_ROLES.reduce((sum, r) => sum + r.count, 0);

const INVITATION_STATUS = [
  { status: 'Accepted', count: 12, color: '#3BB87F' },
  { status: 'Pending',  count: 5,  color: '#FFAB00' },
  { status: 'Expired',  count: 3,  color: '#64748B' },
  { status: 'Declined', count: 2,  color: '#EF4444' },
];
const TOTAL_INVITATIONS = INVITATION_STATUS.reduce((sum, s) => sum + s.count, 0);
const PENDING_INVITES = INVITATION_STATUS.find(s => s.status === 'Pending')?.count ?? 0;

type AttentionType = 'lead-substitute' | 'pending-invitation' | 'overdue-task' | 'request-pending' | 'flag-raised';
type Priority = 'high' | 'medium' | 'low';

interface AttentionItem {
  id: number;
  type: AttentionType;
  title: string;
  molecule: string;
  moleculeId: string;
  description: string;
  time: string;
  priority: Priority;
}

const ATTENTION_ITEMS: AttentionItem[] = [
  { id: 1,  type: 'lead-substitute',    title: 'Lead Substitute Required',   molecule: 'Q3 Product Launch',          moleculeId: 'q3-product-launch',         description: 'A. Patel is unavailable. Assign a substitute lead.',           time: '2h ago', priority: 'high'   },
  { id: 2,  type: 'pending-invitation', title: 'Pending Invitation',         molecule: 'Premier Wedding Expo',       moleculeId: 'premier-wedding-expo',      description: 'Invitation to J. Martinez awaiting response for 3 days.',      time: '3d ago', priority: 'medium' },
  { id: 3,  type: 'pending-invitation', title: 'Pending Invitation',         molecule: 'Community Outreach Plan',    moleculeId: 'community-outreach-plan',   description: 'Invitation to R. Chen awaiting response for 5 days.',          time: '5d ago', priority: 'medium' },
  { id: 4,  type: 'lead-substitute',    title: 'Lead Handoff Needed',        molecule: 'Brand Refresh 2026',         moleculeId: 'brand-refresh-2026',        description: 'Draft molecule needs a lead assignment to proceed.',           time: '1d ago', priority: 'high'   },
  { id: 5,  type: 'overdue-task',       title: 'Overdue Task',               molecule: 'Q3 Product Launch',          moleculeId: 'q3-product-launch',         description: 'Vendor contract review past due date by 2 days.',              time: '2d ago', priority: 'high'   },
  { id: 6,  type: 'request-pending',    title: 'Approval Request',           molecule: 'Premier Wedding Expo',       moleculeId: 'premier-wedding-expo',      description: 'Marketing budget increase request awaiting your decision.',    time: '6h ago', priority: 'medium' },
  { id: 7,  type: 'flag-raised',        title: 'Flag Raised on Quadrant B',  molecule: 'Community Outreach Plan',    moleculeId: 'community-outreach-plan',   description: 'Stump flagged a KPI mismatch — review and resolve.',           time: '4h ago', priority: 'high'   },
  { id: 8,  type: 'pending-invitation', title: 'Pending Invitation',         molecule: 'Brand Refresh 2026',         moleculeId: 'brand-refresh-2026',        description: 'Invitation to L. Walsh awaiting response for 7 days.',         time: '7d ago', priority: 'low'    },
  { id: 9,  type: 'overdue-task',       title: 'Overdue Task',               molecule: 'Premier Wedding Expo',       moleculeId: 'premier-wedding-expo',      description: 'Floral vendor onboarding overdue by 1 day.',                   time: '1d ago', priority: 'medium' },
  { id: 10, type: 'request-pending',    title: 'Resource Request',           molecule: 'Q3 Product Launch',          moleculeId: 'q3-product-launch',         description: '2 additional engineers requested for sprint support.',         time: '2d ago', priority: 'low'    },
];

const AUDIT_FEED = [
  { id: 1, action: 'created',   user: 'Sarah Kaplan',  target: 'Brand Refresh 2026',   time: '10 min ago', icon: 'plus' },
  { id: 2, action: 'invited',   user: 'Sarah Kaplan',  target: 'J. Martinez',          time: '2h ago',     icon: 'mail' },
  { id: 3, action: 'completed', user: 'Marcus Reeves', target: 'Quadrant A',           time: '3h ago',     icon: 'check' },
  { id: 4, action: 'updated',   user: 'Elena Torres',  target: 'Q3 Product Launch',    time: '5h ago',     icon: 'edit' },
  { id: 5, action: 'joined',    user: 'David Kim',     target: 'Premier Wedding Expo', time: '1d ago',     icon: 'user-plus' },
  { id: 6, action: 'submitted', user: 'Mike Chan',     target: 'Vendor Contract',      time: '1d ago',     icon: 'file' },
  { id: 7, action: 'approved',  user: 'Sarah Kaplan',  target: 'Budget Request',       time: '2d ago',     icon: 'check-circle' },
  { id: 8, action: 'commented', user: 'Jenna Brooks',  target: 'Location Selection',   time: '2d ago',     icon: 'message' },
];

const ACTIVE_USERS = [
  { id: 1, name: 'Sarah Kaplan',  initials: 'SK', role: 'Creator', gradient: 'linear-gradient(135deg, #FFAB00, #FFD54F)', online: true  },
  { id: 2, name: 'Marcus Reeves', initials: 'MR', role: 'Lead',    gradient: 'linear-gradient(135deg, #3B82F6, #60A5FA)', online: true  },
  { id: 3, name: 'Elena Torres',  initials: 'ET', role: 'Member',  gradient: 'linear-gradient(135deg, #22C55E, #4ADE80)', online: true  },
  { id: 4, name: 'Mike Chan',     initials: 'MC', role: 'Member',  gradient: 'linear-gradient(135deg, #EF4444, #F87171)', online: true  },
  { id: 5, name: 'David Kim',     initials: 'DK', role: 'Member',  gradient: 'linear-gradient(135deg, #EC4899, #F9A8D4)', online: false },
  { id: 6, name: 'Jenna Brooks',  initials: 'JB', role: 'Viewer',  gradient: 'linear-gradient(135deg, #8B5CF6, #A78BFA)', online: true  },
  { id: 7, name: 'Liam Walker',   initials: 'LW', role: 'Viewer',  gradient: 'linear-gradient(135deg, #0F172A, #334155)', online: false },
];

function formatToday(): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  }).format(new Date());
}

const FEED_ICONS: Record<string, React.ReactNode> = {
  'plus':         <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
  'mail':         <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--gold)"    strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>,
  'check':        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>,
  'edit':         <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)"    strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
  'user-plus':    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>,
  'file':         <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--muted)"   strokeWidth="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><polyline points="13 2 13 9 20 9" /></svg>,
  'check-circle': <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
  'message':      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)"    strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
};

const ATTENTION_ICONS: Record<AttentionType, React.ReactNode> = {
  'lead-substitute':    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  'pending-invitation': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>,
  'overdue-task':       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  'request-pending':    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
  'flag-raised':        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></svg>,
};

type ChartTab = 'pipeline' | 'members' | 'invitations';

const QUAD_LABELS: Record<Quad, { letter: string; phase: string; artifact: string; color: string }> = {
  a: { letter: 'A', phase: 'Coordinate',    artifact: 'OKRs',  color: '#FFAB00' },
  b: { letter: 'B', phase: 'Communication', artifact: 'KPIs',  color: '#3B82F6' },
  c: { letter: 'C', phase: 'Knowledge',     artifact: 'Jobs',  color: '#EF4444' },
  d: { letter: 'D', phase: 'Exchange',      artifact: 'Tasks', color: '#22C55E' },
};

// Mock Sub-Stumps under the active Stump. In a real app these come from
// /members filtered by quadrant assignment.
const STUMP_SUBSTUMPS = [
  { id: 's1', name: 'James Thompson', initials: 'JT', role: 'Sub-Stump · Q-A', gradient: 'linear-gradient(135deg, #38BDF8, #7DD3FC)', online: true  },
  { id: 's2', name: 'Aisha Reddy',    initials: 'AR', role: 'Sub-Stump · Q-A', gradient: 'linear-gradient(135deg, #8B5CF6, #A78BFA)', online: true  },
  { id: 's3', name: 'Carlos Mendez',  initials: 'CM', role: 'Sub-Stump · Q-A', gradient: 'linear-gradient(135deg, #EF4444, #F87171)', online: false },
  { id: 's4', name: 'Priya Nair',     initials: 'PN', role: 'Sub-Stump · Q-A', gradient: 'linear-gradient(135deg, #22C55E, #4ADE80)', online: true  },
];

// Recent activity feed for a Stump — only their Sub-Stumps' actions.
const STUMP_AUDIT_FEED = [
  { id: 1, action: 'submitted', user: 'James Thompson', target: 'Vendor Outreach Task', time: '15 min ago', icon: 'file'         },
  { id: 2, action: 'completed', user: 'James Thompson', target: 'Quadrant A — Step 4',  time: '1h ago',     icon: 'check'        },
  { id: 3, action: 'commented', user: 'Aisha Reddy',    target: 'OKR draft',            time: '3h ago',     icon: 'message'      },
  { id: 4, action: 'updated',   user: 'Priya Nair',     target: 'Vendor list',          time: '5h ago',     icon: 'edit'         },
  { id: 5, action: 'joined',    user: 'Carlos Mendez',  target: 'Quadrant A',           time: '1d ago',     icon: 'user-plus'    },
  { id: 6, action: 'submitted', user: 'Aisha Reddy',    target: 'KPI draft',            time: '2d ago',     icon: 'file'         },
  { id: 7, action: 'approved',  user: 'James Thompson', target: 'Partner shortlist',    time: '2d ago',     icon: 'check-circle' },
];

// Mock attention items for a Sub-Stump — multiple molecules with different Stumps.
const SUBSTUMP_ATTENTION_ITEMS: AttentionItem[] = [
  { id: 201, type: 'request-pending', title: 'Awaiting Stump Approval', molecule: 'Premier Wedding Expo',    moleculeId: 'premier-wedding-expo',    description: 'Q-A OKRs submitted to Maria Chen for review.',     time: '15m ago', priority: 'medium' },
  { id: 202, type: 'flag-raised',     title: 'Stump Requested Changes', molecule: 'Premier Wedding Expo',    moleculeId: 'premier-wedding-expo',    description: 'Maria Chen asked for tighter Q-A vendor scoping.', time: '1h ago',  priority: 'high'   },
  { id: 204, type: 'overdue-task',    title: 'Step Overdue',            molecule: 'Community Outreach Plan', moleculeId: 'community-outreach-plan', description: 'Q-B KPI step has been open with Elena Torres for 5 days.', time: '5d ago',  priority: 'high'   },
];

// Mock attention items relevant to a Stump (lead feedback, sub-stump prompts).
const STUMP_ATTENTION_ITEMS: AttentionItem[] = [
  { id: 101, type: 'request-pending',    title: 'Awaiting Lead Review',     molecule: 'Premier Wedding Expo', moleculeId: 'premier-wedding-expo', description: 'Quadrant A submission is pending Lead approval.',          time: '1h ago', priority: 'medium' },
  { id: 102, type: 'flag-raised',        title: 'Lead Requested Changes',   molecule: 'Premier Wedding Expo', moleculeId: 'premier-wedding-expo', description: 'Marcus Reeves asked for adjustments on Quadrant A KPIs.',  time: '3h ago', priority: 'high'   },
  { id: 103, type: 'pending-invitation', title: 'Sub-Stump Onboarding',     molecule: 'Premier Wedding Expo', moleculeId: 'premier-wedding-expo', description: 'James Thompson hasn’t accepted Quadrant A assignment yet.', time: '1d ago', priority: 'low'    },
];

export default function DashboardPage() {
  const router = useRouter();
  const { roleLabel, canCreateMolecule, isStump, isSubStump } = useRole();
  const [today, setToday] = useState('');
  const [chartTab, setChartTab] = useState<ChartTab>('pipeline');
  const [attentionFilter, setAttentionFilter] = useState<'all' | Priority>('all');
  const [stumpAssigned, setStumpAssigned] = useState<Quad[]>([]);
  const [stumpSubmittedByMol, setStumpSubmittedByMol] = useState<Record<string, Quad[]>>({});
  const [subStumpAssignments, setSubStumpAssignments] = useState<SubStumpAssignment[]>([]);
  // submittedStepsByKey['<molId>:<quad>'] = number[] of steps submitted.
  const [subStumpSubmittedByKey, setSubStumpSubmittedByKey] = useState<Record<string, number[]>>({});

  useEffect(() => {
    if (isStump) {
      setStumpAssigned(getStumpAssignedQuads());
      const submitted: Record<string, Quad[]> = {};
      for (const mol of MOLECULES) submitted[mol.id] = getStumpSubmittedQuads(mol.id);
      setStumpSubmittedByMol(submitted);
    }
    if (isSubStump) {
      const assignments = getSubStumpAssignments();
      setSubStumpAssignments(assignments);
      const submittedByKey: Record<string, number[]> = {};
      for (const a of assignments) {
        for (const q of a.quads) {
          submittedByKey[`${a.moleculeId}:${q}`] = getSubStumpSubmittedSteps(a.moleculeId, q);
        }
      }
      setSubStumpSubmittedByKey(submittedByKey);
    }
  }, [isStump, isSubStump]);

  const stateCounts    = getMoleculeStateCounts();
  const totalMolecules = MOLECULES.length;

  // Stumps see a single demo molecule (Premier Wedding Expo) where they hold
  // the assigned Quadrant. In a real app this would come from the backend.
  const stumpMolecules = isStump ? MOLECULES.filter(m => m.id === 'premier-wedding-expo') : [];
  const totalSubmitted = Object.values(stumpSubmittedByMol).reduce((sum, qs) => sum + qs.length, 0);
  const totalAssignedSlots = isStump ? stumpMolecules.length * stumpAssigned.length : 0;
  const awaitingReview = totalSubmitted;
  const inProgressSlots = Math.max(0, totalAssignedSlots - totalSubmitted);

  // Sub-Stump aggregate metrics across all molecules they hold a Quadrant on.
  // Each row = one (molecule, quadrant) pair the Sub-Stump owns.
  const subStumpRows = isSubStump
    ? subStumpAssignments.flatMap(a => {
        const mol = MOLECULES.find(m => m.id === a.moleculeId);
        if (!mol) return [];
        return a.quads.map(q => {
          const submittedSteps = subStumpSubmittedByKey[`${a.moleculeId}:${q}`] ?? [];
          return {
            moleculeId: a.moleculeId,
            moleculeName: mol.name,
            quad: q,
            stump: a.stump,
            submittedCount: submittedSteps.length,
          };
        });
      })
    : [];
  const subStumpTotalQuads = subStumpRows.length;
  const subStumpTotalSteps = subStumpTotalQuads * TOTAL_STEPS;
  const subStumpSubmittedCount = subStumpRows.reduce((sum, r) => sum + r.submittedCount, 0);
  const subStumpRemainingSteps = Math.max(0, subStumpTotalSteps - subStumpSubmittedCount);
  // Distinct Stumps the Sub-Stump reports to across molecules.
  const subStumpStumps = (() => {
    const seen = new Set<string>();
    return subStumpRows
      .map(r => r.stump)
      .filter(s => (seen.has(s.name) ? false : (seen.add(s.name), true)));
  })();

  const activeAttention = isSubStump
    ? SUBSTUMP_ATTENTION_ITEMS
    : isStump
      ? STUMP_ATTENTION_ITEMS
      : ATTENTION_ITEMS;
  const attentionCounts: Record<'all' | Priority, number> = {
    all:    activeAttention.length,
    high:   activeAttention.filter(i => i.priority === 'high').length,
    medium: activeAttention.filter(i => i.priority === 'medium').length,
    low:    activeAttention.filter(i => i.priority === 'low').length,
  };
  const visibleAttention = attentionFilter === 'all'
    ? activeAttention
    : activeAttention.filter(i => i.priority === attentionFilter);

  useEffect(() => { setToday(formatToday()); }, []);

  // Roster:
  //   Sub-Stump → one entry per Stump they report to (across molecules)
  //   Stump     → their Sub-Stumps
  //   Others    → full active workspace
  const subStumpRoster = subStumpStumps.map((s, idx) => {
    // Aggregate which molecule/quadrant pairs this Stump reviews for the Sub-Stump.
    const responsibilities = subStumpRows
      .filter(r => r.stump.name === s.name)
      .map(r => `${r.moleculeName} · Q-${r.quad.toUpperCase()}`)
      .join(', ');
    return {
      id: `sub-stump-st-${idx}`,
      name: s.name,
      initials: s.initials,
      role: responsibilities || 'Stump',
      gradient: s.gradient,
      online: s.online,
    };
  });
  const teamRoster = isSubStump
    ? subStumpRoster
    : isStump
      ? STUMP_SUBSTUMPS
      : ACTIVE_USERS;
  const onlineCount = teamRoster.filter(u => u.online).length;
  const activityFeed = isStump ? STUMP_AUDIT_FEED : AUDIT_FEED;

  // ─── Reusable card JSX so the same content can be placed in different
  // layouts depending on the role.
  const myStumpsCard = (
    <div className="dash-card">
      <div className="dash-card-head">
        <div>
          <div className="dash-card-title">{isSubStump ? 'My Stumps' : isStump ? 'My Sub-Stumps' : 'Team Online'}</div>
          <div className="dash-card-sub">{onlineCount} of {teamRoster.length} active now</div>
        </div>
        <span className="dash-online-pulse">
          <span /> live
        </span>
      </div>
      <div className="dash-team-list">
        {/* Sub-Stumps see every Stump they report to (online or not).
            Other roles only see online teammates. */}
        {(isSubStump ? teamRoster : teamRoster.filter(user => user.online)).map(user => (
          <div key={user.id} className="dash-team-item">
            <div className="dash-team-av-wrap">
              <div className="dash-team-av" style={{ background: user.gradient }}>
                {user.initials}
              </div>
              <div className={`dash-team-online-dot${user.online ? ' on' : ''}`} />
            </div>
            <div className="dash-team-meta">
              <div className="dash-team-name">{user.name}</div>
              <div className="dash-team-role">{user.role}</div>
            </div>
            <div className={`dash-team-status${user.online ? ' on' : ''}`}>
              {user.online ? 'Online' : 'Offline'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const attentionCard = (
    <div className="attention-card">
      <div className="attention-card-header">
        <div className="attention-title-wrap">
          <span className="attention-pulse" />
          <span className="attention-title-text">Attention Required</span>
          <span className="attention-count-pill">{activeAttention.length}</span>
        </div>
        <div className="attention-filter">
          {(['all', 'high', 'medium', 'low'] as const).map(key => (
            <button
              key={key}
              type="button"
              className={`attention-filter-pill${attentionFilter === key ? ' active' : ''}`}
              onClick={() => setAttentionFilter(key)}
              disabled={key !== 'all' && attentionCounts[key] === 0}
            >
              {key === 'all' ? 'All' : key.charAt(0).toUpperCase() + key.slice(1)}
              <span className="attention-filter-count">{attentionCounts[key]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="attention-table-wrap">
        <table className="attention-table">
          <thead>
            <tr>
              <th style={{ width: '44px' }}></th>
              <th>Issue</th>
              <th style={{ width: '180px' }}>Molecule</th>
              <th style={{ width: '110px' }}>Priority</th>
              <th style={{ width: '90px', textAlign: 'right' }}>Time</th>
            </tr>
          </thead>
          <tbody>
            {visibleAttention.length === 0 && (
              <tr>
                <td colSpan={5} className="attention-empty">No items match this filter.</td>
              </tr>
            )}
            {visibleAttention.map(item => (
              <tr
                key={item.id}
                className={`attention-row priority-${item.priority}`}
                onClick={() => router.push(`/molecules/${item.moleculeId}`)}
              >
                <td>
                  <div className={`attention-item-icon type-${item.type}`}>
                    {ATTENTION_ICONS[item.type]}
                  </div>
                </td>
                <td>
                  <div className="attention-item-title">{item.title}</div>
                  <div className="attention-item-desc">{item.description}</div>
                </td>
                <td>
                  <span className="attention-mol-tag">{item.molecule}</span>
                </td>
                <td>
                  <span className={`attention-pri-tag pri-${item.priority}`}>
                    {item.priority === 'high' && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="6" /></svg>
                    )}
                    {item.priority === 'high' ? 'Urgent' : item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <span className="attention-item-time">{item.time}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <>
      {/* Topbar */}
      <div className="topbar">
        <div className="topbar-left">
          <div className="page-title">{roleLabel} Dashboard</div>
          <div className="page-subtitle">
            {today ? `${today} · Welcome back, Sarah` : 'Welcome back, Sarah'}
          </div>
        </div>
        <div className="topbar-actions">
          <div className="btn-icon" title="Notifications">
            <div className="notif-dot" />
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          {canCreateMolecule && (
            <button className="btn-primary-sm" type="button" onClick={() => router.push('/molecules/new')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New Molecule
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="creator-content dash">

        {/* Hero strip */}
        <div className="dash-hero">
          <div>
            <div className="dash-hero-eyebrow">
              {isSubStump || isStump ? `Welcome, ${roleLabel}` : 'Good morning, Sarah'}
            </div>
            <div className="dash-hero-title">
              {isSubStump
                ? 'Execute every assigned Quadrant step by step.'
                : isStump
                  ? 'Drive your assigned Quadrants to completion.'
                  : 'Your workspace is performing well.'}
            </div>
            <div className="dash-hero-sub">
              {isSubStump
                ? `${subStumpTotalQuads} assigned Quadrant${subStumpTotalQuads === 1 ? '' : 's'} across ${subStumpAssignments.length} molecule${subStumpAssignments.length === 1 ? '' : 's'} · ${subStumpStumps.length} Stump${subStumpStumps.length === 1 ? '' : 's'} reviewing · ${subStumpSubmittedCount}/${subStumpTotalSteps} steps submitted`
                : isStump
                  ? `${totalAssignedSlots} assigned Quadrant${totalAssignedSlots === 1 ? '' : 's'} · ${awaitingReview} awaiting Lead review · ${onlineCount} of ${teamRoster.length} Sub-Stumps online`
                  : `${stateCounts.active} active molecules · ${onlineCount} of ${teamRoster.length} teammates online`}
            </div>
          </div>
          <div className="dash-hero-meta">
            {isSubStump ? (
              <>
                <div className="dash-hero-stat">
                  <div className="dash-hero-stat-val">{subStumpSubmittedCount}</div>
                  <div className="dash-hero-stat-label">Submitted</div>
                </div>
                <div className="dash-hero-stat">
                  <div className="dash-hero-stat-val">{subStumpRemainingSteps}</div>
                  <div className="dash-hero-stat-label">Remaining</div>
                </div>
              </>
            ) : isStump ? (
              <>
                <div className="dash-hero-stat">
                  <div className="dash-hero-stat-val">{inProgressSlots}</div>
                  <div className="dash-hero-stat-label">In progress</div>
                </div>
                <div className="dash-hero-stat">
                  <div className="dash-hero-stat-val">{totalSubmitted}</div>
                  <div className="dash-hero-stat-label">Submitted</div>
                </div>
              </>
            ) : (
              <>
                <div className="dash-hero-stat">
                  <div className="dash-hero-stat-val">{stateCounts.active + stateCounts.paused}</div>
                  <div className="dash-hero-stat-label">In progress</div>
                </div>
                <div className="dash-hero-stat">
                  <div className="dash-hero-stat-val">{stateCounts.completed}</div>
                  <div className="dash-hero-stat-label">Completed</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* KPI strip */}
        <div className="dash-kpis">
          {isSubStump ? (
            <>
              <div className="dash-kpi">
                <div className="dash-kpi-icon green">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="12" y1="3" x2="12" y2="21" /><line x1="3" y1="12" x2="21" y2="12" />
                  </svg>
                </div>
                <div className="dash-kpi-body">
                  <div className="dash-kpi-value">{subStumpTotalQuads}</div>
                  <div className="dash-kpi-label">Assigned Quadrants</div>
                  <div className="dash-kpi-hint">across {subStumpAssignments.length} molecule{subStumpAssignments.length === 1 ? '' : 's'}</div>
                </div>
              </div>

              <div className="dash-kpi">
                <div className="dash-kpi-icon cyan">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <div className="dash-kpi-body">
                  <div className="dash-kpi-value">{subStumpSubmittedCount}</div>
                  <div className="dash-kpi-label">Steps Submitted</div>
                  <div className="dash-kpi-hint">of {subStumpTotalSteps} steps total</div>
                </div>
              </div>

              <div className="dash-kpi">
                <div className="dash-kpi-icon gold">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div className="dash-kpi-body">
                  <div className="dash-kpi-value">{subStumpStumps.length}</div>
                  <div className="dash-kpi-label">Stumps Reviewing</div>
                  <div className="dash-kpi-hint">{subStumpStumps.filter(s => s.online).length} online now</div>
                </div>
              </div>

              <div className="dash-kpi">
                <div className="dash-kpi-icon red">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <div className="dash-kpi-body">
                  <div className="dash-kpi-value">{activeAttention.length}</div>
                  <div className="dash-kpi-label">Needs Attention</div>
                  <div className="dash-kpi-hint">{attentionCounts.high} urgent · {attentionCounts.medium} medium</div>
                </div>
              </div>
            </>
          ) : isStump ? (
            <>
              <div className="dash-kpi">
                <div className="dash-kpi-icon green">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="12" y1="3" x2="12" y2="21" /><line x1="3" y1="12" x2="21" y2="12" />
                  </svg>
                </div>
                <div className="dash-kpi-body">
                  <div className="dash-kpi-value">{totalAssignedSlots}</div>
                  <div className="dash-kpi-label">Assigned Quadrants</div>
                  <div className="dash-kpi-hint">across {stumpMolecules.length} molecule{stumpMolecules.length === 1 ? '' : 's'}</div>
                </div>
              </div>

              <div className="dash-kpi">
                <div className="dash-kpi-icon cyan">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <div className="dash-kpi-body">
                  <div className="dash-kpi-value">{totalSubmitted}</div>
                  <div className="dash-kpi-label">Submitted to Lead</div>
                  <div className="dash-kpi-hint">work delivered for review</div>
                </div>
              </div>

              <div className="dash-kpi">
                <div className="dash-kpi-icon gold">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div className="dash-kpi-body">
                  <div className="dash-kpi-value">{awaitingReview}</div>
                  <div className="dash-kpi-label">Awaiting Lead Review</div>
                  <div className="dash-kpi-hint">{inProgressSlots} still in progress</div>
                </div>
              </div>

              <div className="dash-kpi">
                <div className="dash-kpi-icon red">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <div className="dash-kpi-body">
                  <div className="dash-kpi-value">{activeAttention.length}</div>
                  <div className="dash-kpi-label">Needs Attention</div>
                  <div className="dash-kpi-hint">{attentionCounts.high} urgent · {attentionCounts.medium} medium</div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="dash-kpi">
                <div className="dash-kpi-icon green">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r="8" />
                    <line x1="12" y1="2" x2="12" y2="4" /><line x1="12" y1="20" x2="12" y2="22" />
                    <line x1="2" y1="12" x2="4" y2="12" /><line x1="20" y1="12" x2="22" y2="12" />
                  </svg>
                </div>
                <div className="dash-kpi-body">
                  <div className="dash-kpi-value">{totalMolecules}</div>
                  <div className="dash-kpi-label">Total Molecules</div>
                  <div className="dash-kpi-hint">{stateCounts.active} active · {stateCounts.draft} draft</div>
                </div>
              </div>

              <div className="dash-kpi">
                <div className="dash-kpi-icon cyan">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div className="dash-kpi-body">
                  <div className="dash-kpi-value">{TOTAL_MEMBERS}</div>
                  <div className="dash-kpi-label">Members</div>
                  <div className="dash-kpi-hint">{MEMBER_ROLES.find(r => r.role === 'Lead')?.count ?? 0} leads · {MEMBER_ROLES.find(r => r.role === 'Viewer')?.count ?? 0} viewers</div>
                </div>
              </div>

              <div className="dash-kpi">
                <div className="dash-kpi-icon gold">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div className="dash-kpi-body">
                  <div className="dash-kpi-value">{PENDING_INVITES}</div>
                  <div className="dash-kpi-label">Pending Invitations</div>
                  <div className="dash-kpi-hint">{TOTAL_INVITATIONS} sent total</div>
                </div>
              </div>

              <div className="dash-kpi">
                <div className="dash-kpi-icon red">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <div className="dash-kpi-body">
                  <div className="dash-kpi-value">{ATTENTION_ITEMS.length}</div>
                  <div className="dash-kpi-label">Needs Attention</div>
                  <div className="dash-kpi-hint">{attentionCounts.high} urgent · {attentionCounts.medium} medium</div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Charts / My Quadrant(s) */}
        {isSubStump ? (
          <div className="dash-card">
            <div className="dash-card-head">
              <div>
                <div className="dash-card-title">My Quadrants</div>
                <div className="dash-card-sub">Each Quadrant is reviewed by a different Stump</div>
              </div>
              <span className="dash-card-meta">{subStumpSubmittedCount}/{subStumpTotalSteps} steps submitted</span>
            </div>
            <div className="dash-card-body">
              {subStumpRows.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
                  No Quadrants assigned yet. Your Stumps will assign work soon.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {subStumpRows.map(row => {
                    const meta = QUAD_LABELS[row.quad];
                    const status = row.submittedCount === 0
                      ? 'Not Started'
                      : row.submittedCount >= TOTAL_STEPS
                        ? 'All Submitted'
                        : `Step ${row.submittedCount + 1} of ${TOTAL_STEPS}`;
                    const statusBg = row.submittedCount >= TOTAL_STEPS ? 'rgba(59,184,127,.10)' : 'rgba(255,171,0,.10)';
                    const statusFg = row.submittedCount >= TOTAL_STEPS ? 'var(--success, #3BB87F)' : 'var(--gold, #FFAB00)';
                    return (
                      <button
                        key={`${row.moleculeId}-${row.quad}`}
                        type="button"
                        onClick={() => router.push(`/molecules/${row.moleculeId}/quadrant-${row.quad}`)}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '40px 1fr auto auto auto',
                          alignItems: 'center',
                          gap: 14,
                          padding: '12px 14px',
                          border: '1px solid var(--border)',
                          borderRadius: 10,
                          background: 'transparent',
                          textAlign: 'left',
                          cursor: 'pointer',
                        }}
                      >
                        <div
                          style={{
                            width: 36, height: 36, borderRadius: 8,
                            background: meta.color, color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 14, fontWeight: 700,
                          }}
                        >
                          Q{meta.letter}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>
                            {row.moleculeName} · Q-{meta.letter} {meta.phase}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                            Artifact: {meta.artifact}
                          </div>
                        </div>
                        <div
                          style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            paddingRight: 12, borderRight: '1px solid var(--border)',
                          }}
                          title={`Reports to ${row.stump.name}`}
                        >
                          <div
                            style={{
                              width: 24, height: 24, borderRadius: '50%',
                              background: row.stump.gradient, color: 'white',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 10, fontWeight: 700,
                            }}
                          >
                            {row.stump.initials}
                          </div>
                          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{row.stump.name}</span>
                        </div>
                        <span
                          style={{
                            padding: '4px 10px', borderRadius: 999,
                            background: statusBg, color: statusFg,
                            fontSize: 11, fontWeight: 700, letterSpacing: 0.2,
                          }}
                        >
                          {status}
                        </span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : isStump ? (
          <div className="dash-card">
            <div className="dash-card-head">
              <div>
                <div className="dash-card-title">My Quadrants</div>
                <div className="dash-card-sub">Quadrants assigned to you and their submission status</div>
              </div>
              <span className="dash-card-meta">{totalAssignedSlots} assigned</span>
            </div>
            <div className="dash-card-body">
              {stumpMolecules.length === 0 || stumpAssigned.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
                  You don’t have any Quadrants assigned yet. Your Lead will assign one soon.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {stumpMolecules.flatMap(mol =>
                    stumpAssigned.map(q => {
                      const meta = QUAD_LABELS[q];
                      const submitted = (stumpSubmittedByMol[mol.id] ?? []).includes(q);
                      const status = submitted ? 'Awaiting Lead Review' : 'In Progress';
                      const statusBg = submitted ? 'rgba(59,184,127,.10)' : 'rgba(255,171,0,.10)';
                      const statusFg = submitted ? 'var(--success, #3BB87F)' : 'var(--gold, #FFAB00)';
                      return (
                        <button
                          key={`${mol.id}-${q}`}
                          type="button"
                          onClick={() => router.push(`/molecules/${mol.id}/quadrant-${q}`)}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '40px 1fr auto auto',
                            alignItems: 'center',
                            gap: 14,
                            padding: '12px 14px',
                            border: '1px solid var(--border)',
                            borderRadius: 10,
                            background: 'transparent',
                            textAlign: 'left',
                            cursor: 'pointer',
                          }}
                        >
                          <div
                            style={{
                              width: 36, height: 36, borderRadius: 8,
                              background: meta.color, color: 'white',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 14, fontWeight: 700,
                            }}
                          >
                            Q{meta.letter}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>
                              {mol.name} · Q-{meta.letter} {meta.phase}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                              Artifact: {meta.artifact}
                            </div>
                          </div>
                          <span
                            style={{
                              padding: '4px 10px', borderRadius: 999,
                              background: statusBg, color: statusFg,
                              fontSize: 11, fontWeight: 700, letterSpacing: 0.2,
                            }}
                          >
                            {status}
                          </span>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </button>
                      );
                    }),
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="dash-card">
            <div className="dash-card-head dash-chart-head">
              <div className="dash-chart-tabs" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={chartTab === 'pipeline'}
                  className={`dash-chart-tab${chartTab === 'pipeline' ? ' active' : ''}`}
                  onClick={() => setChartTab('pipeline')}
                >
                  Molecule Pipeline
                  <span className="dash-chart-tab-count">{totalMolecules}</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={chartTab === 'members'}
                  className={`dash-chart-tab${chartTab === 'members' ? ' active' : ''}`}
                  onClick={() => setChartTab('members')}
                >
                  Members by Role
                  <span className="dash-chart-tab-count">{TOTAL_MEMBERS}</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={chartTab === 'invitations'}
                  className={`dash-chart-tab${chartTab === 'invitations' ? ' active' : ''}`}
                  onClick={() => setChartTab('invitations')}
                >
                  Invitations
                  <span className="dash-chart-tab-count">{TOTAL_INVITATIONS}</span>
                </button>
              </div>
              {chartTab === 'pipeline' && (
                <button type="button" className="dash-card-link" onClick={() => router.push('/molecules')}>
                  View all
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              )}
            </div>
            <div className="dash-card-body">
              {chartTab === 'pipeline' && (
                <BarChart
                  total={totalMolecules}
                  rows={STATE_ORDER.map(s => ({
                    label: MOLECULE_STATE_CONFIG[s].label,
                    count: stateCounts[s],
                    color: MOLECULE_STATE_CONFIG[s].color,
                  }))}
                />
              )}
              {chartTab === 'members' && (
                <BarChart
                  total={TOTAL_MEMBERS}
                  rows={MEMBER_ROLES.map(r => ({ label: r.role, count: r.count, color: r.color }))}
                />
              )}
              {chartTab === 'invitations' && (
                <BarChart
                  total={TOTAL_INVITATIONS}
                  rows={INVITATION_STATUS.map(s => ({ label: s.status, count: s.count, color: s.color }))}
                />
              )}
            </div>
          </div>
        )}

        {/* Sub-Stump: Attention Required (25%) + My Stumps (75%) on a single row.
            Other roles keep the standard layout: Activity + Team Online row, then Attention Required below. */}
        {isSubStump ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 1fr)',
              gap: 16,
              alignItems: 'start',
            }}
          >
            <div style={{ minWidth: 0 }}>{attentionCard}</div>
            <div style={{ minWidth: 0 }}>{myStumpsCard}</div>
          </div>
        ) : (
          <>
            <div className="dash-grid-1">
              <div className="dash-col-main">
                <div className="dash-card">
                  <div className="dash-card-head">
                    <div>
                      <div className="dash-card-title">Recent Activity</div>
                      <div className="dash-card-sub">
                        {isStump
                          ? 'Latest events from your Sub-Stumps'
                          : 'Workspace events across the past week'}
                      </div>
                    </div>
                    <span className="dash-card-meta">Last 7 days</span>
                  </div>
                  <div className="dash-feed">
                    {activityFeed.map(item => (
                      <div key={item.id} className="dash-feed-item">
                        <div className="dash-feed-icon">{FEED_ICONS[item.icon]}</div>
                        <div className="dash-feed-text">
                          <div>
                            <b>{item.user}</b>
                            <span style={{ color: 'var(--muted)' }}> {item.action} </span>
                            <em>{item.target}</em>
                          </div>
                          <div className="dash-feed-time">{item.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="dash-col-side">{myStumpsCard}</div>
            </div>

            {attentionCard}
          </>
        )}

      </div>
    </>
  );
}
