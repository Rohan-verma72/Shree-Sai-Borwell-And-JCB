import { BUSINESS_DETAILS } from '@/data/business';

function digitsOnly(value: string) {
  return value.replace(/\D/g, '');
}

export const BUSINESS_LINKS = {
  tel: `tel:${digitsOnly(BUSINESS_DETAILS.phone)}`,
  mailto: `mailto:${BUSINESS_DETAILS.email}`,
  whatsapp: `https://wa.me/${digitsOnly(BUSINESS_DETAILS.whatsapp)}`,
  maps: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(BUSINESS_DETAILS.address)}`,
} as const;

export function buildWhatsAppLink(message: string) {
  return `${BUSINESS_LINKS.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function isValidIndianPhone(phone: string) {
  return /^(?:\+91|91)?[6-9]\d{9}$/.test(digitsOnly(phone));
}
