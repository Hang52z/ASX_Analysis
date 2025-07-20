from fastapi import APIRouter
from typing import List
import csv
import os

router = APIRouter()

MERGED_CSV_PATH = os.path.join("data", "merged_announcements.csv")



@router.get("/announcements")
def get_announcements() -> List[dict]:
    announcements = []

    if not os.path.exists(MERGED_CSV_PATH):
        return []

    with open(MERGED_CSV_PATH, "r", encoding="utf-8") as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            announcements.append(row)

    return announcements
