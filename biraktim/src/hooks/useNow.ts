import { useEffect, useState } from 'react';

/** Canlı sayaç için: verilen aralıkla (ms) yenilenen `Date.now()`. */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
