'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tractor, Lock, Phone } from 'lucide-react';
import { BUSINESS_DETAILS } from '@/data/business';

const STORAGE_KEY = 'ssb_welcome_seen';

export default function WelcomeScreen() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [hiding, setHiding] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setVisible(true);
        setTimeout(() => setReady(true), 80);
      }
    } catch { /* ignore */ }
  }, []);

  const go = (path: string) => {
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* ignore */ }
    setHiding(true);
    setTimeout(() => {
      setVisible(false);
      router.push(path);
    }, 420);
  };

  if (!visible) return null;

  return (
    <div className={`ws-root${hiding ? ' ws-out' : ''}`}>
      {/* ── Background ── */}
      <div className="ws-bg">
        <img
          src="/imgs/jcb-3.webp"
          alt="JCB Background"
          aria-hidden="true"
          className="ws-bg-img"
        />
        <div className="ws-overlay-base" />
      </div>

      {/* ── Centered Card ── */}
      <div className={`ws-layout${ready ? ' ws-layout-ready' : ''}`}>
        <div className="ws-card">
          {/* Logo / Brand */}
          <div className="ws-brand">
            <div className="ws-logo-ring">
              <Tractor size={32} color="#FFD700" strokeWidth={1.5} />
            </div>
            <div className="ws-brand-text">
              <h1 className="ws-brand-name">{BUSINESS_DETAILS.brandName}</h1>
              <p className="ws-brand-sub">Equipment Rental &amp; Borewell</p>
            </div>
          </div>

          <p className="ws-welcome-text">
            Welcome! Please select how you want to continue.
          </p>

          {/* Action Buttons */}
          <div className="ws-actions">
            <button
              className="ws-btn ws-btn-primary"
              onClick={() => go('/')}
            >
              <div className="ws-btn-icon">
                <Tractor size={20} strokeWidth={2} />
              </div>
              <div className="ws-btn-body">
                <strong>Browse &amp; Book</strong>
                <small>For Customers</small>
              </div>
            </button>

            <button
              className="ws-btn ws-btn-secondary"
              onClick={() => go('/admin/login')}
            >
              <div className="ws-btn-icon">
                <Lock size={20} strokeWidth={2} />
              </div>
              <div className="ws-btn-body">
                <strong>Admin Login</strong>
                <small>For Staff</small>
              </div>
            </button>
          </div>

          {/* Footer */}
          <div className="ws-footer">
            <a href={`tel:${BUSINESS_DETAILS.phone}`} className="ws-phone">
              <Phone size={14} strokeWidth={2} />
              {BUSINESS_DETAILS.phone}
            </a>
          </div>
        </div>
      </div>

      <style>{`
        /* ════════════════════════════════════
           ROOT & BACKGROUND
        ════════════════════════════════════ */
        .ws-root {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
          background: #000;
          animation: wsFadeIn 0.3s ease both;
        }
        .ws-root.ws-out {
          animation: wsFadeOut 0.4s ease forwards;
        }
        @keyframes wsFadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes wsFadeOut { from { opacity: 1; } to { opacity: 0; } }

        .ws-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
        }
        .ws-bg-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.5;
        }
        .ws-overlay-base {
          position: absolute; inset: 0;
          background: rgba(0, 0, 0, 0.7);
        }

        /* ════════════════════════════════════
           LAYOUT & CARD
        ════════════════════════════════════ */
        .ws-layout {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 420px;
          padding: 1.5rem;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.4s ease-out;
        }
        .ws-layout-ready {
          opacity: 1;
          transform: translateY(0);
        }

        .ws-card {
          background: rgba(20, 20, 20, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 24px 48px rgba(0,0,0,0.4);
          text-align: center;
        }

        /* ════════════════════════════════════
           BRANDING
        ════════════════════════════════════ */
        .ws-brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .ws-logo-ring {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: rgba(255, 215, 0, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ws-brand-text {
          color: #fff;
        }
        .ws-brand-name {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 0.25rem 0;
          letter-spacing: -0.02em;
        }
        .ws-brand-sub {
          font-size: 0.85rem;
          color: #a0a0a0;
          margin: 0;
        }

        .ws-welcome-text {
          color: #d0d0d0;
          font-size: 0.95rem;
          margin-bottom: 2rem;
          line-height: 1.4;
        }

        /* ════════════════════════════════════
           BUTTONS
        ════════════════════════════════════ */
        .ws-actions {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .ws-btn {
          display: flex;
          align-items: center;
          gap: 1rem;
          width: 100%;
          padding: 1rem;
          border-radius: 12px;
          border: none;
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }
        .ws-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }
        .ws-btn:active {
          transform: translateY(0);
        }

        .ws-btn-primary {
          background: rgba(255, 215, 0, 0.15);
          border: 1px solid rgba(255, 215, 0, 0.3);
        }
        .ws-btn-primary:hover {
          background: rgba(255, 215, 0, 0.25);
        }
        .ws-btn-primary .ws-btn-icon {
          color: #FFD700;
        }

        .ws-btn-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: rgba(0,0,0,0.3);
          color: #a0a0a0;
        }

        .ws-btn-body {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }
        .ws-btn-body strong {
          font-size: 1rem;
          font-weight: 600;
        }
        .ws-btn-body small {
          font-size: 0.8rem;
          color: #a0a0a0;
        }

        /* ════════════════════════════════════
           FOOTER
        ════════════════════════════════════ */
        .ws-footer {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 1.5rem;
        }
        .ws-phone {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #fff;
          text-decoration: none;
          font-size: 0.95rem;
          font-weight: 500;
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          transition: background 0.2s;
        }
        .ws-phone:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}
