// src/api/api.ts
import type { Announcement } from "./types";


export async function fetchAnnouncements(): Promise<Announcement[]> {
  const response = await fetch("http://localhost:8000/announcements");
  if (!response.ok) {
    throw new Error("Failed to fetch announcements");
  }
  return response.json();
}
