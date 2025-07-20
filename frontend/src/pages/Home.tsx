import { useEffect, useState } from "react";
import { fetchAnnouncements } from "../api/api";
import type { Announcement } from "../api/types";
import AnnouncementTable from "../components/AnnouncementTable";
import DateSelector from "../components/DateSelector";
import { Container, Typography } from "@mui/material";
import { format } from "date-fns";
import SearchBar from "../components/SearchBar";


function parseCustomDate(dateStr: string): number {
  try {
    const cleanStr = dateStr.replace(/\n/g, " ").trim();
    const [datePart, timePart, meridian] = cleanStr.split(" ");
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
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    fetchAnnouncements().then((fetched) => {
      const sorted = [...fetched].sort((a, b) => parseCustomDate(b.date) - parseCustomDate(a.date));
      setAllData(sorted);
    });
  }, []);

const filtered = allData
  .filter((item) => {
      try {
        const cleanStr = item.date.replace(/\n/g, " ").trim();
        const [datePart] = cleanStr.split(" ");
        const [day, month, year] = datePart.split("/").map(Number);
        const itemDate = new Date(year, month - 1, day);
        return format(itemDate, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
      } catch {
        return false;
      }
    })
    .filter((item) => {
      // ✅ 添加关键词搜索逻辑
      if (!searchKeyword.trim()) return true; // 没输入关键词则不过滤

      const keyword = searchKeyword.toLowerCase();
      return (
        item.company?.toLowerCase().includes(keyword) ||
        item.ticker?.toLowerCase().includes(keyword) ||
        item.summary?.toLowerCase().includes(keyword)
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
