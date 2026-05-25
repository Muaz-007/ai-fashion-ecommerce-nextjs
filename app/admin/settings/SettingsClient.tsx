'use client';

import { useState, FormEvent } from 'react';
import { useStore } from '@/lib/store';

interface SettingsClientProps {
  firstName: string;
  lastName: string;
  phone: string;
}

export function SettingsClient({ firstName, lastName, phone }: SettingsClientProps) {
  const { showToast } = useStore();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  async function handleProfile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSavingProfile(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: fd.get('firstName'),
          lastName: fd.get('lastName'),
          phone: fd.get('phone'),
        }),
      });
      const data = await res.json();
      showToast(data.message ?? (data.success ? 'Profile updated' : 'Update failed'));
    } catch {
      showToast('Update failed');
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const next = String(fd.get('newPassword'));
    const confirm = String(fd.get('confirmPassword'));
    if (next !== confirm) {
      showToast('New passwords do not match');
      return;
    }
    if (next.length < 8) {
      showToast('Password must be at least 8 characters');
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: fd.get('currentPassword'),
          newPassword: next,
        }),
      });
      const data = await res.json();
      showToast(data.message ?? (data.success ? 'Password changed' : 'Change failed'));
      if (data.success) e.currentTarget.reset();
    } catch {
      showToast('Change failed');
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile */}
      <div className="bg-cream border border-border p-8">
        <h3 className="font-display text-2xl mb-2">Profile Information</h3>
        <p className="text-sm text-muted mb-6">
          Update your personal details. Email cannot be changed.
        </p>

        <form onSubmit={handleProfile} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="form-label">First Name</label>
              <input
                type="text"
                name="firstName"
                defaultValue={firstName}
                required
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Last Name</label>
              <input
                type="text"
                name="lastName"
                defaultValue={lastName}
                required
                className="form-input"
              />
            </div>
          </div>
          <div>
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              name="phone"
              defaultValue={phone}
              placeholder="+92 300 0000000"
              className="form-input"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={savingProfile}
              className="btn btn-primary text-xs disabled:opacity-60"
            >
              {savingProfile ? 'Saving…' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* Password */}
      <div className="bg-cream border border-border p-8">
        <h3 className="font-display text-2xl mb-2">Change Password</h3>
        <p className="text-sm text-muted mb-6">
          Use a strong, unique password for the admin account.
        </p>

        <form onSubmit={handlePassword} className="space-y-5">
          <div>
            <label className="form-label">Current Password</label>
            <input
              type="password"
              name="currentPassword"
              required
              className="form-input"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="form-label">New Password</label>
              <input
                type="password"
                name="newPassword"
                required
                minLength={8}
                placeholder="At least 8 characters"
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                required
                minLength={8}
                className="form-input"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={savingPassword}
              className="btn btn-primary text-xs disabled:opacity-60"
            >
              {savingPassword ? 'Updating…' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
