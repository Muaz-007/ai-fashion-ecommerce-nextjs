import { prisma } from '@/lib/prisma';
import { AdminPageHeader } from '../AdminPageHeader';
import { ProductPlaceholder } from '@/components/ProductPlaceholder';
import { Sparkles, Eye, ShoppingBag, Heart, CheckCircle, Target } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'AI Recommendations · Admin' };

export default async function RecommendationsPage() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [views, cartAdds, wishlistAdds, purchases, mostViewed, mostRecommended] =
    await Promise.all([
      prisma.userActivity.count({ where: { activityType: 'view' } }),
      prisma.userActivity.count({ where: { activityType: 'cart_add' } }),
      prisma.userActivity.count({ where: { activityType: 'wishlist_add' } }),
      prisma.userActivity.count({ where: { activityType: 'purchase' } }),
      // Most-viewed products (last 7 days)
      prisma.userActivity.groupBy({
        by: ['productId'],
        where: {
          activityType: 'view',
          createdAt: { gte: sevenDaysAgo },
        },
        _count: true,
        orderBy: { _count: { productId: 'desc' } },
        take: 5,
      }),
      // Featured / popular products the AI surfaces
      prisma.product.findMany({
        where: { isActive: true, isFeatured: true },
        include: { category: true },
        orderBy: { rating: 'desc' },
        take: 6,
      }),
    ]);

  // Enrich most viewed
  const mostViewedIds = mostViewed.map((m) => m.productId);
  const mostViewedProducts = await prisma.product.findMany({
    where: { id: { in: mostViewedIds } },
    include: { category: true },
  });
  const productMap = new Map(mostViewedProducts.map((p) => [p.id, p]));

  const totalActivity = views + cartAdds + wishlistAdds + purchases;

  const stats = [
    {
      Icon: Eye,
      label: 'Product Views',
      value: views.toLocaleString(),
      weight: 1,
      note: 'Weight × 1',
    },
    {
      Icon: ShoppingBag,
      label: 'Cart Additions',
      value: cartAdds.toLocaleString(),
      weight: 3,
      note: 'Weight × 3',
    },
    {
      Icon: Heart,
      label: 'Wishlist Saves',
      value: wishlistAdds.toLocaleString(),
      weight: 4,
      note: 'Weight × 4',
    },
    {
      Icon: CheckCircle,
      label: 'Purchases',
      value: purchases.toLocaleString(),
      weight: 10,
      note: 'Weight × 10',
    },
  ];

  return (
    <div>
      <AdminPageHeader
        eyebrow="AI Engine"
        title="Recommendations"
        subtitle="Hybrid scoring engine: collaborative filtering + content matching + popularity"
      />

      {/* Engine status banner */}
      <div
        className="border border-accent mb-10 p-6"
        style={{
          background:
            'linear-gradient(135deg, #FAF7F2 0%, rgba(176, 141, 90, 0.06) 100%)',
        }}
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
            <Sparkles size={22} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="font-display text-2xl">Engine Online</h2>
              <span className="inline-flex items-center gap-1.5 text-xs text-success">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-soft" />
                Active
              </span>
            </div>
            <p className="text-sm text-muted mt-1 leading-relaxed">
              Powering personal picks, similar products, frequently-bought-together, and smart search across the site.
              Trained on <strong className="text-ink">{totalActivity.toLocaleString()}</strong> behavioural signals.
            </p>
          </div>
        </div>
      </div>

      {/* Activity stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {stats.map(({ Icon, label, value, note }) => (
          <div key={label} className="bg-cream border border-border p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                <Icon size={20} />
              </div>
              <span className="text-[9px] uppercase tracking-widest text-muted-light">
                {note}
              </span>
            </div>
            <div className="text-[10px] uppercase tracking-widest text-muted">{label}</div>
            <div className="font-display text-3xl mt-1">{value}</div>
          </div>
        ))}
      </div>

      {/* Algorithm explainer */}
      <div className="bg-cream border border-border p-8 mb-10">
        <h3 className="font-display text-2xl mb-6 pb-5 border-b border-border flex items-center gap-3">
          <Target size={20} className="text-accent" />
          How Scoring Works
        </h3>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: 'Behavioural Profile',
              body: 'Last 30 days of activity weighted by intent. Purchase signals carry 10× the weight of a view, so the AI quickly picks up genuine preferences.',
            },
            {
              title: 'Content Similarity',
              body: 'Category match (+40), tag overlap (+15 per matching tag), price proximity (−1 per 1K diff). Products near your taste rank higher.',
            },
            {
              title: 'Quality Signals',
              body: 'Rating × 5, review count, featured boost, new arrival boost (+8 for < 30 days), stock penalty (×0.5 if out of stock).',
            },
          ].map((card) => (
            <div key={card.title}>
              <h4 className="font-display text-lg mb-2 text-accent">{card.title}</h4>
              <p className="text-sm text-muted leading-relaxed">{card.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Most viewed */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-cream border border-border">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="font-display text-2xl">Trending Now</h3>
            <p className="text-xs text-muted mt-1">Most viewed in the last 7 days</p>
          </div>
          <div className="divide-y divide-border">
            {mostViewed.length === 0 ? (
              <p className="p-8 text-muted text-sm text-center">No view data yet.</p>
            ) : (
              mostViewed.map((item, i) => {
                const product = productMap.get(item.productId);
                if (!product) return null;
                return (
                  <div
                    key={item.productId}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-cream-200/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-cream-200 text-ink flex items-center justify-center text-sm font-semibold shrink-0">
                      {i + 1}
                    </div>
                    <div className="w-12 h-12 overflow-hidden shrink-0">
                      <ProductPlaceholder
                        productId={product.id}
                        productName={product.name}
                        category={product.category.name}
                        gradient={product.gradient}
                        showWordmark={false}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{product.name}</div>
                      <div className="text-xs text-muted">{product.category.name}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-medium text-accent">{item._count}</div>
                      <div className="text-[10px] uppercase tracking-widest text-muted">
                        views
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Featured curation */}
        <div className="bg-cream border border-border">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="font-display text-2xl">Editor&apos;s Picks</h3>
            <p className="text-xs text-muted mt-1">
              Featured items the AI surfaces to cold-start users
            </p>
          </div>
          <div className="divide-y divide-border">
            {mostRecommended.length === 0 ? (
              <p className="p-8 text-muted text-sm text-center">
                No featured products configured.
              </p>
            ) : (
              mostRecommended.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-cream-200/50 transition-colors"
                >
                  <div className="w-12 h-12 overflow-hidden shrink-0">
                    <ProductPlaceholder
                      productId={product.id}
                      productName={product.name}
                      category={product.category.name}
                      gradient={product.gradient}
                      showWordmark={false}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{product.name}</div>
                    <div className="text-xs text-muted">
                      {product.category.name} · ★ {product.rating}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-medium">{formatPrice(product.price)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
