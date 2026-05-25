'use client';

/**
 * Global confirmation dialog with an imperative async API.
 *
 * Usage from anywhere:
 *   const ok = await confirmDialog({
 *     title: 'Delete product?',
 *     message: 'This cannot be undone.',
 *     confirmLabel: 'Delete',
 *     tone: 'danger',
 *   });
 *   if (ok) { ... }
 *
 * Mount <ConfirmDialog /> once in the root layout (it portals to document.body).
 */

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'default' | 'danger';
}

interface PendingConfirm extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

// Module-level resolver — set by the mounted dialog, called by `confirmDialog`
let pendingResolver: ((opts: PendingConfirm) => void) | null = null;

/** Imperative API — call from any client component. */
export function confirmDialog(opts: ConfirmOptions): Promise<boolean> {
  if (!pendingResolver) {
    // Fallback if dialog component isn't mounted (shouldn't happen in normal use)
    return Promise.resolve(window.confirm(opts.message ?? opts.title));
  }
  return new Promise((resolve) => {
    pendingResolver!({ ...opts, resolve });
  });
}

export function ConfirmDialog() {
  const [mounted, setMounted] = useState(false);
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  useEffect(() => setMounted(true), []);

  // Register module-level resolver so `confirmDialog()` can talk to us
  useEffect(() => {
    pendingResolver = (opts) => setPending(opts);
    return () => {
      pendingResolver = null;
    };
  }, []);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = pending ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [pending]);

  // Esc to cancel
  useEffect(() => {
    if (!pending) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') handleCancel();
      if (e.key === 'Enter') handleConfirm();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending]);

  function handleConfirm() {
    if (!pending) return;
    pending.resolve(true);
    setPending(null);
  }

  function handleCancel() {
    if (!pending) return;
    pending.resolve(false);
    setPending(null);
  }

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {pending && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
            onClick={handleCancel}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="relative bg-cream shadow-large max-w-md w-full overflow-hidden"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
          >
            {/* Close button */}
            <button
              onClick={handleCancel}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-muted hover:text-ink transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="p-8">
              {/* Icon */}
              <div
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center mb-5',
                  pending.tone === 'danger'
                    ? 'bg-error/10 text-error'
                    : 'bg-accent/10 text-accent'
                )}
              >
                <AlertTriangle size={22} />
              </div>

              {/* Content */}
              <h3 id="confirm-title" className="font-display text-2xl mb-3">
                {pending.title}
              </h3>
              {pending.message && (
                <p className="text-muted leading-relaxed text-sm mb-8">
                  {pending.message}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn btn-secondary text-xs"
                >
                  {pending.cancelLabel ?? 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  autoFocus
                  className={cn(
                    'btn text-xs',
                    pending.tone === 'danger'
                      ? 'bg-error text-cream border border-error hover:bg-error/90 hover:-translate-y-0.5 hover:shadow-medium transition-all'
                      : 'btn-primary'
                  )}
                >
                  {pending.confirmLabel ?? 'Confirm'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
