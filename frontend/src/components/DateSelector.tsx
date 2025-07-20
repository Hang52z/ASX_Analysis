// src/components/DateSelector.tsx
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Box } from '@mui/material';

// ✅ 明确 props 类型
type Props = {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
};

export default function DateSelector({ selectedDate, onDateChange }: Props) {
  return (
    <Box sx={{ marginBottom: 2 }}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="Select Date"
          value={selectedDate}
          onChange={(date) => {
            if (date) onDateChange(date);
          }}
          slotProps={{ textField: { size: 'small' } }}
        />
      </LocalizationProvider>
    </Box>
  );
}
