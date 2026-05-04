'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import LogoMark from '@/components/auth/LogoMark';
import { useRole } from '@/lib/useRole';
import { fullNameForRole, initialsForRole } from '@/lib/profileByRole';

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
  badge?: string;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const DashIcon = (
  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
  </svg>
);

const MolIcon = (
  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="2" /><circle cx="12" cy="4" r="2" /><circle cx="12" cy="20" r="2" />
    <circle cx="4" cy="12" r="2" /><circle cx="20" cy="12" r="2" />
    <line x1="12" y1="6" x2="12" y2="10" /><line x1="12" y1="14" x2="12" y2="18" />
    <line x1="6" y1="12" x2="10" y2="12" /><line x1="14" y1="12" x2="18" y2="12" />
  </svg>
);

const SettingsIcon = (
  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.07 4.93l-1.41 1.41M5.34 17.66l-1.41 1.41M19.07 19.07l-1.41-1.41M5.34 6.34L3.93 4.93M20 12h2M2 12h2M12 20v2M12 2v2" />
  </svg>
);

const UsersIcon = (
  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const SignOutIcon = (
  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export default function Sidebar() {
  const pathname = usePathname();
  const { role, roleLabel, isSuperAdmin, isPlatformAdmin } = useRole();
  const userName = fullNameForRole(role);
  const userInitials = initialsForRole(role);
  // Both admin tiers see the platform-wide views; only Super Admin can mutate.
  const isPlatformView = isSuperAdmin || isPlatformAdmin;

  const workspaceItems: NavItem[] = [
    {
      label: isPlatformView ? 'All Molecules' : 'My Molecules',
      href: '/molecules',
      icon: MolIcon,
      badge: '5',
    },
  ];
  if (isPlatformView) {
    // Platform-wide User Manager — Super Admin manages, Platform Admin views.
    workspaceItems.push({ label: 'User Manager', href: '/users', icon: UsersIcon });
  }

  const NAV_SECTIONS: NavSection[] = [
    { label: 'Overview',  items: [{ label: 'Dashboard', href: '/dashboard', icon: DashIcon }] },
    { label: 'Workspace', items: workspaceItems },
    { label: 'Account',   items: [{ label: 'Settings & Profile', href: '/profile', icon: SettingsIcon }] },
  ];

  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <LogoMark size={36} />
        <div className="sidebar-logo-text">VSG <span>{roleLabel}</span></div>
      </div>

      <div className="creator-badge">
        <div className="creator-avatar">{userInitials}</div>
        <div>
          <div className="c-name">{userName}</div>
          <div className="c-role">{roleLabel}</div>
        </div>
      </div>

      <div className="sidebar-nav">
        {NAV_SECTIONS.map(section => (
          <div key={section.label} className="nav-section">
            <div className="nav-section-label">{section.label}</div>
            {section.items.map(item => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item${active ? ' active' : ''}`}
                >
                  {item.icon}
                  {item.label}
                  {item.badge && <span className="nav-badge">{item.badge}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <Link href="/login" className="nav-item signout">
          {SignOutIcon}
          Sign Out
        </Link>
      </div>
    </nav>
  );
}
