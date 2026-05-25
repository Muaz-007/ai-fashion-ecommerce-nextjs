import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import { AdminPageHeader } from '../AdminPageHeader';
import { CustomersClient } from './CustomersClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Customers · Admin' };

interface CustomerStats {
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

function classifySegment(orders: number, ltv: number): CustomerStats['segment'] {
  if (ltv >= 100000 && orders >= 5) return 'VIP';
  if (orders >= 3) return 'Loyal';
  if (orders >= 1) return 'Active';
  return 'New';
}

export default async function CustomersPage() {
  const users = await prisma.user.findMany({
    where: { role: 'customer' },
    include: {
      orders: { where: { paymentStatus: 'paid' }, select: { total: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const customers: CustomerStats[] = users.map((u) => {
    const totalOrders = u.orders.length;
    const lifetimeValue = u.orders.reduce((sum, o) => sum + o.total, 0);
    return {
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      phone: u.phone,
      createdAt: u.createdAt.toISOString(),
      lastLogin: u.lastLogin?.toISOString() ?? null,
      totalOrders,
      lifetimeValue,
      segment: classifySegment(totalOrders, lifetimeValue),
    };
  });

  const totalLTV = customers.reduce((sum, c) => sum + c.lifetimeValue, 0);
  const avgLTV = customers.length > 0 ? totalLTV / customers.length : 0;
  const vips = customers.filter((c) => c.segment === 'VIP').length;
  const loyal = customers.filter((c) => c.segment === 'Loyal').length;

  return (
    <div>
      <AdminPageHeader
        eyebrow="Audience"
        title="Customers"
        subtitle={`${customers.length} customers · ${formatPrice(avgLTV)} avg LTV · ${vips + loyal} repeat buyers`}
      />

      {/* Segment summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {(['VIP', 'Loyal', 'Active', 'New'] as const).map((segment) => {
          const count = customers.filter((c) => c.segment === segment).length;
          const pct = customers.length > 0 ? Math.round((count / customers.length) * 100) : 0;
          return (
            <div key={segment} className="bg-cream border border-border p-5">
              <div className="text-[10px] uppercase tracking-widest text-muted mb-1">
                {segment}
              </div>
              <div className="font-display text-2xl">{count}</div>
              <div className="text-xs text-muted mt-1">{pct}% of base</div>
            </div>
          );
        })}
      </div>

      <CustomersClient initialCustomers={customers} />
    </div>
  );
}
