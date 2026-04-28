'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Construction, 
  Menu, 
  Phone, 
  X,
  ChevronRight
} from 'lucide-react';
import { BUSINESS_DETAILS } from '@/data/business';
import { BUSINESS_LINKS } from '@/lib/business';
import { useLanguage } from '@/lib/LanguageContext';

export default function Navbar() {
  const { language, setLanguage, t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container nav-content">
        <Link href="/" className="logo">
          <Construction size={32} className="logo-icon" />
          <div className="logo-stack">
            <span className="logo-text">
              Shree Sai <span className="accent">Borewell</span> & JCB
            </span>
            <span className="logo-hindi">{BUSINESS_DETAILS.brandNameHindi}</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="nav-links">
          <Link href="/equipment" className={pathname === '/equipment' ? 'active' : ''}>{t.allEquipment}</Link>
          <Link href="/bookings" className={pathname === '/bookings' ? 'active' : ''}>{t.bookings}</Link>
          <Link href="/support" className={pathname === '/support' ? 'active' : ''}>{t.support}</Link>
          <Link href="/admin" className="admin-link">{t.adminPanel}</Link>
          
          <button 
            className="lang-toggle"
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
          >
            {language === 'en' ? 'हिन्दी' : 'English'}
          </button>

          <a href={BUSINESS_LINKS.tel} className="nav-contact">
            <Phone size={18} />
            {BUSINESS_DETAILS.phone}
          </a>
        </div>

        {/* Mobile Toggle & Call */}
        <div className="mobile-actions">
          <button
            className="mobile-lang-btn"
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            aria-label="Toggle language"
          >
            {language === 'en' ? 'हि' : 'EN'}
          </button>
          <a href={BUSINESS_LINKS.tel} className="mobile-phone-btn">
            <Phone size={20} fill="var(--primary)" />
          </a>
          <button 
            className="mobile-toggle" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={`mobile-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-nav">
          <Link href="/equipment" onClick={() => setMobileMenuOpen(false)}>
            {t.allEquipment} <ChevronRight size={18} />
          </Link>
          <Link href="/bookings" onClick={() => setMobileMenuOpen(false)}>
            {t.bookings} <ChevronRight size={18} />
          </Link>
          <Link href="/support" onClick={() => setMobileMenuOpen(false)}>
            {t.support} <ChevronRight size={18} />
          </Link>
          <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
            {t.adminPanel} <ChevronRight size={18} />
          </Link>
        </div>

        <div className="mobile-lang-full">
          <button
            className="lang-toggle-full"
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
          >
            <span>{language === 'en' ? '🇮🇳' : '🇬🇧'}</span>
            {language === 'en' ? 'हिन्दी में बदलें' : 'Switch to English'}
          </button>
        </div>
        
        <div className="mobile-footer">
          <a href={BUSINESS_LINKS.tel} className="mobile-call-btn">
            <Phone size={20} /> {t.callToBook}
          </a>
        </div>
      </div>

      {mobileMenuOpen ? <button className="mobile-overlay" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu" /> : null}

      <style jsx>{`
        .navbar {
          position: fixed;
          top: 0.9rem;
          left: 0;
          right: 0;
          height: 84px;
          display: flex;
          align-items: center;
          z-index: 1000;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          background: transparent;
        }

        .navbar.scrolled {
          top: 0.35rem;
          height: 76px;
        }

        .nav-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 4rem;
          width: min(100%, var(--container-max));
          margin: 0 auto;
          padding: 0.8rem 1rem;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          background: rgba(7, 11, 18, 0.72);
          backdrop-filter: blur(10px);
          box-shadow: 0 20px 40px rgba(2, 6, 20, 0.25);
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
        }

        .logo-icon {
          color: var(--primary);
        }

        .logo-stack {
          display: flex;
          flex-direction: column;
          line-height: 1.1;
        }

        .logo-text {
          color: #fff;
          font-weight: 800;
          font-size: 1.25rem;
          letter-spacing: -0.02em;
        }

        .logo-text .accent {
          color: var(--primary);
          margin: 0 0.2rem;
        }

        .logo-hindi {
          font-size: 0.7rem;
          color: var(--primary);
          font-weight: 500;
          opacity: 0.9;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 3.5rem;
        }

        .nav-links a {
          color: var(--text-dim);
          font-weight: 650;
          font-size: 0.95rem;
          transition: color 0.25s;
        }

        .nav-links a:hover, .nav-links a.active {
          color: var(--primary);
        }

        .admin-link {
          padding: 0.45rem 0.85rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.02);
        }

        .nav-contact {
          border: 1px solid rgba(247, 201, 72, 0.7);
          color: var(--primary) !important;
          padding: 0.65rem 1.2rem;
          border-radius: 11px;
          display: flex;
          align-items: center;
          gap: 0.7rem;
          font-weight: 800;
          font-size: 1rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;
        }

        .nav-contact:hover {
          background: var(--primary-low);
          box-shadow: 0 10px 26px rgba(247, 201, 72, 0.18);
        }

        .lang-toggle {
          background: rgba(255, 215, 0, 0.1);
          color: var(--primary);
          border: 1px solid rgba(255, 215, 0, 0.3);
          padding: 0.4rem 0.8rem;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
          font-size: 0.85rem;
          transition: all 0.2s;
        }

        .lang-toggle:hover {
          background: var(--primary);
          color: #000;
        }

        .mobile-toggle {
          display: block;
          background: none;
          border: none;
          color: #fff;
          cursor: pointer;
          padding: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mobile-sidebar {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 300px;
          background: #0a0f19;
          z-index: 999;
          padding: 100px 1.5rem 2rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transform: translateX(100%);
          transition: transform 0.3s ease;
          border-left: 1px solid var(--border-color);
        }

        .mobile-overlay {
          position: fixed;
          inset: 0;
          z-index: 998;
          background: rgba(3, 7, 12, 0.6);
          border: 0;
        }

        .mobile-sidebar.open {
          transform: translateX(0);
        }

        .mobile-nav {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .mobile-nav a {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #fff;
          font-size: 1.2rem;
          font-weight: 700;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-color);
        }

        .mobile-footer {
          margin-top: auto;
        }

        .mobile-call-btn {
          background: var(--primary);
          color: var(--text-dark);
          padding: 1rem;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          font-weight: 800;
          text-decoration: none;
        }

        @media (max-width: 1200px) {
          .nav-links {
            gap: 1.5rem;
          }
          .nav-contact {
            padding: 0.6rem 1rem;
            font-size: 0.9rem;
          }
        }

        .mobile-actions {
          display: none;
          align-items: center;
          gap: 0.5rem;
        }

        .mobile-lang-btn {
          background: rgba(255, 215, 0, 0.12);
          color: var(--primary);
          border: 1px solid rgba(255, 215, 0, 0.3);
          border-radius: 8px;
          padding: 0.3rem 0.6rem;
          font-weight: 800;
          font-size: 0.8rem;
          cursor: pointer;
          min-width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mobile-phone-btn {
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 215, 0, 0.1);
          border: 1px solid rgba(255, 215, 0, 0.2);
          border-radius: 50%;
          color: var(--primary);
        }

        .mobile-lang-full {
          padding: 1rem 0;
          border-top: 1px solid var(--border-color);
          border-bottom: 1px solid var(--border-color);
          margin-bottom: 1rem;
        }

        .lang-toggle-full {
          width: 100%;
          background: rgba(255, 215, 0, 0.08);
          color: var(--primary);
          border: 1px solid rgba(255, 215, 0, 0.25);
          border-radius: 10px;
          padding: 0.85rem 1rem;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          transition: all 0.2s;
        }

        .lang-toggle-full:hover {
          background: rgba(255, 215, 0, 0.15);
        }

        @media (max-width: 900px) {
          .nav-links {
            display: none;
          }

          .mobile-actions {
            display: flex;
          }

          .logo-text {
            font-size: 1.1rem;
          }

          .logo-hindi {
            font-size: 0.65rem;
          }
          
          .nav-content {
            padding: 0.6rem 0.8rem;
            gap: 1rem;
          }
        }

        @media (max-width: 480px) {
          .nav-content {
            gap: 0.5rem;
            padding: 0.5rem 0.65rem;
          }
          .logo-text {
            font-size: 0.9rem;
            max-width: 110px;
          }
          .logo-hindi {
            display: none;
          }
          .mobile-actions {
            gap: 0.35rem;
          }
          .mobile-phone-btn {
            width: 36px;
            height: 36px;
          }
        }
      `}</style>
    </nav>
  );
}
