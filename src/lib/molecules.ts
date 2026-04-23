export type PhaseCls = 'qA' | 'qB' | 'qC' | 'qD' | 'done';
export type Status = 'progress' | 'completed';

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
    dotColor: '#C8973A',
    members: 4,
    date: 'Mar 15',
    updated: '2h ago',
    leadName: 'M. Reeves',
    leadHint: 'Lead: M. Reeves',
    status: 'progress',
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
    dotColor: '#2AB8D8',
    members: 5,
    date: 'Apr 1',
    updated: '5h ago',
    leadName: 'A. Patel',
    leadHint: 'Lead: A. Patel',
    status: 'progress',
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
    dotColor: '#3BB87F',
    members: 3,
    date: 'May 10',
    updated: '1d ago',
    leadName: 'S. Kaplan',
    leadHint: 'Lead: You (Creator)',
    status: 'progress',
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
    dotColor: '#3BB87F',
    members: 3,
    date: 'Jan 30',
    updated: '2mo ago',
    leadName: 'Completed',
    leadHint: 'Completed',
    status: 'completed',
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
    dotColor: '#3BB87F',
    members: 6,
    date: 'Dec 12',
    updated: '3mo ago',
    leadName: 'Completed',
    leadHint: 'Completed',
    status: 'completed',
    sidebar: { membersAssigned: 6, membersTotal: 6, pendingRequests: 0, quadA: 100, quadB: 100, quadC: 100, quadD: 100 },
  },
];

export function getMolecule(id: string): Molecule | undefined {
  return MOLECULES.find(m => m.id === id);
}
