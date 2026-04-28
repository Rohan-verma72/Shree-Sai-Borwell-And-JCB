'use client';

import React, { useEffect } from 'react';
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
  const [confirmedBookingId, setConfirmedBookingId] = React.useState<string>('');

  // Lock body scroll when modal is open to prevent background scrolling on mobile
  useEffect(() => {
    if (showBookingForm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showBookingForm]);
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

  const generateBill = (bookingId: string) => {
    const duration = bookingData.bookingType === 'Hourly'
      ? `${bookingData.hours} Hours`
      : `${Math.max(differenceInDays(new Date(bookingData.endDate), new Date(bookingData.startDate)), 1)} Days`;

    const ratePerUnit = bookingData.bookingType === 'Hourly'
      ? (bookingData.customerType === 'Farmer' ? (equipment.farmerHourlyRate || equipment.hourlyRate) : equipment.hourlyRate)
      : bookingData.bookingType === 'Daily'
        ? (bookingData.customerType === 'Farmer' ? (equipment.farmerDailyRate || equipment.dailyRate) : equipment.dailyRate)
        : equipment.monthlyRate;

    const rateLabel = bookingData.bookingType === 'Hourly'
      ? `Rs. ${ratePerUnit.toLocaleString('en-IN')} / hr`
      : bookingData.bookingType === 'Daily'
        ? `Rs. ${ratePerUnit.toLocaleString('en-IN')} / day`
        : `Rs. ${ratePerUnit.toLocaleString('en-IN')} / month`;

    const qty = bookingData.bookingType === 'Hourly'
      ? `${bookingData.hours} hrs`
      : `${Math.max(differenceInDays(new Date(bookingData.endDate), new Date(bookingData.startDate)), 1)} days`;

    const waMsg = encodeURIComponent(
      `*Booking Receipt — ${bookingId}*\n\nCustomer: ${bookingData.customer}\nPhone: ${bookingData.phone}\nEquipment: ${equipment.name}\nDuration: ${duration}\nAmount: Rs. ${currentTotal.toLocaleString('en-IN')}\n\nShree Sai Borewell & JCB\nPhone: ${BUSINESS_DETAILS.phone}`
    );

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no"/>
  <title>Booking Receipt — ${bookingId}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');
    *{margin:0;padding:0;box-sizing:border-box;-webkit-font-smoothing:antialiased;}
    body{font-family:'Inter',sans-serif;background:#eef1f6;padding:20px;color:#1a202c;}
    
    .page{max-width:720px;margin:0 auto;background:#fff;box-shadow:0 10px 30px rgba(0,0,0,0.08);border-radius:12px;overflow:hidden;}
    
    .header{background:#0f141d;color:#fff;padding:32px;display:flex;justify-content:space-between;align-items:center;border-bottom:4px solid #f7c948;}
    .header-left h1{font-family:'Outfit',sans-serif;color:#f7c948;font-size:24px;margin-bottom:4px;letter-spacing:0.5px;}
    .header-left p{color:#9ca8be;font-size:12px;margin-bottom:8px;}
    .header-left .contact{font-size:13px;color:#cbd5e1;line-height:1.5;}
    .header-right{text-align:right;}
    .receipt-title{font-family:'Outfit',sans-serif;font-size:28px;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;}
    .receipt-id{background:rgba(247,201,72,0.15);color:#f7c948;padding:6px 12px;border-radius:6px;font-weight:600;font-size:14px;display:inline-block;border:1px solid rgba(247,201,72,0.3);}
    
    .status-banner{background:#fffbeb;padding:12px 32px;border-bottom:1px solid #fde68a;display:flex;align-items:center;gap:10px;font-size:13px;color:#b45309;font-weight:500;}
    .status-dot{width:8px;height:8px;border-radius:50%;background:#f59e0b;box-shadow:0 0 0 3px rgba(245,158,11,0.2);}
    
    .body-content{padding:32px;}
    
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:32px;}
    .card{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px;}
    .card-title{font-family:'Outfit',sans-serif;font-size:14px;color:#64748b;text-transform:uppercase;letter-spacing:1px;font-weight:600;margin-bottom:16px;display:flex;align-items:center;gap:8px;}
    .row{display:flex;flex-direction:column;margin-bottom:12px;}
    .row:last-child{margin-bottom:0;}
    .lbl{font-size:12px;color:#64748b;margin-bottom:4px;}
    .val{font-size:14px;color:#0f141d;font-weight:600;}
    
    .table-wrap{overflow-x:auto;}
    table{width:100%;border-collapse:collapse;margin-bottom:24px;min-width:400px;}
    th{background:#f1f5f9;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px;padding:12px 16px;text-align:left;font-weight:600;}
    th.right, td.right{text-align:right;}
    td{padding:16px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#334155;vertical-align:top;}
    .item-title{font-weight:600;color:#0f141d;font-size:15px;margin-bottom:4px;}
    .item-sub{font-size:13px;color:#64748b;}
    
    .total-box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:24px;width:100%;max-width:320px;margin-left:auto;}
    .t-row{display:flex;justify-content:space-between;margin-bottom:12px;font-size:14px;color:#64748b;}
    .t-row.final{margin-top:16px;padding-top:16px;border-top:1px dashed #cbd5e1;font-size:18px;color:#0f141d;font-weight:700;}
    
    .notes{background:#f0f9ff;border-left:4px solid #0ea5e9;padding:16px;border-radius:4px;margin-top:32px;font-size:13px;color:#0369a1;line-height:1.6;}
    
    .footer{text-align:center;padding:24px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;line-height:1.6;}
    
    .actions{display:flex;gap:12px;justify-content:center;padding:0 0 24px 0;}
    .btn{padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;border:none;display:flex;align-items:center;justify-content:center;gap:8px;text-decoration:none;transition:0.2s;}
    .btn-print{background:#0f141d;color:#fff;}
    .btn-print:hover{background:#1e293b;}
    .btn-wa{background:#22c55e;color:#fff;}
    .btn-wa:hover{background:#16a34a;}
    
    @media(max-width:600px){
      body{padding:12px;}
      .header{flex-direction:column;align-items:flex-start;gap:20px;padding:24px;}
      .header-right{text-align:left;}
      .grid{grid-template-columns:1fr;gap:16px;margin-bottom:24px;}
      .body-content{padding:20px;}
      .total-box{max-width:100%;}
      th:nth-child(1), td:nth-child(1){display:none;}
      th, td{padding:12px 10px;}
      .actions{flex-direction:column;}
      .btn{width:100%;}
    }
    @media print{
      body{background:#fff;padding:0;}
      .page{box-shadow:none;border-radius:0;}
      .actions{display:none!important;}
    }
  </style>
</head>
<body>
  <div class="actions">
    <a class="btn btn-wa" href="https://wa.me/${BUSINESS_DETAILS.phone.replace(/[^0-9]/g,'')}?text=${waMsg}" target="_blank">💬 Share on WhatsApp</a>
    <button class="btn btn-print" onclick="window.print()">🖨️ Print Receipt</button>
  </div>
  
  <div class="page">
    <div class="header">
      <div class="header-left">
        <h1>${BUSINESS_DETAILS.brandName}</h1>
        <p>Heavy Equipment Rental & Borewell Services</p>
        <div class="contact">
          Tel: ${BUSINESS_DETAILS.phone}<br/>
          GSTIN: ${BUSINESS_DETAILS.gstin}
        </div>
      </div>
      <div class="header-right">
        <div class="receipt-title">RECEIPT</div>
        <div class="receipt-id">${bookingId}</div>
        <div style="margin-top:12px;font-size:13px;color:#cbd5e1;">
          Date: ${format(new Date(), 'dd MMM yyyy')}<br/>
          Time: ${format(new Date(), 'hh:mm a')}
        </div>
      </div>
    </div>
    
    <div class="status-banner">
      <div class="status-dot"></div>
      <span><strong>Pending Confirmation</strong> — Our team will contact you within 2 hours.</span>
    </div>
    
    <div class="body-content">
      <div class="grid">
        <div class="card">
          <div class="card-title">Customer Details</div>
          <div class="row"><span class="lbl">Name</span><span class="val">${bookingData.customer}</span></div>
          <div class="row"><span class="lbl">Phone</span><span class="val">${bookingData.phone}</span></div>
          <div class="row"><span class="lbl">Category</span><span class="val">${bookingData.customerType}</span></div>
        </div>
        <div class="card">
          <div class="card-title">Booking Info</div>
          <div class="row"><span class="lbl">Start Date</span><span class="val">${format(new Date(bookingData.startDate), 'dd MMM yyyy')}</span></div>
          ${bookingData.bookingType !== 'Hourly' ? `<div class="row"><span class="lbl">End Date</span><span class="val">${format(new Date(bookingData.endDate), 'dd MMM yyyy')}</span></div>` : ''}
          <div class="row"><span class="lbl">Billing Type</span><span class="val">${bookingData.bookingType}</span></div>
          <div class="row"><span class="lbl">Duration</span><span class="val">${duration}</span></div>
        </div>
      </div>
      
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th style="width:40px">#</th>
              <th>Description</th>
              <th>Rate</th>
              <th>Qty</th>
              <th class="right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>01</td>
              <td>
                <div class="item-title">${equipment.name}</div>
                <div class="item-sub">${equipment.type} &bull; ${equipment.location}</div>
              </td>
              <td>${rateLabel}</td>
              <td>${qty}</td>
              <td class="right" style="font-weight:600;color:#0f141d;">Rs. ${currentTotal.toLocaleString('en-IN')}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="total-box">
        <div class="t-row"><span>Subtotal</span><span>Rs. ${currentTotal.toLocaleString('en-IN')}</span></div>
        <div class="t-row"><span>Taxes</span><span>As applicable</span></div>
        <div class="t-row final"><span>Total (Est.)</span><span style="color:#000;">Rs. ${currentTotal.toLocaleString('en-IN')}</span></div>
      </div>
      
      ${bookingData.notes ? `
      <div class="notes">
        <strong>Site Location / Notes:</strong><br/>
        ${bookingData.notes}
      </div>` : ''}
      
    </div>
    
    <div class="footer">
      This is a system-generated booking request receipt, not a final tax invoice. Final billing may vary based on actual work hours and site conditions. Payment is collected post-service. No signature is required.
    </div>
  </div>
</body>
</html>`);
    win.document.close();
  };
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

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: 'Something went wrong' }));
        throw new Error(errData?.error || `Server error (${response.status})`);
      }

      const data = await response.json() as { id?: string; booking?: { id: string } };
      const bookingId = data?.id ?? data?.booking?.id ?? `BK-${Date.now()}`;

      // Store booking ID, show success popup — NO auto-open
      setConfirmedBookingId(bookingId);
      setSuccess(true);
      toast.success('✅ Booking request submitted!');
    } catch (error) {
      console.error(error);
      const msg = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
      toast.error(msg);
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
                  {/* Animated checkmark */}
                  <div className="success-ring">
                    <CheckCircle2 size={52} className="success-icon" />
                  </div>

                  <div className="success-text">
                    <h3>🎉 Booking Successful!</h3>
                    <p>Request for <strong>{equipment.name}</strong> submitted.</p>
                    <div className="booking-id-badge">{confirmedBookingId}</div>
                    <p className="success-note">हम जल्द ही आपसे contact करेंगे।<br/>We will call you to confirm.</p>
                  </div>

                  {/* Action buttons */}
                  <div className="success-actions">
                    <button
                      className="btn-view-receipt"
                      onClick={() => generateBill(confirmedBookingId)}
                    >
                      🧾 View Receipt
                    </button>
                    <a
                      className="btn-wa-success"
                      href={`https://wa.me/${BUSINESS_DETAILS.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`🧾 Booking Confirmed!\n\nBooking ID: ${confirmedBookingId}\nEquipment: ${equipment.name}\nCustomer: ${bookingData.customer}\nPhone: ${bookingData.phone}\nAmount: ₹${currentTotal.toLocaleString('en-IN')}\n\nShree Sai Borewell & JCB\n📞 ${BUSINESS_DETAILS.phone}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      💬 Share on WhatsApp
                    </a>
                    <button
                      className="btn-close-success"
                      onClick={() => {
                        setShowBookingForm(false);
                        setSuccess(false);
                        router.push('/bookings');
                      }}
                    >
                      ✕ Close
                    </button>
                  </div>
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
          align-items: flex-start;
          justify-content: center;
          padding: 1rem 0;
          padding-bottom: env(safe-area-inset-bottom, 0px);
          overflow-y: auto;
        }
        @media (min-width: 600px) {
          .booking-modal-overlay {
            align-items: center;
            padding: 20px;
          }
        }

        .booking-modal {
          background: #0f141d;
          border: 1px solid var(--border-color);
          width: 100%;
          max-width: 540px;
          border-radius: 12px;
          padding: 1.25rem 1rem 2.5rem;
          margin: auto 0;
        }
        @media (min-width: 600px) {
          .booking-modal {
            border-radius: 16px;
            padding: 1.5rem;
            max-height: 96vh;
          }
        }

        /* Drag handle hint for mobile bottom sheet */
        .booking-modal::before {
          content: '';
          display: block;
          width: 40px;
          height: 4px;
          border-radius: 99px;
          background: rgba(255,255,255,0.15);
          margin: 0 auto 1rem;
        }
        @media (min-width: 600px) {
          .booking-modal::before { display: none; }
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
          grid-template-columns: 1fr;
          gap: 0.75rem;
        }
        @media (min-width: 480px) {
          .form-row {
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
          }
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
          background: #1a2231;
          border: 1px solid #3d4a62;
          padding: 0.8rem 1rem;
          border-radius: 8px;
          color: #ffffff;
          font-family: inherit;
          font-size: 16px;
          width: 100%;
          box-sizing: border-box;
          -webkit-appearance: none;
          appearance: none;
          min-height: 48px;
        }

        .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
          border-color: var(--primary);
          outline: none;
          background: #252e3f;
        }

        /* Fix for browser autofill making inputs invisible on mobile */
        .form-group input:-webkit-autofill,
        .form-group input:-webkit-autofill:hover, 
        .form-group input:-webkit-autofill:focus, 
        .form-group input:-webkit-autofill:active {
            -webkit-box-shadow: 0 0 0 30px #1a2231 inset !important;
            -webkit-text-fill-color: #ffffff !important;
            transition: background-color 5000s ease-in-out 0s;
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
          font-size: 1rem;
          border: none;
          cursor: pointer;
          margin-top: 0.5rem;
          width: 100%;
          min-height: 52px;
          letter-spacing: 0.03em;
        }

        .btn-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .success-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2rem 1rem 1.5rem;
          text-align: center;
          gap: 0;
        }

        .success-ring {
          width: 88px;
          height: 88px;
          border-radius: 50%;
          background: rgba(74, 222, 128, 0.12);
          border: 2px solid rgba(74, 222, 128, 0.35);
          display: grid;
          place-items: center;
          margin-bottom: 1.25rem;
          animation: ringPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes ringPop {
          from { transform: scale(0.5); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }

        .success-icon {
          color: #4ade80;
        }

        .success-text h3 {
          font-size: 1.6rem;
          color: #fff;
          margin-bottom: 0.4rem;
        }

        .success-text p {
          color: #888;
          font-size: 0.92rem;
        }

        .booking-id-badge {
          display: inline-block;
          margin: 0.75rem auto;
          background: rgba(247, 202, 0, 0.1);
          border: 1px solid rgba(247, 202, 0, 0.3);
          color: #f7ca00;
          font-family: monospace;
          font-size: 0.95rem;
          font-weight: 700;
          padding: 5px 14px;
          border-radius: 8px;
          letter-spacing: 0.06em;
        }

        .success-note {
          font-size: 0.82rem !important;
          color: #666 !important;
          margin-top: 0.3rem;
          line-height: 1.6;
        }

        .success-actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 1.5rem;
          width: 100%;
        }

        .btn-view-receipt {
          width: 100%;
          padding: 1rem;
          border-radius: 12px;
          background: linear-gradient(120deg, #f7ca00, #ffb800);
          color: #000;
          font-weight: 800;
          font-size: 1rem;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          min-height: 52px;
          transition: transform 0.15s, filter 0.15s;
        }

        .btn-view-receipt:hover {
          transform: translateY(-1px);
          filter: brightness(1.06);
        }

        .btn-wa-success {
          width: 100%;
          padding: 1rem;
          border-radius: 12px;
          background: #25D366;
          color: #fff;
          font-weight: 800;
          font-size: 1rem;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          min-height: 52px;
          text-decoration: none;
          transition: transform 0.15s, filter 0.15s;
        }

        .btn-wa-success:hover {
          transform: translateY(-1px);
          filter: brightness(1.06);
        }

        .btn-close-success {
          width: 100%;
          padding: 0.85rem;
          border-radius: 12px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.12);
          color: #888;
          font-size: 0.92rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }

        .btn-close-success:hover {
          background: rgba(255,255,255,0.05);
          color: #ccc;
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

        @media (max-width: 768px) {
          .detail-page {
            padding: 90px 0 60px;
          }
          .booking-card {
            padding: 1.5rem;
          }
          .booking-card h1 {
            font-size: 2rem;
          }
          .btn-book-now, .btn-call, .btn-wa {
            padding: 0.9rem 1rem;
            font-size: 1rem;
            min-height: 50px;
          }
        }

        @media (max-width: 480px) {
          .booking-card {
            padding: 1.25rem;
          }
          .booking-card h1 {
            font-size: 1.7rem;
          }
          .modal-header h2 {
            font-size: 1.2rem;
          }
          .estimate-box strong {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
}
