from services.scraper import scrape_announcements
from services.analyzer import analyze_all_pdfs
from services.merge import merge_csv_files

if __name__ == "__main__":
    announcements = scrape_announcements() 
    analyze_all_pdfs()
    merge_csv_files()
