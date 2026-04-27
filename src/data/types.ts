export interface Equipment {
  id: string;
  name: string;
  type: 'JCB' | 'Poclain' | 'Harvester' | 'Tractor' | 'Truck';
  stock: number;
  image: string;
  images?: string[];
  specifications: Record<string, string>;
  dailyRate: number;
  monthlyRate: number;
  hourlyRate: number;
  farmerDailyRate: number;
  farmerMonthlyRate: number;
  farmerHourlyRate: number;
  availability: boolean;
  condition: 'Excellent' | 'Good' | 'Maintenance Required';
  location: string;
  description: string;
}

export interface Booking {
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
  bookingType: 'Hourly' | 'Daily' | 'Monthly';
  hours?: number;
  duration: string;
  createdAt: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  notes?: string;
}

export interface Stats {
  totalRevenue: number;
  activeBookings: number;
  utilization: number;
}

export interface Inquiry {
  id: string;
  name: string;
  phone: string;
  industry: string;
  message: string;
  createdAt: string;
}

export interface GalleryItem {
  id: string;
  imageUrl: string;
  title: string;
  location: string;
  createdAt: string;
}

export interface DbData {
  equipment: Equipment[];
  bookings: Booking[];
  enquiries: Inquiry[];
  gallery: GalleryItem[];
  stats: Stats;
}
