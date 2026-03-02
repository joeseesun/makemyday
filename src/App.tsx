import { useState, useEffect, useCallback, useMemo } from "react";
import { type Habit, getHabits, getCheckInsForYear, toggleCheckIn, formatDate } from "./db";
import YearCalendar from "./YearCalendar";
import { MonthGrid, generateYearCalendar, MONTH_NAMES } from "./YearCalendar";
import HabitManager from "./HabitManager";
import StatsBar from "./StatsBar";
import TodayCard from "./TodayCard";
import {
  Cog6ToothIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

interface AppProps {
  compact?: boolean;
}

export default function App({ compact = false }: AppProps) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [habits, setHabits] = useState<Habit[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showManager, setShowManager] = useState(false);
  const [checkIns, setCheckIns] = useState<Map<string, number[]>>(new Map());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const today = formatDate(new Date());
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const loadHabits = useCallback(async () => {
    const h = await getHabits();
    setHabits(h);
  }, []);

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  // Load check-in data for compact month calendar
  const loadCheckIns = useCallback(async () => {
    if (!compact) return;
    const data = await getCheckInsForYear(currentYear);
    setCheckIns(data);
  }, [compact, currentYear]);

  useEffect(() => {
    loadCheckIns();
  }, [loadCheckIns, refreshKey]);

  // Current month data for compact view
  const currentMonthData = useMemo(() => {
    if (!compact) return null;
    const months = generateYearCalendar(currentYear);
    return months[currentMonth];
  }, [compact, currentYear, currentMonth]);

  const handleToggleCalendar = async (date: string, habitId: number) => {
    await toggleCheckIn(date, habitId);
    await loadCheckIns();
    handleDataChanged();
  };

  const handleDateClick = (dateStr: string, isFuture: boolean) => {
    if (isFuture) return;
    setSelectedDate(selectedDate === dateStr ? null : dateStr);
  };

  // In panel mode, also reload habits when window gains focus (data may change from main window)
  useEffect(() => {
    if (!compact) return;
    const onFocus = () => {
      loadHabits();
      loadCheckIns();
      setRefreshKey((k) => k + 1);
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [compact, loadHabits, loadCheckIns]);

  const handleDataChanged = () => {
    setRefreshKey((k) => k + 1);
    if (compact) loadCheckIns();
  };

  const handleHabitsChanged = () => {
    loadHabits();
    setRefreshKey((k) => k + 1);
  };

  const todayStr = new Date().toLocaleDateString("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  if (compact) {
    return (
      <div className="min-h-[100dvh] bg-[var(--color-surface)] px-4 pt-4 pb-4">
        {/* Header */}
        <header className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-[18px] font-semibold tracking-tight text-[var(--color-text-primary)]">
              MakeMyDay
            </h1>
            <p className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5">
              {todayStr}
            </p>
          </div>
          <button
            onClick={() => setShowManager(!showManager)}
            className="flex items-center gap-1 text-[12px] px-2.5 py-1 rounded-lg border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:bg-[var(--color-card)] transition-colors"
          >
            {showManager ? (
              <>
                <XMarkIcon className="w-3 h-3" />
                收起
              </>
            ) : (
              <>
                <Cog6ToothIcon className="w-3 h-3" />
                管理
              </>
            )}
          </button>
        </header>

        {/* Habit Manager */}
        {showManager && (
          <div className="mb-3">
            <HabitManager habits={habits} onChanged={handleHabitsChanged} />
          </div>
        )}

        {/* Today's check-in */}
        <div className="mb-3">
          <TodayCard
            habits={habits}
            onDataChanged={handleDataChanged}
            refreshKey={refreshKey}
          />
        </div>

        {/* Stats */}
        <div className="mb-3">
          <StatsBar habits={habits} refreshKey={refreshKey} />
        </div>

        {/* Current month calendar */}
        {currentMonthData && (
          <div>
            <MonthGrid
              monthData={currentMonthData}
              monthName={MONTH_NAMES[currentMonth]}
              habits={habits}
              checkIns={checkIns}
              today={today}
              selectedDate={selectedDate}
              onDateClick={handleDateClick}
              onToggle={handleToggleCalendar}
            />
          </div>
        )}
      </div>
    );
  }

  // Full main window layout
  return (
    <div className="min-h-[100dvh] bg-[var(--color-surface)] px-6 pt-10 pb-5">
      <div className="max-w-3xl mx-auto">
        {/* Draggable title bar region */}
        <div
          data-tauri-drag-region
          className="fixed top-0 left-0 right-0 h-10 z-50"
        />
        {/* Header — minimal */}
        <header className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight text-[var(--color-text-primary)]">
              MakeMyDay
            </h1>
            <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
              {todayStr}
            </p>
          </div>
          <button
            onClick={() => setShowManager(!showManager)}
            className="flex items-center gap-1.5 text-[13px] px-3 py-1.5 rounded-lg border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:bg-[var(--color-card)] transition-colors"
          >
            {showManager ? (
              <>
                <XMarkIcon className="w-3.5 h-3.5" />
                收起
              </>
            ) : (
              <>
                <Cog6ToothIcon className="w-3.5 h-3.5" />
                管理
              </>
            )}
          </button>
        </header>

        {/* Habit Manager — toggled */}
        {showManager && (
          <div className="mb-4">
            <HabitManager habits={habits} onChanged={handleHabitsChanged} />
          </div>
        )}

        {/* Core: Today's check-in */}
        <div className="mb-4">
          <TodayCard
            habits={habits}
            onDataChanged={handleDataChanged}
            refreshKey={refreshKey}
          />
        </div>

        {/* Stats overview */}
        <div className="mb-5">
          <StatsBar habits={habits} refreshKey={refreshKey} />
        </div>

        {/* Calendar — with year navigation */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[var(--color-text-secondary)]">
              历史记录
            </h2>
            <div className="flex items-center bg-[var(--color-card)] rounded-lg border border-[var(--color-border-subtle)]">
              <button
                onClick={() => setYear((y) => y - 1)}
                className="p-1.5 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
              >
                <ChevronLeftIcon className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-medium text-[var(--color-text-secondary)] min-w-[40px] text-center tabular-nums">
                {year}
              </span>
              <button
                onClick={() => setYear((y) => y + 1)}
                className="p-1.5 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
              >
                <ChevronRightIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <YearCalendar
            year={year}
            habits={habits}
            onDataChanged={handleDataChanged}
            refreshKey={refreshKey}
          />
        </div>
      </div>
    </div>
  );
}
