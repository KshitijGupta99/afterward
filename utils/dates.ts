/** Local calendar date as YYYY-MM-DD (not UTC). */
export function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** UTC ISO for timestamptz storage — preserves the instant the user picked. */
export function toISOString(date: Date): string {
  return date.toISOString();
}

export function parseDeliveryInput(value: string): Date {
  if (value.includes("T")) {
    return new Date(value);
  }
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, 12, 0, 0);
}

export function isDeliveryInFuture(isoOrDate: string | Date): boolean {
  const delivery =
    isoOrDate instanceof Date ? isoOrDate : parseDeliveryInput(isoOrDate);
  return delivery.getTime() > Date.now();
}

export function formatDisplayDate(dateStr: string): string {
  const date = parseDeliveryInput(dateStr);
  return date.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDisplayDateTime(isoOrDate: string): string {
  const date = parseDeliveryInput(isoOrDate);
  return date.toLocaleString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Prefer delivery_at (has time); fall back to date-only label without inventing a time. */
export function formatCapsuleDelivery(
  deliveryAt: string | null | undefined,
  deliveryDate: string
): string {
  if (deliveryAt) {
    return formatDisplayDateTime(deliveryAt);
  }
  return formatDisplayDate(deliveryDate);
}

export function formatMonthYear(dateStr: string): string {
  const date = parseDeliveryInput(dateStr);
  return date.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

export function addYears(date: Date, years: number): Date {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

export function toDateString(date: Date): string {
  return toLocalDateString(date);
}

export function defaultDeliveryTime(date: Date): Date {
  const d = new Date(date);
  d.setHours(9, 0, 0, 0);
  return d;
}

export function withDefaultMorningTime(date: Date): string {
  const d = defaultDeliveryTime(date);
  const now = new Date();
  if (d <= now) {
    const next = new Date(now);
    next.setHours(next.getHours() + 1, 0, 0, 0);
    return next.toISOString();
  }
  return d.toISOString();
}

export function getNextBirthday(birthdateStr: string): string {
  const birth = parseDeliveryInput(birthdateStr);
  const today = new Date();
  const next = defaultDeliveryTime(
    new Date(today.getFullYear(), birth.getMonth(), birth.getDate())
  );
  if (next <= today) {
    next.setFullYear(today.getFullYear() + 1);
  }
  return next.toISOString();
}

export function startOfToday(): Date {
  return new Date();
}

export function isToday(dateStr: string): boolean {
  return toLocalDateString(parseDeliveryInput(dateStr)) === toLocalDateString(new Date());
}

export function getCapsuleDeliveryTimestamp(capsule: {
  delivery_at?: string | null;
  delivery_date: string;
}): number {
  return capsule.delivery_at
    ? new Date(capsule.delivery_at).getTime()
    : parseDeliveryInput(capsule.delivery_date).getTime();
}

export function isCapsuleOverdue(capsule: {
  status: string;
  delivery_at?: string | null;
  delivery_date: string;
}): boolean {
  if (capsule.status !== "locked") return false;
  return getCapsuleDeliveryTimestamp(capsule) <= Date.now();
}

export function sortCapsulesByDelivery<
  T extends { delivery_date: string; delivery_at?: string | null; status: string },
>(capsules: T[]): T[] {
  return [...capsules].sort((a, b) => {
    const aDelivered = a.status === "delivered";
    const bDelivered = b.status === "delivered";
    if (aDelivered && !bDelivered) return 1;
    if (!aDelivered && bDelivered) return -1;

    const aOverdue = isCapsuleOverdue(a);
    const bOverdue = isCapsuleOverdue(b);
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;

    return getCapsuleDeliveryTimestamp(a) - getCapsuleDeliveryTimestamp(b);
  });
}
