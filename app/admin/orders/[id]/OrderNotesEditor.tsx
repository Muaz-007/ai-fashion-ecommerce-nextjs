'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { StickyNote, Save } from 'lucide-react';
import { useStore } from '@/lib/store';

interface Props {
  orderId: number;
  initialNotes: string;
}

export function OrderNotesEditor({ orderId, initialNotes }: Props) {
  const router = useRouter();
  const [notes, setNotes] = useState(initialNotes);
  const [saving, setSaving] = useState(false);
  const [, startTransition] = useTransition();
  const showToast = useStore((s) => s.showToast);

  const dirty = notes !== initialNotes;

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Save failed');
      showToast('Notes saved');
      startTransition(() => router.refresh());
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="bg-cream border border-border">
      <header className="px-6 py-4 border-b border-border flex items-center gap-3">
        <StickyNote size={18} className="text-accent" />
        <h2 className="font-display text-xl">Internal Notes</h2>
        <span className="ml-auto text-xs text-muted">Only staff can see this</span>
      </header>
      <div className="p-6 space-y-3">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Track tracking numbers, customer requests, courier dispatch details…"
          rows={4}
          maxLength={2000}
          className="w-full px-4 py-3 bg-cream-200 text-sm focus:outline-none focus:bg-cream border border-border focus:border-accent transition-colors resize-y"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted">{notes.length} / 2000</span>
          <button
            onClick={save}
            disabled={!dirty || saving}
            className="btn btn-primary text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <Save size={14} />
            {saving ? 'Saving…' : 'Save Notes'}
          </button>
        </div>
      </div>
    </section>
  );
}
