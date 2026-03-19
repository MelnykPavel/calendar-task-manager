import { API_ROUTES } from "@/src/lib/api/routes";
import { apiFetch } from "@/src/lib/api/http";
import type { Holiday } from "@/src/types/holiday";

export async function getHolidays(input: { year: number; country: string }, signal?: AbortSignal) {
  const url = new URL(API_ROUTES.holidays, window.location.origin);
  url.searchParams.set("year", String(input.year));
  url.searchParams.set("country", input.country);
  return apiFetch<Holiday[]>(url, { method: "GET", signal, timeoutMs: 20_000 });
}
