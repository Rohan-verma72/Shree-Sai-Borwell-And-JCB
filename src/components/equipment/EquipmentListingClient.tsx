'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Construction,
  Search,
  ShieldCheck,
} from 'lucide-react';
import type { Equipment } from '@/data/types';
import EquipmentImageSlider from '@/components/equipment/EquipmentImageSlider';
import { BUSINESS_DETAILS } from '@/data/business';
import { BUSINESS_LINKS } from '@/lib/business';
import { useLanguage } from '@/lib/LanguageContext';

const EQUIPMENT_TYPES = ['All', 'JCB', 'Poclain', 'Harvester', 'Tractor', 'Truck'];
const REGIONS = ['Bhopal', 'Indore', 'Sehore', 'Dewas'];

type EquipmentListingClientProps = {
  equipmentData: Equipment[];
};

export default function EquipmentListingClient({
  equipmentData,
}: EquipmentListingClientProps) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedRegion, setSelectedRegion] = useState('All');

  const filteredItems = useMemo(() => {
    return equipmentData.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = selectedType === 'All' || item.type === selectedType;
      const matchRegion = selectedRegion === 'All' || item.location.includes(selectedRegion);
      return matchSearch && matchType && matchRegion;
    });
  }, [equipmentData, searchTerm, selectedType, selectedRegion]);

  return (
    <div className="equipment-listing">
      <section className="page-header">
        <div className="container">
          <div className="header-text">
            <div className="breadcrumb">
              <Link href="/">Home</Link> / <span>{t.allEquipment}</span>
            </div>
            <h1>
              {t.equipmentTitle.split(' ').map((part, i, arr) => (
                <React.Fragment key={i}>
                  {i === Math.floor(arr.length / 2) ? <span className="accent">{part} </span> : part + ' '}
                </React.Fragment>
              ))}
            </h1>
            <p>{t.equipmentSubtitle}</p>
          </div>
        </div>
      </section>

      <div className="container">
        <div className="listing-stats">
          <p>Showing {filteredItems.length} machines available</p>
        </div>

        <div className="main-content">
          <aside className="filter-sidebar">
            <div className="search-bar">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search machinery..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <h3>Equipment Type</h3>
              <div className="type-tabs">
                {EQUIPMENT_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`type-btn ${selectedType === type ? 'active' : ''}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="info-box">
              <div className="info-icon">
                <ShieldCheck size={20} />
              </div>
              <div className="info-text">
                <h4>{t.trustMaintained}</h4>
                <p>All machines come with daily maintenance logs and expert operators.</p>
              </div>
            </div>
          </aside>

          <main className="eq-grid">
            {filteredItems.map((item) => (
              <div key={item.id} className="eq-item">
                <div className="eq-img">
                  <EquipmentImageSlider images={item.images ?? [item.image]} alt={item.name} />
                  <div className={`status-badge ${item.availability ? 'available' : 'booked'}`}>
                    {item.availability ? (
                      <><CheckCircle2 size={12} /> {t.available}</>
                    ) : (
                      <><AlertTriangle size={12} /> {t.busy}</>
                    )}
                  </div>
                </div>

                <div className="eq-details">
                  <div className="eq-top">
                    <span className="eq-type">{item.type}</span>
                    <h3 className="eq-name">{item.name}</h3>
                    <div className="stock-tag">
                      <Construction size={14} /> In Stock: <strong>{item.stock} Units</strong>
                    </div>
                  </div>

                  <div className="eq-specs">
                    {Object.entries(item.specifications).slice(0, 4).map(([key, val]) => (
                      <div key={key} className="spec">
                        <span className="spec-key">{key}:</span>
                        <span className="spec-val">{val}</span>
                      </div>
                    ))}
                  </div>

                  <div className="eq-pricing">
                    <div className="price-box">
                      <span className="p-label">{t.daily} 12h</span>
                      <span className="p-val">Rs {item.dailyRate}</span>
                    </div>
                    <div className="price-box side">
                      <span className="p-label">{t.monthly}</span>
                      <span className="p-val">Rs {item.monthlyRate / 1000}k</span>
                    </div>
                  </div>

                  <div className="eq-actions">
                    <Link href={`/equipment/${item.id}`} className="btn-view">Details</Link>
                    <Link href={`/equipment/${item.id}`} className="btn-book">{t.bookNow}</Link>
                  </div>
                </div>
              </div>
            ))}
          </main>
        </div>
      </div>

      <style jsx>{`
        .equipment-listing {
          padding: 130px 0 100px;
          min-height: 100vh;
          background: var(--bg-main);
        }

        .page-header {
          padding: 4.5rem 0;
          background: linear-gradient(rgba(7, 11, 18, 0.82), rgba(7, 11, 18, 0.86)), url('/imgs/jcb-3.webp')
            center/cover;
          margin-bottom: 3rem;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-left: 0;
          border-right: 0;
        }

        .breadcrumb {
          font-size: 0.8rem;
          color: var(--text-dim);
          margin-bottom: 1rem;
        }

        .header-text h1 {
          font-size: clamp(2.1rem, 4.4vw, 3.1rem);
          margin-bottom: 1rem;
        }

        .accent {
          color: var(--primary);
        }

        .header-text p {
          color: var(--text-dim);
          font-size: 1.1rem;
        }

        .listing-stats {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2rem;
          color: var(--text-dim);
          font-size: 0.9rem;
        }

        .main-content {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 1.5rem;
        }

        .filter-sidebar {
          padding: 1.15rem;
          border-radius: 18px;
          border: 1px solid var(--border-color);
          background: rgba(255, 255, 255, 0.03);
          height: fit-content;
          position: sticky;
          top: 95px;
        }

        .search-bar {
          position: relative;
          margin-bottom: 2rem;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #555;
        }

        .search-bar input {
          width: 100%;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          padding: 1rem 1rem 1rem 3rem;
          border-radius: 12px;
          color: #fff;
        }

        .filter-group {
          margin-bottom: 3rem;
        }

        .filter-group h3 {
          font-size: 1rem;
          margin-bottom: 1.5rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-dim);
        }

        .type-tabs {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .type-btn {
          text-align: left;
          padding: 0.8rem 1.2rem;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 11px;
          color: var(--text-dim);
          font-weight: 600;
          transition: all 0.3s;
          cursor: pointer;
        }

        .type-btn.active {
          background: rgba(247, 201, 72, 0.12);
          color: var(--primary);
          border-color: rgba(247, 201, 72, 0.5);
        }

        .region-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .region-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          color: var(--text-dim);
          cursor: pointer;
        }

        .info-box {
          background: rgba(255, 215, 0, 0.05);
          border: 1px solid rgba(255, 215, 0, 0.1);
          padding: 1.5rem;
          border-radius: var(--radius-sm);
          display: flex;
          gap: 1rem;
        }

        .info-icon {
          color: var(--primary);
        }

        .info-text h4 {
          font-size: 0.95rem;
          margin-bottom: 0.4rem;
        }

        .info-text p {
          font-size: 0.8rem;
          color: var(--text-dim);
          line-height: 1.5;
        }

        .eq-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.1rem;
        }

        .eq-item {
          overflow: hidden;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          transition: transform 0.2s ease, border-color 0.2s ease;
        }

        .eq-item:hover {
          transform: translateY(-4px);
          border-color: rgba(247, 201, 72, 0.35);
        }

        .eq-img {
          position: relative;
          height: 220px;
        }

        .status-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(0, 0, 0, 0.8);
          padding: 0.4rem 0.8rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .status-badge.available { color: #4ade80; }
        .status-badge.booked { color: #f87171; }

        .eq-details {
          padding: 1.35rem;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .eq-type {
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--primary);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .eq-name {
          font-size: 1.35rem;
          margin-top: 0.2rem;
          margin-bottom: 1rem;
        }

        .stock-tag {
          font-size: 0.8rem;
          color: var(--text-dim);
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .eq-specs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.8rem;
          margin: 1.1rem 0;
          padding: 1rem 0;
          border-top: 1px solid var(--border-color);
        }

        .spec {
          font-size: 0.8rem;
          display: flex;
          flex-direction: column;
        }

        .spec-key { color: var(--text-dim); }
        .spec-val { color: #fff; font-weight: 600; }

        .eq-pricing {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 1.5rem;
          margin-bottom: 1.2rem;
        }

        .price-box { display: flex; flex-direction: column; }
        .p-label { font-size: 0.7rem; color: var(--text-dim); text-transform: uppercase; margin-bottom: 0.2rem; }
        .p-val { font-size: 1.6rem; font-weight: 800; color: var(--primary); }

        .eq-actions {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 1rem;
        }

        .btn-view, .btn-book {
          padding: 0.8rem;
          border-radius: 11px;
          font-weight: 700;
          text-align: center;
          transition: all 0.3s;
        }

        .btn-view { border: 1px solid var(--border-color); color: #fff; }
        .btn-view:hover { background: var(--bg-accent); }
        .btn-book {
          background: linear-gradient(120deg, var(--primary), var(--primary-strong));
          color: var(--text-dark);
        }

        @media (max-width: 1024px) {
          .main-content { grid-template-columns: 1fr; }
          .filter-sidebar { display: none; }
        }

        @media (max-width: 600px) {
          .eq-grid { grid-template-columns: 1fr; }
          .page-header h1 { font-size: 2.2rem; }
          .eq-pricing { grid-template-columns: 1fr; gap: 0.8rem; }
        }
      `}</style>
    </div>
  );
}
