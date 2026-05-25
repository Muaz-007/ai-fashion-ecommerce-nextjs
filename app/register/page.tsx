import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { RegisterClient } from './RegisterClient';

export default async function RegisterPage() {
  const session = await getSession();
  if (session) {
    redirect(session.role === 'admin' ? '/admin' : '/');
  }

  return <RegisterClient />;
}
