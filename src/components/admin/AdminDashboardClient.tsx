'use client';

import React from 'react';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  ArrowRight,
  Bell,
  CalendarRange,
  Check,
  CheckCheck,
  Clock3,
  Cog,
  LayoutDashboard,
  LogOut,
  MapPin,
  MessageSquare,
  Package,
  Search,
  ShieldCheck,
  Tractor,
  TrendingUp,
  Truck,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import styles from './AdminDashboardClient.module.css';
import { BUSINESS_DETAILS } from '@/data/business';
import { BUSINESS_LINKS } from '@/lib/business';

type Stats = {
  totalRevenue: number;
  activeBookings: number;
  utilization: number;
};

type Booking = {
  id: string;
  equipmentId?: string;
  customer: string;
  phone?: string;
  equipment: string;
  location: string;
  startDate: string;
  endDate: string;
  total: number;
  customerType: 'Construction' | 'Farmer';
  bookingType: 'Hourly' | 'Daily';
  duration: string;
  createdAt: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  notes?: string;
};

type Equipment = {
  id: string;
  name: string;
  type: 'JCB' | 'Poclain' | 'Harvester' | 'Tractor' | 'Truck';
  stock: number;
  location: string;
  availability: boolean;
  condition: 'Excellent' | 'Good' | 'Maintenance Required';
  dailyRate: number;
  monthlyRate: number;
  hourlyRate: number;
  farmerDailyRate: number;
  farmerMonthlyRate: number;
  farmerHourlyRate: number;
  image?: string;
  description?: string;
};

type NotificationItem = {
  id: string;
  title: string;
  message: string;
};

const navSections = [
  {
    label: 'Overview',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', active: true },
      { icon: Package, label: 'Fleet Ops' },
      { icon: CalendarRange, label: 'Bookings' },
      { icon: Users, label: 'Customers' },
      { icon: Package, label: 'Site Gallery' },
    ],
  },
  {
    label: 'Control',
    items: [
      { icon: Wrench, label: 'Maintenance' },
      { icon: Truck, label: 'Dispatch' },
      { icon: ShieldCheck, label: 'Compliance' },
      { icon: Cog, label: 'Settings' },
    ],
  },
];

const statusToneMap: Record<Booking['status'], string> = {
  Pending: 'pending',
  Confirmed: 'confirmed',
  Completed: 'completed',
  Cancelled: 'cancelled',
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

const formatCompactCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);

const SEEN_NOTIFICATIONS_KEY = 'admin-notification-seen';

