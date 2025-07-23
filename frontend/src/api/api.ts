// src/api/api.ts
import type { Announcement } from "./types";

const API_BASE = 'https://d3ivte86kn0hrg.cloudfront.net';

export async function fetchAnnouncements(): Promise<Announcement[]> {
  const res = await fetch(`${API_BASE}/merged_announcements`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}