'use client';

import React from 'react';
import './footer.css';
import Link from 'next/link';
import {
  Construction,
  FileBadge2,
  Globe,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  Users,
  Lock,
} from 'lucide-react';
import { BUSINESS_DETAILS } from '@/data/business';
import { BUSINESS_LINKS, buildWhatsAppLink } from '@/lib/business';
import { useLanguage } from '@/lib/LanguageContext';

const QUICK_LINKS = [
  { href: '/equipment', label: 'Browse Equipment' },
  { href: '/bookings', label: 'Track Booking' },
  { href: '/pricing', label: 'Pricing Plans' },
  { href: '/support', label: 'Support Center' },
];

const SERVICE_LINKS = [
  { href: '/equipment', label: 'Construction Equipment Hire' },
  { href: '/equipment', label: 'Farming Machinery Support' },
  { href: '/pricing', label: 'Long-term Leasing Plans' },
  { href: '/support', label: 'Maintenance & Site Assistance' },
];

const SOCIAL_LINKS = [
  { href: '/support', label: 'Support Team', icon: Users },
  { href: buildWhatsAppLink('Hello, I need help with equipment booking.'), label: 'WhatsApp', icon: MessageSquare },
  { href: BUSINESS_LINKS.maps, label: 'Location', icon: Globe },
  { href: BUSINESS_LINKS.mailto, label: 'Email', icon: Send },
];

const CONTACT_DETAILS = [
  {
    icon: MapPin,
    text: BUSINESS_DETAILS.address,
  },
  {
    icon: Phone,
    text: BUSINESS_DETAILS.phone,
  },
  {
    icon: Mail,
    text: BUSINESS_DETAILS.email,
  },
  {
    icon: FileBadge2,
    text: `License No: ${BUSINESS_DETAILS.licenseNumber}`,
  },
  {
    icon: FileBadge2,
    text: `GSTIN: ${BUSINESS_DETAILS.gstin}`,
  },
];

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="footer section">
      <div className="container footer-grid">
        <div className="footer-info">
          <div className="footer-logo">
            <Construction size={32} className="logo-icon" />

            <div className="logo-stack">
              <span className="logo-text">
                Shree Sai <span className="accent">Borewell & JCB</span>
              </span>
              <span className="logo-hindi">{BUSINESS_DETAILS.brandNameHindi}</span>
            </div>
          </div>

          <p className="footer-desc">
            {t.brandName} reliable heavy-equipment rental, borewell support, and seasonal machinery
            service.
          </p>

          <div className="social-links">
            {SOCIAL_LINKS.map((socialLink) => {
              const Icon = socialLink.icon;

              return (
                <Link
                  key={socialLink.label}
                  href={socialLink.href}
                  aria-label={socialLink.label}
                  target={socialLink.href.startsWith('http') || socialLink.href.startsWith('mailto:') ? '_blank' : undefined}
                  rel={socialLink.href.startsWith('http') || socialLink.href.startsWith('mailto:') ? 'noreferrer' : undefined}
                >
                  <Icon size={20} />
                </Link>
              );
            })}
          </div>
        </div>

        <div className="footer-links">
          <h4 className="footer-title">Quick Links</h4>
          <ul>
            {QUICK_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-links">
          <h4 className="footer-title">Our Services</h4>
          <ul>
            {SERVICE_LINKS.map((link) => (
              <li key={link.label}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-contact">
          <h4 className="footer-title">Contact Us</h4>

          {CONTACT_DETAILS.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.text} className="contact-item">
                <Icon size={20} className="contact-icon" />
                <p>{item.text}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container bottom-content">
          <p>&copy; {new Date().getFullYear()} {BUSINESS_DETAILS.brandName}. All rights reserved.</p>

          <p>Developed By Rohan Patel</p>

          <div className="bottom-links">
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms & Conditions</Link>
            <Link href="/admin/login" style={{ opacity: 0.15, marginLeft: '12px', display: 'inline-flex', alignItems: 'center' }} aria-label="Admin">
              <Lock size={12} />
            </Link>
          </div>
        </div>
      </div>


    </footer>
  );
}
