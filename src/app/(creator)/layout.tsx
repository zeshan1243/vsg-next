import Sidebar from '@/components/layout/Sidebar';

export default function CreatorLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="creator-app">
      <Sidebar />
      <div className="creator-main">{children}</div>
    </div>
  );
}
