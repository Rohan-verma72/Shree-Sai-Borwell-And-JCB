import Link from 'next/link';
import { BUSINESS_DETAILS } from '@/data/business';

const PLANS = [
  {
    title: 'Hourly Dispatch',
    price: 'From Rs 600/hr',
    summary: 'Best for short excavation, loading, and one-day site support.',
    points: ['Operator-led execution', 'Suitable for urgent city jobs', 'Phone + WhatsApp confirmation'],
  },
  {
    title: 'Daily Rental',
    price: 'From Rs 4,500/day',
    summary: 'Ideal for contractors, farms, and multi-day field work.',
    points: ['Transparent daily pricing', 'Transport quoted separately where needed', 'Priority machine allocation'],
  },
  {
    title: 'Monthly Contract',
    price: 'Custom quote',
    summary: 'For continuous project deployment and seasonal peak workloads.',
    points: ['Preferred long-term rates', 'Recurring site support', 'Commercial invoicing with GST details'],
  },
];

export default function PricingPage() {
  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
      <div style={{ maxWidth: 760, marginBottom: '2.5rem' }}>
        <span className="eyebrow">Pricing</span>
        <h1>Commercial rental plans built for real site work.</h1>
        <p style={{ color: 'var(--text-dim)' }}>
          Final pricing depends on machine type, duration, operator requirement, and dispatch location.
          For the fastest quote, contact {BUSINESS_DETAILS.brandName} with your project window and site address.
        </p>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        {PLANS.map((plan) => (
          <article key={plan.title} className="glass-card" style={{ padding: '1.75rem' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>{plan.title}</h2>
            <strong style={{ color: 'var(--primary)', fontSize: '1.5rem' }}>{plan.price}</strong>
            <p style={{ color: 'var(--text-dim)', marginTop: '0.9rem' }}>{plan.summary}</p>
            <ul style={{ marginTop: '1rem', color: 'var(--text-dim)', paddingLeft: '1.2rem' }}>
              {plan.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className="glass-card" style={{ padding: '1.5rem', marginTop: '2rem' }}>
        <h3>What affects the final quotation?</h3>
        <p style={{ color: 'var(--text-dim)' }}>
          Transport distance, operator schedule, duration, site access, fuel policy, and any waiting-time commitment.
          Seasonal agricultural jobs and long-term contracts are priced separately.
        </p>
        <Link href="/support" className="btn-primary" style={{ display: 'inline-flex', marginTop: '1rem' }}>
          Request a Quote
        </Link>
      </div>
    </div>
  );
}
