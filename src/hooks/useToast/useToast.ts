import { useState } from 'react';

export interface ToastMessage {
  msg: string;
  type: 'success' | 'error';
}

export function useToast() {
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  return { toast, showToast };
}
