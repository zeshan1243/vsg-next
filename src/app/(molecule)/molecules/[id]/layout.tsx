import { notFound } from 'next/navigation';
import MoleculeSidebar from '@/components/layout/MoleculeSidebar';
import { getMolecule } from '@/lib/molecules';

export default async function MoleculeLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!getMolecule(id)) notFound();

  return (
    <div className="creator-app">
      <MoleculeSidebar />
      <div className="creator-main">{children}</div>
    </div>
  );
}
