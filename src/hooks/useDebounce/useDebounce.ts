import { useEffect } from 'react';

export function useDebounce(
  callback: () => void,
  dependencies: any[],
  delay: number = 500
): void {
  useEffect(() => {
    const timer = setTimeout(callback, delay);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, delay]);
}
