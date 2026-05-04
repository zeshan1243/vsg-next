'use client';

import { useState, useEffect } from 'react';

export type UserRole = 'creator' | 'lead' | 'stump' | 'sub-stump' | 'admin' | 'super-admin';

const ROLE_LABELS: Record<UserRole, string> = {
  'creator': 'Creator',
  'lead': 'Lead',
  'stump': 'Stump',
  'sub-stump': 'Sub-Stump',
  'admin': 'Platform Admin',
  'super-admin': 'Super Admin',
};

export function useRole() {
  const [role, setRoleState] = useState<UserRole>('creator');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('vsg-role') as UserRole | null;
    if (stored && ROLE_LABELS[stored]) {
      setRoleState(stored);
    }
    setLoaded(true);
  }, []);

  function setRole(newRole: UserRole) {
    localStorage.setItem('vsg-role', newRole);
    setRoleState(newRole);
  }

  return {
    role,
    setRole,
    loaded,
    roleLabel: ROLE_LABELS[role],
    isCreator: role === 'creator',
    isLead: role === 'lead',
    isStump: role === 'stump',
    isSubStump: role === 'sub-stump',
    isPlatformAdmin: role === 'admin',
    isSuperAdmin: role === 'super-admin',
    canCreateMolecule: role === 'creator',
  };
}
