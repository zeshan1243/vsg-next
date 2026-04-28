export type PhaseCls = 'qA' | 'qB' | 'qC' | 'qD' | 'done';
export type Status = 'progress' | 'completed';
export type MoleculeState = 'draft' | 'active' | 'paused' | 'completed' | 'archived';

export const MOLECULE_STATE_CONFIG: Record<MoleculeState, { label: string; color: string; bgColor: string }> = {
  draft: { label: 'Draft', color: '#64748B', bgColor: 'rgba(100, 116, 139, 0.12)' },
  active: { label: 'Active', color: '#22C55E', bgColor: 'rgba(34, 197, 94, 0.12)' },
  paused: { label: 'Paused', color: '#FFAB00', bgColor: 'rgba(255, 171, 0, 0.12)' },
  completed: { label: 'Completed', color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.12)' },
  archived: { label: 'Archived', color: '#94A3B8', bgColor: 'rgba(148, 163, 184, 0.12)' },
};

export interface MoleculeSidebarStats {
  membersAssigned: number;
  membersTotal: number;
  pendingRequests: number;
  quadA: number;
  quadB: number;
  quadC: number;
  quadD: number;
}

export interface Molecule {
  id: string;
  code: string;
  name: string;
  initials: string;
  description: string;
  phaseLabel: string;
  phaseCls: PhaseCls;
  progress: number;
  progressColor: string;
  dotColor: string;
  members: number;
  date: string;
  updated: string;
  leadName: string;
  leadHint: string;
  status: Status;
  state: MoleculeState;
  sidebar: MoleculeSidebarStats;
}

