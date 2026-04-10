export const openWhatsApp = (phone: string, message?: string): void => {
  const cleanPhone = phone.replace(/\D/g, '');
  const url = message
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
    : `https://wa.me/${cleanPhone}`;
  window.open(url, '_blank');
};
