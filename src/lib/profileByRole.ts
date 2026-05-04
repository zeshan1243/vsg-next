import type { UserRole } from './useRole';

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  organization: string;
  phone: string;
}

export interface ProfileStat { val: string; label: string }

export interface RoleProfile {
  info: PersonalInfo;
  joined: string;
  stats: ProfileStat[];
}

// Each role gets a distinct demo identity, organisation, joined date and
// stat strip so the profile screen and sidebar avatar reflect who's signed in.
export const PROFILE_BY_ROLE: Record<UserRole, RoleProfile> = {
  creator: {
    info: { firstName: 'Sarah', lastName: 'Kaplan', email: 'sarah@vsg.io', organization: 'Kaplan Ventures LLC', phone: '(970) 555-0142' },
    joined: 'Jan 15, 2024',
    stats: [
      { val: '5',  label: 'Molecules' },
      { val: '12', label: 'Team' },
      { val: '42', label: 'Tasks Done' },
    ],
  },
  lead: {
    info: { firstName: 'Marcus', lastName: 'Reeves', email: 'marcus@vsg.io', organization: 'Reeves Field Office', phone: '(970) 555-0188' },
    joined: 'Jan 20, 2024',
    stats: [
      { val: '4',  label: 'Quadrants' },
      { val: '8',  label: 'Stumps' },
      { val: '18', label: 'Approvals' },
    ],
  },
  stump: {
    info: { firstName: 'Maria', lastName: 'Chen', email: 'maria@vsg.io', organization: 'Independent Contractor', phone: '(415) 555-0117' },
    joined: 'Feb 1, 2024',
    stats: [
      { val: '1', label: 'Quadrant' },
      { val: '4', label: 'Sub-Stumps' },
      { val: '8', label: 'Submissions' },
    ],
  },
  'sub-stump': {
    info: { firstName: 'James', lastName: 'Thompson', email: 'james@vsg.io', organization: 'Independent Contractor', phone: '(415) 555-0211' },
    joined: 'Feb 5, 2024',
    stats: [
      { val: '3', label: 'Quadrants' },
      { val: '3', label: 'Stumps' },
      { val: '5', label: 'Steps Submitted' },
    ],
  },
  admin: {
    info: { firstName: 'Jordan', lastName: 'Lee', email: 'jordan@vsg.io', organization: 'Veracity Space, Inc.', phone: '(212) 555-0119' },
    joined: 'Sep 12, 2023',
    stats: [
      { val: '5',  label: 'Creators' },
      { val: '20', label: 'Molecules' },
      { val: '3',  label: 'Admins' },
    ],
  },
  'super-admin': {
    info: { firstName: 'Avery', lastName: 'Stone', email: 'avery@vsg.io', organization: 'Veracity Space, Inc.', phone: '(212) 555-0100' },
    joined: 'Aug 4, 2023',
    stats: [
      { val: '5',  label: 'Creators' },
      { val: '20', label: 'Molecules' },
      { val: '3',  label: 'Platform Admins' },
    ],
  },
};

export function profileForRole(role: UserRole): RoleProfile {
  return PROFILE_BY_ROLE[role];
}

export function initialsForRole(role: UserRole): string {
  const { firstName, lastName } = PROFILE_BY_ROLE[role].info;
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();
}

export function fullNameForRole(role: UserRole): string {
  const { firstName, lastName } = PROFILE_BY_ROLE[role].info;
  return `${firstName} ${lastName}`.trim();
}
