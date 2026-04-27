'use client';

import React from 'react';
import Link from 'next/link';
import './bookings.css';
import { format } from 'date-fns';
import {
  Calendar,
  CheckCircle2,
  Clock3,
  FileText,
  MapPin,
  PackageCheck,
  Phone,
} from 'lucide-react';
import type { Booking } from '@/data/types';
import { BUSINESS_DETAILS } from '@/data/business';
import { BUSINESS_LINKS } from '@/lib/business';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

export default function MyBookings() {
  const [activeTab, setActiveTab] = React.useState<'Active' | 'History'>('Active');
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchPhone, setSearchPhone] = React.useState('');
  const [hasSearched, setHasSearched] = React.useState(false);

  React.useEffect(() => {
    let active = true;

    const loadBookings = async () => {
      try {
        const response = await fetch('/api/bookings');
        if (!response.ok) {
          throw new Error('Failed to load bookings');
        }

        const data = (await response.json()) as Booking[];
        if (active) {
          setBookings(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadBookings();
    return () => {
      active = false;
    };
  }, []);

  const filteredBookings = bookings.filter(b => 
    hasSearched && searchPhone && b.phone && b.phone.includes(searchPhone)
  );

  const activeBookings = filteredBookings.filter(
    (booking) => booking.status === 'Pending' || booking.status === 'Confirmed',
  );
  const bookingHistory = filteredBookings.filter(
    (booking) => booking.status === 'Completed' || booking.status === 'Cancelled',
  );
  const visibleBookings = activeTab === 'Active' ? activeBookings : bookingHistory;

  return (
    <div className="bookings-page">
      <div className="container">
        <div className="page-header">
          <div>
            <span className="eyebrow">Customer dashboard</span>
            <h1>Track every booking from request to completion.</h1>
            <p>Enter your phone number used during booking to see your records.</p>
            
            <div className="search-box glass-card">
              <Phone size={18} />
              <input 
                type="tel" 
                placeholder="Enter Phone Number" 
                value={searchPhone}
                onChange={e => {
                  setSearchPhone(e.target.value);
                  setHasSearched(false);
                }}
              />
              <button 
                onClick={() => setHasSearched(true)}
                className="search-submit"
              >
                Find My Bookings
              </button>
            </div>
          </div>

          <div className="header-stat glass-card">
            <span>Orders found</span>
            <strong>{filteredBookings.length}</strong>
            <small>{hasSearched ? 'Showing latest' : 'Enter phone'}</small>
          </div>
        </div>

        <div className="layout-grid">
          <div className="main-area">
            <div className="tabs">
              <button
                className={`tab-btn ${activeTab === 'Active' ? 'active' : ''}`}
                onClick={() => setActiveTab('Active')}
              >
                Active & Pending
              </button>
              <button
                className={`tab-btn ${activeTab === 'History' ? 'active' : ''}`}
                onClick={() => setActiveTab('History')}
              >
                History
              </button>
            </div>

            <div className="order-list">
              {loading ? (
                <div className="empty-card glass-card">Loading bookings...</div>
              ) : visibleBookings.length > 0 ? (
                visibleBookings.map((booking) => (
                  <article key={booking.id} className="order-card glass-card">
                    <div className="order-top">
                      <div className="order-id">
                        <span>Booking ID</span>
                        <strong>{booking.id}</strong>
                      </div>
                      <div className={`order-status ${booking.status.toLowerCase()}`}>
                        {booking.status}
                      </div>
                    </div>

                    <div className="order-middle">
                      <div className="eq-mini-info">
                        <div className="eq-thumb">
                          <PackageCheck size={24} />
                        </div>
                        <div className="eq-details">
                          <h4>{booking.equipment}</h4>
                          <div className="meta-row">
                            <span>
                              <Calendar size={14} />
                              {format(new Date(booking.startDate), 'dd MMM yyyy')}
                            </span>
                            <span>
                              <Clock3 size={14} />
                              {booking.duration}
                            </span>
                            <span>
                              <MapPin size={14} />
                              {booking.location}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="order-pricing">
                        <div className="price-item">
                          <span>Total</span>
                          <strong>{formatCurrency(booking.total)}</strong>
                        </div>
                        <div className="price-item">
                          <span>Customer</span>
                          <strong>{booking.customer}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="order-bottom">
                      <div className="meta-badges">
                        <span className="badge">{booking.customerType}</span>
                        <span className="badge">{booking.bookingType}</span>
                        {booking.phone ? (
                          <span className="badge">
                            <Phone size={13} />
                            {booking.phone}
                          </span>
                        ) : null}
                      </div>

                      {booking.notes ? (
                        <div className="notes">
                          <FileText size={14} />
                          <span>{booking.notes}</span>
                        </div>
                      ) : (
                        <div className="notes muted">No extra note added.</div>
                      )}
                    </div>
                  </article>
                ))
              ) : !hasSearched ? (
                <div className="empty-card glass-card">
                  <h3>Check Your Status</h3>
                  <p>Please enter your phone number above to see your live booking updates.</p>
                </div>
              ) : (
                <div className="empty-card glass-card">
                  No bookings found for <strong>{searchPhone}</strong>.
                </div>
              )}
            </div>
          </div>

          <aside className="side-area">
            <div className="info-card glass-card">
              <h3>How this works</h3>
              <div className="info-list">
                <span>
                  <CheckCircle2 size={15} />
                  Submit a request from any equipment detail page
                </span>
                <span>
                  <CheckCircle2 size={15} />
                  Admin confirms or cancels it from the dashboard
                </span>
                <span>
                  <CheckCircle2 size={15} />
                  Confirmed jobs show up as active and count toward fleet usage
                </span>
              </div>
            </div>

            <div className="summary-card">
              <h4>Need another machine?</h4>
              <p>
                Browse the live fleet inventory or call {BUSINESS_DETAILS.phone} if your site
                needs urgent dispatch support.
              </p>
              <Link href="/equipment">Open fleet</Link>
              <a href={BUSINESS_LINKS.tel}>Call dispatch desk</a>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
