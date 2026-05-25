'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Toast } from '@/components/Toast';
import { useStore } from '@/lib/store';
import { syncLocalCartToServer } from '@/lib/cart';

const SAFE_REDIRECTS = ['cart', 'checkout', 'account'];

export function LoginClient({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter();
  const { showToast, setUser } = useStore();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: fd.get('email'),
          password: fd.get('password'),
        }),
      });
      const data = await res.json();

      if (data.success) {
        setUser(data.data.user);

        // Migrate any guest cart into the user's server cart
        await syncLocalCartToServer();

        showToast(`Welcome back, ${data.data.user.firstName}`);

        let destination = '/';
        if (data.data.user.role === 'admin') {
          destination = '/admin';
        } else if (redirectTo && SAFE_REDIRECTS.includes(redirectTo)) {
          destination = `/${redirectTo}`;
        }
        setTimeout(() => router.push(destination), 600);
      } else {
        showToast(data.message || 'Sign in failed');
        setSubmitting(false);
      }
    } catch {
      showToast('Sign in failed');
      setSubmitting(false);
    }
  }

  return (
    <>
      <Toast />
      <div className="min-h-screen grid md:grid-cols-2">
        {/* Visual side */}
        <div className="bg-gradient-to-br from-accent-300 via-accent-400 to-ink relative overflow-hidden hidden md:flex items-center justify-center p-16">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(176, 141, 90, 0.3) 0%, transparent 50%)',
            }}
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 text-center text-cream"
          >
            <Link href="/" className="font-display text-3xl tracking-wide mb-12 inline-block">
              Maison <span className="text-accent-light italic">Aurelle</span>
            </Link>
            <h2 className="font-display text-5xl italic mb-6">Welcome Back</h2>
            <p className="text-lg opacity-90 max-w-md leading-relaxed">
              Sign in to continue your journey through curated luxury — where every visit refines our understanding of your unique style.
            </p>
            <div className="font-script text-5xl text-accent-light mt-16">— Aurelle</div>
          </motion.div>
        </div>

        {/* Form side */}
        <div className="flex items-center justify-center p-8 md:p-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            <Link
              href="/"
              className="block text-center font-display text-2xl mb-12 md:hidden"
            >
              Maison <span className="text-accent italic">Aurelle</span>
            </Link>

            <h1 className="font-display text-4xl mb-3">Sign In</h1>
            <p className="text-muted mb-10">Enter your details to access your account.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="form-label" htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  placeholder="your@email.com"
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label" htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  placeholder="Enter your password"
                  className="form-input"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary w-full disabled:opacity-50"
              >
                {submitting ? 'Signing In…' : 'Sign In'}
              </button>

              <div className="text-center text-muted text-sm pt-4">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="text-accent border-b border-accent hover:opacity-70">
                  Create one
                </Link>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </>
  );
}