export const MOLECULES: Molecule[] = [
  {
    id: 'premier-wedding-expo',
    code: 'MOL-001',
    name: 'Premier Wedding Expo',
    initials: 'WE',
    description: 'Live "Shark-Tank" style fundraising event for local startups in the Western Slope region.',
    phaseLabel: 'Q-D Exchange',
    phaseCls: 'qD',
    progress: 78,
    progressColor: 'var(--warn)',
    dotColor: '#FFAB00',
    members: 4,
    date: 'Mar 15',
    updated: '2h ago',
    leadName: 'M. Reeves',
    leadHint: 'Lead: M. Reeves',
    status: 'progress',
    state: 'active',
    sidebar: { membersAssigned: 6, membersTotal: 8, pendingRequests: 3, quadA: 100, quadB: 100, quadC: 100, quadD: 78 },
  },
  {
    id: 'q3-product-launch',
    code: 'MOL-002',
    name: 'Q3 Product Launch',
    initials: 'Q3',
    description: 'Coordinating cross-functional teams for the Q3 product release and go-to-market strategy.',
    phaseLabel: 'Q-C Knowledge',
    phaseCls: 'qC',
    progress: 55,
    progressColor: 'var(--success)',
    dotColor: '#3B82F6',
    members: 5,
    date: 'Apr 1',
    updated: '5h ago',
    leadName: 'A. Patel',
    leadHint: 'Lead: A. Patel',
    status: 'progress',
    state: 'active',
    sidebar: { membersAssigned: 4, membersTotal: 8, pendingRequests: 2, quadA: 100, quadB: 100, quadC: 55, quadD: 0 },
  },
  {
    id: 'community-outreach-plan',
    code: 'MOL-003',
    name: 'Community Outreach Plan',
    initials: 'CO',
    description: 'Establishing community partnerships and volunteer network for the nonprofit co-working space.',
    phaseLabel: 'Q-B Communication',
    phaseCls: 'qB',
    progress: 30,
    progressColor: 'var(--cyan)',
    dotColor: '#22C55E',
    members: 3,
    date: 'May 10',
    updated: '1d ago',
    leadName: 'S. Kaplan',
    leadHint: 'Lead: You (Creator)',
    status: 'progress',
    state: 'paused',
    sidebar: { membersAssigned: 3, membersTotal: 6, pendingRequests: 1, quadA: 100, quadB: 30, quadC: 0, quadD: 0 },
  },
  {
    id: 'annual-report-2025',
    code: 'MOL-004',
    name: 'Annual Report 2025',
    initials: 'AR',
    description: 'Year-end report covering organizational KPIs, financial metrics, and strategic outcomes.',
    phaseLabel: 'Completed',
    phaseCls: 'done',
    progress: 100,
    progressColor: 'var(--success)',
    dotColor: '#22C55E',
    members: 3,
    date: 'Jan 30',
    updated: '2mo ago',
    leadName: 'Completed',
    leadHint: 'Completed',
    status: 'completed',
    state: 'completed',
    sidebar: { membersAssigned: 3, membersTotal: 3, pendingRequests: 0, quadA: 100, quadB: 100, quadC: 100, quadD: 100 },
  },
  {
    id: 'fundraiser-event',
    code: 'MOL-005',
    name: 'Fundraiser Event',
    initials: 'FE',
    description: 'Secured $10mm in combined funding for 5 start-up companies through live pitch event.',
    phaseLabel: 'Completed',
    phaseCls: 'done',
    progress: 100,
    progressColor: 'var(--success)',
    dotColor: '#22C55E',
    members: 6,
    date: 'Dec 12',
    updated: '3mo ago',
    leadName: 'Completed',
    leadHint: 'Completed',
    status: 'completed',
    state: 'archived',
    sidebar: { membersAssigned: 6, membersTotal: 6, pendingRequests: 0, quadA: 100, quadB: 100, quadC: 100, quadD: 100 },
  },
  {
    id: 'brand-refresh-2026',
    code: 'MOL-006',
    name: 'Brand Refresh 2026',
    initials: 'BR',
    description: 'Complete visual identity overhaul including logo redesign, color palette, and brand guidelines.',
    phaseLabel: 'Q-A Coordinate',
    phaseCls: 'qA',
    progress: 0,
    progressColor: 'var(--muted)',
    dotColor: '#64748B',
    members: 0,
    date: 'Apr 20',
    updated: 'Just now',
    leadName: 'Unassigned',
    leadHint: 'Draft',
    status: 'progress',
    state: 'draft',
    sidebar: { membersAssigned: 0, membersTotal: 0, pendingRequests: 0, quadA: 0, quadB: 0, quadC: 0, quadD: 0 },
  },
  {
    id: 'partner-summit-2025',
    code: 'MOL-007',
    name: 'Partner Summit 2025',
    initials: 'PS',
    description: 'Annual partner conference bringing together key stakeholders for strategic alignment.',
    phaseLabel: 'Q-A Coordinate',
    phaseCls: 'qA',
    progress: 15,
    progressColor: 'var(--muted)',
    dotColor: '#64748B',
    members: 2,
    date: 'Apr 15',
    updated: '3d ago',
    leadName: 'J. Brooks',
    leadHint: 'Draft',
    status: 'progress',
    state: 'draft',
    sidebar: { membersAssigned: 2, membersTotal: 4, pendingRequests: 0, quadA: 15, quadB: 0, quadC: 0, quadD: 0 },
  },
];

export function getMolecule(id: string): Molecule | undefined {
  return MOLECULES.find(m => m.id === id);
}

export function getMoleculesByState(state: MoleculeState): Molecule[] {
  return MOLECULES.filter(m => m.state === state);
}

export function getMoleculeStateCounts(): Record<MoleculeState, number> {
  const counts: Record<MoleculeState, number> = {
    draft: 0,
    active: 0,
    paused: 0,
    completed: 0,
    archived: 0,
  };
  for (const mol of MOLECULES) {
    counts[mol.state]++;
  }
  return counts;
}

export function getQuadrantLabel(phaseCls: PhaseCls): string {
  switch (phaseCls) {
    case 'qA': return 'Q-A';
    case 'qB': return 'Q-B';
    case 'qC': return 'Q-C';
    case 'qD': return 'Q-D';
    case 'done': return 'Done';
    default: return '';
  }
}
