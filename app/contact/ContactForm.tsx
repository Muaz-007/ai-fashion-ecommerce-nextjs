'use client';

import { useState, FormEvent } from 'react';
import { useStore } from '@/lib/store';

const INQUIRY_TYPES = [
  'General Inquiry',
  'Order Support',
  'Bespoke Fitting',
  'Press / Media',
  'Career Opportunity',
  'Wholesale Inquiry',
];

export function ContactForm() {
  const { showToast } = useStore();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: fd.get('firstName'),
          lastName: fd.get('lastName'),
          email: fd.get('email'),
          phone: fd.get('phone'),
          inquiryType: fd.get('inquiryType'),
          message: fd.get('message'),
        }),
      });
      const data = await res.json();
      showToast(data.message);
      if (data.success) e.currentTarget.reset();
    } catch {
      showToast('Failed to send message');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="form-label">First Name</label>
          <input type="text" name="firstName" required className="form-input" />
        </div>
        <div>
          <label className="form-label">Last Name</label>
          <input type="text" name="lastName" required className="form-input" />
        </div>
      </div>

      <div>
        <label className="form-label">Email Address</label>
        <input type="email" name="email" required className="form-input" />
      </div>

      <div>
        <label className="form-label">Phone (Optional)</label>
        <input type="tel" name="phone" className="form-input" />
      </div>

      <div>
        <label className="form-label">Inquiry Type</label>
        <select name="inquiryType" required className="form-input cursor-pointer">
          <option value="">Select an inquiry type</option>
          {INQUIRY_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="form-label">Message</label>
        <textarea
          name="message"
          rows={5}
          required
          placeholder="Tell us how we can assist you..."
          className="form-input resize-y min-h-[120px]"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="btn btn-primary w-full mt-4 disabled:opacity-50"
      >
        {submitting ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  );
}
