import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import { AdminPageHeader } from '../AdminPageHeader';
import { OrdersClient } from './OrdersClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Orders · Admin' };

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
      items: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.total, 0);

  const pending = orders.filter((o) => o.status === 'pending').length;
  const processing = orders.filter((o) => o.status === 'processing').length;

  // Normalize for client component (Dates → ISO, decimals → numbers)
  const safeOrders = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus,
    total: o.total,
    itemCount: o.items.length,
    customerName: o.user
      ? `${o.user.firstName} ${o.user.lastName}`
      : `${o.shippingFirstName ?? 'Guest'} ${o.shippingLastName ?? ''}`.trim(),
    customerEmail: o.user?.email ?? o.shippingEmail ?? '',
    isGuest: !o.user,
    createdAt: o.createdAt.toISOString(),
  }));

  return (
    <div>
      <AdminPageHeader
        eyebrow="Commerce"
        title="Orders"
        subtitle={`${orders.length} total · ${formatPrice(totalRevenue)} revenue · ${pending + processing} need attention`}
      />

      {pending > 0 && (
        <div className="mb-8 p-4 border-l-2 border-accent bg-accent/5 text-sm">
          <strong className="text-accent">{pending} pending orders</strong>
          <span className="text-muted"> are awaiting your action.</span>
        </div>
      )}

      <OrdersClient initialOrders={safeOrders} />
    </div>
  );
}
