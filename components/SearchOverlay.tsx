'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProductPlaceholder } from './ProductPlaceholder';
import { formatPrice } from '@/lib/utils';

interface SearchResult {
  id: number;
  name: string;
  slug: string;
  price: number;
  gradient: string | null;
  category: { name: string };
}

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

const POPULAR_SEARCHES = ['Bridal', 'Embroidered', 'Silk', 'Wedding', 'Lawn', 'Saree'];

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [expandedQuery, setExpandedQuery] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Mark mounted so we know document.body is available (SSR-safe)
  useEffect(() => setMounted(true), []);

  // Autofocus on open
  useEffect(() => {
    if (open) {
      // small delay so the input mounts first
      const t = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    } else {
      // Reset on close
      setQuery('');
      setResults([]);
      setSearched(false);
    }
  }, [open]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  // Debounced search
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=8`);
        const data = await res.json();
        if (data.success) {
          setResults(data.data.products || []);
          setExpandedQuery(data.data.expandedQuery || []);
          setSearched(true);
        } else {
          setResults([]);
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(t);
  }, [query]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim().length < 2) return;
    // Navigate to shop with search param (could be a dedicated /search route later)
    onClose();
    router.push(`/shop?search=${encodeURIComponent(query)}`);
  }

  function handleResultClick() {
    onClose();
  }

  function handleSuggestion(term: string) {
    setQuery(term);
    inputRef.current?.focus();
  }

  // Render at document.body via portal so the overlay escapes any ancestor
  // with `backdrop-filter`/`transform`/`filter` (which would break position:fixed).
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 bg-cream z-[100] overflow-y-auto scrollbar-thin"
        >
          {/* Decorative oversized text in the background */}
          <div
            aria-hidden
            className="fixed top-[40%] -right-[10%] font-display italic text-[18rem] text-accent/[0.04] leading-none pointer-events-none hidden md:block select-none"
          >
            Search
          </div>

          <div className="container-padded py-8 md:py-12 relative">
            {/* Top row */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="flex items-center justify-between mb-12"
            >
              <div className="font-display text-xl">
                Maison <span className="text-accent italic">Aurelle</span>
              </div>
              <button
                onClick={onClose}
                className="nav-icon-btn"
                aria-label="Close search"
              >
                <X size={22} />
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="eyebrow mb-6"
            >
              Search The Atelier
            </motion.div>

            {/* Input */}
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              onSubmit={handleSubmit}
              className="relative mb-10 max-w-3xl"
            >
              <Search
                size={22}
                className="absolute left-0 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
              />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for products, categories, styles..."
                className="w-full pl-12 pr-12 py-6 bg-transparent border-0 border-b-2 border-border focus:border-accent text-2xl md:text-4xl font-display italic placeholder:text-muted-light placeholder:italic focus:outline-none transition-colors"
              />
              {loading && (
                <Loader2
                  size={22}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-accent animate-spin"
                />
              )}
            </motion.form>

            {/* Synonym expansion hint */}
            {searched && expandedQuery.length > query.split(/\s+/).length && (
              <div className="mb-8 text-sm text-muted max-w-3xl">
                <span className="text-xs uppercase tracking-wider text-accent mr-2">
                  AI Smart Search
                </span>
                also matched:{' '}
                {expandedQuery
                  .filter((t) => !query.toLowerCase().includes(t))
                  .slice(0, 5)
                  .join(', ')}
              </div>
            )}

            {/* Results / empty states */}
            <div className="min-h-[200px]">
                {/* No query yet — show popular suggestions */}
                {!query && (
                  <div>
                    <div className="text-xs uppercase tracking-widest text-muted mb-4">
                      Popular Searches
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {POPULAR_SEARCHES.map((term) => (
                        <button
                          key={term}
                          onClick={() => handleSuggestion(term)}
                          className="px-4 py-2 border border-border text-sm hover:border-accent hover:text-accent transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Query too short */}
                {query && query.trim().length < 2 && (
                  <div className="text-muted text-sm">Type at least 2 characters…</div>
                )}

                {/* Results */}
                {results.length > 0 && (
                  <div>
                    <div className="text-xs uppercase tracking-widest text-muted mb-4">
                      {results.length} {results.length === 1 ? 'Result' : 'Results'}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {results.map((product, i) => (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.04 }}
                        >
                          <Link
                            href={`/shop/${product.slug}`}
                            onClick={handleResultClick}
                            className="group block"
                          >
                            <div className="aspect-[3/4] overflow-hidden mb-3 bg-cream-200">
                              <div className="w-full h-full transition-transform duration-500 group-hover:scale-105">
                                <ProductPlaceholder
                                  productId={product.id}
                                  productName={product.name}
                                  category={product.category.name}
                                  gradient={product.gradient}
                                  showWordmark={false}
                                />
                              </div>
                            </div>
                            <div className="text-[10px] uppercase tracking-widest text-muted-light mb-1">
                              {product.category.name}
                            </div>
                            <div className="font-display text-base mb-1 group-hover:text-accent transition-colors">
                              {product.name}
                            </div>
                            <div className="text-sm font-medium">
                              {formatPrice(product.price)}
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>

                    <button
                      onClick={handleSubmit}
                      className="mt-8 text-sm text-accent border-b border-accent pb-1 hover:opacity-70 transition-opacity"
                    >
                      View all results for &ldquo;{query}&rdquo; →
                    </button>
                  </div>
                )}

                {/* No results */}
                {searched && !loading && results.length === 0 && query.length >= 2 && (
                  <div className="py-12 text-center">
                    <div className="font-display text-2xl mb-3">
                      No matches for &ldquo;{query}&rdquo;
                    </div>
                    <p className="text-muted mb-6">
                      Try a different keyword or browse our collections.
                    </p>
                    <Link
                      href="/shop"
                      onClick={onClose}
                      className="btn btn-secondary"
                    >
                      Browse All
                    </Link>
                  </div>
                )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
