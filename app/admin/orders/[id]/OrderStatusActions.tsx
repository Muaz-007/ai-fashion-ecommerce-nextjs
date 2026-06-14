'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Truck, Package, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

interface Props {
  orderId: number;
  currentStatus: string;
  currentPaymentStatus: string;
}

const STATUS_FLOW: { value: OrderStatus; label: string; icon: React.ReactNode }[] = [
  { value: 'pending', label: 'Pending', icon: <Package size={14} /> },
  { value: 'processing', label: 'Processing', icon: <Package size={14} /> },
  { value: 'shipped', label: 'Shipped', icon: <Truck size={14} /> },
  { value: 'delivered', label: 'Delivered', icon: <Check size={14} /> },
];

const PAYMENT_OPTIONS: { value: PaymentStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Mark Paid' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
];

export function OrderStatusActions({ orderId, currentStatus, currentPaymentStatus }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saving, setSaving] = useState<string | null>(null);
  const showToast = useStore((s) => s.showToast);

  async function update(payload: { status?: OrderStatus; paymentStatus?: PaymentStatus }, label: string) {
    setSaving(label);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Update failed');
      }
      showToast(`Order updated: ${label}`);
      startTransition(() => router.refresh());
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSaving(null);
    }
  }

  const isCancelled = currentStatus === 'cancelled';
  const currentIdx = STATUS_FLOW.findIndex((s) => s.value === currentStatus);

  return (
    <div className="bg-cream border border-border">
      {/* Status flow */}
      <div className="px-6 py-5 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[11px] uppercase tracking-widest text-muted font-semibold">
            Order Status
          </h3>
          {!isCancelled && (
            <button
              onClick={() => update({ status: 'cancelled' }, 'Cancelled')}
              disabled={saving !== null || isPending}
              className="text-xs text-error hover:underline disabled:opacity-50 flex items-center gap-1"
            >
              <X size={12} /> Cancel order
            </button>
          )}
          {isCancelled && (
            <button
              onClick={() => update({ status: 'pending' }, 'Reopened')}
              disabled={saving !== null || isPending}
              className="text-xs text-accent hover:underline disabled:opacity-50 flex items-center gap-1"
            >
              <RotateCcw size={12} /> Reopen
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {STATUS_FLOW.map((step, idx) => {
            const isCurrent = step.value === currentStatus;
            const isPast = !isCancelled && currentIdx > idx;
            return (
              <button
                key={step.value}
                onClick={() => update({ status: step.value }, step.label)}
                disabled={isCurrent || saving !== null || isPending || isCancelled}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 text-xs font-medium border transition-colors disabled:cursor-not-allowed',
                  isCurrent
                    ? 'bg-charcoal text-cream border-charcoal'
                    : isPast
                    ? 'bg-success/10 text-success border-success/30'
                    : 'bg-cream border-border hover:border-accent hover:text-accent',
                  isCancelled && 'opacity-40'
                )}
              >
                {step.icon}
                {saving === step.label ? 'Saving…' : step.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Payment status */}
      <div className="px-6 py-5">
        <h3 className="text-[11px] uppercase tracking-widest text-muted font-semibold mb-4">
          Payment Status
        </h3>
        <div className="flex flex-wrap gap-2">
          {PAYMENT_OPTIONS.map((opt) => {
            const isCurrent = opt.value === currentPaymentStatus;
            return (
              <button
                key={opt.value}
                onClick={() => update({ paymentStatus: opt.value }, opt.label)}
                disabled={isCurrent || saving !== null || isPending}
                className={cn(
                  'px-3 py-2 text-xs font-medium border transition-colors disabled:cursor-not-allowed',
                  isCurrent
                    ? opt.value === 'paid'
                      ? 'bg-success text-cream border-success'
                      : opt.value === 'refunded'
                      ? 'bg-error text-cream border-error'
                      : 'bg-charcoal text-cream border-charcoal'
                    : 'bg-cream border-border hover:border-accent hover:text-accent'
                )}
              >
                {saving === opt.label ? 'Saving…' : opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
