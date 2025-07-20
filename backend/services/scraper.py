import os
import csv
import requests
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup

PDF_DIR = os.path.join("data", "pdfs")
CSV_FILE = os.path.join("data", "announcements.csv")
CATEGORY_KEYWORDS = {
    # 并购类
    "acquisition": "acquisition",
    "acquire": "acquisition",
    "acquired": "acquisition",
    "merger": "acquisition",
    "takeover": "acquisition",

    # 分红类
    "dividend": "dividend",
    "distribution": "dividend",

    # 财报/业绩类
    "earnings": "financials",
    "profit": "financials",
    "results": "financials",
    "quarterly": "financials",
    "half year": "financials",
    "annual report": "financials",
    "presentation": "financials",

    # 高管/人事变动
    "appointment": "management",
    "resignation": "management",
    "change of director": "management",
    "ceo": "management",
    "cfo": "management",
    "director": "management",

    # 融资类
    "capital raising": "funding",
    "placement": "funding",
    "equity": "funding",
    "share issue": "funding",

    # 法律相关
    "litigation": "legal",
    "lawsuit": "legal",
    "court": "legal",

    # 运营更新
    "update": "update",
    "project update": "update",
    "operational": "update",

    # 交易行为
    "suspension": "trading",
    "trading halt": "trading",

    # 重组
    "voluntary administration": "restructure",
    "restructure": "restructure"
}

os.makedirs(PDF_DIR, exist_ok=True)
os.makedirs("data", exist_ok=True)

def classify_title(title: str) -> str:
    lowered = title.lower()
    for keyword, category in CATEGORY_KEYWORDS.items():
        if keyword in lowered:
            return category
    return "other"

def setup_driver():
    options = Options()
    options.add_argument("--headless")  # 调试时可注释掉
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1920,1080")
    service = Service(ChromeDriverManager().install())
    return webdriver.Chrome(service=service, options=options)

def fetch_announcements(driver):
    driver.get("https://www.asx.com.au/asx/v2/statistics/todayAnns.do")
    WebDriverWait(driver, 30).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "a[href*='displayAnnouncement.do']"))
    )

    rows = driver.find_elements(By.CSS_SELECTOR, "tr")
    sensitive_links = []

    for row in rows:
        try:
            row_html = row.get_attribute("innerHTML")
            if 'title="price sensitive"' not in row_html:
                continue
            link = row.find_element(By.CSS_SELECTOR, "a[href*='displayAnnouncement.do']")
            sensitive_links.append(link)
        except:
            continue

    print(f"✅ 共找到价格敏感公告：{len(sensitive_links)} 条")
    return sensitive_links

def load_existing_ids():
    existing_ids = set()
    if os.path.exists(CSV_FILE):
        with open(CSV_FILE, "r", encoding="utf-8") as csvfile:
            reader = csv.reader(csvfile)
            next(reader, None)
            for row in reader:
                if len(row) >= 2 and "idsId=" in row[1]:
                    existing_ids.add(row[1].split("idsId=")[-1].strip())
    return existing_ids

def save_announcement(title, fake_pdf_url):
    os.makedirs(PDF_DIR, exist_ok=True)
    try:
        # 第一步：获取详情页 HTML
        detail_response = requests.get(fake_pdf_url)
        if detail_response.status_code != 200:
            print(f"❌ 获取详情页失败：{detail_response.status_code}")
            return

        soup = BeautifulSoup(detail_response.text, "html.parser")
        # 第二步：从隐藏字段中提取真正的 PDF 链接
        real_pdf_input = soup.find("input", {"name": "pdfURL"})
        if not real_pdf_input:
            print(f"❌ 未找到 PDF 链接：{fake_pdf_url}")
            return
        real_pdf_url = real_pdf_input.get("value")

        # 第三步：请求真正的 PDF 链接
        pdf_response = requests.get(real_pdf_url)
        if pdf_response.status_code == 200 and "pdf" in pdf_response.headers.get("Content-Type", "").lower():
            filename = f"{title}.pdf".replace("/", "_").replace("\\", "_")
            with open(os.path.join(PDF_DIR, filename), "wb") as f:
                f.write(pdf_response.content)
            print(f"✅ 下载成功：{filename}")
        else:
            print(f"❌ 下载失败（状态码 {pdf_response.status_code}，类型：{pdf_response.headers.get('Content-Type')}），URL: {real_pdf_url}")

    except Exception as e:
        print(f"❌ 下载异常：{e}")

def get_real_pdf_url(announcement_url, driver):
    try:
        driver.get(announcement_url)

        # 等待页面加载并出现“Agree and proceed”按钮
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//input[@value='Agree and proceed']"))
        )

        # 提取隐藏的 PDF 链接
        hidden_input = driver.find_element(By.NAME, "pdfURL")
        real_pdf_url = hidden_input.get_attribute("value")

        return real_pdf_url
    except Exception as e:
        print(f"❌ 获取 PDF 链接失败：{e}")
        return None


def scrape_announcements():
    driver = setup_driver()
    announcements_data = []

    try:
        elements = fetch_announcements(driver)
        existing_ids = load_existing_ids()
        new_rows = []

        if not os.path.exists(CSV_FILE):
            with open(CSV_FILE, "w", newline="", encoding="utf-8") as f:
                writer = csv.writer(f)
                writer.writerow(["标题", "PDF链接", "发布时间", "股票代码", "初步分类"])


        for el in elements:
            try:
                title = el.text.strip().replace("\n", " ").replace("/", "_")
                href = el.get_attribute("href")
                url = f"https://www.asx.com.au{href}" if href.startswith("/") else href

                if "idsId=" not in url:
                    continue

                ann_id = url.split("idsId=")[-1]
                if ann_id in existing_ids:
                    continue

                # 🆕 获取 ticker 和 datetime
                row = el.find_element(By.XPATH, "./ancestor::tr")
                tds = row.find_elements(By.TAG_NAME, "td")
                ticker = tds[0].text.strip() if len(tds) > 0 else ""
                datetime_ = tds[1].text.strip() if len(tds) > 1 else ""

                # 🆕 基于标题关键词生成初步分类
                category = classify_title(title)

                print(f"🆕 抓取公告：{title}")
                save_announcement(title, url)

                new_rows.append([title, url, datetime_,  ticker,category])
                announcements_data.append({
                    "title": title,
                    "url": url,
                    "datetime": datetime_,
                    "ticker": ticker,
                    "category": category
                })
            except Exception as e:
                print(f"❌ 抓取失败：{e}")

        if new_rows:
            with open(CSV_FILE, "a", newline="", encoding="utf-8") as f:
                fieldnames = ["标题", "PDF链接", "发布时间", "股票代码", "初步分类"]
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                
                if f.tell() == 0:  # 若是新文件则写 header
                    writer.writeheader()
                
                for row_data in new_rows:
                    writer.writerow({
                        "标题": row_data[0],
                        "PDF链接": row_data[1],
                        "发布时间": row_data[2],
                        "股票代码": row_data[3],
                        "初步分类": row_data[4]
                    })

    finally:
        driver.quit()

    return announcements_data
def main():
    scrape_announcements()

if __name__ == "__main__":
    main()

