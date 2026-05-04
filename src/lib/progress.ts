export type Quad = 'a' | 'b' | 'c' | 'd';
export type Stack = 'okrs' | 'kpis' | 'jobs' | 'tasks';

export const STACK_SEQUENCE: Stack[] = ['okrs', 'kpis', 'jobs', 'tasks'];
export const NEXT_QUAD: Record<Quad, Quad> = { a: 'b', b: 'c', c: 'd', d: 'a' };
export const QUAD_FINAL: Record<Quad, Stack> = { a: 'okrs', b: 'kpis', c: 'jobs', d: 'tasks' };
export const STACK_LABEL: Record<Stack, string> = { okrs: 'OKRs', kpis: 'KPIs', jobs: 'Jobs', tasks: 'Tasks' };

export const TOTAL_STEPS = 5;

export function stackForStep(quad: Quad, step: number): Stack {
  if (step >= 1 && step <= 4) return STACK_SEQUENCE[step - 1];
  return QUAD_FINAL[quad];
}

const ACTIVE_KEY = (molId: string) => `vsg:mol:${molId}:active-quad`;
const STEP_KEY = (molId: string) => `vsg:mol:${molId}:active-step`;

export function getActiveQuad(molId: string): Quad | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = window.localStorage.getItem(ACTIVE_KEY(molId));
    return v === 'a' || v === 'b' || v === 'c' || v === 'd' ? v : null;
  } catch {
    return null;
  }
}

export function setActiveQuad(molId: string, quad: Quad | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (quad === null) window.localStorage.removeItem(ACTIVE_KEY(molId));
    else window.localStorage.setItem(ACTIVE_KEY(molId), quad);
  } catch {
    // ignore
  }
}

export function getActiveStep(molId: string): number {
  if (typeof window === 'undefined') return 1;
  try {
    const v = Number.parseInt(window.localStorage.getItem(STEP_KEY(molId)) ?? '1', 10);
    return Math.min(TOTAL_STEPS, Math.max(1, Number.isFinite(v) ? v : 1));
  } catch {
    return 1;
  }
}

export function setActiveStep(molId: string, step: number): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STEP_KEY(molId), String(step));
  } catch {
    // ignore
  }
}

const COMPLETED_KEY = (molId: string) => `vsg:mol:${molId}:completed-quads`;

export function getCompletedQuads(molId: string): Quad[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(COMPLETED_KEY(molId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is Quad => v === 'a' || v === 'b' || v === 'c' || v === 'd');
  } catch {
    return [];
  }
}

export function markQuadCompleted(molId: string, quad: Quad): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getCompletedQuads(molId);
    if (current.includes(quad)) return;
    window.localStorage.setItem(COMPLETED_KEY(molId), JSON.stringify([...current, quad]));
  } catch {
    // ignore
  }
}

// Sidebar/overview unlock chain: Q-A always; Q-B once A done; Q-C once B; Q-D once C.
export function isQuadUnlocked(quad: Quad, completed: Quad[]): boolean {
  if (quad === 'a') return true;
  if (quad === 'b') return completed.includes('a');
  if (quad === 'c') return completed.includes('b');
  return completed.includes('c');
}

const QUAD_MAX_STEP_KEY = (molId: string, quad: Quad) => `vsg:mol:${molId}:quad-${quad}-max-step`;

export function getQuadMaxStep(molId: string, quad: Quad): number {
  if (typeof window === 'undefined') return 0;
  try {
    const v = Number.parseInt(window.localStorage.getItem(QUAD_MAX_STEP_KEY(molId, quad)) ?? '0', 10);
    return Math.min(TOTAL_STEPS, Math.max(0, Number.isFinite(v) ? v : 0));
  } catch {
    return 0;
  }
}

// Only bumps up. Never moves the stored max down.
export function bumpQuadMaxStep(molId: string, quad: Quad, step: number): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getQuadMaxStep(molId, quad);
    if (step > current) {
      window.localStorage.setItem(QUAD_MAX_STEP_KEY(molId, quad), String(step));
    }
  } catch {
    // ignore
  }
}

// ── Stump-specific state ────────────────────────────
// A stump can only access the quadrants assigned to them by the Lead.
// Default assignment for the demo is Quadrant A.
const STUMP_ASSIGNED_KEY = 'vsg:stump:assigned-quads';
const STUMP_DEFAULT_ASSIGNED: Quad[] = ['a'];

