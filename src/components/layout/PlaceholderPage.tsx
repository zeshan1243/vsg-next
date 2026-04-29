'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getMolecule } from '@/lib/molecules';
import { useRole } from '@/lib/useRole';

interface Props {
  title: string;
  description?: string;
  /** When true, the breadcrumb ends at the molecule name (used on Overview). */
  isRoot?: boolean;
}

export default function PlaceholderPage({ title, description, isRoot }: Props) {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';
  const mol = getMolecule(id);
  const { roleLabel } = useRole();

  return (
    <>
      <div className="topbar">
        <div className="breadcrumb">
          <Link href="/dashboard">Dashboard</Link>
          <span className="sep">›</span>
          <Link href="/molecules">My Molecules</Link>
          <span className="sep">›</span>
          {isRoot ? (
            <span className="cur">{mol?.name ?? title}</span>
          ) : (
            <>
              <Link href={`/molecules/${id}`}>{mol?.name ?? 'Molecule'}</Link>
              <span className="sep">›</span>
              <span className="cur">{title}</span>
            </>
          )}
        </div>
        <div className="topbar-right">
          <span className="creator-tag">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {roleLabel}
          </span>
        </div>
      </div>

      <div className="creator-content">
        <h1 className="font-syne" style={{ fontSize: '26px', fontWeight: 800, color: 'var(--navy)', marginBottom: '8px', letterSpacing: '-.3px' }}>
          {title}
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.6 }}>
          {description ?? 'Coming soon.'}
        </p>
      </div>
    </>
  );
}
