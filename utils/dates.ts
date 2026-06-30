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

/** Minimum time from now before a delivery can be scheduled. */
export const MIN_DELIVERY_LEAD_MS = 30_000;

export function isDeliveryInFuture(
  isoOrDate: string | Date,
  nowMs: number = Date.now()
): boolean {
  const delivery =
    isoOrDate instanceof Date ? isoOrDate : parseDeliveryInput(isoOrDate);
  return delivery.getTime() >= nowMs + MIN_DELIVERY_LEAD_MS;
}

export function isSameLocalDay(a: Date, b: Date): boolean {
  return toLocalDateString(a) === toLocalDateString(b);
}

/** If date is today but time already passed, bump to now + lead + 1 minute. */
export function bumpToNextValidDelivery(date: Date, nowMs = Date.now()): Date {
  const bumped = new Date(date);
  const floor = new Date(nowMs + MIN_DELIVERY_LEAD_MS + 60_000);
  if (isSameLocalDay(bumped, new Date(nowMs)) && bumped < floor) {
    return floor;
  }
  return bumped;
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
  today.setHours(0, 0, 0, 0);

  let next = new Date(today.getFullYear(), birth.getMonth(), birth.getDate(), 9, 0, 0, 0);
  if (next.getTime() <= Date.now()) {
    next = new Date(today.getFullYear() + 1, birth.getMonth(), birth.getDate(), 9, 0, 0, 0);
  }
  return next.toISOString();
}

const BIRTHDATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidBirthdate(dateStr: string): boolean {
  if (!BIRTHDATE_RE.test(dateStr)) return false;
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  ) {
    return false;
  }
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  return date.getTime() <= endOfToday.getTime();
}

export function parseBirthdateToDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

function endOfLocalDay(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, 23, 59, 59, 999).getTime();
}

/** When a capsule becomes due (exact time, or end of date-only day). */
export function getCapsuleDueTimestamp(capsule: {
  delivery_at?: string | null;
  delivery_date: string;
}): number {
  if (capsule.delivery_at) {
    return new Date(capsule.delivery_at).getTime();
  }
  return endOfLocalDay(capsule.delivery_date);
}

export function getCapsuleDeliveryTimestamp(capsule: {
  delivery_at?: string | null;
  delivery_date: string;
}): number {
  return getCapsuleDueTimestamp(capsule);
}

export function isCapsuleOverdue(
  capsule: {
    status: string;
    delivery_at?: string | null;
    delivery_date: string;
  },
  nowMs: number = Date.now()
): boolean {
  if (capsule.status !== "locked") return false;
  return getCapsuleDueTimestamp(capsule) <= nowMs;
}

export function isCapsuleFailed(capsule: { status: string }): boolean {
  return capsule.status === "failed";
}

export function sortCapsulesByDelivery<
  T extends { delivery_date: string; delivery_at?: string | null; status: string },
>(capsules: T[]): T[] {
  return [...capsules].sort((a, b) => {
    const aDelivered = a.status === "delivered";
    const bDelivered = b.status === "delivered";
    if (aDelivered && !bDelivered) return 1;
    if (!aDelivered && bDelivered) return -1;

    const aOverdue = isCapsuleOverdue(a, Date.now());
    const bOverdue = isCapsuleOverdue(b, Date.now());
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;

    return getCapsuleDeliveryTimestamp(a) - getCapsuleDeliveryTimestamp(b);
  });
}
