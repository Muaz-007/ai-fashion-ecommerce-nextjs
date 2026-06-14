import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, CreditCard, Package } from 'lucide-react';
import { AdminPageHeader } from '../../AdminPageHeader';
import { ProductPlaceholder } from '@/components/ProductPlaceholder';
import { formatPrice, cn } from '@/lib/utils';
import { OrderStatusActions } from './OrderStatusActions';
import { OrderNotesEditor } from './OrderNotesEditor';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id: Number(id) },
    select: { orderNumber: true },
  });
  return { title: order ? `${order.orderNumber} · Admin` : 'Order · Admin' };
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
  bank_transfer: 'Bank Transfer',
  cod: 'Cash on Delivery',
};

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) notFound();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
      items: {
        include: {
          product: {
            select: { id: true, name: true, slug: true, sku: true, gradient: true, imageUrl: true, category: { select: { name: true } } },
          },
        },
      },
    },
  });

  if (!order) notFound();

  const customerName = order.user
    ? `${order.user.firstName} ${order.user.lastName}`
    : `${order.shippingFirstName ?? 'Guest'} ${order.shippingLastName ?? ''}`.trim();
  const customerEmail = order.user?.email ?? order.shippingEmail ?? '';
  const customerPhone = order.user?.phone ?? order.shippingPhone ?? '';

  return (
    <div>
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-2 text-xs text-muted hover:text-charcoal mb-4 transition-colors"
      >
        <ArrowLeft size={14} /> All Orders
      </Link>

      <AdminPageHeader
        eyebrow="Order"
        title={order.orderNumber}
        subtitle={
          `${order.items.length} item${order.items.length === 1 ? '' : 's'} · ` +
          `${formatPrice(order.total)} · ` +
          `Placed ${new Date(order.createdAt).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}`
        }
        action={
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium capitalize',
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
            <span
              className={cn(
                'inline-flex items-center px-3 py-1.5 text-xs font-medium uppercase tracking-widest',
                order.paymentStatus === 'paid'
                  ? 'bg-success/10 text-success'
                  : order.paymentStatus === 'refunded'
                  ? 'bg-error/10 text-error'
                  : 'bg-cream-300 text-muted'
              )}
            >
              {order.paymentStatus}
            </span>
          </div>
        }
      />

      <OrderStatusActions
        orderId={order.id}
        currentStatus={order.status}
        currentPaymentStatus={order.paymentStatus}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Items + summary */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-cream border border-border">
            <header className="px-6 py-4 border-b border-border flex items-center gap-3">
              <Package size={18} className="text-accent" />
              <h2 className="font-display text-xl">Items</h2>
              <span className="ml-auto text-xs text-muted">{order.items.length} line items</span>
            </header>
            <div className="divide-y divide-border">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="w-16 h-16 overflow-hidden shrink-0">
                    {item.product ? (
                      <ProductPlaceholder
                        productId={item.product.id}
                        productName={item.product.name}
                        category={item.product.category?.name ?? ''}
                        gradient={item.product.gradient}
                        showWordmark={false}
                      />
                    ) : (
                      <div className="w-full h-full bg-cream-200" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {item.productName ?? item.product?.name ?? 'Product unavailable'}
                    </div>
                    <div className="text-xs text-muted">
                      {item.product?.sku && <span className="font-mono">{item.product.sku}</span>}
                      {item.size && <span> · Size {item.size}</span>}
                      <span> · Qty {item.quantity}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-medium">{formatPrice(item.subtotal)}</div>
                    <div className="text-xs text-muted">{formatPrice(item.unitPrice)} each</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="px-6 py-4 border-t border-border bg-cream-200/40 space-y-2 text-sm">
              <Row label="Subtotal" value={formatPrice(order.subtotal)} />
              {order.tax > 0 && <Row label="Tax" value={formatPrice(order.tax)} />}
              <Row
                label="Shipping"
                value={order.shippingCost > 0 ? formatPrice(order.shippingCost) : 'Free'}
              />
              <div className="pt-2 border-t border-border">
                <Row label="Total" value={formatPrice(order.total)} bold />
              </div>
            </div>
          </section>

          <OrderNotesEditor orderId={order.id} initialNotes={order.notes ?? ''} />
        </div>

        {/* Right column: customer, shipping, payment */}
        <div className="space-y-6">
          <InfoCard title="Customer" icon={<Mail size={16} />}>
            <div className="space-y-2 text-sm">
              <div className="font-medium">{customerName}</div>
              {order.user ? (
                <div className="text-[10px] uppercase tracking-widest text-success">Registered</div>
              ) : (
                <div className="text-[10px] uppercase tracking-widest text-muted">Guest checkout</div>
              )}
              {customerEmail && (
                <a
                  href={`mailto:${customerEmail}`}
                  className="flex items-center gap-2 text-muted hover:text-charcoal transition-colors break-all"
                >
                  <Mail size={14} className="shrink-0" />
                  {customerEmail}
                </a>
              )}
              {customerPhone && (
                <a
                  href={`tel:${customerPhone}`}
                  className="flex items-center gap-2 text-muted hover:text-charcoal transition-colors"
                >
                  <Phone size={14} className="shrink-0" />
                  {customerPhone}
                </a>
              )}
            </div>
          </InfoCard>

          <InfoCard title="Shipping Address" icon={<MapPin size={16} />}>
            {order.shippingStreet ? (
              <address className="not-italic text-sm leading-relaxed">
                {order.shippingFirstName} {order.shippingLastName}
                <br />
                {order.shippingStreet}
                <br />
                {order.shippingCity}
                {order.shippingPostalCode && `, ${order.shippingPostalCode}`}
                <br />
                {order.shippingCountry}
              </address>
            ) : (
              <div className="text-sm text-muted">No shipping address on file.</div>
            )}
          </InfoCard>

          <InfoCard title="Payment" icon={<CreditCard size={16} />}>
            <div className="space-y-1 text-sm">
              <div>
                <span className="text-muted">Method:</span>{' '}
                <span className="font-medium">
                  {PAYMENT_LABEL[order.paymentMethod] ?? order.paymentMethod}
                </span>
              </div>
              <div>
                <span className="text-muted">Status:</span>{' '}
                <span
                  className={cn(
                    'font-medium capitalize',
                    order.paymentStatus === 'paid'
                      ? 'text-success'
                      : order.paymentStatus === 'refunded'
                      ? 'text-error'
                      : 'text-accent'
                  )}
                >
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </InfoCard>

          <InfoCard title="Timeline" icon={<Calendar size={16} />}>
            <div className="space-y-1 text-sm">
              <div>
                <span className="text-muted">Placed:</span>{' '}
                <span className="font-medium">
                  {new Date(order.createdAt).toLocaleString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div>
                <span className="text-muted">Updated:</span>{' '}
                <span className="font-medium">
                  {new Date(order.updatedAt).toLocaleString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          </InfoCard>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className={cn(bold ? 'font-display text-base' : 'text-muted')}>{label}</span>
      <span className={cn(bold ? 'font-display text-base' : 'font-medium')}>{value}</span>
    </div>
  );
}

function InfoCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-cream border border-border">
      <header className="px-5 py-3 border-b border-border flex items-center gap-2">
        <span className="text-accent">{icon}</span>
        <h3 className="font-display text-base">{title}</h3>
      </header>
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}
