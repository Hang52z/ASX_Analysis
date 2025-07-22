// src/api/api.ts
import { parse } from "papaparse";
import type { Announcement } from "./types";

export async function fetchAnnouncements(): Promise<Announcement[]> {
  const res = await fetch("http://44.204.5.152:3000");
  if (!res.ok) throw new Error("Failed to fetch CSV");
  const csvText = await res.text();
  const { data, errors } = parse(csvText, {
    header: true,
    skipEmptyLines: true
  });
  if (errors.length) {
    console.warn("CSV parse errors:", errors);
  }
  return data as Announcement[];
}
