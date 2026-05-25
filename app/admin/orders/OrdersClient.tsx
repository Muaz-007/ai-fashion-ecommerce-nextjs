'use client';

import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Select } from '@/components/Select';
import { formatPrice, cn } from '@/lib/utils';

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  total: number;
  itemCount: number;
  customerName: string;
  customerEmail: string;
  isGuest: boolean;
  createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  delivered: 'bg-success/10 text-success',
  shipped: 'bg-accent/10 text-accent',
  processing: 'bg-accent/10 text-accent',
  pending: 'bg-cream-300 text-muted',
  cancelled: 'bg-error/10 text-error',
};

const PAYMENT_LABEL: Record<string, string> = {
  card: 'Card',
  jazzcash: 'JazzCash',
  easypaisa: 'EasyPaisa',
  bank_transfer: 'Bank',
  cod: 'COD',
};

export function OrdersClient({ initialOrders }: { initialOrders: Order[] }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    return initialOrders.filter((o) => {
      if (search) {
        const q = search.toLowerCase();
        if (
          !o.orderNumber.toLowerCase().includes(q) &&
          !o.customerName.toLowerCase().includes(q) &&
          !o.customerEmail.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      return true;
    });
  }, [initialOrders, search, statusFilter]);

  return (
    <div className="bg-cream border border-border">
      {/* Toolbar */}
      <div className="p-4 border-b border-border flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-light pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order number, customer..."
            className="w-full pl-10 pr-4 py-2.5 bg-cream-200 text-sm focus:outline-none focus:bg-cream border border-border focus:border-accent transition-colors"
          />
        </div>
        <div className="min-w-[180px]">
          <Select
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'pending', label: 'Pending' },
              { value: 'processing', label: 'Processing' },
              { value: 'shipped', label: 'Shipped' },
              { value: 'delivered', label: 'Delivered' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
            value={statusFilter}
            onChange={setStatusFilter}
            ariaLabel="Filter by status"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cream-200 text-[11px] uppercase tracking-widest text-muted">
            <tr>
              <th className="text-left p-4 font-semibold">Order</th>
              <th className="text-left p-4 font-semibold">Customer</th>
              <th className="text-left p-4 font-semibold hidden md:table-cell">Date</th>
              <th className="text-left p-4 font-semibold hidden lg:table-cell">Payment</th>
              <th className="text-center p-4 font-semibold">Status</th>
              <th className="text-right p-4 font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-16 text-muted">
                  No orders match the filters.
                </td>
              </tr>
            ) : (
              filtered.map((order) => (
                <tr
                  key={order.id}
                  className="border-t border-border hover:bg-cream-200/50 transition-colors"
                >
                  <td className="p-4">
                    <div className="font-medium font-mono text-xs">{order.orderNumber}</div>
                    <div className="text-xs text-muted-light">{order.itemCount} items</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{order.customerName}</span>
                      {order.isGuest && (
                        <span className="text-[9px] uppercase tracking-widest text-muted-light bg-cream-200 px-1.5 py-0.5">
                          Guest
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted truncate max-w-[200px]">
                      {order.customerEmail}
                    </div>
                  </td>
                  <td className="p-4 text-muted text-xs hidden md:table-cell">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    <div className="text-xs text-muted">{PAYMENT_LABEL[order.paymentMethod] ?? order.paymentMethod}</div>
                    <div
                      className={cn(
                        'text-[10px] uppercase tracking-widest mt-1',
                        order.paymentStatus === 'paid' ? 'text-success' : 'text-accent'
                      )}
                    >
                      {order.paymentStatus}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium capitalize',
                        STATUS_STYLES[order.status] ?? STATUS_STYLES.pending
                      )}
                    >
                      <span
                        className={cn(
                          'w-1.5 h-1.5 rounded-full',
                          order.status === 'delivered'
                            ? 'bg-success'
                            : order.status === 'cancelled'
                            ? 'bg-error'
                            : 'bg-accent'
                        )}
                      />
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-right font-medium">{formatPrice(order.total)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-border text-xs text-muted">
        Showing {filtered.length} of {initialOrders.length} orders
      </div>
    </div>
  );
}
