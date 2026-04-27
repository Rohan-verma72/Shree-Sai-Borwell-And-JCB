import { BUSINESS_DETAILS } from '@/data/business';

export default function PrivacyPage() {
  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem', maxWidth: 820 }}>
      <span className="eyebrow">Privacy</span>
      <h1>Privacy Policy</h1>
      <p style={{ color: 'var(--text-dim)' }}>
        {BUSINESS_DETAILS.brandName} collects customer details such as name, phone number, project
        location, and booking notes only to coordinate quotations, dispatch, invoicing, and after-service support.
      </p>
      <p style={{ color: 'var(--text-dim)' }}>
        We do not sell customer data. Information is shared only when required for machine dispatch,
        operator coordination, billing, legal compliance, or direct customer support.
      </p>
      <p style={{ color: 'var(--text-dim)' }}>
        If you need your data corrected or removed from our active booking records, contact us through the support page.
      </p>
    </div>
  );
}
