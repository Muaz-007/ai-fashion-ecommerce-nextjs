import { getCurrentUser } from '@/lib/auth';
import { AdminPageHeader } from '../AdminPageHeader';
import { SettingsClient } from './SettingsClient';
import { prisma } from '@/lib/prisma';
import { User as UserIcon, Mail, Phone, Calendar } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Settings · Admin' };

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) return null; // layout guard handles this

  // Aggregate stats for "About this store" section
  const [productCount, orderCount, customerCount] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count(),
    prisma.user.count({ where: { role: 'customer' } }),
  ]);

  return (
    <div>
      <AdminPageHeader
        eyebrow="System"
        title="Settings"
        subtitle="Profile, preferences, and store configuration"
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <div className="lg:col-span-1">
          <div className="bg-cream border border-border p-8 text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent to-accent-300 flex items-center justify-center text-cream font-display text-3xl mx-auto mb-4">
              {user.firstName[0]}
              {user.lastName[0]}
            </div>
            <h2 className="font-display text-2xl">
              {user.firstName} {user.lastName}
            </h2>
            <div className="inline-block mt-2 px-2.5 py-1 bg-accent text-cream text-[10px] uppercase tracking-widest font-semibold">
              Administrator
            </div>

            <div className="mt-8 pt-6 border-t border-border space-y-3 text-left">
              <DetailRow Icon={Mail} label="Email" value={user.email} />
              {user.phone && <DetailRow Icon={Phone} label="Phone" value={user.phone} />}
              <DetailRow
                Icon={Calendar}
                label="Member since"
                value={new Date(user.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              />
            </div>
          </div>

          {/* Store info */}
          <div className="bg-cream border border-border p-8 mt-6">
            <h3 className="font-display text-xl mb-4 pb-3 border-b border-border">
              Store Snapshot
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Active products</span>
                <span className="font-medium">{productCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Total orders</span>
                <span className="font-medium">{orderCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Registered customers</span>
                <span className="font-medium">{customerCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Currency</span>
                <span className="font-medium">PKR</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Tax rate</span>
                <span className="font-medium">5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Free shipping above</span>
                <span className="font-medium">PKR 10,000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Forms */}
        <div className="lg:col-span-2">
          <SettingsClient
            firstName={user.firstName}
            lastName={user.lastName}
            phone={user.phone ?? ''}
          />
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  Icon,
  label,
  value,
}: {
  Icon: typeof UserIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-cream-200 text-accent flex items-center justify-center shrink-0">
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-widest text-muted">{label}</div>
        <div className="text-sm truncate">{value}</div>
      </div>
    </div>
  );
}
