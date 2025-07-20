from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from services.scraper import scrape_announcements
from services.analyzer import analyze_all_pdfs
from services.merge import merge_csv_files
from routers import announcements
import threading

app = FastAPI()

# ✅ 添加 CORS 支持
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5175"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(announcements.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to ASX Announcement Analysis API"}

# 在应用启动时自动执行爬取、分析和合并操作
@app.on_event("startup")
def run_data_pipeline_background():
    def background_task():
        print("🔄 后端启动，开始执行数据管道...")
        scrape_announcements()
        analyze_all_pdfs()
        merge_csv_files()
        print("✅ 数据管道执行完成")

    print("🟢 后端启动完成，数据处理将在后台运行中...")
    threading.Thread(target=background_task).start()
