// src/api/api.ts
import { parse } from "papaparse";
import type { Announcement } from "./types";

export async function fetchAnnouncements(): Promise<Announcement[]> {
  const res = await fetch("https://d3ivte86kn0hrg.cloudfront.net/merged_announcements");
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
