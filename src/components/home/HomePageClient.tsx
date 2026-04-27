'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight, CheckCircle, Shield, Clock, MapPin, CircleCheck, Headset, ImageIcon } from 'lucide-react';
import type { Equipment, GalleryItem } from '@/data/types';
import EquipmentImageSlider from '@/components/equipment/EquipmentImageSlider';
import { BUSINESS_DETAILS } from '@/data/business';
import { useLanguage } from '@/lib/LanguageContext';

type HomePageClientProps = {
  featuredEquipment: Equipment[];
  recentGallery: GalleryItem[];
};

export default function HomePageClient({ featuredEquipment, recentGallery }: HomePageClientProps) {
  const { t } = useLanguage();
  const supportLabel = BUSINESS_DETAILS.supportHours
    .replace('Mon-Sun, ', '')
    .replace(':00', '')
    .replace(' to ', ' - ');

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="container hero-content">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="hero-text"
          >
            <span className="badge">Shree Sai Borewell & JCB | Bhopal - Indore</span>
            <h1>
              {t.heroTitle.split('Shree Sai').map((part, i, arr) => (
                <React.Fragment key={i}>
                  {part}
                  {i < arr.length - 1 && <span className="accent">Shree Sai</span>}
                </React.Fragment>
              ))}
            </h1>
            <p>{t.heroSubtitle}</p>
            <div className="hero-actions">
              <Link href="/equipment" className="btn-primary">
                {t.viewEquipment} <ArrowRight size={20} />
              </Link>
              <Link href="/support" className="btn-secondary">
                {t.getQuote}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="featured section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="title">
                {t.ourFleet.split('Heavy').map((part, i, arr) => (
                  <React.Fragment key={i}>
                    {part}
                    {i < arr.length - 1 && <span className="accent">Heavy</span>}
                  </React.Fragment>
                ))}
              </h2>
              <p className="subtitle">{t.fleetSubtitle}</p>
            </div>
            <Link href="/equipment" className="view-all">
              View All <ChevronRight size={18} />
            </Link>
          </div>

          <div className="equipment-grid">
            {featuredEquipment.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="eq-card glass-card"
              >
                <div className="eq-image">
                  <EquipmentImageSlider
                    images={item.images ?? [item.image]}
                    alt={item.name}
                    badge={<div className="eq-badge">{item.type}</div>}
                  />
                </div>
                <div className="eq-info">
                  <h3>{item.name}</h3>
                  <div className="eq-price">
                    <div className="price-main">
                      <span className="label">{t.daily}:</span>
                      <span className="value">Rs {item.dailyRate}</span>
                    </div>
                  </div>
                  <Link href={`/equipment/${item.id}`} className="btn-book">
                    {t.bookNow}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {recentGallery && recentGallery.length > 0 && (
        <section className="gallery section section-alt">
          <div className="container">
            <div className="section-header">
              <div>
                <h2 className="title">Recent <span className="accent">Site</span> Gallery</h2>
                <p className="subtitle">Real photos from our active excavation and borewell sites across MP.</p>
              </div>
            </div>

            <div className="gallery-grid">
              {recentGallery.map((img, i) => (
                <motion.div 
                  key={img.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="gallery-item-wrap"
                >
                  <div className="gallery-img-box">
                     <img src={img.imageUrl} alt={img.title} />
                     <div className="gallery-overlay">
                        <MapPin size={14} /> {img.location}
                     </div>
                  </div>
                  <h4>{img.title}</h4>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="service-area section">
        <div className="container area-content">
          <div className="area-text">
            <h2>
              {t.activeSites.split('MP\'s').map((part, i, arr) => (
                 <React.Fragment key={i}>
                    {part}
                    {i < arr.length - 1 && <span className="accent">MP's</span>}
                 </React.Fragment>
              ))}
            </h2>
            <p>
              {BUSINESS_DETAILS.brandName} supports contractor and farming demand across
              Sehore, Bhopal, Indore, Vidisha, and nearby work belts.
            </p>
            <ul className="area-list">
              <li><MapPin size={16} /> Bhopal Metropolitan Region</li>
              <li><MapPin size={16} /> Sehore Farmers Hub</li>
              <li><MapPin size={16} /> Vidisha Agricultural Zone</li>
              <li><MapPin size={16} /> Indore Super Corridor</li>
            </ul>
          </div>
          <div className="area-visual" id="map-section">
            <div className="map-frame glass-card">
              <iframe
                src="https://maps.google.com/maps?q=Bhopal%20Madhya%20Pradesh&t=&z=9&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="450"
                style={{ border: 0, borderRadius: 'var(--radius-md)', display: 'block', background: '#1c1c1c' }}
                allowFullScreen={true}
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      <section className="trust-badges section">
        <div className="container badges-grid">
          <div className="trust-strip">
            <span><CircleCheck size={14} /> {t.verifiedOperators}</span>
            <span><CircleCheck size={14} /> {t.transparentPricing}</span>
            <span><Headset size={14} /> {t.dispatchSupport}</span>
          </div>
          <div className="badge-card">
            <Shield className="badge-icon" />
            <div>
              <h4>{t.trustMaintained}</h4>
              <p>Performance guaranteed for every work site</p>
            </div>
          </div>
          <div className="badge-card">
            <Clock className="badge-icon" />
            <div>
              <h4>{t.available} 24/7</h4>
              <p>Planned dispatch across Sehore, Bhopal and Indore routes</p>
            </div>
          </div>
          <div className="badge-card">
            <CheckCircle className="badge-icon" />
            <div>
              <h4>{t.trustOperator}</h4>
              <p>Maintained machines with operator-ready support</p>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .hero {
          position: relative;
          height: 82vh;
          min-height: 620px;
          display: flex;
          align-items: center;
          background: url('/imgs/hero_main.png') center/cover no-repeat;
          background-position: center;
          padding-top: 138px;
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(108deg, rgba(7, 10, 17, 0.95) 20%, rgba(10, 18, 32, 0.65) 56%, rgba(7, 10, 17, 0.45));
        }

        .hero-content {
          position: relative;
          z-index: 10;
        }

        .hero-text {
          max-width: 650px;
          padding: 0.8rem 0;
        }

        .badge {
          display: inline-block;
          background: rgba(247, 201, 72, 0.12);
          color: var(--primary);
          padding: 0.5rem 1rem;
          border-radius: var(--radius-full);
          font-weight: 700;
          font-size: 0.8rem;
          margin-bottom: 1.5rem;
          text-transform: uppercase;
          border: 1px solid rgba(247, 201, 72, 0.45);
        }

        .hero-text h1 {
          font-size: clamp(2.7rem, 6vw, 4.8rem);
          line-height: 1.1;
          margin-bottom: 1rem;
          letter-spacing: -0.02em;
        }

        .hero-text .accent {
          color: var(--primary);
        }

        .hero-text p {
          font-size: 1.15rem;
          color: var(--text-dim);
          margin-bottom: 1.2rem;
          max-width: 58ch;
        }

        .hero-actions {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 1.4rem;
        }

        .hero-stats {
          display: flex;
          gap: 3rem;
          align-items: center;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(9, 13, 21, 0.55);
          border-radius: 16px;
          padding: 0.72rem 1rem;
          width: fit-content;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
        }

        .stat-num {
          font-size: 2.5rem;
          font-weight: 800;
          color: #fff;
          font-family: 'Outfit';
        }

        .stat-label {
          color: var(--text-dim);
          font-size: 0.9rem;
          text-transform: uppercase;
        }

        .stat-item.divider {
          width: 1px;
          height: 40px;
          background: var(--border-color);
        }

        .section {
          padding: 6.5rem 0;
        }

        .badges-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .trust-strip {
          grid-column: 1 / -1;
          display: flex;
          flex-wrap: wrap;
          gap: 0.7rem;
          margin-bottom: 0.35rem;
        }

        .trust-strip span {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.48rem 0.78rem;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.03);
          color: #d7deee;
          font-size: 0.79rem;
          font-weight: 600;
        }

        .badge-card {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 2rem;
          background: linear-gradient(160deg, rgba(255, 255, 255, 0.03), transparent), var(--bg-card);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow-sm);
        }

        .badge-icon {
          width: 40px;
          height: 40px;
          color: var(--primary);
          flex-shrink: 0;
        }

        .badge-card h4 {
          font-size: 1.2rem;
          margin-bottom: 0.25rem;
        }

        .badge-card p {
          color: var(--text-dim);
          font-size: 0.9rem;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 3rem;
          width: 100%;
        }

        .title {
          font-size: 3.5rem;
          margin-bottom: 1rem;
          line-height: 1.1;
          max-width: 800px;
        }

        .subtitle {
          color: var(--text-dim);
          font-size: 1.1rem;
          max-width: 600px;
          line-height: 1.7;
        }

        .view-all {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--primary);
          font-weight: 600;
          border-bottom: 1px dashed rgba(247, 201, 72, 0.4);
          padding-bottom: 0.25rem;
        }

        .equipment-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        .eq-card {
          overflow: hidden;
          border-radius: var(--radius-lg);
          transition: transform 0.25s, border-color 0.25s;
        }

        .eq-card:hover {
          transform: translateY(-8px);
          border-color: rgba(247, 201, 72, 0.4);
        }

        .eq-image {
          position: relative;
          height: 220px;
        }

        .eq-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: var(--bg-main);
          padding: 0.3rem 0.8rem;
          font-size: 0.75rem;
          font-weight: 700;
          border-radius: var(--radius-sm);
          color: var(--primary);
        }

        .eq-info {
          padding: 1.4rem;
        }

        .eq-info h3 {
          font-size: 1.4rem;
          margin-bottom: 1rem;
        }

        .eq-specs {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .eq-specs span {
          background: var(--bg-accent);
          padding: 0.3rem 0.7rem;
          font-size: 0.8rem;
          border-radius: var(--radius-sm);
          color: var(--text-dim);
        }

        .eq-price {
          display: flex;
          justify-content: space-between;
          padding: 1rem 0;
          border-top: 1px solid var(--border-color);
          margin-bottom: 1.5rem;
        }

        .price-main .value {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--primary);
          display: block;
        }

        .price-secondary .value {
          font-size: 1.1rem;
          font-weight: 600;
          display: block;
        }

        .label {
          font-size: 0.7rem;
          color: var(--text-dim);
          text-transform: uppercase;
        }

        .btn-book {
          display: block;
          text-align: center;
          background: var(--bg-accent);
          color: var(--text-main);
          padding: 0.8rem;
          border-radius: 12px;
          font-weight: 700;
          border: 1px solid rgba(255, 255, 255, 0.12);
          transition: all 0.2s;
        }

        .btn-book:hover {
          border-color: rgba(247, 201, 72, 0.55);
          color: var(--primary);
        }

        .area-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 5rem;
          align-items: center;
        }

        .area-text h2 {
          font-size: 3rem;
          margin-bottom: 1.5rem;
        }

        .area-list {
          list-style: none;
          margin-top: 2rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .area-list li {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          color: var(--text-dim);
        }

        .map-frame {
          position: relative;
          width: 100%;
          padding: 10px;
          border-radius: var(--radius-lg);
          background: rgba(8, 12, 20, 0.78);
          border: 1px solid var(--border-color);
        }

        .map-labels {
          position: absolute;
          bottom: 25px;
          right: 25px;
        }

        .m-tag {
          background: #000;
          color: #fff;
          padding: 0.5rem 1rem;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border: 1px solid var(--primary);
        }

        .m-dot {
          width: 8px;
          height: 8px;
          background: var(--primary);
          border-radius: 50%;
          display: inline-block;
          box-shadow: 0 0 10px var(--primary);
          animation: mPulse 2s infinite;
        }

        @keyframes mPulse {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }

        .section-alt {
          background: rgba(255, 255, 255, 0.02);
        }

        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .gallery-item-wrap h4 {
          margin-top: 1rem;
          font-size: 1.1rem;
          color: #fff;
        }

        .gallery-img-box {
          position: relative;
          height: 280px;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid var(--border-color);
        }

        .gallery-img-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s;
        }

        .gallery-item-wrap:hover img {
          transform: scale(1.1);
        }

        .gallery-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 1.5rem 1rem 1rem;
          background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
          color: var(--primary);
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 700;
        }

        @media (max-width: 1024px) {
          .hero-text h1 { font-size: 3.5rem; }
          .equipment-grid { grid-template-columns: 1fr 1fr; }
          .gallery-grid { grid-template-columns: 1fr 1fr; }
          .area-content { grid-template-columns: 1fr; gap: 3rem; }
        }

        @media (max-width: 768px) {
          .section { padding: 4rem 0; }
          .gallery-grid { grid-template-columns: 1fr; }
          .hero {
            height: auto;
            min-height: 85vh;
            padding: 10rem 0 5rem;
            margin-top: 0;
            background-position: 25% center;
            display: flex;
            align-items: center;
          }
          .hero-text h1 { font-size: 2.5rem; }
          .hero-text p { font-size: 1.1rem; margin-bottom: 2rem; }
          .title { font-size: 2.25rem; }
          .badges-grid { grid-template-columns: 1fr; }
          .trust-strip { margin-bottom: 0.2rem; }
          .equipment-grid { grid-template-columns: 1fr; }
          .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1.5rem;
            margin-bottom: 3rem;
          }
          .hero-actions { flex-direction: column; gap: 1rem; }
          .hero-actions .btn-primary, .hero-actions .btn-secondary {
            width: 100%;
            justify-content: center;
          }
          .hero-stats { gap: 1.5rem; flex-wrap: wrap; margin-top: 2rem; justify-content: flex-start; }
          .stat-num { font-size: 2rem; }
          .area-list { grid-template-columns: 1fr; }
          .area-text h2 { font-size: 2.25rem; }
        }

        @media (max-width: 480px) {
          .hero-text h1 { font-size: 2.1rem; }
          .stat-item { flex: 1 1 120px; }
          .stat-item.divider { display: none; }
        }
      `}</style>
    </div>
  );
}

