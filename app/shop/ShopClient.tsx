'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ProductCard } from '@/components/ProductCard';
import { Select } from '@/components/Select';
import { formatPrice, cn } from '@/lib/utils';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  originalPrice: number | null;
  gradient: string | null;
  imageUrl: string | null;
  rating: number;
  reviewCount: number;
  category: { name: string };
  badges: { badgeType: string }[];
  colors: { colorHex: string }[];
}

interface Category {
  id: number;
  name: string;
  _count: { products: number };
}

interface ShopClientProps {
  initialProducts: Product[];
  categories: Category[];
  activeCategory: string;
  searchQuery?: string;
}

const COLOR_SWATCHES = [
  { hex: '#B08D5A', name: 'Gold' },
  { hex: '#5A1A2F', name: 'Maroon' },
  { hex: '#1A1614', name: 'Black' },
  { hex: '#C9B398', name: 'Beige' },
  { hex: '#1A2F3A', name: 'Navy' },
  { hex: '#E8DFCF', name: 'Cream' },
  { hex: '#8B6F47', name: 'Tan' },
  { hex: '#D4B896', name: 'Champagne' },
];

export function ShopClient({ initialProducts, categories, activeCategory, searchQuery }: ShopClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [color, setColor] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState(100000);
  const [sort, setSort] = useState<string>('featured');

  const filtered = useMemo(() => {
    let result = [...initialProducts];

    if (color) {
      result = result.filter((p) => p.colors.some((c) => c.colorHex === color));
    }
    result = result.filter((p) => p.price <= maxPrice);

    switch (sort) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.sort((a, b) => {
          const aNew = a.badges.some((bg) => bg.badgeType === 'new') ? 1 : 0;
          const bNew = b.badges.some((bg) => bg.badgeType === 'new') ? 1 : 0;
          return bNew - aNew;
        });
        break;
    }

    return result;
  }, [initialProducts, color, maxPrice, sort]);

  function setCategory(cat: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (cat === 'All') {
      params.delete('category');
    } else {
      params.set('category', cat);
    }
    router.push(`/shop?${params.toString()}`);
  }

  return (
    <>
      {/* Page header */}
      <section className="pt-44 md:pt-52 pb-16 text-center bg-gradient-to-b from-cream-200 to-cream">
        <div className="container-padded">
          <div className="eyebrow mb-5">
            {searchQuery ? 'Search Results' : 'The Collection'}
          </div>
          <motion.h1
            key={searchQuery ?? activeCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-display-xl mb-4"
          >
            {searchQuery ? (
              <>
                Results for <em className="text-accent italic font-normal">&ldquo;{searchQuery}&rdquo;</em>
              </>
            ) : activeCategory === 'All' ? (
              <>
                Shop <em className="text-accent italic font-normal">All</em>
              </>
            ) : (
              <em className="text-accent italic font-normal">{activeCategory}</em>
            )}
          </motion.h1>
          <div className="flex justify-center gap-3 text-sm text-muted uppercase tracking-wider">
            <span>Home</span>
            <span>·</span>
            <span>{searchQuery ? `"${searchQuery}"` : activeCategory}</span>
          </div>
        </div>
      </section>

      <div className="container-padded py-12">
        <div className="grid md:grid-cols-[260px_1fr] gap-12">
          {/* Sidebar filters */}
          <aside className="md:sticky md:top-32 md:self-start space-y-10">
            <div className="border-b border-border pb-8">
              <h4 className="text-xs uppercase tracking-wider font-semibold mb-5">Category</h4>
              <div className="space-y-3">
                {[{ name: 'All', _count: { products: initialProducts.length } }, ...categories].map(
                  (cat) => (
                    <label
                      key={cat.name}
                      className="flex items-center gap-3 cursor-pointer text-sm text-muted hover:text-ink transition-colors"
                    >
                      <input
                        type="radio"
                        name="category"
                        value={cat.name}
                        checked={activeCategory === cat.name}
                        onChange={() => setCategory(cat.name)}
                        className="accent-accent w-4 h-4"
                      />
                      <span>{cat.name}</span>
                      <span className="ml-auto text-muted-light text-xs">
                        {cat._count.products}
                      </span>
                    </label>
                  )
                )}
              </div>
            </div>

            <div className="border-b border-border pb-8">
              <h4 className="text-xs uppercase tracking-wider font-semibold mb-5">Price Range</h4>
              <input
                type="range"
                min={0}
                max={100000}
                step={1000}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-accent"
              />
              <div className="flex justify-between mt-2 text-xs text-muted">
                <span>PKR 0</span>
                <span>{formatPrice(maxPrice)}</span>
              </div>
            </div>

            <div className="border-b border-border pb-8">
              <h4 className="text-xs uppercase tracking-wider font-semibold mb-5">Color</h4>
              <div className="flex flex-wrap gap-2">
                {COLOR_SWATCHES.map((swatch) => (
                  <button
                    key={swatch.hex}
                    onClick={() => setColor(color === swatch.hex ? null : swatch.hex)}
                    className={cn(
                      'w-8 h-8 rounded-full border-2 transition-all',
                      color === swatch.hex
                        ? 'border-accent scale-110'
                        : 'border-transparent hover:border-accent/50'
                    )}
                    style={{ background: swatch.hex }}
                    title={swatch.name}
                    aria-label={swatch.name}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setColor(null);
                setMaxPrice(100000);
                setSort('featured');
                setCategory('All');
              }}
              className="btn btn-secondary w-full text-[10px] py-3"
            >
              Reset Filters
            </button>
          </aside>

          {/* Products */}
          <main>
            <div className="flex justify-between items-center mb-8 pb-6 border-b border-border flex-wrap gap-4">
              <div className="text-sm text-muted">
                Showing {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-muted whitespace-nowrap">Sort by:</label>
                <div className="min-w-[200px]">
                  <Select
                    options={[
                      { value: 'featured', label: 'Featured' },
                      { value: 'newest', label: 'Newest' },
                      { value: 'price-low', label: 'Price: Low to High' },
                      { value: 'price-high', label: 'Price: High to Low' },
                      { value: 'rating', label: 'Best Rated' },
                    ]}
                    value={sort}
                    onChange={setSort}
                    ariaLabel="Sort products"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-24 text-muted">
                No products match your filters.
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
