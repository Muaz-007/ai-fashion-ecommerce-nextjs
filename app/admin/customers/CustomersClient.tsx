'use client';

import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Select } from '@/components/Select';
import { formatPrice, cn } from '@/lib/utils';

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  createdAt: string;
  lastLogin: string | null;
  totalOrders: number;
  lifetimeValue: number;
  segment: 'VIP' | 'Loyal' | 'Active' | 'New';
}

const SEGMENT_STYLES: Record<Customer['segment'], string> = {
  VIP: 'bg-accent text-cream',
  Loyal: 'bg-success/10 text-success',
  Active: 'bg-accent/10 text-accent',
  New: 'bg-cream-300 text-muted',
};

export function CustomersClient({ initialCustomers }: { initialCustomers: Customer[] }) {
  const [search, setSearch] = useState('');
  const [segmentFilter, setSegmentFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'ltv' | 'orders'>('recent');

  const filtered = useMemo(() => {
    let result = initialCustomers.filter((c) => {
      if (search) {
        const q = search.toLowerCase();
        const hay = `${c.firstName} ${c.lastName} ${c.email}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (segmentFilter !== 'all' && c.segment !== segmentFilter) return false;
      return true;
    });

    switch (sortBy) {
      case 'ltv':
        result.sort((a, b) => b.lifetimeValue - a.lifetimeValue);
        break;
      case 'orders':
        result.sort((a, b) => b.totalOrders - a.totalOrders);
        break;
      case 'recent':
        result.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
    }

    return result;
  }, [initialCustomers, search, segmentFilter, sortBy]);

  return (
    <div className="bg-cream border border-border">
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
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 bg-cream-200 text-sm focus:outline-none focus:bg-cream border border-border focus:border-accent transition-colors"
          />
        </div>
        <div className="min-w-[160px]">
          <Select
            options={[
              { value: 'all', label: 'All Segments' },
              { value: 'VIP', label: 'VIP' },
              { value: 'Loyal', label: 'Loyal' },
              { value: 'Active', label: 'Active' },
              { value: 'New', label: 'New' },
            ]}
            value={segmentFilter}
            onChange={setSegmentFilter}
            ariaLabel="Filter by segment"
          />
        </div>
        <div className="min-w-[180px]">
          <Select
            options={[
              { value: 'recent', label: 'Recently Joined' },
              { value: 'ltv', label: 'Highest LTV' },
              { value: 'orders', label: 'Most Orders' },
            ]}
            value={sortBy}
            onChange={(v) => setSortBy(v as 'recent' | 'ltv' | 'orders')}
            ariaLabel="Sort by"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cream-200 text-[11px] uppercase tracking-widest text-muted">
            <tr>
              <th className="text-left p-4 font-semibold">Customer</th>
              <th className="text-left p-4 font-semibold hidden md:table-cell">Joined</th>
              <th className="text-center p-4 font-semibold">Orders</th>
              <th className="text-right p-4 font-semibold">Lifetime Value</th>
              <th className="text-center p-4 font-semibold">Segment</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-16 text-muted">
                  No customers match the filters.
                </td>
              </tr>
            ) : (
              filtered.map((customer) => (
                <tr
                  key={customer.id}
                  className="border-t border-border hover:bg-cream-200/50 transition-colors"
                >
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent-300 flex items-center justify-center text-cream text-sm font-semibold shrink-0">
                        {customer.firstName[0]}
                        {customer.lastName[0]}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium truncate">
                          {customer.firstName} {customer.lastName}
                        </div>
                        <div className="text-xs text-muted truncate max-w-[200px]">
                          {customer.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-muted text-xs hidden md:table-cell">
                    {new Date(customer.createdAt).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="p-3 text-center">
                    <span className="font-medium">{customer.totalOrders}</span>
                  </td>
                  <td className="p-3 text-right font-medium text-accent">
                    {formatPrice(customer.lifetimeValue)}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={cn(
                        'inline-block px-2.5 py-1 text-[10px] uppercase tracking-widest font-semibold',
                        SEGMENT_STYLES[customer.segment]
                      )}
                    >
                      {customer.segment}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-border text-xs text-muted">
        Showing {filtered.length} of {initialCustomers.length} customers
      </div>
    </div>
  );
}
