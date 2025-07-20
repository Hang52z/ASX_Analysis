// src/components/SearchBar.tsx
import { TextField, Box } from "@mui/material";

type Props = {
  keyword: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
};

export default function SearchBar({ keyword, onChange, placeholder, label }: Props) {
  return (
    <Box sx={{ my: 2 }}>
      <TextField
        fullWidth
        label={label || "🔍 搜索"}
        placeholder={placeholder || "请输入关键词..."}
        variant="outlined"
        value={keyword}
        onChange={(e) => onChange(e.target.value)}
      />
    </Box>
  );
}
