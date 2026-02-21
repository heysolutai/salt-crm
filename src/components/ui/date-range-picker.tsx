import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateRange } from "react-day-picker";

interface DatePickerProps {
  date: Date;
  onDateChange: (date: Date) => void;
  className?: string;
}

export function DatePicker({ date, onDateChange, className }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 px-2 text-[11px] font-medium gap-1.5 hover:bg-secondary/50",
            "text-muted-foreground hover:text-foreground",
            className
          )}
        >
          <CalendarIcon className="w-3.5 h-3.5" />
          {format(date, "dd MMM yyyy", { locale: ptBR })}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(newDate) => newDate && onDateChange(newDate)}
          initialFocus
          locale={ptBR}
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  );
}

// New DateRangePicker component for period selection
interface DateRangePickerProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  className?: string;
}

export function DateRangePicker({ dateRange, onDateRangeChange, className }: DateRangePickerProps) {
  const formatDateRange = () => {
    if (!dateRange?.from) return "Selecionar período";
    if (!dateRange.to) return format(dateRange.from, "dd MMM", { locale: ptBR });
    return `${format(dateRange.from, "dd MMM", { locale: ptBR })} - ${format(dateRange.to, "dd MMM", { locale: ptBR })}`;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 px-2 text-[11px] font-medium gap-1.5 hover:bg-secondary/50",
            "text-muted-foreground hover:text-foreground",
            !dateRange?.from && "text-muted-foreground/60",
            className
          )}
        >
          <CalendarIcon className="w-3.5 h-3.5" />
          {formatDateRange()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          mode="range"
          selected={dateRange}
          onSelect={onDateRangeChange}
          numberOfMonths={1}
          initialFocus
          locale={ptBR}
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  );
}
