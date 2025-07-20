import csv
import os

ANNOUNCEMENT_CSV = os.path.join("data", "announcements.csv")
ANALYSIS_CSV = os.path.join("data", "analyzer.csv")
MERGED_CSV = os.path.join("data", "merged_announcements.csv")

def merge_csv_files():
    # 加载分析结果
    analysis_data = {}
    with open(ANALYSIS_CSV, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            analysis_data[row["filename"]] = row

    # 合并逻辑
    with open(ANNOUNCEMENT_CSV, "r", encoding="utf-8") as f_ann, \
         open(MERGED_CSV, "w", newline="", encoding="utf-8") as f_out:

        ann_reader = csv.DictReader(f_ann)
        writer = csv.writer(f_out)
        writer.writerow([
            "company", "ticker", "date", "title", "url",
            "category", "summary", "impact_duration", "impact_type", "investment_advice"
        ])

        for row in ann_reader:
            title = row["标题"]
            filename = f"{title}.pdf"
            analysis = analysis_data.get(filename)

            if not analysis:
                continue

            writer.writerow([
                analysis.get("company", ""),
                row.get("股票代码", ""),            # ticker
                row.get("发布时间", ""),            # date
                row.get("标题", ""),              # title
                row.get("PDF链接", ""),           # url
                row.get("初步分类", ""),           # category 来自 scraper 的分类
                analysis.get("summary", ""),
                analysis.get("impact_duration", ""),
                analysis.get("impact_type", ""),
                analysis.get("investment_advice", "")
            ])

    print(f"✅ 合并完成，已生成：{MERGED_CSV}")

def main():
    merge_csv_files()  # 假设你写了 merge_data 函数用于合并 analyzer.csv 和 announcements.csv

if __name__ == "__main__":
    main()
