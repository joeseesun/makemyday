import { useState, useEffect, useCallback, useMemo } from "react";
import {
  type Habit,
  getCheckInsForYear,
  toggleCheckIn,
  formatDate,
} from "./db";
import { HabitIcon } from "./icons";
import { CheckCircleIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";

const MONTH_NAMES = [
  "一月", "二月", "三月", "四月", "五月", "六月",
  "七月", "八月", "九月", "十月", "十一月", "十二月",
];
const DAY_NAMES = ["日", "一", "二", "三", "四", "五", "六"];

interface MonthData {
  month: number;
  days: (Date | null)[];
}

function generateYearCalendar(year: number): MonthData[] {
  const months: MonthData[] = [];
  for (let month = 0; month < 12; month++) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }
    months.push({ month, days });
  }
  return months;
}

interface YearCalendarProps {
  year: number;
  habits: Habit[];
  onDataChanged: () => void;
  refreshKey: number;
}

export default function YearCalendar({
  year,
  habits,
  onDataChanged,
  refreshKey,
}: YearCalendarProps) {
  const [checkIns, setCheckIns] = useState<Map<string, number[]>>(new Map());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const months = useMemo(() => generateYearCalendar(year), [year]);
  const today = formatDate(new Date());
  const currentMonth = new Date().getMonth();
  const isCurrentYear = year === new Date().getFullYear();

  const loadCheckIns = useCallback(async () => {
    const data = await getCheckInsForYear(year);
    setCheckIns(data);
  }, [year]);

  useEffect(() => {
    loadCheckIns();
  }, [loadCheckIns, refreshKey]);

  const handleToggle = async (date: string, habitId: number) => {
    await toggleCheckIn(date, habitId);
    await loadCheckIns();
    onDataChanged();
  };

  const handleDateClick = (dateStr: string, isFuture: boolean) => {
    if (isFuture) return;
    setSelectedDate(selectedDate === dateStr ? null : dateStr);
  };

  // Show recent 3 months by default for current year, all for other years
  const visibleMonths = useMemo(() => {
    if (!isCurrentYear || showAll) return months;
    const startMonth = Math.max(0, currentMonth - 2);
    return months.slice(startMonth, currentMonth + 1);
  }, [months, isCurrentYear, showAll, currentMonth]);

  const hiddenCount = isCurrentYear && !showAll ? months.length - visibleMonths.length : 0;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleMonths.map((m) => (
          <MonthGrid
            key={m.month}
            monthData={m}
            monthName={MONTH_NAMES[m.month]}
            habits={habits}
            checkIns={checkIns}
            today={today}
            selectedDate={selectedDate}
            onDateClick={handleDateClick}
            onToggle={handleToggle}
          />
        ))}
      </div>

      {/* Expand/collapse for current year */}
      {isCurrentYear && hiddenCount > 0 && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-3 w-full flex items-center justify-center gap-1 py-2 text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
        >
          <ChevronDownIcon className="w-3.5 h-3.5" />
          显示全部 12 个月
        </button>
      )}
      {isCurrentYear && showAll && (
        <button
          onClick={() => setShowAll(false)}
          className="mt-3 w-full flex items-center justify-center gap-1 py-2 text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
        >
          <ChevronUpIcon className="w-3.5 h-3.5" />
          只显示近 3 个月
        </button>
      )}
    </div>
  );
}

interface MonthGridProps {
  monthData: MonthData;
  monthName: string;
  habits: Habit[];
  checkIns: Map<string, number[]>;
  today: string;
  selectedDate: string | null;
  onDateClick: (date: string, isFuture: boolean) => void;
  onToggle: (date: string, habitId: number) => void;
}

function MonthGrid({
  monthData,
  monthName,
  habits,
  checkIns,
  today,
  selectedDate,
  onDateClick,
  onToggle,
}: MonthGridProps) {
  return (
    <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border-subtle)] p-4">
      <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-2 text-center">
        {monthName}
      </h3>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {DAY_NAMES.map((d) => (
          <div
            key={d}
            className="text-[10px] text-[var(--color-text-tertiary)] text-center font-medium"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {monthData.days.map((day, i) => {
          if (!day) {
            return <div key={`empty-${i}`} className="w-full aspect-square" />;
          }
          const dateStr = formatDate(day);
          const dayCheckIns = checkIns.get(dateStr) || [];
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDate;
          const isFuture = dateStr > today;

          return (
            <div key={dateStr} className="relative">
              <div
                className={`w-full aspect-square flex flex-col items-center justify-start rounded-md text-[10px] cursor-pointer transition-all
                  ${isToday ? "ring-2 ring-[var(--color-accent)] bg-[var(--color-accent-light)]" : ""}
                  ${isSelected ? "bg-[var(--color-border-subtle)] shadow-sm" : "hover:bg-[var(--color-border-subtle)]"}
                  ${isFuture ? "opacity-35" : ""}
                `}
                onClick={() => onDateClick(dateStr, isFuture)}
              >
                <span
                  className={`text-[10px] leading-tight mt-0.5 ${
                    isToday
                      ? "text-[var(--color-accent-hover)] font-bold"
                      : "text-[var(--color-text-tertiary)]"
                  }`}
                >
                  {day.getDate()}
                </span>
                {dayCheckIns.length > 0 && (
                  <div className="flex flex-col items-center gap-0 leading-none">
                    {dayCheckIns.slice(0, 3).map((hid) => {
                      const habit = habits.find((h) => h.id === hid);
                      return habit ? (
                        <HabitIcon
                          key={hid}
                          icon={habit.emoji}
                          className="w-3 h-3"
                          style={{ color: habit.color }}
                        />
                      ) : null;
                    })}
                    {dayCheckIns.length > 3 && (
                      <span className="text-[8px] text-[var(--color-text-tertiary)]">
                        +{dayCheckIns.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Click-based popover */}
              {isSelected && !isFuture && (
                <div className="absolute z-50 top-full left-1/2 -translate-x-1/2 mt-1 bg-[var(--color-card)] rounded-lg shadow-lg border border-[var(--color-border)] p-2 min-w-[140px]">
                  <div className="text-xs text-[var(--color-text-tertiary)] mb-1.5 text-center font-medium">
                    {dateStr}
                  </div>
                  <div className="flex flex-col gap-1">
                    {habits.map((h) => {
                      const checked = dayCheckIns.includes(h.id);
                      return (
                        <button
                          key={h.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggle(dateStr, h.id);
                          }}
                          className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-xs transition-colors
                            ${
                              checked
                                ? "font-medium"
                                : "hover:bg-[var(--color-border-subtle)]"
                            }
                          `}
                          style={
                            checked
                              ? { backgroundColor: h.color + "20", color: h.color }
                              : {}
                          }
                        >
                          <HabitIcon
                            icon={h.emoji}
                            className="w-4 h-4"
                            style={checked ? { color: h.color } : {}}
                          />
                          <span className="flex-1 text-left">{h.name}</span>
                          {checked && (
                            <CheckCircleIcon
                              className="w-4 h-4 ml-auto"
                              style={{ color: h.color }}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
