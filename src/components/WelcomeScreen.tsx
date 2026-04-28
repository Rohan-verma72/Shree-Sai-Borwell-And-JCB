'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BUSINESS_DETAILS } from '@/data/business';

const STORAGE_KEY = 'ssb_welcome_seen';

export default function WelcomeScreen() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setVisible(true);
      }
    } catch { /* ignore */ }
  }, []);

  const go = (path: string) => {
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* ignore */ }
    setHiding(true);
    setTimeout(() => {
      setVisible(false);
      router.push(path);
    }, 380);
  };

  if (!visible) return null;

  return (
    <div className={`ws-root${hiding ? ' ws-out' : ''}`}>

      {/* Background — Tata Hitachi LCM-220 */}
      <div className="ws-bg">
        <img src="/imgs/tata_hitachi_action.png" alt="" aria-hidden="true" className="ws-bg-img" />
        <div className="ws-bg-overlay" />
      </div>

      {/* Card */}
      <div className="ws-wrap">
        <div className="ws-card">

          <div className="ws-topbar" />

          {/* Brand section */}
          <div className="ws-brand">
            <div className="ws-brand-icon">🏗️</div>
            <h1 className="ws-brand-name">{BUSINESS_DETAILS.brandName}</h1>
            <p className="ws-brand-tagline">Equipment Rental &amp; Borewell Services</p>
            <p className="ws-brand-location">📍 {BUSINESS_DETAILS.primaryServiceArea}</p>
          </div>

          <div className="ws-divider" />

          {/* Prompt */}
          <p className="ws-prompt">How would you like to continue?</p>

          {/* Buttons */}
          <div className="ws-actions">
            <button className="ws-btn ws-btn-gold" onClick={() => go('/')}>
              <div className="ws-btn-left">
                <span className="ws-btn-icon">🚜</span>
                <div>
                  <strong>Browse Equipment</strong>
                  <small>View fleet &amp; book machinery</small>
                </div>
              </div>
              <span className="ws-arrow">→</span>
            </button>

            <button className="ws-btn ws-btn-dark" onClick={() => go('/admin/login')}>
              <div className="ws-btn-left">
                <span className="ws-btn-icon">🔑</span>
                <div>
                  <strong>Admin Login</strong>
                  <small>Manage bookings &amp; operations</small>
                </div>
              </div>
              <span className="ws-arrow">→</span>
            </button>
          </div>

          {/* Footer */}
          <div className="ws-footer">
            <a href={`tel:${BUSINESS_DETAILS.phone}`} className="ws-phone">
              📞 {BUSINESS_DETAILS.phone}
            </a>
            <span className="ws-hours">{BUSINESS_DETAILS.supportHours}</span>
          </div>

        </div>
      </div>

      <style>{`
        .ws-root {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          font-family: 'Segoe UI', Arial, sans-serif;
          animation: wsFadeIn 0.4s ease;
        }
        .ws-root.ws-out { animation: wsFadeOut 0.38s ease forwards; }
        @keyframes wsFadeIn  { from { opacity:0; } to { opacity:1; } }
        @keyframes wsFadeOut { from { opacity:1; } to { opacity:0; } }

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
          opacity: 0.5;
        }
        .ws-bg-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(0,0,0,0.88) 0%,
            rgba(8,6,0,0.82) 50%,
            rgba(0,0,0,0.75) 100%
          );
        }

        /* Wrap */
        .ws-wrap {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 400px;
          animation: wsUp 0.45s cubic-bezier(0.34,1.3,0.64,1);
        }
        @keyframes wsUp {
          from { opacity:0; transform: translateY(30px); }
          to   { opacity:1; transform: translateY(0);    }
        }

        /* Card */
        .ws-card {
          background: rgba(12,12,12,0.92);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 32px 80px rgba(0,0,0,0.7);
          backdrop-filter: blur(28px);
        }

        .ws-topbar {
          height: 4px;
          background: linear-gradient(90deg,#b8860b,#f7ca00,#b8860b);
        }

        /* Brand */
        .ws-brand {
          padding: 32px 32px 20px;
          text-align: center;
        }
        .ws-brand-icon {
          font-size: 2.4rem;
          margin-bottom: 10px;
          filter: drop-shadow(0 4px 12px rgba(247,202,0,0.3));
        }
        .ws-brand-name {
          font-size: 1.25rem;
          font-weight: 800;
          color: #f7ca00;
          margin: 0 0 5px;
          letter-spacing: 0.02em;
          line-height: 1.25;
        }
        .ws-brand-tagline {
          font-size: 0.75rem;
          color: #666;
          margin: 0 0 8px;
        }
        .ws-brand-location {
          font-size: 0.7rem;
          color: #4a4a4a;
          margin: 0;
          line-height: 1.5;
        }

        .ws-divider {
          height: 1px;
          background: rgba(255,255,255,0.06);
          margin: 0 32px;
        }

        .ws-prompt {
          text-align: center;
          font-size: 0.72rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #444;
          margin: 20px 0 14px;
          padding: 0 32px;
        }

        /* Buttons */
        .ws-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 0 24px;
        }

        .ws-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 15px 18px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          text-align: left;
          transition: transform 0.15s, filter 0.15s;
          width: 100%;
        }
        .ws-btn:hover  { transform: translateY(-2px); filter: brightness(1.06); }
        .ws-btn:active { transform: translateY(0);    filter: brightness(0.96); }

        .ws-btn-gold {
          background: linear-gradient(120deg, #c9a800, #f7ca00);
          color: #111;
        }
        .ws-btn-dark {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1) !important;
          color: #fff;
        }

        .ws-btn-left {
          display: flex;
          align-items: center;
          gap: 13px;
        }
        .ws-btn-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
          line-height: 1;
        }
        .ws-btn-left div {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .ws-btn strong {
          font-size: 0.88rem;
          font-weight: 700;
          display: block;
        }
        .ws-btn small {
          font-size: 0.68rem;
          opacity: 0.65;
          display: block;
          font-weight: 400;
        }
        .ws-btn-gold small { opacity: 0.6; }

        .ws-arrow {
          font-size: 1rem;
          opacity: 0.5;
          flex-shrink: 0;
        }

        /* Footer */
        .ws-footer {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          padding: 18px 24px 22px;
          border-top: 1px solid rgba(255,255,255,0.05);
          margin-top: 20px;
        }
        .ws-phone {
          font-size: 0.78rem;
          font-weight: 600;
          color: #c9a800;
          text-decoration: none;
        }
        .ws-phone:hover { color: #f7ca00; }
        .ws-hours {
          font-size: 0.68rem;
          color: #3a3a3a;
        }

        @media (max-width: 420px) {
          .ws-brand { padding: 26px 24px 18px; }
          .ws-actions { padding: 0 18px; }
          .ws-brand-name { font-size: 1.1rem; }
        }
      `}</style>
    </div>
  );
}
