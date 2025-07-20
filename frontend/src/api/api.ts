// src/api/api.ts
import type { Announcement } from "./types";


export async function fetchAnnouncements(): Promise<Announcement[]> {
  const response = await fetch("https://asx-analysis.vercel.app/announcements.csv")
  if (!response.ok) {
    throw new Error("Failed to fetch announcements");
  }
  return response.json();
}
