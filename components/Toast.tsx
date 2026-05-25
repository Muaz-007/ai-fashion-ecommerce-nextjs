'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { useEffect } from 'react';
import { useStore } from '@/lib/store';

export function Toast() {
  const { toast, clearToast } = useStore();

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => clearToast(), 3000);
    return () => clearTimeout(timeout);
  }, [toast, clearToast]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ x: 'calc(100% + 2rem)' }}
          animate={{ x: 0 }}
          exit={{ x: 'calc(100% + 2rem)' }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="fixed top-28 right-8 bg-ink text-cream px-6 py-4 shadow-large z-[2000] flex items-center gap-3 max-w-sm text-sm border-l-2 border-accent"
        >
          <Check size={18} className="text-accent shrink-0" />
          <span>{toast.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
