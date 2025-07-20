// src/pages/Announcements.tsx
import { useEffect, useState } from "react";
import { fetchAnnouncements } from "../api/api";
import type { Announcement } from "../api/types";

// ✅ 放在组件外部，关键词高亮函数
function highlightKeyword(text: string, keyword: string) {
  const parts = text.split(new RegExp(`(${keyword})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === keyword.toLowerCase() ? (
      <span key={i} style={{ backgroundColor: "yellow", fontWeight: "bold" }}>{part}</span>
    ) : (
      part
    )
  );
}

// ✅ 正确处理含换行符的时间字符串
function parseCustomDate(dateStr: string): number {
  try {
    const cleanStr = dateStr.replace(/\n/g, " ").trim(); // 去除换行
    const [datePart, timePart, meridian] = cleanStr.split(" ");
    if (!datePart || !timePart || !meridian) return 0;
    const [day, month, year] = datePart.split("/").map(Number);
    const [hourRaw, minute] = timePart.split(":").map(Number);
    let hour = hourRaw;
    if (meridian.toLowerCase() === "pm" && hour !== 12) hour += 12;
    if (meridian.toLowerCase() === "am" && hour === 12) hour = 0;
    return new Date(year, month - 1, day, hour, minute).getTime();
  } catch {
    return 0;
  }
}

export default function Announcements() {
  const [data, setData] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements()
      .then((fetchedData) => {
        const sorted = [...fetchedData].sort(
          (a, b) => parseCustomDate(b.date) - parseCustomDate(a.date)
        );
        setData(sorted);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 font-sans">
      <h1 className="text-xl mb-4">📈 ASX 公告分析</h1>
      {loading ? (
        <p>加载中...</p>
      ) : (
        <table className="border border-collapse w-full text-sm">
          <thead>
            <tr>
              <th className="border p-2">公司</th>
              <th className="border p-2">代码</th>
              <th className="border p-2">时间</th>
              <th className="border p-2">类型</th>
              <th className="border p-2">标题</th>
              <th className="border p-2">摘要</th>
              <th className="border p-2">影响</th>
              <th className="border p-2">建议</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, i) => (
              <tr key={i}>
                <td className="border p-2">{item.company}</td>
                <td className="border p-2">{item.ticker}</td>
                <td className="border p-2">{item.date}</td>
                <td className="border p-2">{item.category}</td>
                <td className="border p-2">
                  <a href={item.url} target="_blank" rel="noreferrer">{item.title}</a>
                </td>
                <td className="border p-2">{highlightKeyword(item.summary, "强烈")}</td>
                <td className="border p-2" style={{
                  color:
                    item.impact_type === "利好" ? "red" :
                    item.impact_type === "利空" ? "green" :
                    "black"
                }}>
                  {item.impact_type}（{item.impact_duration}）
                </td>
                <td className="border p-2">{highlightKeyword(item.investment_advice, "强烈")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
