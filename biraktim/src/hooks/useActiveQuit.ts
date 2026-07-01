import { useCallback, useEffect, useState } from 'react';
import { getActiveQuit } from '../db/quits';
import type { Quit } from '../db/types';

export function useActiveQuit() {
  const [quit, setQuit] = useState<Quit | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const q = await getActiveQuit();
    setQuit(q);
    setLoading(false);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { quit, loading, reload };
}
