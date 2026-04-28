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
        // Slight delay so entry animation feels intentional
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

      {/* ── Cinematic Background ── */}
      <div className="ws-bg">
        <img
          src="/imgs/tata_hitachi_action.png"
          alt=""
          aria-hidden="true"
          className="ws-bg-img"
        />
        {/* Layered overlays for depth */}
        <div className="ws-overlay-base" />
        <div className="ws-overlay-vignette" />
        <div className="ws-overlay-gold" />
      </div>

      {/* ── Animated background particles / scan lines ── */}
      <div className="ws-scanlines" aria-hidden="true" />

      {/* ── Main layout ── */}
      <div className={`ws-layout${ready ? ' ws-layout-ready' : ''}`}>

        {/* Left — Branding column (desktop only) */}
        <div className="ws-left">
          <div className="ws-left-badge">Est. Since 2012</div>
          <h2 className="ws-left-headline">
            Heavy Equipment<br />
            <span className="ws-left-accent">Hire & Borewell</span><br />
            Experts in MP
          </h2>
          <div className="ws-trust-list">
            {[
              { icon: '✦', label: '10+ Years of Experience' },
              { icon: '✦', label: 'JCB, Poclain, Harvester Fleet' },
              { icon: '✦', label: 'Sehore · Bhopal · Indore' },
              { icon: '✦', label: 'Trusted by 500+ Clients' },
            ].map((item) => (
              <div key={item.label} className="ws-trust-item">
                <span className="ws-trust-dot">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Card column */}
        <div className="ws-right">
          <div className="ws-card">

            {/* Gold accent top bar */}
            <div className="ws-topbar">
              <div className="ws-topbar-shine" />
            </div>

            {/* Logo / Brand */}
            <div className="ws-brand">
              <div className="ws-logo-ring">
                <Tractor size={28} color="#f7ca00" strokeWidth={1.8} />
              </div>
              <div className="ws-brand-text">
                <h1 className="ws-brand-name">{BUSINESS_DETAILS.brandName}</h1>
                <p className="ws-brand-sub">Equipment Rental &amp; Borewell Services</p>
              </div>
            </div>

            {/* Divider */}
            <div className="ws-divider">
              <span className="ws-divider-text">Choose your path</span>
            </div>

            {/* Action Buttons */}
            <div className="ws-actions">

              {/* Customer CTA */}
              <button
                className="ws-btn ws-btn-primary"
                onClick={() => go('/')}
                style={{ animationDelay: '0.1s' }}
              >
                <div className="ws-btn-icon-wrap ws-icon-yellow">
                  <Tractor size={22} strokeWidth={2} />
                </div>
                <div className="ws-btn-body">
                  <strong>Browse &amp; Book Equipment</strong>
                  <small>View fleet, check rates &amp; place requests</small>
                </div>
                <svg className="ws-btn-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>

              {/* Admin CTA */}
              <button
                className="ws-btn ws-btn-ghost"
                onClick={() => go('/admin/login')}
                style={{ animationDelay: '0.2s' }}
              >
                <div className="ws-btn-icon-wrap ws-icon-dim">
                  <Lock size={20} strokeWidth={2} />
                </div>
                <div className="ws-btn-body">
                  <strong>Admin Portal</strong>
                  <small>Manage bookings &amp; operations</small>
                </div>
                <svg className="ws-btn-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>

            </div>

            {/* Footer */}
            <div className="ws-footer">
              <a href={`tel:${BUSINESS_DETAILS.phone}`} className="ws-phone">
                <Phone size={13} strokeWidth={2.2} />
                {BUSINESS_DETAILS.phone}
              </a>
              <span className="ws-sep">·</span>
              <span className="ws-hours">{BUSINESS_DETAILS.supportHours}</span>
            </div>

          </div>

          {/* Below card — licence badge */}
          <div className="ws-licence">
            <span>PWD Lic. {BUSINESS_DETAILS.licenseNumber}</span>
            <span className="ws-dot-sep" />
            <span>GSTIN {BUSINESS_DETAILS.gstin}</span>
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
          align-items: stretch;
          justify-content: stretch;
          font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
          animation: wsFadeIn 0.35s ease both;
        }
        .ws-root.ws-out {
          animation: wsFadeOut 0.42s ease forwards;
        }
        @keyframes wsFadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes wsFadeOut { from { opacity: 1; } to { opacity: 0; } }

        /* Background */
        .ws-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
        }
        .ws-bg-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 40%;
          filter: brightness(0.45) saturate(0.7);
        }
        .ws-overlay-base {
          position: absolute; inset: 0;
          background: rgba(5, 7, 12, 0.72);
        }
        .ws-overlay-vignette {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at center, transparent 25%, rgba(0,0,0,0.75) 100%);
        }
        .ws-overlay-gold {
          position: absolute; inset: 0;
          background: linear-gradient(
            135deg,
            rgba(247, 202, 0, 0.06) 0%,
            transparent 55%,
            rgba(247, 202, 0, 0.03) 100%
          );
        }

        /* Subtle scanlines for industrial feel */
        .ws-scanlines {
          position: absolute; inset: 0; z-index: 0;
          background-image: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0,0,0,0.08) 2px,
            rgba(0,0,0,0.08) 4px
          );
          pointer-events: none;
        }

        /* ════════════════════════════════════
           LAYOUT
        ════════════════════════════════════ */
        .ws-layout {
          position: relative;
          z-index: 1;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5rem;
          padding: 2rem;
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.34,1.3,0.64,1);
        }
        .ws-layout-ready {
          opacity: 1;
          transform: translateY(0);
        }

        /* ════════════════════════════════════
           LEFT COLUMN (desktop only)
        ════════════════════════════════════ */
        .ws-left {
          display: none;
          flex-direction: column;
          max-width: 340px;
          color: #fff;
        }
        @media (min-width: 860px) {
          .ws-left { display: flex; }
        }

        .ws-left-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(247,202,0,0.12);
          border: 1px solid rgba(247,202,0,0.25);
          color: #f7ca00;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          padding: 5px 14px;
          border-radius: 999px;
          margin-bottom: 1.5rem;
          width: fit-content;
        }
        .ws-left-badge::before {
          content: '';
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #f7ca00;
          animation: wsPulse 1.8s ease-in-out infinite;
        }
        @keyframes wsPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.7); }
        }

        .ws-left-headline {
          font-family: 'Outfit', 'Segoe UI', sans-serif;
          font-size: clamp(2rem, 3.5vw, 2.8rem);
          font-weight: 800;
          line-height: 1.18;
          color: #fff;
          margin: 0 0 2rem;
          letter-spacing: -0.01em;
        }
        .ws-left-accent {
          color: #f7ca00;
        }

        .ws-trust-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .ws-trust-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.88rem;
          color: rgba(255,255,255,0.65);
          font-weight: 500;
        }
        .ws-trust-dot {
          color: #f7ca00;
          font-size: 0.6rem;
          flex-shrink: 0;
        }

        /* ════════════════════════════════════
           CARD
        ════════════════════════════════════ */
        .ws-right {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          max-width: 400px;
        }

        .ws-card {
          background: rgba(10, 12, 18, 0.88);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 20px;
          overflow: hidden;
          box-shadow:
            0 0 0 1px rgba(247,202,0,0.08),
            0 32px 80px rgba(0,0,0,0.7),
            0 2px 0 rgba(247,202,0,0.15) inset;
          backdrop-filter: blur(32px);
          -webkit-backdrop-filter: blur(32px);
          width: 100%;
        }

        /* Top gold bar */
        .ws-topbar {
          height: 3px;
          background: linear-gradient(90deg, transparent, #b8860b 20%, #f7ca00 50%, #b8860b 80%, transparent);
          position: relative;
          overflow: hidden;
        }
        .ws-topbar-shine {
          position: absolute;
          top: 0; left: -60%;
          width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
          animation: wsShine 3s ease-in-out infinite 1s;
        }
        @keyframes wsShine {
          0%   { left: -60%; }
          40%  { left: 120%; }
          100% { left: 120%; }
        }

        /* Brand row */
        .ws-brand {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 24px 28px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .ws-logo-ring {
          width: 54px; height: 54px;
          border-radius: 14px;
          background: rgba(247,202,0,0.08);
          border: 1px solid rgba(247,202,0,0.2);
          display: grid;
          place-items: center;
          flex-shrink: 0;
        }
        .ws-brand-text {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .ws-brand-name {
          font-family: 'Outfit', 'Segoe UI', sans-serif;
          font-size: 0.95rem;
          font-weight: 800;
          color: #f7ca00;
          margin: 0;
          line-height: 1.2;
          letter-spacing: 0.01em;
        }
        .ws-brand-sub {
          font-size: 0.68rem;
          color: rgba(255,255,255,0.35);
          margin: 0;
          font-weight: 500;
        }

        /* Divider */
        .ws-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 18px 28px 14px;
        }
        .ws-divider::before,
        .ws-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.07);
        }
        .ws-divider-text {
          font-size: 0.64rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: rgba(255,255,255,0.25);
          white-space: nowrap;
        }

        /* ════════════════════════════════════
           BUTTONS
        ════════════════════════════════════ */
        .ws-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 0 20px;
        }

        .ws-btn {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          border-radius: 14px;
          border: none;
          cursor: pointer;
          text-align: left;
          transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s ease, filter 0.18s ease;
          width: 100%;
          animation: wsBtnIn 0.4s cubic-bezier(0.34,1.3,0.64,1) both;
        }
        @keyframes wsBtnIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .ws-btn:hover  {
          transform: translateY(-3px);
          box-shadow: 0 12px 28px rgba(0,0,0,0.4);
          filter: brightness(1.05);
        }
        .ws-btn:active { transform: translateY(-1px); filter: brightness(0.95); }

        /* Primary (gold) */
        .ws-btn-primary {
          background: linear-gradient(125deg, #c9a200, #f7ca00 60%, #e0b000);
          color: #1a1000;
          box-shadow: 0 6px 24px rgba(247,202,0,0.25);
        }

        /* Ghost (dark) */
        .ws-btn-ghost {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1) !important;
          color: rgba(255,255,255,0.82);
        }
        .ws-btn-ghost:hover {
          background: rgba(255,255,255,0.07);
          border-color: rgba(255,255,255,0.2) !important;
        }

        /* Icon wrapper */
        .ws-btn-icon-wrap {
          width: 40px; height: 40px;
          border-radius: 10px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          transition: transform 0.18s ease;
        }
        .ws-btn:hover .ws-btn-icon-wrap { transform: scale(1.1); }

        .ws-icon-yellow {
          background: rgba(0,0,0,0.18);
          color: #1a1000;
        }
        .ws-icon-dim {
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.5);
        }
        .ws-btn-ghost .ws-icon-dim { color: rgba(255,255,255,0.5); }

        /* Button body text */
        .ws-btn-body {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
        }
        .ws-btn strong {
          font-size: 0.9rem;
          font-weight: 700;
          display: block;
          line-height: 1.2;
        }
        .ws-btn small {
          font-size: 0.68rem;
          opacity: 0.6;
          display: block;
          font-weight: 400;
        }
        .ws-btn-primary small { opacity: 0.55; }

        /* Arrow */
        .ws-btn-arrow {
          flex-shrink: 0;
          opacity: 0.4;
          transition: transform 0.18s ease, opacity 0.18s ease;
        }
        .ws-btn:hover .ws-btn-arrow {
          opacity: 0.8;
          transform: translateX(4px);
        }

        /* ════════════════════════════════════
           FOOTER
        ════════════════════════════════════ */
        .ws-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 0.4rem;
          padding: 16px 20px 20px;
          margin-top: 14px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .ws-phone {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.78rem;
          font-weight: 700;
          color: #f7ca00;
          text-decoration: none;
          transition: color 0.15s;
        }
        .ws-phone:hover { color: #ffe066; }
        .ws-sep {
          color: rgba(255,255,255,0.15);
          font-size: 0.8rem;
        }
        .ws-hours {
          font-size: 0.68rem;
          color: rgba(255,255,255,0.25);
          font-weight: 500;
        }

        /* Licence strip below card */
        .ws-licence {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.62rem;
          color: rgba(255,255,255,0.2);
          font-weight: 500;
          letter-spacing: 0.03em;
        }
        .ws-dot-sep {
          width: 3px; height: 3px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
        }

        /* ════════════════════════════════════
           RESPONSIVE
        ════════════════════════════════════ */
        @media (max-width: 420px) {
          .ws-layout { padding: 1rem; }
          .ws-card { border-radius: 16px; }
          .ws-brand { padding: 18px 20px 16px; }
          .ws-actions { padding: 0 14px; }
          .ws-btn { padding: 13px 14px; }
          .ws-btn strong { font-size: 0.85rem; }
          .ws-footer { padding: 14px 16px 18px; }
          .ws-logo-ring { width: 46px; height: 46px; }
        }
      `}</style>
    </div>
  );
}
