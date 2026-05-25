import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { AdminSidebar } from './AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Server-side guard — non-admins never receive admin HTML
  if (!session) {
    redirect('/login?redirect=admin');
  }
  if (session.role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-cream md:grid md:grid-cols-[260px_1fr]">
      <AdminSidebar firstName={session.firstName} />
      <main className="p-5 sm:p-6 md:p-12">{children}</main>
    </div>
  );
}
