"use client"

import * as React from "react"
import { addDays, format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/utils/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// INTERFACE FOR DATE RANGE PICKER PROPS 📅
export interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  align?: "center" | "start" | "end";
  className?: string;
  placeholder?: string;
  numberOfMonths?: number;
}

export function DateRangePicker({
  dateRange,
  onDateRangeChange,
  className,
  align = "start",
  placeholder = "Select date range",
  numberOfMonths = 2
}: DateRangePickerProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !dateRange && "text-muted-foreground",
              "bg-accent/30 border border-white/10 rounded-sm h-9 focus:ring-0 px-3"
            )}
            style={{ boxShadow: 'none' }}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-gray-400 flex-shrink-0" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-background/95 backdrop-blur-sm border-white/10" align={align}>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={onDateRangeChange}
            numberOfMonths={numberOfMonths}
            className="bg-background"
          />
          {/* CLEAR SELECTION BUTTON (ONLY SHOWN WHEN DATE RANGE IS SELECTED) 🗑️ */}
          {dateRange && (
            <div className="p-3 border-t border-white/10">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onDateRangeChange(undefined)}
                className="w-full h-8 rounded-sm text-sm font-medium text-white/70 hover:text-white hover:bg-accent/40"
              >
                Clear Selection
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
} 