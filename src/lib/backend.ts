import type { Booking, Equipment, Stats } from '@/data/types';

const javaApiBaseUrl = process.env.JAVA_API_BASE_URL?.replace(/\/$/, '');

type JsonRequestInit = RequestInit & {
  next?: unknown;
};

async function fetchFromJavaBackend<T>(
  path: string,
  init?: JsonRequestInit,
): Promise<T | null> {
  if (!javaApiBaseUrl) {
    return null;
  }

  try {
    const response = await fetch(`${javaApiBaseUrl}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
      cache: init?.cache ?? 'no-store',
    });

    if (!response.ok) {
      const message = await response.text();
      console.warn(`Java backend path ${path} returned error:`, message);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.warn(`Java backend (${javaApiBaseUrl}) is currently unreachable for ${path}. Falling back to local DB.`);
    return null;
  }
}

export async function getExternalEquipment() {
  return fetchFromJavaBackend<Equipment[]>('/api/equipment');
}

export async function getExternalBookings() {
  return fetchFromJavaBackend<Booking[]>('/api/bookings');
}

export async function getExternalStats() {
  return fetchFromJavaBackend<Stats>('/api/stats');
}

export async function createExternalBooking(payload: unknown) {
  return fetchFromJavaBackend<{ success: true; booking: Booking; error?: string }>('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateExternalBookingStatus(id: string, payload: unknown) {
  return fetchFromJavaBackend<{ success: true; booking: Booking; error?: string }>(
    `/api/bookings/${id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  );
}

export async function updateExternalEquipment(id: string, payload: unknown) {
  return fetchFromJavaBackend<Equipment>(`/api/equipment/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function createExternalEquipment(payload: unknown) {
  return fetchFromJavaBackend<Equipment>('/api/equipment', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function isJavaBackendEnabled() {
  return Boolean(javaApiBaseUrl);
}
