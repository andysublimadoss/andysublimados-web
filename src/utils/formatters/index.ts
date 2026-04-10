export const formatCurrency = (amount: number): string => {
  return `$${amount.toLocaleString()}`;
};

export const formatDate = (dateStr: string): string => {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short'
  });
};
