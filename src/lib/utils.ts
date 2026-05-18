import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Prefix a site-internal path with the configured base URL so links and
// assets work both at the root in dev and under a sub-path on GitHub Pages.
export function withBase(path: string): string {
  const rawBase = import.meta.env.BASE_URL
  const base = rawBase.endsWith("/") ? rawBase : rawBase + "/"
  if (!path) return base
  const cleaned = path.startsWith("/") ? path.slice(1) : path
  return base + cleaned
}

export function toValidDate(value: unknown, label = "date"): Date {
  if (value instanceof Date) {
    if (!Number.isNaN(value.getTime())) {
      return value;
    }

    throw new Error(`Invalid ${label}: received Invalid Date`);
  }

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);

    if (!Number.isNaN(date.getTime())) {
      return date;
    }

    throw new Error(`Invalid ${label}: ${String(value)}`);
  }

  throw new Error(
    `Invalid ${label}: expected Date/string/number, received ${typeof value}`
  );
}

export function formatDate(value: unknown, label = "date") {
  const date = toValidDate(value, label);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

export function readingTime(html: string) {
  const textOnly = html.replace(/<[^>]+>/g, "")
  const wordCount = textOnly.split(/\s+/).length
  const readingTimeMinutes = ((wordCount / 200) + 1).toFixed()
  return `${readingTimeMinutes} min read`
}


export function truncateText(str: string, maxLength: number): string {
  const ellipsis = '…';

  if (str.length <= maxLength) return str;

  const trimmed = str.trimEnd();
  if (trimmed.length <= maxLength) return trimmed;

  const cutoff = maxLength - ellipsis.length;
  let sliced = str.slice(0, cutoff).trimEnd();

  return sliced + ellipsis;
}