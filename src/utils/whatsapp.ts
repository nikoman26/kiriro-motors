import { WHATSAPP_NUMBER } from '../data';

export function whatsappUrl(message: string, phone = WHATSAPP_NUMBER) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
