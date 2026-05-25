'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Toast } from '@/components/Toast';
import { useStore } from '@/lib/store';
import { syncLocalCartToServer } from '@/lib/cart';

export function RegisterClient() {
  const router = useRouter();
  const { showToast, setUser } = useStore();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const password = String(fd.get('password'));
    const confirm = String(fd.get('confirmPassword'));

    if (password !== confirm) {
      showToast('Passwords do not match');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: fd.get('firstName'),
          lastName: fd.get('lastName'),
          email: fd.get('email'),
          phone: fd.get('phone'),
          password,
          subscribedNewsletter: fd.get('subscribe') === 'on',
        }),
      });
      const data = await res.json();

      if (data.success) {
        setUser(data.data.user);

        // Migrate any guest cart into the new user's server cart
        await syncLocalCartToServer();

        showToast('Welcome to Maison Aurelle');
        setTimeout(() => router.push('/'), 800);
      } else {
        showToast(data.message || 'Registration failed');
        setSubmitting(false);
      }
    } catch {
      showToast('Registration failed');
      setSubmitting(false);
    }
  }

  return (
    <>
      <Toast />
      <div className="min-h-screen grid md:grid-cols-2">
        {/* Form side */}
        <div className="flex items-center justify-center p-8 md:p-16 order-2 md:order-1">
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

            <h1 className="font-display text-4xl mb-3">Create Account</h1>
            <p className="text-muted mb-10">
              Join our atelier — where AI personalizes your luxury journey.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">First Name</label>
                  <input type="text" name="firstName" required className="form-input" />
                </div>
                <div>
                  <label className="form-label">Last Name</label>
                  <input type="text" name="lastName" required className="form-input" />
                </div>
              </div>

              <div>
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="your@email.com"
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+92 300 0000000"
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={8}
                  placeholder="At least 8 characters"
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  placeholder="Re-enter password"
                  className="form-input"
                />
              </div>

              <label className="flex items-start gap-2 cursor-pointer text-sm text-muted leading-relaxed py-2">
                <input type="checkbox" required className="accent-accent mt-1" />
                <span>
                  I agree to the{' '}
                  <Link
                    href="/terms"
                    target="_blank"
                    className="text-accent border-b border-accent hover:opacity-70 transition-opacity"
                  >
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link
                    href="/privacy"
                    target="_blank"
                    className="text-accent border-b border-accent hover:opacity-70 transition-opacity"
                  >
                    Privacy Policy
                  </Link>
                </span>
              </label>

              <label className="flex items-start gap-2 cursor-pointer text-sm text-muted leading-relaxed">
                <input
                  type="checkbox"
                  name="subscribe"
                  defaultChecked
                  className="accent-accent mt-1"
                />
                <span>Subscribe to receive AI-curated style updates and exclusive offers</span>
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary w-full disabled:opacity-50"
              >
                {submitting ? 'Creating Account…' : 'Create Account'}
              </button>

              <div className="text-center text-muted text-sm pt-4">
                Already have an account?{' '}
                <Link href="/login" className="text-accent border-b border-accent hover:opacity-70">
                  Sign in
                </Link>
              </div>
            </form>
          </motion.div>
        </div>

        {/* Visual side */}
        <div className="bg-gradient-to-br from-accent-300 via-accent-400 to-ink relative overflow-hidden hidden md:flex items-center justify-center p-16 order-1 md:order-2">
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
            <h2 className="font-display text-5xl italic mb-6">Begin Your Story</h2>
            <p className="text-lg opacity-90 max-w-md mx-auto leading-relaxed mb-16">
              Join thousands who trust Maison Aurelle for hand-crafted pieces, AI-personalized recommendations, and concierge service.
            </p>
            <div className="flex gap-12 justify-center flex-wrap">
              {[
                { stat: '15K+', label: 'Happy Clients' },
                { stat: '200+', label: 'Curated Pieces' },
                { stat: '4.9★', label: 'Avg Rating' },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="font-display text-4xl text-accent-light">{s.stat}</div>
                  <div className="text-xs uppercase tracking-widest opacity-70 mt-2">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
