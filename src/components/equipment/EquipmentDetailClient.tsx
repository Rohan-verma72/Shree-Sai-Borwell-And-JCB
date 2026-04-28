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
  const [confirmedBookingId, setConfirmedBookingId] = React.useState<string>('');
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
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Booking Receipt — ${bookingId}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Inter',Arial,sans-serif;background:#f4f4f4;padding:40px 16px 60px;color:#1a1a1a;font-size:14px;}

    .page{max-width:680px;margin:0 auto;background:#fff;box-shadow:0 2px 16px rgba(0,0,0,0.08);}

    /* Gold top bar */
    .top-bar{height:5px;background:linear-gradient(90deg,#c9a800,#f7ca00,#c9a800);}

    /* Header */
    .header{padding:28px 36px 20px;display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid #e8e8e8;}
    .co-name{font-size:1.15rem;font-weight:700;color:#b8860b;letter-spacing:0.02em;}
    .co-sub{font-size:0.72rem;color:#888;margin-top:3px;}
    .co-contact{font-size:0.78rem;color:#555;margin-top:10px;line-height:1.7;}
    .receipt-meta{text-align:right;}
    .receipt-label{font-size:0.65rem;text-transform:uppercase;letter-spacing:0.14em;color:#aaa;margin-bottom:6px;}
    .receipt-id{font-family:monospace;font-size:0.95rem;font-weight:700;color:#111;background:#f5f5f5;border:1px solid #e0e0e0;padding:4px 10px;border-radius:4px;display:inline-block;}
    .receipt-date{font-size:0.78rem;color:#777;margin-top:6px;line-height:1.6;}

    /* Status */
    .status-bar{background:#fffbeb;border-top:1px solid #fde68a;border-bottom:1px solid #fde68a;padding:8px 36px;font-size:0.75rem;color:#92400e;display:flex;align-items:center;gap:8px;}
    .status-dot{width:7px;height:7px;border-radius:50%;background:#d97706;flex-shrink:0;}

    /* Body */
    .body{padding:24px 36px;}

    /* Info section */
    .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;}
    .info-block{padding:14px 16px;background:#fafafa;border:1px solid #efefef;border-radius:4px;}
    .info-title{font-size:0.62rem;text-transform:uppercase;letter-spacing:0.12em;color:#aaa;font-weight:600;margin-bottom:10px;}
    .info-row{display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f0f0f0;font-size:0.8rem;}
    .info-row:last-child{border-bottom:none;}
    .info-lbl{color:#888;}
    .info-val{color:#111;font-weight:600;text-align:right;}

    /* Table */
    .section-label{font-size:0.62rem;text-transform:uppercase;letter-spacing:0.12em;color:#aaa;font-weight:600;margin-bottom:8px;}
    table{width:100%;border-collapse:collapse;border:1px solid #ebebeb;margin-bottom:20px;font-size:0.82rem;}
    thead{background:#1a1a1a;}
    th{padding:10px 14px;text-align:left;font-size:0.65rem;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#f0f0f0;}
    th.amt{text-align:right;}
    tbody tr{border-bottom:1px solid #f0f0f0;}
    td{padding:12px 14px;color:#333;vertical-align:top;}
    td.amt{text-align:right;font-weight:600;color:#111;}
    .item-name{font-weight:600;color:#111;}
    .item-sub{font-size:0.75rem;color:#999;margin-top:2px;}

    /* Total */
    .total-section{display:flex;justify-content:flex-end;margin-bottom:20px;}
    .total-box{border:1px solid #e0e0e0;border-top:2px solid #c9a800;padding:14px 20px;min-width:260px;}
    .total-line{display:flex;justify-content:space-between;font-size:0.8rem;color:#777;padding:3px 0;}
    .total-final{display:flex;justify-content:space-between;padding-top:8px;margin-top:6px;border-top:1px solid #ddd;}
    .total-final span{font-size:0.88rem;font-weight:600;color:#333;}
    .total-final strong{font-size:1.15rem;font-weight:700;color:#111;}

    /* Notes */
    .notes{background:#fffbeb;border:1px solid #fde68a;padding:12px 14px;margin-bottom:16px;border-radius:3px;}
    .notes .nt{font-size:0.62rem;text-transform:uppercase;letter-spacing:0.1em;color:#92400e;font-weight:600;margin-bottom:4px;}
    .notes p{font-size:0.8rem;color:#78350f;}

    /* Disclaimer */
    .disclaimer{font-size:0.75rem;color:#999;line-height:1.6;padding:12px 0;border-top:1px solid #efefef;}

    /* Footer */
    .footer{padding:16px 36px;border-top:1px solid #e8e8e8;display:flex;justify-content:space-between;align-items:center;background:#fafafa;}
    .footer-left{font-size:0.72rem;color:#888;line-height:1.7;}
    .footer-left strong{color:#555;}
    .footer-right{font-size:0.68rem;color:#bbb;text-align:right;}

    /* Print buttons */
    .btn-row{text-align:center;padding:20px 16px;display:flex;gap:12px;justify-content:center;}
    .btn-print{background:#1a1a1a;color:#fff;border:none;padding:11px 24px;font-size:0.88rem;font-weight:600;cursor:pointer;border-radius:4px;letter-spacing:0.02em;}
    .btn-wa{background:#25D366;color:#fff;border:none;padding:11px 24px;font-size:0.88rem;font-weight:600;cursor:pointer;border-radius:4px;text-decoration:none;letter-spacing:0.02em;}

    @media print{
      body{background:#fff;padding:0;}
      .page{box-shadow:none;}
      .btn-row{display:none!important;}
    }
    @media(max-width:600px){
      .header,.body,.footer,.status-bar{padding-left:20px;padding-right:20px;}
      .info-grid{grid-template-columns:1fr;}
      .total-section{justify-content:stretch;}
      .total-box{min-width:0;width:100%;}
    }
  </style>
</head>
<body>
<div class="page">
  <div class="top-bar"></div>

  <div class="header">
    <div>
      <div class="co-name">${BUSINESS_DETAILS.brandName}</div>
      <div class="co-sub">Equipment Rental &amp; Borewell Services</div>
      <div class="co-contact">
        Tel: ${BUSINESS_DETAILS.phone}<br/>
        ${BUSINESS_DETAILS.address}<br/>
        GSTIN: ${BUSINESS_DETAILS.gstin}
      </div>
    </div>
    <div class="receipt-meta">
      <div class="receipt-label">Booking Receipt</div>
      <div class="receipt-id">${bookingId}</div>
      <div class="receipt-date">
        Date: ${format(new Date(), 'dd MMM yyyy')}<br/>
        Time: ${format(new Date(), 'hh:mm a')}
      </div>
    </div>
  </div>

  <div class="status-bar">
    <div class="status-dot"></div>
    <span>Status: <strong>Pending Confirmation</strong> &mdash; Our team will call you within 2 hours.</span>
  </div>

  <div class="body">

    <div class="info-grid">
      <div class="info-block">
        <div class="info-title">Customer Details</div>
        <div class="info-row"><span class="info-lbl">Name</span><span class="info-val">${bookingData.customer}</span></div>
        <div class="info-row"><span class="info-lbl">Phone</span><span class="info-val">${bookingData.phone}</span></div>
        <div class="info-row"><span class="info-lbl">Category</span><span class="info-val">${bookingData.customerType}</span></div>
      </div>
      <div class="info-block">
        <div class="info-title">Booking Details</div>
        <div class="info-row"><span class="info-lbl">Start Date</span><span class="info-val">${format(new Date(bookingData.startDate), 'dd MMM yyyy')}</span></div>
        ${bookingData.bookingType !== 'Hourly' ? `<div class="info-row"><span class="info-lbl">End Date</span><span class="info-val">${format(new Date(bookingData.endDate), 'dd MMM yyyy')}</span></div>` : ''}
        <div class="info-row"><span class="info-lbl">Billing Type</span><span class="info-val">${bookingData.bookingType}</span></div>
        <div class="info-row"><span class="info-lbl">Duration</span><span class="info-val">${duration}</span></div>
      </div>
    </div>

    <div class="section-label">Service &amp; Charges</div>
    <table>
      <thead>
        <tr>
          <th style="width:32px">#</th>
          <th>Description</th>
          <th>Rate</th>
          <th>Qty</th>
          <th class="amt">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>01</td>
          <td>
            <div class="item-name">${equipment.name}</div>
            <div class="item-sub">${equipment.type} &nbsp;&bull;&nbsp; ${equipment.location}</div>
          </td>
          <td>${rateLabel}</td>
          <td>${qty}</td>
          <td class="amt">Rs. ${currentTotal.toLocaleString('en-IN')}</td>
        </tr>
      </tbody>
    </table>

    <div class="total-section">
      <div class="total-box">
        <div class="total-line"><span>Subtotal</span><span>Rs. ${currentTotal.toLocaleString('en-IN')}</span></div>
        <div class="total-line"><span>GST / Taxes</span><span>As applicable</span></div>
        <div class="total-final">
          <span>Total (Estimated)</span>
          <strong>Rs. ${currentTotal.toLocaleString('en-IN')}</strong>
        </div>
      </div>
    </div>

    ${bookingData.notes ? `
    <div class="notes">
      <div class="nt">Site / Notes</div>
      <p>${bookingData.notes}</p>
    </div>` : ''}

    <div class="disclaimer">
      <strong>Note:</strong> This is a booking request receipt, not a final tax invoice. The final amount may vary based on actual site conditions and work hours. Payment is collected after service completion. This receipt is computer-generated and does not require a signature.
    </div>

  </div>

  <div class="footer">
    <div class="footer-left">
      <strong style="color:#b8860b;">${BUSINESS_DETAILS.brandName}</strong><br/>
      ${BUSINESS_DETAILS.phone} &nbsp;|&nbsp; ${BUSINESS_DETAILS.supportHours}
    </div>
    <div class="footer-right">
      Computer Generated<br/>
      No Signature Required
    </div>
  </div>
</div>

<div class="btn-row">
  <button class="btn-print" onclick="window.print()">Print / Save as PDF</button>
  <a class="btn-wa" href="https://wa.me/${BUSINESS_DETAILS.phone.replace(/[^0-9]/g,'')}?text=${waMsg}" target="_blank">Share on WhatsApp</a>
</div>

<script>setTimeout(()=>window.print(),700);</script>
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
          align-items: flex-end;
          justify-content: center;
          padding: 0;
          padding-bottom: env(safe-area-inset-bottom, 0px);
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
          border-radius: 16px 16px 0 0;
          padding: 1.25rem 1rem 2.5rem;
          max-height: 88vh;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
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
