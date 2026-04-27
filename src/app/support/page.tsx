'use client';
import React from 'react';
import './support.css';
import { 
  Phone, Mail, MapPin, 
  MessageSquare, Clock, FileBadge2,
  Send, ChevronDown
} from 'lucide-react';
import { BUSINESS_DETAILS as BUSINESS_INFO } from '@/data/business';
import { BUSINESS_LINKS, buildWhatsAppLink, isValidIndianPhone } from '@/lib/business';
import toast from 'react-hot-toast';
import { useLanguage } from '@/lib/LanguageContext';

const BUSINESS_META = [
  { label: 'License No', value: BUSINESS_INFO.licenseNumber },
  { label: 'GSTIN', value: BUSINESS_INFO.gstin },
];

export default function Support() {
  const { t } = useLanguage();
  const [fullName, setFullName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [industry, setIndustry] = React.useState('Construction/Infrastructure');
  const [message, setMessage] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  const faqs = [
    { q: "How are transport charges calculated?", a: "Transport is based on the distance from our nearest hub (Bhopal or Indore). For Sehore and Vidisha, we have fixed flat rates." },
    { q: "What is the Farmer Discount policy?", a: "Registered farmers with valid ID can avail 15-20% discounts on tractors and harvesters for seasonal use." },
    { q: "Do you provide operators with the machines?", a: "Yes, all rentals (except long-term leases) include a certified, experienced operator and basic insurance." },
    { q: "What if the machine breaks down during work?", a: "Our maintenance team responds during support hours and urgent breakdowns are escalated to the nearest field team. We aim to repair or replace faulty equipment within 4-6 hours depending on site distance." }
  ];

  const handleSupportSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!fullName.trim() || !phone.trim() || !message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!isValidIndianPhone(phone)) {
      toast.error('Please enter a valid mobile number');
      return;
    }

    try {
      setSubmitting(true);
      // Save locally first
      await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName.trim(),
          phone: phone.trim(),
          industry,
          message: message.trim(),
        }),
      });

      const formattedMessage = [
        'Hello, I need a project quotation.',
        `Name: ${fullName.trim()}`,
        `Phone: ${phone.trim()}`,
        `Industry: ${industry}`,
        `Requirement: ${message.trim()}`,
      ].join('\n');

      window.open(buildWhatsAppLink(formattedMessage), '_blank', 'noopener,noreferrer');
      toast.success('Requirement sent! Opening WhatsApp...');
      
      // Clear form
      setFullName('');
      setPhone('');
      setMessage('');
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="support-page">
      <div className="container">
        {/* Contact Hero */}
        <div className="contact-hero section">
          <div className="hero-c-text">
            <span>{t.supportHours}</span>
            <h1>{t.supportTitle.split(' ').map((part, i, arr) => (
                <React.Fragment key={i}>
                  {i === 1 ? <span className="accent">{part} </span> : part + ' '}
                </React.Fragment>
              ))}</h1>
            <p>{t.supportSubtitle}</p>
          </div>
          <div className="support-grid">
            <div className="s-card glass-card">
              <Phone className="s-icon" />
              <h3>{t.callToBook}</h3>
              <p>Speak with our logistics advisor</p>
              <a href={BUSINESS_LINKS.tel} className="s-link">{BUSINESS_INFO.phone}</a>
            </div>
            <div className="s-card glass-card accent-card">
              <MessageSquare className="s-icon" />
              <h3>{t.whatsappEnquiry}</h3>
              <p>Instant booking queries & photos</p>
              <a href={buildWhatsAppLink('Hello, I need help with equipment booking and quotation.')} className="s-link" target="_blank" rel="noreferrer">Chat Now</a>
            </div>
            <div className="s-card glass-card">
              <Mail className="s-icon" />
              <h3>Email Support</h3>
              <p>For large project quotations</p>
              <a href={BUSINESS_LINKS.mailto} className="s-link">{BUSINESS_INFO.email}</a>
            </div>
          </div>
        </div>

        <div className="support-main">
          {/* Contact Form */}
          <div className="form-col glass-card">
            <h2>{t.submitRequest}</h2>
            <form className="contact-form" onSubmit={handleSupportSubmit}>
              <div className="f-row">
                <div className="f-group">
                  <label>{t.customerName}</label>
                  <input type="text" placeholder="Your name or company name" value={fullName} onChange={(event) => setFullName(event.target.value)} />
                </div>
                <div className="f-group">
                  <label>{t.phoneNumber}</label>
                  <input type="tel" placeholder="10-digit mobile number" value={phone} onChange={(event) => setPhone(event.target.value)} />
                </div>
              </div>
              <div className="f-group">
                <label>Industry</label>
                <select value={industry} onChange={(event) => setIndustry(event.target.value)}>
                  <option>Construction/Infrastructure</option>
                  <option>Agriculture/Farming</option>
                  <option>Logistics/Mining</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="f-group">
                <label>{t.locationNotes}</label>
                <textarea rows={5} placeholder="Tell us what equipment you need and for how long..." value={message} onChange={(event) => setMessage(event.target.value)}></textarea>
              </div>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Send Inquiry'} <Send size={18} />
              </button>
            </form>
          </div>

          {/* FAQ Column */}
          <div className="faq-col">
            <h2>Frequently Asked Questions</h2>
            <div className="faq-list">
              {faqs.map((faq, i) => (
                <div key={i} className="faq-item">
                  <div className="faq-q">
                    <span>{faq.q}</span>
                    <ChevronDown size={18} />
                  </div>
                  <div className="faq-a">
                    <p>{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="office-card glass-card">
              <h3>Our Main Hubs</h3>
              <div className="o-item">
                <MapPin size={18} className="o-icon" />
                <div>
                  <strong>Sehore HQ</strong>
                  <p>{BUSINESS_INFO.address}</p>
                </div>
              </div>

              <div className="o-item">
                <Clock size={18} className="o-icon" />
                <div>
                  <strong>Support Hours</strong>
                  <p>{BUSINESS_INFO.supportHours}</p>
                </div>
              </div>

              <div className="business-meta">
                {BUSINESS_META.map((item) => (
                  <div key={item.label} className="meta-item">
                    <FileBadge2 size={16} className="meta-icon" />
                    <div>
                      <strong>{item.label}</strong>
                      <p>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

     
    </div>
  );
}
