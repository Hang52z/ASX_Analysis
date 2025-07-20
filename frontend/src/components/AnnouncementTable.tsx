import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef, GridCellParams } from "@mui/x-data-grid";
import type { Announcement } from "../api/types";

type Props = {
  data: Announcement[];
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

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

export default function AnnouncementTable({
  data,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: Props) {
  const columns: GridColDef[] = [
    { field: "date", headerName: "Date", width: 150 },
    { field: "ticker", headerName: "Ticker", width: 100 },
    { field: "category", headerName: "Category", width: 150 },
    {
      field: "summary",
      headerName: "Summary",
      flex: 2,
      renderCell: (params) => <>{highlightKeyword(params.value, "强烈")}</>,
    },
    {
      field: "impact_type",
      headerName: "Impact",
      width: 120,
      cellClassName: (params: GridCellParams) =>
        params.value === "利好"
          ? "positive"
          : params.value === "利空"
          ? "negative"
          : "",
      renderCell: (params) => (
        <span>
          {params.value}（{params.row.impact_duration}）
        </span>
      ),
    },
    {
      field: "investment_advice",
      headerName: "Advice",
      flex: 2,
      renderCell: (params) => <>{highlightKeyword(params.value, "强烈")}</>,
    },
  ];

  return (
    <div style={{ height: 600, width: "100%" }}>
      <style>
        {`
          .positive {
            background-color: #e8f5e9;
            color: #388e3c;
            font-weight: bold;
          }
          .negative {
            background-color: #ffebee;
            color: #d32f2f;
            font-weight: bold;
          }
        `}
      </style>

      <DataGrid
        rows={data.map((item, idx) => ({ id: idx, ...item }))}
        columns={columns}
        pagination
        paginationModel={{ page: page - 1, pageSize }}
        onPaginationModelChange={(model) => {
          onPageChange(model.page + 1);
          onPageSizeChange(model.pageSize);
        }}
        pageSizeOptions={[10, 20, 50]}
        paginationMode="client"
        disableRowSelectionOnClick
        sx={{
          "& .MuiDataGrid-cell": {
            whiteSpace: "normal",
            wordBreak: "break-word",
            lineHeight: 1.5,
            paddingY: "8px",
            fontSize: "14px",
            alignItems: "start",
          },
          "& .MuiDataGrid-row": {
            maxHeight: "none !important",
          },
        }}
      />
    </div>
  );
}
