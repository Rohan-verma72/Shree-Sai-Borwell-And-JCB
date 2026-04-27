import { BUSINESS_DETAILS } from '@/data/business';

export default function TermsPage() {
  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem', maxWidth: 820 }}>
      <span className="eyebrow">Terms</span>
      <h1>Terms & Conditions</h1>
      <p style={{ color: 'var(--text-dim)' }}>
        All bookings submitted through {BUSINESS_DETAILS.brandName} are requests until confirmed by the operations team.
        Machine availability, transport schedule, operator support, and commercial terms are finalized only after approval.
      </p>
      <p style={{ color: 'var(--text-dim)' }}>
        Customers must provide an accurate work location, expected rental window, and safe site access. Delays caused by
        wrong site details, restricted access, or off-schedule usage may affect dispatch timing and commercial charges.
      </p>
      <p style={{ color: 'var(--text-dim)' }}>
        Any misuse, unauthorized relocation, or unsafe operation of hired machinery may lead to cancellation and recovery charges.
      </p>
    </div>
  );
}