function parseQuadArray(raw: string | null, fallback: Quad[]): Quad[] {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return fallback;
    const filtered = parsed.filter((v): v is Quad => v === 'a' || v === 'b' || v === 'c' || v === 'd');
    return filtered.length === 0 ? fallback : filtered;
  } catch {
    return fallback;
  }
}

export function getStumpAssignedQuads(): Quad[] {
  if (typeof window === 'undefined') return STUMP_DEFAULT_ASSIGNED;
  try {
    return parseQuadArray(window.localStorage.getItem(STUMP_ASSIGNED_KEY), STUMP_DEFAULT_ASSIGNED);
  } catch {
    return STUMP_DEFAULT_ASSIGNED;
  }
}

// Sub-Stumps span multiple molecules and may hold different Quadrants in each
// (with a different Stump as their reviewer per molecule). For the demo we
// hard-code the per-molecule assignment; in production this comes from the API.
export interface SubStumpStump {
  name: string;
  initials: string;
  gradient: string;
  online: boolean;
}
export interface SubStumpAssignment {
  moleculeId: string;
  quads: Quad[];
  stump: SubStumpStump;
}

const SUBSTUMP_ASSIGNMENTS: SubStumpAssignment[] = [
  {
    moleculeId: 'premier-wedding-expo',
    quads: ['a'],
    stump: { name: 'Maria Chen',    initials: 'MC', gradient: 'linear-gradient(135deg, #FFAB00, #FFD54F)', online: true  },
  },
  {
    moleculeId: 'q3-product-launch',
    quads: ['c'],
    stump: { name: 'Rachel Nguyen', initials: 'RN', gradient: 'linear-gradient(135deg, #EF4444, #F87171)', online: true  },
  },
  {
    moleculeId: 'community-outreach-plan',
    quads: ['b'],
    stump: { name: 'Elena Torres',  initials: 'ET', gradient: 'linear-gradient(135deg, #3B82F6, #60A5FA)', online: false },
  },
];

export function getSubStumpAssignments(): SubStumpAssignment[] {
  return SUBSTUMP_ASSIGNMENTS;
}

// Per-molecule list of Quadrants the Sub-Stump is assigned to. When called
// without a molId the result is the union across every molecule (handy for
// the dashboard summary).
export function getSubStumpAssignedQuads(molId?: string): Quad[] {
  if (molId) {
    return SUBSTUMP_ASSIGNMENTS.find(a => a.moleculeId === molId)?.quads ?? [];
  }
  return Array.from(new Set(SUBSTUMP_ASSIGNMENTS.flatMap(a => a.quads)));
}

// Per-step submission tracking for the Sub-Stump → Stump approval workflow.
const SUBSTUMP_STEPS_KEY = (molId: string, quad: Quad) => `vsg:mol:${molId}:substump-submitted-steps-${quad}`;

export function getSubStumpSubmittedSteps(molId: string, quad: Quad): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(SUBSTUMP_STEPS_KEY(molId, quad));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((n): n is number => typeof n === 'number' && n >= 1 && n <= TOTAL_STEPS);
  } catch {
    return [];
  }
}

export function markSubStumpStepSubmitted(molId: string, quad: Quad, step: number): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getSubStumpSubmittedSteps(molId, quad);
    if (current.includes(step)) return;
    window.localStorage.setItem(SUBSTUMP_STEPS_KEY(molId, quad), JSON.stringify([...current, step]));
  } catch {
    // ignore
  }
}

const STUMP_SUBMITTED_KEY = (molId: string) => `vsg:mol:${molId}:stump-submitted-quads`;

export function getStumpSubmittedQuads(molId: string): Quad[] {
  if (typeof window === 'undefined') return [];
  try {
    return parseQuadArray(window.localStorage.getItem(STUMP_SUBMITTED_KEY(molId)), []);
  } catch {
    return [];
  }
}

export function markStumpQuadSubmitted(molId: string, quad: Quad): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getStumpSubmittedQuads(molId);
    if (current.includes(quad)) return;
    window.localStorage.setItem(STUMP_SUBMITTED_KEY(molId), JSON.stringify([...current, quad]));
  } catch {
    // ignore
  }
}
