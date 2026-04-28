'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { BUSINESS_DETAILS } from '@/data/business';

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [showPass, setShowPass] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const username = formData.get('username');
    const password = formData.get('password');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        toast.success('Welcome back!');
        router.push('/admin');
        router.refresh();
      } else {
        toast.error('Invalid credentials. Please try again.');
      }
    } catch {
      toast.error('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      {/* Background */}
      <div className="login-bg">
        <img src="/imgs/auth-bg.png" alt="" aria-hidden="true" className="login-bg-img" />
        <div className="login-bg-overlay" />
      </div>

      {/* Card */}
      <div className="login-wrap">
        <div className="login-card">

          {/* Gold top accent */}
          <div className="login-topbar" />

          {/* Header */}
          <div className="login-header">
            <div className="login-badge">
              <ShieldCheck size={18} strokeWidth={2.5} />
              <span>Admin Portal</span>
            </div>

            <div className="login-brand">
              <span className="login-brand-name">{BUSINESS_DETAILS.brandName}</span>
              <span className="login-brand-sub">Equipment Rental &amp; Fleet Management</span>
            </div>
          </div>

          <div className="login-divider" />

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                autoComplete="username"
                placeholder="Enter your username"
                disabled={loading}
              />
            </div>

            <div className="login-field">
              <label htmlFor="password">Password</label>
              <div className="login-pass-wrap">
                <input
                  id="password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="login-eye"
                  onClick={() => setShowPass(p => !p)}
                  tabIndex={-1}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="login-submit"
            >
              {loading ? (
                <span className="login-spinner" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="login-footer">
            <span>Authorised access only</span>
            <span>&nbsp;·&nbsp;</span>
            <span>{BUSINESS_DETAILS.phone}</span>
          </div>
        </div>
      </div>

      <style>{`
        .login-root {
          position: relative;
          width: 100%;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Segoe UI', Arial, sans-serif;
          overflow: hidden;
        }

        /* Background */
        .login-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
        }
        .login-bg-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.55;
        }
        .login-bg-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(0,0,0,0.75) 0%, rgba(10,8,0,0.80) 100%);
        }

        /* Wrap */
        .login-wrap {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 420px;
          padding: 20px;
          animation: loginFadeUp 0.45s cubic-bezier(0.34,1.3,0.64,1);
        }
        @keyframes loginFadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0);    }
        }

        /* Card */
        .login-card {
          background: rgba(14, 14, 14, 0.92);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04);
          backdrop-filter: blur(24px);
        }

        .login-topbar {
          height: 4px;
          background: linear-gradient(90deg, #b8860b, #f7ca00, #b8860b);
        }

        /* Header */
        .login-header {
          padding: 32px 36px 24px;
        }

        .login-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: rgba(247,202,0,0.1);
          border: 1px solid rgba(247,202,0,0.2);
          color: #c9a800;
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 5px 12px;
          border-radius: 6px;
          margin-bottom: 20px;
        }

        .login-brand {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .login-brand-name {
          font-size: 1.35rem;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: 0.01em;
          line-height: 1.2;
        }
        .login-brand-sub {
          font-size: 0.75rem;
          color: #666;
          font-weight: 500;
        }

        .login-divider {
          height: 1px;
          background: rgba(255,255,255,0.06);
          margin: 0 36px;
        }

        /* Form */
        .login-form {
          padding: 28px 36px 24px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .login-field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .login-field label {
          font-size: 0.72rem;
          font-weight: 600;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .login-field input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 13px 16px;
          color: #fff;
          font-size: 0.92rem;
          font-family: inherit;
          transition: border-color 0.2s;
          outline: none;
          box-sizing: border-box;
        }
        .login-field input:focus {
          border-color: rgba(247,202,0,0.4);
          background: rgba(255,255,255,0.06);
        }
        .login-field input::placeholder { color: #444; }
        .login-field input:disabled { opacity: 0.5; }

        .login-pass-wrap {
          position: relative;
        }
        .login-pass-wrap input {
          padding-right: 46px;
        }
        .login-eye {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #555;
          cursor: pointer;
          padding: 4px;
          line-height: 1;
          transition: color 0.15s;
        }
        .login-eye:hover { color: #aaa; }

        .login-submit {
          width: 100%;
          padding: 14px;
          border-radius: 10px;
          border: none;
          background: linear-gradient(120deg, #c9a800, #f7ca00);
          color: #000;
          font-size: 0.92rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          cursor: pointer;
          margin-top: 4px;
          transition: filter 0.2s, transform 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 48px;
        }
        .login-submit:hover:not(:disabled) {
          filter: brightness(1.07);
          transform: translateY(-1px);
        }
        .login-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .login-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(0,0,0,0.2);
          border-top-color: #000;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Footer */
        .login-footer {
          padding: 14px 36px 20px;
          font-size: 0.7rem;
          color: #3a3a3a;
          text-align: center;
          border-top: 1px solid rgba(255,255,255,0.04);
        }

        @media (max-width: 480px) {
          .login-header,
          .login-form { padding-left: 24px; padding-right: 24px; }
          .login-divider { margin: 0 24px; }
          .login-footer { padding-left: 24px; padding-right: 24px; }
          .login-brand-name { font-size: 1.15rem; }
        }
      `}</style>
    </div>
  );
}
