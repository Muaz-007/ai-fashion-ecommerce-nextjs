'use client';

import { useState, FormEvent, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { X, Plus, Upload, Loader2, Sparkles } from 'lucide-react';
import { ProductPlaceholder } from '@/components/ProductPlaceholder';
import { Select } from '@/components/Select';
import { confirmDialog } from '@/components/ConfirmDialog';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface ProductFormProps {
  categories: { id: number; name: string }[];
  /** If provided, form runs in edit mode and submits to PUT instead of POST */
  initial?: {
    id: number;
    name: string;
    sku: string;
    description: string | null;
    material: string | null;
    careInstructions: string | null;
    price: number;
    originalPrice: number | null;
    stockQuantity: number;
    gradient: string | null;
    imageUrl: string | null;
    categoryId: number;
    isFeatured: boolean;
    isActive: boolean;
    sizes: string[];
    colors: string[];
    badges: string[];
    tags: string[];
  };
}

const GRADIENT_PRESETS = [
  { label: 'Gold', value: 'linear-gradient(135deg, #B08D5A 0%, #6B4F2E 100%)' },
  { label: 'Maroon', value: 'linear-gradient(135deg, #5A1A2F 0%, #2C0D17 100%)' },
  { label: 'Espresso', value: 'linear-gradient(135deg, #2C1810 0%, #5C3A28 100%)' },
  { label: 'Beige', value: 'linear-gradient(135deg, #C9B398 0%, #8B6F47 100%)' },
  { label: 'Cream', value: 'linear-gradient(135deg, #E8DFCF 0%, #C9B398 100%)' },
  { label: 'Navy', value: 'linear-gradient(135deg, #1A2F3A 0%, #0D1820 100%)' },
  { label: 'Tan', value: 'linear-gradient(135deg, #8B6F47 0%, #5C3A28 100%)' },
  { label: 'Champagne', value: 'linear-gradient(135deg, #D4B896 0%, #8B6F47 100%)' },
];

const SIZE_PRESETS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'];

const VARIANT_OPTIONS = [
  { value: '', label: 'Auto' },
  { value: 'monogram', label: 'Monogram' },
  { value: 'silhouette', label: 'Silhouette' },
  { value: 'damask', label: 'Damask' },
  { value: 'paisley', label: 'Paisley' },
];

export function ProductForm({ categories, initial }: ProductFormProps) {
  const router = useRouter();
  const { showToast } = useStore();
  const isEdit = !!initial;
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Controlled state
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [material, setMaterial] = useState(initial?.material ?? '');
  const [careInstructions, setCareInstructions] = useState(initial?.careInstructions ?? '');
  const [price, setPrice] = useState<string>(
    initial?.price != null ? String(initial.price) : ''
  );
  const [gradient, setGradient] = useState(initial?.gradient ?? GRADIENT_PRESETS[0].value);
  const [variant, setVariant] = useState<string>('');
  const [categoryId, setCategoryId] = useState<number>(
    initial?.categoryId ?? categories[0]?.id ?? 0
  );
  const [sizes, setSizes] = useState<string[]>(initial?.sizes ?? ['S', 'M', 'L']);
  const [colors, setColors] = useState<string[]>(initial?.colors ?? ['#B08D5A']);
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [badges, setBadges] = useState<string[]>(initial?.badges ?? []);
  const [tagInput, setTagInput] = useState('');
  const [colorInput, setColorInput] = useState('#1A1614');

  // Image upload state
  const [imageUrl, setImageUrl] = useState<string | null>(initial?.imageUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categoryName = categories.find((c) => c.id === categoryId)?.name;

  function toggleSize(size: string) {
    setSizes((s) => (s.includes(size) ? s.filter((x) => x !== size) : [...s, size]));
  }

  function toggleBadge(badge: string) {
    setBadges((b) => (b.includes(badge) ? b.filter((x) => x !== badge) : [...b, badge]));
  }

  function addColor() {
    if (!colorInput || colors.includes(colorInput)) return;
    setColors([...colors, colorInput]);
  }

  function removeColor(c: string) {
    setColors(colors.filter((x) => x !== c));
  }

  function addTagFromInput() {
    const cleaned = tagInput.trim().toLowerCase();
    if (!cleaned || tags.includes(cleaned)) return;
    setTags([...tags, cleaned]);
    setTagInput('');
  }

  function removeTag(t: string) {
    setTags(tags.filter((x) => x !== t));
  }

  async function handleImageUpload(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setImageUrl(data.data.url);
        showToast('Image uploaded');
      } else {
        showToast(data.message ?? 'Upload failed');
      }
    } catch {
      showToast('Upload failed');
    } finally {
      setUploading(false);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) handleImageUpload(file);
  }

  /**
   * Send the currently-uploaded image to Gemini Vision and pre-fill
   * name, description, material, care, tags, category & price.
   * Never overwrites fields the admin has already filled in.
   */
  async function handleAnalyzeWithAI() {
    if (!imageUrl) {
      showToast('Upload an image first');
      return;
    }
    setAnalyzing(true);
    try {
      // Re-download the uploaded image so we can POST it as multipart form-data
      const imgRes = await fetch(imageUrl);
      if (!imgRes.ok) throw new Error('Could not load image');
      const blob = await imgRes.blob();
      const file = new File([blob], 'analyze.jpg', { type: blob.type || 'image/jpeg' });

      const fd = new FormData();
      fd.append('file', file);

      const res = await fetch('/api/admin/ai/describe-product', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();

      if (!data.success) {
        showToast(data.message ?? 'AI analysis failed');
        return;
      }

      const d = data.data as {
        name: string;
        description: string;
        material: string;
        careInstructions: string;
        tags: string[];
        suggestedCategory: string;
        estimatedPriceRange: { min: number; max: number };
      };

      // Only pre-fill empty fields — never trample admin's work
      if (!name) setName(d.name);
      if (!description) setDescription(d.description);
      if (!material) setMaterial(d.material);
      if (!careInstructions) setCareInstructions(d.careInstructions);
      if (!price && d.estimatedPriceRange?.min) {
        setPrice(String(d.estimatedPriceRange.min));
      }

      // Tags: append non-duplicates
      const newTags = (d.tags ?? []).filter((t) => !tags.includes(t));
      if (newTags.length) setTags([...tags, ...newTags]);

      // Category: switch if AI suggestion matches a known category
      const matched = categories.find(
        (c) => c.name.toLowerCase() === d.suggestedCategory?.toLowerCase()
      );
      if (matched) setCategoryId(matched.id);

      showToast('AI suggestions applied — review before saving');
    } catch {
      showToast('AI analysis failed');
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const fd = new FormData(e.currentTarget);

    const payload = {
      name,
      categoryId,
      sku: String(fd.get('sku')) || undefined,
      description: description || undefined,
      material: material || undefined,
      careInstructions: careInstructions || undefined,
      price: Number(price),
      originalPrice: fd.get('originalPrice') ? Number(fd.get('originalPrice')) : null,
      stockQuantity: Number(fd.get('stockQuantity')),
      gradient,
      imageUrl,
      variant: variant || undefined,
      sizes,
      colors,
      badges,
      tags,
      isFeatured: fd.get('isFeatured') === 'on',
      isActive: fd.get('isActive') === 'on',
    };

    try {
      const url = isEdit ? `/api/admin/products/${initial.id}` : '/api/admin/products';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        showToast(isEdit ? `${name} updated` : `${name} created`);
        setTimeout(() => router.push('/admin/products'), 600);
      } else {
        showToast(data.message ?? 'Could not save');
        setSubmitting(false);
      }
    } catch {
      showToast('Could not save');
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!isEdit) return;
    const ok = await confirmDialog({
      title: `Delete "${name}"?`,
      message:
        'This product will be permanently removed. If it has order history, it will be archived instead to preserve records.',
      confirmLabel: 'Delete Product',
      cancelLabel: 'Keep',
      tone: 'danger',
    });
    if (!ok) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${initial.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Product deleted');
        setTimeout(() => router.push('/admin/products'), 600);
      } else {
        showToast(data.message ?? 'Delete failed');
        setDeleting(false);
      }
    } catch {
      showToast('Delete failed');
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_320px] gap-8">
      {/* Main fields */}
      <div className="space-y-6">
        {/* Basics */}
        <Section title="Basics">
          <div>
            <label className="form-label">Product Name *</label>
            <input
              type="text"
              name="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Embroidered Silk Kurta"
              className="form-input"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="form-label">Category *</label>
              <Select
                options={categories.map((c) => ({
                  value: String(c.id),
                  label: c.name,
                }))}
                value={String(categoryId)}
                onChange={(v) => setCategoryId(Number(v))}
                placeholder="Select a category"
                ariaLabel="Category"
              />
            </div>
            <div>
              <label className="form-label">SKU (Optional)</label>
              <input
                type="text"
                name="sku"
                defaultValue={initial?.sku ?? ''}
                placeholder="Auto-generated if blank"
                className="form-input font-mono"
              />
            </div>
          </div>
          <div>
            <label className="form-label">Description</label>
            <textarea
              name="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Story behind the piece — fabric, craft, occasion..."
              className="form-input resize-y min-h-[100px]"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="form-label">Material</label>
              <input
                type="text"
                name="material"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                placeholder="e.g. 100% Mulberry Silk"
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Care Instructions</label>
              <input
                type="text"
                name="careInstructions"
                value={careInstructions}
                onChange={(e) => setCareInstructions(e.target.value)}
                placeholder="e.g. Dry Clean Only"
                className="form-input"
              />
            </div>
          </div>
        </Section>

        {/* Image upload */}
        <Section title="Product Image">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className={cn(
              'relative border-2 border-dashed transition-all',
              imageUrl
                ? 'border-border'
                : 'border-border hover:border-accent bg-cream-200/40'
            )}
          >
            {uploading ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted">
                <Loader2 size={32} className="animate-spin text-accent mb-3" />
                <p className="text-sm">Uploading…</p>
              </div>
            ) : imageUrl ? (
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image
                  src={imageUrl}
                  alt="Product"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  unoptimized
                />
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-ink/80 to-transparent flex justify-end gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleAnalyzeWithAI}
                    disabled={analyzing}
                    className="px-4 py-2 bg-accent text-cream text-xs uppercase tracking-wider flex items-center gap-2 disabled:opacity-60"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        Analyzing…
                      </>
                    ) : (
                      <>
                        <Sparkles size={12} />
                        Analyze with AI
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-cream text-ink text-xs uppercase tracking-wider"
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageUrl(null)}
                    className="px-4 py-2 bg-error text-cream text-xs uppercase tracking-wider"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center justify-center py-16 px-6 hover:bg-cream/40 transition-colors"
              >
                <div className="w-14 h-14 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-4">
                  <Upload size={22} />
                </div>
                <p className="font-medium mb-1">Drop an image here, or click to browse</p>
                <p className="text-xs text-muted">JPEG, PNG, WebP, or GIF · Max 5MB</p>
                <p className="inline-flex items-center gap-1.5 text-xs text-accent mt-4 px-3 py-1.5 bg-accent/10 rounded-full">
                  <Sparkles size={11} />
                  After upload — auto-fill name, description &amp; tags with AI
                </p>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </Section>

        {/* Pricing & Stock */}
        <Section title="Pricing & Stock">
          <div className="grid sm:grid-cols-3 gap-5">
            <div>
              <label className="form-label">Price (PKR) *</label>
              <input
                type="number"
                name="price"
                required
                min="0"
                step="100"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="8500"
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Original Price</label>
              <input
                type="number"
                name="originalPrice"
                min="0"
                step="100"
                defaultValue={initial?.originalPrice ?? ''}
                placeholder="For sale items"
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Stock Quantity *</label>
              <input
                type="number"
                name="stockQuantity"
                required
                min="0"
                defaultValue={initial?.stockQuantity ?? 20}
                className="form-input"
              />
            </div>
          </div>
        </Section>

        {/* Sizes */}
        <Section title="Available Sizes">
          <div className="flex flex-wrap gap-2">
            {SIZE_PRESETS.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                className={cn(
                  'px-4 h-11 border text-sm transition-all',
                  sizes.includes(size)
                    ? 'bg-ink text-cream border-ink'
                    : 'border-border hover:border-ink'
                )}
              >
                {size}
              </button>
            ))}
          </div>
          {sizes.length === 0 && (
            <p className="text-xs text-error mt-2">Select at least one size</p>
          )}
        </Section>

        {/* Colors */}
        <Section title="Colors">
          <div className="flex flex-wrap gap-3 mb-4">
            {colors.map((c) => (
              <div
                key={c}
                className="flex items-center gap-2 pl-1 pr-2 py-1 border border-border"
              >
                <span
                  className="w-7 h-7 rounded-full border border-border shrink-0"
                  style={{ background: c }}
                />
                <span className="text-xs font-mono text-muted">{c}</span>
                <button
                  type="button"
                  onClick={() => removeColor(c)}
                  className="text-muted-light hover:text-error"
                  aria-label={`Remove ${c}`}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={colorInput}
              onChange={(e) => setColorInput(e.target.value)}
              className="w-12 h-11 border border-border cursor-pointer"
            />
            <input
              type="text"
              value={colorInput}
              onChange={(e) => setColorInput(e.target.value)}
              placeholder="#1A1614"
              className="form-input flex-1 max-w-[200px] font-mono"
            />
            <button
              type="button"
              onClick={addColor}
              className="btn btn-secondary text-xs h-11 py-0 px-4"
            >
              <Plus size={14} /> Add
            </button>
          </div>
        </Section>

        {/* Tags */}
        <Section title="Tags">
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((t) => (
              <div
                key={t}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-cream-200 text-xs"
              >
                <span>{t}</span>
                <button
                  type="button"
                  onClick={() => removeTag(t)}
                  className="text-muted-light hover:text-error"
                  aria-label={`Remove ${t}`}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTagFromInput();
                }
              }}
              placeholder="Type a tag and press Enter (e.g. embroidered)"
              className="form-input flex-1"
            />
            <button
              type="button"
              onClick={addTagFromInput}
              className="btn btn-secondary text-xs h-11 py-0 px-4"
            >
              Add
            </button>
          </div>
        </Section>

        {/* Badges */}
        <Section title="Badges">
          <div className="grid sm:grid-cols-3 gap-3">
            {(['new', 'sale', 'bestseller'] as const).map((badge) => (
              <label
                key={badge}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 border cursor-pointer transition-all',
                  badges.includes(badge)
                    ? 'border-accent bg-accent/5'
                    : 'border-border hover:border-accent/50'
                )}
              >
                <input
                  type="checkbox"
                  checked={badges.includes(badge)}
                  onChange={() => toggleBadge(badge)}
                  className="accent-accent w-4 h-4"
                />
                <span className="text-sm capitalize">{badge}</span>
              </label>
            ))}
          </div>
        </Section>

        {/* Status */}
        <Section title="Status">
          <div className="space-y-3">
            <label className="flex items-center justify-between py-3 border-b border-border cursor-pointer">
              <div>
                <div className="font-medium">Active</div>
                <div className="text-xs text-muted">Show this product on the storefront</div>
              </div>
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={initial?.isActive ?? true}
                className="accent-accent w-4 h-4"
              />
            </label>
            <label className="flex items-center justify-between py-3 cursor-pointer">
              <div>
                <div className="font-medium">Featured</div>
                <div className="text-xs text-muted">
                  Highlight on home page & new-user recommendations
                </div>
              </div>
              <input
                type="checkbox"
                name="isFeatured"
                defaultChecked={initial?.isFeatured ?? false}
                className="accent-accent w-4 h-4"
              />
            </label>
          </div>
        </Section>

        {/* Mobile submit row */}
        <div className="flex flex-wrap gap-3 lg:hidden pt-4">
          <button
            type="submit"
            disabled={submitting || sizes.length === 0}
            className="btn btn-primary flex-1 disabled:opacity-60"
          >
            {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Product'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/products')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="btn text-error border border-error/30 hover:bg-error hover:text-cream hover:border-error transition-colors disabled:opacity-60 w-full"
            >
              {deleting ? 'Deleting…' : 'Delete Product'}
            </button>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <aside className="lg:sticky lg:top-6 lg:self-start space-y-6">
        <div className="bg-cream border border-border p-5">
          <div className="text-[10px] uppercase tracking-widest text-muted mb-3">
            Live Preview
          </div>
          <div className="aspect-[3/4] overflow-hidden mb-4 relative bg-cream-200">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt="Preview"
                fill
                className="object-cover"
                sizes="320px"
                unoptimized
              />
            ) : (
              <ProductPlaceholder
                productName={name || 'Untitled'}
                category={categoryName}
                gradient={gradient}
                variant={
                  (variant || undefined) as
                    | 'monogram'
                    | 'silhouette'
                    | 'damask'
                    | 'paisley'
                    | undefined
                }
              />
            )}
          </div>
          <div className="text-[10px] uppercase tracking-widest text-muted-light mb-1">
            {categoryName ?? 'Category'}
          </div>
          <h4 className="font-display text-lg leading-tight">
            {name || 'Untitled Product'}
          </h4>
        </div>

        {!imageUrl && (
          <Section title="Placeholder Style">
            <div>
              <label className="text-xs uppercase tracking-widest text-muted block mb-2">
                Background Gradient
              </label>
              <div className="grid grid-cols-4 gap-2">
                {GRADIENT_PRESETS.map((g) => (
                  <button
                    key={g.label}
                    type="button"
                    onClick={() => setGradient(g.value)}
                    className={cn(
                      'aspect-square border-2 transition-all',
                      gradient === g.value
                        ? 'border-accent scale-95'
                        : 'border-transparent hover:border-accent/50'
                    )}
                    style={{ background: g.value }}
                    title={g.label}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-widest text-muted block mb-2">
                Motif Variant
              </label>
              <Select
                options={VARIANT_OPTIONS}
                value={variant}
                onChange={setVariant}
                placeholder="Auto"
                ariaLabel="Motif variant"
              />
            </div>
          </Section>
        )}

        <div className="hidden lg:flex flex-col gap-3">
          <button
            type="submit"
            disabled={submitting || sizes.length === 0}
            className="btn btn-primary disabled:opacity-60"
          >
            {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Product'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/products')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="text-xs uppercase tracking-widest text-error hover:text-error/80 mt-2 py-2"
            >
              {deleting ? 'Deleting…' : 'Delete Product'}
            </button>
          )}
        </div>
      </aside>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-cream border border-border p-6">
      <h3 className="font-display text-lg mb-5 pb-3 border-b border-border">{title}</h3>
      <div className="space-y-5">{children}</div>
    </div>
  );
}