export default function AdminDashboardClient() {
  const router = useRouter();
  const previousUnreadCountRef = React.useRef(0);
  const hasInteractedRef = React.useRef(false);
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [equipment, setEquipment] = React.useState<Equipment[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isNotificationOpen, setIsNotificationOpen] = React.useState(false);
  const [seenNotificationIds, setSeenNotificationIds] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [updatingBookingId, setUpdatingBookingId] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState('Dashboard');
  const [lastUpdated, setLastUpdated] = React.useState<string>(new Date().toLocaleTimeString());
  const [enquiries, setEnquiries] = React.useState<any[]>([]);
  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = React.useState(false);
  const [selectedEquipment, setSelectedEquipment] = React.useState<Equipment | null>(null);
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null);

  const fetchDashboard = React.useCallback(async () => {
    const [statsRes, bookingsRes, equipmentRes] = await Promise.all([
      fetch('/api/stats', { cache: 'no-store' }),
      fetch('/api/bookings', { cache: 'no-store' }),
      fetch('/api/equipment', { cache: 'no-store' }),
    ]);

    if (!statsRes.ok || !bookingsRes.ok || !equipmentRes.ok) {
      throw new Error('Dashboard sync failed');
    }

    const [statsData, bookingsData, equipmentData, enquiriesRes] = await Promise.all([
      statsRes.json() as Promise<Stats>,
      bookingsRes.json() as Promise<Booking[]>,
      equipmentRes.json() as Promise<Equipment[]>,
      fetch('/api/enquiries', { cache: 'no-store' }),
    ]);

    const enquiriesData = enquiriesRes.ok ? await enquiriesRes.json() : [];

    setStats(statsData);
    setBookings(bookingsData);
    setEquipment(equipmentData);
    setEnquiries(enquiriesRes.ok ? (enquiriesData as any) : []);
    setLastUpdated(new Date().toLocaleTimeString());
  }, []);

  React.useEffect(() => {
    const storedSeenState = window.localStorage.getItem(SEEN_NOTIFICATIONS_KEY);
    if (storedSeenState) {
      try {
        const parsed = JSON.parse(storedSeenState) as string[];
        setSeenNotificationIds(parsed);
      } catch {
        window.localStorage.removeItem(SEEN_NOTIFICATIONS_KEY);
      }
    }
  }, []);

  React.useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        await fetchDashboard();
      } catch (error) {
        console.error(error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();
    const intervalId = window.setInterval(() => {
      void fetchDashboard().catch((error) => console.error(error));
    }, 20000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [fetchDashboard]);

  React.useEffect(() => {
    window.localStorage.setItem(SEEN_NOTIFICATIONS_KEY, JSON.stringify(seenNotificationIds));
  }, [seenNotificationIds]);

  React.useEffect(() => {
    const markInteraction = () => {
      hasInteractedRef.current = true;
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener('keydown', markInteraction, { once: true });
    document.addEventListener('pointerdown', markInteraction, { once: true });
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', markInteraction);
      document.removeEventListener('pointerdown', markInteraction);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const pendingBookings = bookings.filter((booking) => booking.status === 'Pending');
  const confirmedBookings = bookings.filter((booking) => booking.status === 'Confirmed');
  const latestBooking = bookings[0];
  const availableCount = equipment.reduce(
    (sum, item) => sum + (item.availability ? item.stock : 0),
    0,
  );
  const totalMachines = equipment.reduce((sum, item) => sum + item.stock, 0);
  const notifications: NotificationItem[] = [
    ...pendingBookings.slice(0, 2).map((booking) => ({
      id: `pending-${booking.id}-${booking.status}`,
      title: `${booking.customer} is waiting for approval`,
      message: `${booking.equipment} requested for ${booking.location}.`,
    })),
    ...(latestBooking
      ? [
          {
            id: `latest-${latestBooking.id}-${latestBooking.status}`,
            title: `Latest booking ${latestBooking.id}`,
            message: `${latestBooking.customer} added a ${latestBooking.status.toLowerCase()} request.`,
          },
        ]
      : []),
    {
      id: `fleet-${availableCount}-${totalMachines}`,
      title: `${availableCount} of ${totalMachines} machines ready`,
      message: 'Fleet availability is synced from confirmed and completed jobs.',
    },
  ];
  const unreadNotifications = notifications.filter(
    (notification) => !seenNotificationIds.includes(notification.id),
  );
  const unreadCount = unreadNotifications.length;

  React.useEffect(() => {
    const previousUnreadCount = previousUnreadCountRef.current;
    if (
      unreadCount > previousUnreadCount &&
      hasInteractedRef.current &&
      typeof window !== 'undefined'
    ) {
      const AudioContextCtor =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

      if (AudioContextCtor) {
        const audioContext = new AudioContextCtor();
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
        gain.gain.setValueAtTime(0.001, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.05, audioContext.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.18);

        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.18);
        oscillator.onended = () => {
          void audioContext.close();
        };
      }
    }

    previousUnreadCountRef.current = unreadCount;
  }, [unreadCount]);

  const visibleBookings = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return bookings;
    }

    return bookings.filter((booking) =>
      [booking.id, booking.customer, booking.equipment, booking.location, booking.phone, booking.notes]
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [bookings, searchQuery]);

  const metricCards = [
    {
      label: 'Revenue Run Rate',
      value: stats ? formatCompactCurrency(stats.totalRevenue) : '...',
      meta: 'confirmed + completed',
      icon: TrendingUp,
    },
    {
      label: 'Active Jobs',
      value: stats?.activeBookings ?? 0,
      meta: `${pendingBookings.length} pending approval`,
      icon: CalendarRange,
    },
    {
      label: 'Fleet Utilization',
      value: `${stats?.utilization ?? 0}%`,
      meta: `${totalMachines} total machines`,
      icon: Truck,
    },
    {
      label: 'Available Machines',
      value: availableCount,
      meta: `${confirmedBookings.length} confirmed jobs`,
      icon: Tractor,
    },
  ];

  const topEquipment = [...equipment]
    .sort((left, right) => right.dailyRate - left.dailyRate)
    .slice(0, 3);

  const updateStatus = async (bookingId: string, status: Booking['status']) => {
    try {
      setUpdatingBookingId(bookingId);
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || 'Failed to update booking');
      }

      await fetchDashboard();
      toast.success(`Booking ${bookingId} marked ${status.toLowerCase()}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update booking.');
    } finally {
      setUpdatingBookingId(null);
    }
  };

  const handleToggleAvailability = async (id: string, current: boolean) => {
    try {
      const response = await fetch(`/api/equipment/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability: !current }),
      });
      if (!response.ok) throw new Error('Failed to update availability');
      await fetchDashboard();
      toast.success('Machine availability updated.');
    } catch (error) {
      toast.error('Failed to update machine.');
    }
  };

  const handleDeleteEquipment = async (id: string) => {
    if (!confirm('Are you sure you want to remove this machine from the fleet?')) return;
    try {
      setIsDeleting(id);
      const response = await fetch(`/api/equipment/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      await fetchDashboard();
      toast.success('Machine removed from fleet.');
    } catch (error) {
      toast.error('Failed to delete machine.');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleSaveEquipment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const getVal = (key: string) => {
      const val = formData.get(key);
      const parsed = parseInt(val as string);
      return isNaN(parsed) ? 0 : parsed;
    };

    const data = {
      name: (formData.get('name') as string) || 'Unnamed Machine',
      type: (formData.get('type') as string) || 'JCB',
      stock: getVal('stock') || 1,
      location: (formData.get('location') as string) || 'Generic Site',
      condition: (formData.get('condition') as string) || 'Excellent',
      dailyRate: getVal('dailyRate'),
      monthlyRate: getVal('monthlyRate'),
      hourlyRate: getVal('hourlyRate'),
      farmerMonthlyRate: getVal('farmerMonthlyRate'),
      farmerHourlyRate: getVal('farmerHourlyRate'),
      image: (formData.get('image') as string) || (selectedEquipment?.image || '/imgs/jcb-3.webp'),
      description: (formData.get('description') as string) || (selectedEquipment?.description || ''),
    };

    try {
      const url = selectedEquipment ? `/api/equipment/${selectedEquipment.id}` : '/api/equipment';
      const method = selectedEquipment ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.error || 'Server error while saving');
      await fetchDashboard();
      router.refresh();
      setIsEquipmentModalOpen(false);
      setSelectedEquipment(null);
      toast.success(selectedEquipment ? 'Machine updated.' : 'New machine added.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong while saving.');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
      toast.success('Logged out successfully');
    } catch (err) {
      toast.error('Failed to logout');
    }
  };

  const handleNotificationToggle = () => {
    hasInteractedRef.current = true;
    setIsNotificationOpen((value) => !value);
  };

  const markAllRead = () => {
    setSeenNotificationIds((current) => Array.from(new Set([...current, ...notifications.map((item) => item.id)])));
    setIsNotificationOpen(false);
  };

  const markNotificationRead = (id: string) => {
    setSeenNotificationIds((current) => (current.includes(id) ? current : [...current, id]));
  };

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div className={styles.brandBlock}>
              <span className={styles.brandEyebrow}>Admin panel</span>
              <h1>Shree Sai Ops</h1>
              <p>Back to Website →</p>
            </div>
          </Link>

          {navSections.map((section) => (
            <div key={section.label} className={styles.navSection}>
              <span className={styles.navLabel}>{section.label}</span>
              <div className={styles.navList}>
                {section.items.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    className={clsx(styles.navItem, activeTab === item.label && styles.navItemActive)}
                    onClick={() => setActiveTab(item.label)}
                  >
                    <item.icon size={17} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button
            type="button"
            className={clsx(styles.navItem, styles.logoutBtn)}
            onClick={handleLogout}
          >
            <LogOut size={17} />
            <span>Log Out</span>
          </button>
        </div>

        <div className={styles.sidebarCard}>
          <span className={styles.sidebarKicker}>Today</span>
          <strong>{format(new Date(), 'dd MMM yyyy')}</strong>
          <p>{pendingBookings.length} bookings waiting for action.</p>
        </div>
      </aside>

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span className={styles.heroBadge}>Operations cockpit</span>
              <span className={styles.syncStatus}>● Live Sync: {lastUpdated}</span>
            </div>
            <h2>Run approvals, fleet and revenue from one place.</h2>
            <p>
              Review incoming site requests, confirm machine allocation, and keep the rental
              desk synced with live fleet availability.
            </p>
          </div>

          {confirmedBookings.length > 0 && (
            <div className={styles.dashboardMap}>
              <div className={styles.mapHeader}>
                <MapPin size={16} color="#FFD700" />
                <span>Live Active Sites ({confirmedBookings.length})</span>
              </div>
              <iframe
                src={`https://maps.google.com/maps?q=Bhopal%20Madhya%20Pradesh&t=&z=8&ie=UTF8&iwloc=&output=embed`}
                width="100%"
                height="180"
                style={{ border: 0, borderRadius: '12px', background: '#111' }}
                loading="lazy"
              ></iframe>
              <div className={styles.siteList}>
                {confirmedBookings.slice(0, 4).map(b => (
                  <div key={b.id} className={styles.siteTag}>
                    <span className={styles.siteDot}></span> {b.location}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={styles.heroActions}>
            <label className={styles.searchBox}>
              <Search size={16} />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search booking, customer, phone or location"
              />
            </label>
            <div className={styles.notificationWrap}>
              <button
                type="button"
                className={clsx(styles.iconButton, isNotificationOpen && styles.iconButtonActive)}
                aria-label="Notifications"
                aria-expanded={isNotificationOpen}
                onClick={handleNotificationToggle}
              >
                <Bell size={18} />
                {unreadCount > 0 && <span className={styles.notificationDot} />}
              </button>
            </div>
            
            <button
              type="button"
              className={clsx(styles.iconButton, styles.logoutHeaderBtn)}
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </section>

        <section className={styles.metricsGrid}>
          {metricCards.map((card, index) => (
            <motion.article
              key={card.label}
              className={styles.metricCard}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.35 }}
            >
              <div className={styles.metricIcon}>
                <card.icon size={20} />
              </div>
              <div>
                <p className={styles.metricLabel}>{card.label}</p>
                <strong className={styles.metricValue}>{card.value}</strong>
                <span className={styles.metricMeta}>{card.meta}</span>
              </div>
            </motion.article>
          ))}
        </section>

        <section className={styles.contentGrid}>
          <article className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <span className={styles.panelEyebrow}>Live queue</span>
                <h3>Booking control board</h3>
              </div>
              <button type="button" className={styles.ghostButton} onClick={() => void fetchDashboard()}>
                Refresh board <ArrowRight size={15} />
              </button>
            </div>

            <div className={styles.tableWrap}>
              {activeTab === 'Site Gallery' ? (
                <div className={styles.galleryManage}>
                  <div className={styles.panelHeaderCompact}>
                    <h3>Add New Work Photo</h3>
                  </div>
                  <form className={styles.galleryForm} onSubmit={async (e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    const res = await fetch('/api/gallery', {
                      method: 'POST',
                      body: JSON.stringify({
                        title: fd.get('title'),
                        location: fd.get('location'),
                        imageUrl: fd.get('imageUrl')
                      })
                    });
                    if(res.ok) {
                      toast.success('Photo added to gallery');
                      (e.target as any).reset();
                      await fetchDashboard();
                    }
                  }}>
                    <div className={styles.formGrid}>
                      <div className={styles.formField}>
                        <label>Site Title</label>
                        <input name="title" required placeholder="e.g. Deep Foundation Digging" />
                      </div>
                      <div className={styles.formField}>
                        <label>Location</label>
                        <input name="location" required placeholder="e.g. Sehore, MP" />
                      </div>
                      <div className={styles.formField}>
                        <label>Image URL</label>
                        <input name="imageUrl" required placeholder="Paste image link here" />
                      </div>
                      <button type="submit" className={styles.actionPrimary}>Add to Gallery</button>
                    </div>
                  </form>
                </div>
              ) : activeTab === 'Dashboard' || activeTab === 'Bookings' ? (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Booking</th>
                      <th>Customer</th>
                      <th>Equipment</th>
                      <th>Window</th>
                      <th>Status</th>
                      <th>Amount</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={7} className={styles.emptyState}>
                          Syncing dashboard data...
                        </td>
                      </tr>
                    ) : visibleBookings.length > 0 ? (
                      visibleBookings.map((booking) => (
                        <tr key={booking.id}>
                          <td>
                            <span className={styles.bookingId}>{booking.id}</span>
                            <span className={styles.tableHint}>{format(new Date(booking.createdAt), 'dd MMM, hh:mm a')}</span>
                          </td>
                          <td>
                            <strong>{booking.customer}</strong>
                            <span className={styles.tableHint}>
                              {booking.customerType}
                              {booking.phone ? ` • ${booking.phone}` : ''}
                            </span>
                          </td>
                          <td>
                            <strong>{booking.equipment}</strong>
                            <span className={styles.tableHint}>{booking.location}</span>
                          </td>
                          <td>
                            <span>{format(new Date(booking.startDate), 'dd MMM')}</span>
                            <span className={styles.tableHint}>{booking.duration}</span>
                          </td>
                          <td>
                            <span
                              className={clsx(
                                styles.statusPill,
                                styles[`status${statusToneMap[booking.status]}`],
                              )}
                            >
                              {booking.status}
                            </span>
                          </td>
                          <td>{formatCurrency(booking.total)}</td>
                          <td>
                            <div className={styles.actionGroup}>
                              <button
                                type="button"
                                className={styles.actionApprove}
                                disabled={updatingBookingId === booking.id || booking.status === 'Confirmed'}
                                onClick={() => void updateStatus(booking.id, 'Confirmed')}
                              >
                                <Check size={14} /> Approve
                              </button>
                              <button
                                type="button"
                                className={styles.actionComplete}
                                disabled={updatingBookingId === booking.id || booking.status === 'Completed'}
                                onClick={() => void updateStatus(booking.id, 'Completed')}
                              >
                                <CheckCheck size={14} /> Complete
                              </button>
                              <button
                                type="button"
                                className={styles.actionCancel}
                                disabled={updatingBookingId === booking.id || booking.status === 'Cancelled'}
                                onClick={() => void updateStatus(booking.id, 'Cancelled')}
                              >
                                <X size={14} /> Cancel
                              </button>
                              {booking.status === 'Confirmed' && (
                                <a
                                  href={`https://wa.me/${booking.phone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                    `Hello ${booking.customer}, Your booking ${booking.id} for ${booking.equipment} at ${booking.location} is CONFIRMED by Shree Sai Borewell & JCB. We are dispatching the machine shortly.`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={styles.actionWhatsApp}
                                >
                                  <MessageSquare size={14} /> WhatsApp
                                </a>
                              )}
                              {booking.status === 'Completed' && (
                                <button
                                  type="button"
                                  className={styles.actionReceipt}
                                  onClick={() => {
                                    const win = window.open('', '_blank');
                                    if (win) {
                                      win.document.write(`
                                        <html>
                                          <head>
                                            <title>Receipt - ${booking.id}</title>
                                            <style>
                                              body { font-family: sans-serif; padding: 40px; color: #333; }
                                              .header { border-bottom: 2px solid #f7ca00; padding-bottom: 20px; margin-bottom: 30px; }
                                              .bill-to { margin-bottom: 30px; }
                                              .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                                              .table th, .table td { padding: 12px; border-bottom: 1px solid #eee; text-align: left; }
                                              .total { font-size: 1.5rem; font-weight: bold; text-align: right; }
                                              .footer { margin-top: 50px; font-size: 0.8rem; color: #777; text-align: center; }
                                            </style>
                                          </head>
                                          <body>
                                            <div class="header">
                                              <h1>SHREE SAI BOREWELL & JCB</h1>
                                              <p>Bhopal Road, MP | +91 99999 88888</p>
                                            </div>
                                            <div class="bill-to">
                                              <h3>INVOICE / RECEIPT</h3>
                                              <p><strong>Receipt ID:</strong> ${booking.id}</p>
                                              <p><strong>Date:</strong> ${format(new Date(), 'dd MMMM yyyy')}</p>
                                              <p><strong>Customer:</strong> ${booking.customer}</p>
                                            </div>
                                            <table class="table">
                                              <thead>
                                                <tr>
                                                  <th>Description</th>
                                                  <th>Duration</th>
                                                  <th>Amount</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                <tr>
                                                  <td>Equipment Rental: ${booking.equipment}</td>
                                                  <td>${booking.duration}</td>
                                                  <td>Rs ${booking.total}</td>
                                                </tr>
                                              </tbody>
                                            </table>
                                            <div class="total">Total Paid: Rs ${booking.total}</div>
                                            <div class="footer">
                                              This is a computer generated receipt. Thank you for choosing Shree Sai Borewell & JCB!
                                            </div>
                                            <script>window.print();</script>
                                          </body>
                                        </html>
                                      `);
                                      win.document.close();
                                    }
                                  }}
                                >
                                  <CheckCheck size={14} /> Receipt
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className={styles.emptyState}>
                          No bookings match this search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              ) : activeTab === 'Customers' ? (
                <div className={styles.enquiriesList}>
                    {enquiries.length > 0 ? enquiries.map((enq) => (
                        <div key={enq.id} className={styles.enqRow}>
                            <div className={styles.enqMain}>
                                <strong>{enq.name}</strong>
                                <span>{enq.phone} • {enq.industry}</span>
                                <p>{enq.message}</p>
                            </div>
                            <span className={styles.enqDate}>{format(new Date(enq.createdAt), 'dd MMM')}</span>
                        </div>
                    )) : <div className={styles.emptyState}>No recent enquiries.</div>}
                </div>
              ) : activeTab === 'Fleet Ops' ? (
                <div className={styles.fleetTableContainer}>
                  <div className={styles.tableHeaderActions}>
                    <p>Manage machines, availability and pricing.</p>
                    <button
                      className={styles.ghostButton}
                      onClick={() => {
                        setSelectedEquipment(null);
                        setIsEquipmentModalOpen(true);
                      }}
                    >
                      <Package size={15} /> Add New Machine
                    </button>
                  </div>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Machine</th>
                        <th>Type</th>
                        <th>Location</th>
                        <th>Stock</th>
                        <th>Daily Rate</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {equipment.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <strong>{item.name}</strong>
                          </td>
                          <td>{item.type}</td>
                          <td>{item.location}</td>
                          <td>{item.stock}</td>
                          <td>{formatCurrency(item.dailyRate)}</td>
                          <td>
                            <button
                              onClick={() => void handleToggleAvailability(item.id, item.availability)}
                              className={clsx(
                                styles.statusPill,
                                item.availability ? styles.statusconfirmed : styles.statuscancelled,
                                styles.toggleBtn,
                              )}
                            >
                              {item.availability ? 'Available' : 'Busy/Maintenance'}
                            </button>
                          </td>
                          <td>
                            <div className={styles.actionGroup}>
                              <button
                                className={styles.actionApprove}
                                onClick={() => {
                                  setSelectedEquipment(item);
                                  setIsEquipmentModalOpen(true);
                                }}
                              >
                                Edit
                              </button>
                              <button
                                className={styles.actionCancel}
                                disabled={isDeleting === item.id}
                                onClick={() => void handleDeleteEquipment(item.id)}
                              >
                                {isDeleting === item.id ? '...' : 'Delete'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className={styles.emptyState}>View coming soon for {activeTab}</div>
              )}
            </div>
          </article>

          <div className={styles.sideStack}>
            <article className={styles.quickStrip}>
              <div className={styles.quickStat}>
                <span>Latest booking</span>
                <strong>{latestBooking?.id ?? 'No data'}</strong>
              </div>
              <div className={styles.quickStat}>
                <span>Pending approvals</span>
                <strong>{pendingBookings.length}</strong>
              </div>
            </article>

            <article className={styles.panel}>
              <div className={styles.panelHeaderCompact}>
                <div>
                  <span className={styles.panelEyebrow}>Fleet pulse</span>
                  <h3>Top equipment</h3>
                </div>
              </div>

              <div className={styles.fleetList}>
                {topEquipment.map((item) => (
                  <div key={item.id} className={styles.fleetItem}>
                    <div>
                      <strong>{item.name}</strong>
                      <div className={styles.inlineMeta}>
                        <span><MapPin size={14} /> {item.location}</span>
                        <span><Clock3 size={14} /> {item.condition}</span>
                        <span>Stock {item.stock}</span>
                        <span>{item.availability ? 'Available' : 'Busy'}</span>
                      </div>
                    </div>
                    <span className={styles.fleetPrice}>{formatCurrency(item.dailyRate)}/day</span>
                  </div>
                ))}
              </div>
            </article>

            <article className={styles.highlightCard}>
              <span className={styles.panelEyebrow}>Attention needed</span>
              <h3>Pending approvals and fleet capacity are now connected.</h3>
              <p>
                Confirming a booking updates live stats and machine availability. Cancelling or completing releases the queue cleanly.
              </p>
              <div className={styles.highlightStats}>
                <div>
                  <strong>{pendingBookings.length}</strong>
                  <span>Pending approvals</span>
                </div>
                <div>
                  <strong>{availableCount}</strong>
                  <span>Available machines</span>
                </div>
              </div>
              <p style={{ marginTop: '1rem' }}>
                Need manual coordination? Call the dispatch desk at{' '}
                <a href={BUSINESS_LINKS.tel}>{BUSINESS_DETAILS.phone}</a>.
              </p>
            </article>
          </div>
        </section>
      </main>

      {isNotificationOpen && (
        <>
          <button
            type="button"
            aria-label="Close notifications"
            className={styles.notificationBackdrop}
            onClick={() => setIsNotificationOpen(false)}
          />
          <div className={styles.notificationPanelFixed}>
            <div className={styles.notificationHeader}>
              <div>
                <span className={styles.panelEyebrow}>Notifications</span>
                <h3>Alerts</h3>
              </div>
              <button type="button" className={styles.markReadButton} onClick={markAllRead}>
                <CheckCheck size={15} />
                Mark all read
              </button>
            </div>

            <div className={styles.notificationList}>
              {notifications.length > 0 ? (
                notifications.map((item) => {
                  const isSeen = seenNotificationIds.includes(item.id);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={styles.notificationItem}
                      onClick={() => markNotificationRead(item.id)}
                    >
                      <div className={styles.notificationIcon}>
                        <Bell size={14} />
                      </div>
                      <div className={styles.notificationBody}>
                        <strong>{item.title}</strong>
                        <p>{item.message}</p>
                      </div>
                      {!isSeen && <span className={styles.notificationUnread}>New</span>}
                    </button>
                  );
                })
              ) : (
                <div className={styles.notificationEmpty}>No new alerts right now.</div>
              )}
            </div>
          </div>
        </>
      )}

      {isEquipmentModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>{selectedEquipment ? 'Edit Machine' : 'Add New Machine'}</h3>
            <form onSubmit={(e) => void handleSaveEquipment(e)}>
              <div className={styles.formGrid}>
                <div className={styles.formFieldFull}>
                  <label>Machine Name</label>
                  <input name="name" defaultValue={selectedEquipment?.name} required />
                </div>
                <div className={styles.formField}>
                  <label>Type</label>
                  <select name="type" defaultValue={selectedEquipment?.type || 'JCB'}>
                    <option value="JCB">JCB</option>
                    <option value="Poclain">Poclain</option>
                    <option value="Harvester">Harvester</option>
                    <option value="Tractor">Tractor</option>
                    <option value="Truck">Truck</option>
                  </select>
                </div>
                <div className={styles.formField}>
                  <label>Location</label>
                  <input name="location" defaultValue={selectedEquipment?.location} required />
                </div>
                <div className={styles.formFieldFull}>
                  <label>Stock Count</label>
                  <input name="stock" type="number" defaultValue={selectedEquipment?.stock || 1} required />
                </div>

                <div className={styles.formSectionTitle}>Standard Rental Rates (Corporate/Construction)</div>
                <div className={styles.rateRow}>
                  <div className={styles.formField}>
                    <label>Hourly (₹)</label>
                    <input name="hourlyRate" type="number" defaultValue={selectedEquipment?.hourlyRate} required />
                  </div>
                  <div className={styles.formField}>
                    <label>Daily (₹)</label>
                    <input name="dailyRate" type="number" defaultValue={selectedEquipment?.dailyRate} required />
                  </div>
                  <div className={styles.formField}>
                    <label>Monthly (₹)</label>
                    <input name="monthlyRate" type="number" defaultValue={selectedEquipment?.monthlyRate} required />
                  </div>
                </div>

                <div className={styles.formSectionTitle}>Special Discounted Rates (Farmers)</div>
                <div className={styles.rateRow}>
                  <div className={styles.formField}>
                    <label>Farmer Hourly (₹)</label>
                    <input name="farmerHourlyRate" type="number" defaultValue={selectedEquipment?.farmerHourlyRate} required />
                  </div>
                  <div className={styles.formField}>
                    <label>Farmer Daily (₹)</label>
                    <input name="farmerDailyRate" type="number" defaultValue={selectedEquipment?.farmerDailyRate} required />
                  </div>
                  <div className={styles.formField}>
                    <label>Farmer Monthly (₹)</label>
                    <input name="farmerMonthlyRate" type="number" defaultValue={selectedEquipment?.farmerMonthlyRate} required />
                  </div>
                </div>

                <div className={styles.formFieldFull}>
                  <label>Machine Condition</label>
                  <select name="condition" defaultValue={selectedEquipment?.condition || 'Excellent'}>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Maintenance Required">Maintenance Required</option>
                  </select>
                </div>
              </div>
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.actionSecondary}
                  onClick={() => setIsEquipmentModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.actionPrimary}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

