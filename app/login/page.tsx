import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { LoginClient } from './LoginClient';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const sp = await searchParams;
  const session = await getSession();

  if (session) {
    redirect(session.role === 'admin' ? '/admin' : '/');
  }

  return <LoginClient redirectTo={sp.redirect} />;
}
