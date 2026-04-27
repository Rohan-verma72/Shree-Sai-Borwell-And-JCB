'use client';

import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { 
  ArrowLeft, 
  CheckCircle2, 
  MapPin, 
  Shield, 
  Phone, 
  MessageSquare,
  Calendar,
  Construction,
  X
} from 'lucide-react';
import Link from 'next/link';
import type { Booking, Equipment } from '@/data/types';
import EquipmentImageSlider from '@/components/equipment/EquipmentImageSlider';
import { BUSINESS_DETAILS } from '@/data/business';
import { BUSINESS_LINKS, buildWhatsAppLink } from '@/lib/business';
import toast from 'react-hot-toast';
import { format, addDays, differenceInDays } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/LanguageContext';

type EquipmentDetailClientProps = {
  equipment: Equipment | null;
};

export default function EquipmentDetailClient({ equipment }: EquipmentDetailClientProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [showBookingForm, setShowBookingForm] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [bookingData, setBookingData] = React.useState({
    customer: '',
    phone: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    customerType: 'Construction' as Booking['customerType'],
    bookingType: 'Daily' as Booking['bookingType'],
    hours: 8,
    notes: '',
  });

  if (!equipment) return <div>Equipment not found</div>;

  const calculateTotal = () => {
    if (bookingData.bookingType === 'Hourly') {
      const hours = bookingData.hours || 1;
      const rate = bookingData.customerType === 'Farmer' ? (equipment.farmerHourlyRate || equipment.hourlyRate) : equipment.hourlyRate;
      return rate * hours;
    }
    
    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    const days = Math.max(differenceInDays(end, start), 1);
    
    if (bookingData.bookingType === 'Daily') {
      const rate = bookingData.customerType === 'Farmer' ? (equipment.farmerDailyRate || equipment.dailyRate) : equipment.dailyRate;
      return rate * days;
    }
    
    // Monthly
    const rate = bookingData.customerType === 'Farmer' ? (equipment.farmerMonthlyRate || equipment.monthlyRate) : equipment.monthlyRate;
    return (rate / 30) * days;
  };

  const currentTotal = calculateTotal();

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingData.customer || !bookingData.phone) {
      toast.error('Please fill in your name and phone number');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...bookingData,
        equipmentId: equipment.id,
        total: currentTotal,
        duration: bookingData.bookingType === 'Hourly' ? `${bookingData.hours} Hours` : `${Math.max(differenceInDays(new Date(bookingData.endDate), new Date(bookingData.startDate)), 1)} Days`,
      };

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to submit booking');

      setSuccess(true);
      toast.success('Booking request submitted!');
      
      setTimeout(() => {
        setShowBookingForm(false);
        setSuccess(false);
        router.push('/bookings');
      }, 2000);
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="detail-page">
      <div className="container">
        <Link href="/equipment" className="back-btn">
          <ArrowLeft size={18} /> {t.backToFleet}
        </Link>

        <div className="main-layout">
          <div className="visuals">
             <div className="image-card">
               <EquipmentImageSlider images={equipment.images ?? [equipment.image]} alt={equipment.name} height={420} showThumbs />
             </div>
             
             <div className="info-section">
               <h2>{t.technicalSpecs}</h2>
               <div className="specs-grid">
                 {Object.entries(equipment.specifications).map(([key, value]) => (
                   <div key={key} className="spec-card">
                     <span className="s-label">{key}</span>
                     <span className="s-val">{value}</span>
                   </div>
                 ))}
               </div>
             </div>
          </div>

          <aside className="booking-sidebar">
             <div className="booking-card">
               <span className="type-label">{equipment.type}</span>
               <h1>{equipment.name}</h1>
               <p className="location"><MapPin size={16} /> Currently at {equipment.location}</p>

               <div className="pricing">
                 <div className="price-item">
                   <span className="p-label">{t.daily}</span>
                   <span className="p-val">Rs {equipment.dailyRate}</span>
                 </div>
                 <div className="price-item">
                   <span className="p-label">{t.monthly}</span>
                   <span className="p-val">Rs {equipment.monthlyRate}</span>
                 </div>
               </div>

                <div className="actions">
                  <button 
                    onClick={() => setShowBookingForm(true)} 
                    className="btn-book-now"
                    disabled={!equipment.availability}
                  >
                    {equipment.availability ? t.bookNow : t.busy}
                  </button>
                  <a 
                    href={equipment.availability ? BUSINESS_LINKS.tel : '#'} 
                    className={clsx("btn-call", !equipment.availability && "disabled")}
                  >
                    <Phone size={18} /> {equipment.availability ? t.callToBook : t.busy}
                  </a>
                  <a 
                    href={buildWhatsAppLink(`Order Query: ${equipment.name} (${equipment.availability ? 'Available' : 'Booked'})`)} 
                    className="btn-wa"
                  >
                    <MessageSquare size={18} /> {t.whatsappEnquiry}
                  </a>
                </div>

               <div className="trust-signs">
                 <div className="ts-item"><Shield size={16} /> {t.trustMaintained}</div>
                 <div className="ts-item"><CheckCircle2 size={16} /> {t.trustOperator}</div>
               </div>
             </div>

             <div className="support-box">
                <Construction size={24} className="icon" />
                <h4>{t.customQuoteNeeded}</h4>
                <p>{t.customQuoteDesc}</p>
             </div>
          </aside>
        </div>

        {showBookingForm && (
          <div className="booking-modal-overlay">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="booking-modal"
            >
              <div className="modal-header">
                <h2>{success ? 'Success' : t.bookNow}</h2>
                {!success && (
                  <button onClick={() => setShowBookingForm(false)} aria-label="Close form">
                    <X size={20} />
                  </button>
                )}
              </div>

              {success ? (
                <div className="success-state">
                  <CheckCircle2 size={48} className="success-icon" />
                  <h3>{t.brandName}</h3>
                  <p>Request for <strong>{equipment.name}</strong> sent.</p>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="booking-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label>{t.customerName}</label>
                        <input 
                          type="text" 
                          required
                          value={bookingData.customer}
                          onChange={e => setBookingData({...bookingData, customer: e.target.value})}
                          placeholder="Name" 
                        />
                      </div>
                      <div className="form-group">
                        <label>{t.phoneNumber}</label>
                        <input 
                          type="tel" 
                          required
                          value={bookingData.phone}
                          onChange={e => setBookingData({...bookingData, phone: e.target.value})}
                          placeholder="Phone" 
                        />
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>{t.startDate}</label>
                        <input 
                          type="date" 
                          required
                          value={bookingData.startDate}
                          onChange={e => setBookingData({...bookingData, startDate: e.target.value})}
                        />
                      </div>
                      <div className="form-group">
                        <label>{t.endDate}</label>
                        <input 
                          type="date" 
                          required={bookingData.bookingType !== 'Hourly'}
                          disabled={bookingData.bookingType === 'Hourly'}
                          value={bookingData.endDate}
                          onChange={e => setBookingData({...bookingData, endDate: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Customer Category</label>
                        <select 
                          value={bookingData.customerType}
                          onChange={e => setBookingData({...bookingData, customerType: e.target.value as any})}
                        >
                          <option value="Construction">Construction / Heavy Work</option>
                          <option value="Farmer">Farmer (Special Discount)</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>{t.billingType}</label>
                        <select 
                          value={bookingData.bookingType}
                          onChange={e => setBookingData({...bookingData, bookingType: e.target.value as any})}
                        >
                          <option value="Hourly">{t.hourly}</option>
                          <option value="Daily">{t.daily}</option>
                          <option value="Monthly">{t.monthly}</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      {bookingData.bookingType === 'Hourly' && (
                        <div className="form-group">
                          <label>{t.totalHours}</label>
                          <input 
                            type="number" 
                            min={1}
                            max={24}
                            required
                            value={bookingData.hours}
                            onChange={e => setBookingData({...bookingData, hours: parseInt(e.target.value) || 0})}
                            placeholder="Hours" 
                          />
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label>{t.locationNotes}</label>
                      <textarea 
                        rows={2}
                        value={bookingData.notes}
                        onChange={e => setBookingData({...bookingData, notes: e.target.value})}
                        placeholder="Site location..."
                      />
                    </div>

                    <div className="estimate-box">
                      <div className="est-main">
                        <span>{t.expectedTotal}</span>
                        <strong>Rs {currentTotal.toLocaleString('en-IN')}</strong>
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={submitting} 
                      className="btn-submit"
                    >
                      {submitting ? '...' : t.submitRequest}
                    </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </div>

      <style jsx>{`
        .detail-page {
          padding: 128px 0 80px;
          min-height: 100vh;
          background: var(--bg-main);
        }

        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-dim);
          text-decoration: none;
          margin-bottom: 2rem;
          font-weight: 600;
        }

        .back-btn:hover {
          color: var(--primary);
        }

        .main-layout {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 4rem;
        }

        .image-card {
           border-radius: 18px;
           overflow: hidden;
           border: 1px solid var(--border-color);
           margin-bottom: 3rem;
        }

        .info-section h2 {
          font-size: 1.8rem;
          margin-bottom: 2rem;
          color: #fff;
        }

        .specs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1.5rem;
        }

        .spec-card {
          background: rgba(255, 255, 255, 0.03);
          padding: 1.25rem;
          border-radius: 8px;
          border: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .s-label {
          color: #666;
          font-size: 0.8rem;
          text-transform: uppercase;
        }

        .s-val {
          color: #fff;
          font-weight: 700;
          font-size: 1.1rem;
        }

        .booking-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          padding: 2.5rem;
          border-radius: 18px;
          position: sticky;
          top: 100px;
        }

        .type-label {
          color: var(--primary);
          text-transform: uppercase;
          font-weight: 800;
          font-size: 0.8rem;
          letter-spacing: 0.1em;
        }

        .booking-card h1 {
          font-size: 2.5rem;
          margin: 0.5rem 0 1rem;
        }

        .location {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-dim);
          margin-bottom: 2rem;
        }

        .pricing {
          display: grid;
          grid-template-columns: 1fr 1fr;
          padding: 1.5rem 0;
          border-top: 1px solid var(--border-color);
          border-bottom: 1px solid var(--border-color);
          margin-bottom: 2rem;
        }

        .price-item {
          display: flex;
          flex-direction: column;
        }

        .p-label {
          font-size: 0.75rem;
          color: #666;
        }

        .p-val {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--primary);
        }

        .actions {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .btn-call {
          background: transparent;
          border: 1px solid var(--border-color);
          color: #fff;
          padding: 1rem;
          border-radius: 10px;
          text-align: center;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }

        .btn-call:hover {
          background: var(--bg-accent);
          border-color: #4a566d;
        }

        .btn-call.disabled {
          opacity: 0.5;
          pointer-events: none;
          filter: grayscale(1);
          border-color: #333;
        }

        .btn-book-now {
          background: linear-gradient(120deg, var(--primary), var(--primary-strong));
          color: #000;
          padding: 1.1rem;
          border-radius: 10px;
          text-align: center;
          font-weight: 800;
          font-size: 1.1rem;
          border: none;
          cursor: pointer;
          transition: transform 0.2s, background 0.2s;
        }

        .btn-book-now:hover {
          filter: brightness(1.03);
          transform: translateY(-2px);
        }

        .booking-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .booking-modal {
          background: #0f141d;
          border: 1px solid var(--border-color);
          width: 100%;
          max-width: 540px;
          border-radius: 16px;
          padding: 1.25rem;
          max-height: 96vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
        }

        .modal-header h2 {
          font-size: 1.5rem;
          margin: 0;
        }

        .modal-header button {
          background: transparent;
          border: none;
          color: #777;
          cursor: pointer;
        }

        .booking-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-size: 0.8rem;
          color: #999;
          text-transform: uppercase;
        }

        .form-group input, .form-group select, .form-group textarea {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          padding: 0.6rem 0.75rem;
          border-radius: 6px;
          color: #fff;
          font-family: inherit;
          font-size: 0.95rem;
        }

        .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
          border-color: var(--primary);
          outline: none;
        }

        .estimate-box {
          background: rgba(255, 215, 0, 0.05);
          border: 1px dashed rgba(255, 215, 0, 0.3);
          padding: 0.75rem 1rem;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
        }

        .est-main {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
        }

        .estimate-box span {
          font-size: 0.8rem;
          color: #999;
        }

        .estimate-box strong {
          font-size: 1.5rem;
          color: var(--primary);
        }

        .estimate-box small {
          font-size: 0.75rem;
          color: #666;
        }

        .btn-submit {
          background: linear-gradient(120deg, var(--primary), var(--primary-strong));
          color: #000;
          padding: 1rem;
          border-radius: 10px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          margin-top: 1rem;
        }

        .btn-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .success-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 0;
          text-align: center;
          gap: 1rem;
        }

        .success-icon {
          color: #4ade80;
          margin-bottom: 1rem;
        }

        .success-state h3 {
          font-size: 2rem;
          color: #fff;
        }

        .success-state p {
          color: #777;
          max-width: 300px;
        }

        .hint {
          font-size: 0.85rem;
          margin-top: 2rem;
          color: #FFD700 !important;
        }

        .btn-wa {
          background: transparent;
          border: 1px solid rgba(37, 211, 102, 0.7);
          color: #25D366;
          padding: 1rem;
          border-radius: 10px;
          text-align: center;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .trust-signs {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }

        .ts-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: #777;
        }

        .ts-item svg {
          color: #25D366;
        }

        .support-box {
          margin-top: 2rem;
          padding: 1.5rem;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.03);
          color: #777;
        }

        .support-box .icon {
          color: #333;
          margin-bottom: 1rem;
        }

        .support-box h4 {
          color: #fff;
          margin-bottom: 0.5rem;
        }

        .support-box p {
          font-size: 0.85rem;
        }

        @media (max-width: 1024px) {
          .main-layout {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
          .booking-card {
            position: static;
          }
        }

        @media (max-width: 480px) {
          .booking-card {
            padding: 1.5rem;
          }
          .booking-card h1 {
            font-size: 1.8rem;
          }
        }
      `}</style>
    </div>
  );
}
