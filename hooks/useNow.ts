import { useEffect, useState } from "react";

/** Re-renders on an interval so time-based UI (e.g. overdue capsules) stays current. */
export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
