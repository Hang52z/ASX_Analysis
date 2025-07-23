// src/pages/Home.tsx
import { useEffect, useState } from "react";
import { fetchAnnouncements } from "../api/api";
import type { Announcement } from "../api/types";
import AnnouncementTable from "../components/AnnouncementTable";
import DateSelector from "../components/DateSelector";
import SearchBar from "../components/SearchBar";
import { Container, Typography } from "@mui/material";
import { format } from "date-fns";


function parseCustomDate(dateStr: string): number {
  try {
    const cleanStr = dateStr.replace(/\n/g, " ").trim();
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
export default function Home() {
  const [allData, setAllData] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    fetchAnnouncements()
      .then(fetched => {
        const sorted = [...fetched].sort(
          (a, b) => parseCustomDate(b.date) - parseCustomDate(a.date)
        );

        setAllData(sorted);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Typography>加载中…</Typography>;

  const filtered = allData
  .filter(item => {
    const ts = parseCustomDate(item.date);
    if (!ts) return false;
    // 直接按格式比较也可以
    return format(new Date(ts), "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
  })

    .filter(item => {
      if (!searchKeyword.trim()) return true;
      const kw = searchKeyword.toLowerCase();
      return (
        item.company?.toLowerCase().includes(kw) ||
        item.ticker?.toLowerCase().includes(kw) ||
        item.summary?.toLowerCase().includes(kw)
      );
    });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h5" gutterBottom>
        📅 指定日期公告查看
      </Typography>
      <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />
      <SearchBar
        keyword={searchKeyword}
        onChange={setSearchKeyword}
        label="🔍 搜索公司、代码或摘要关键词"
      />
      <AnnouncementTable
        data={filtered}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </Container>
  );
}