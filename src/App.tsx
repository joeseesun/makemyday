import { useState, useEffect, useCallback } from "react";
import { type Habit, getHabits } from "./db";
import YearCalendar from "./YearCalendar";
import HabitManager from "./HabitManager";
import StatsBar from "./StatsBar";
import TodayCard from "./TodayCard";
import {
  Cog6ToothIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

export default function App() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [habits, setHabits] = useState<Habit[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showManager, setShowManager] = useState(false);

  const loadHabits = useCallback(async () => {
    const h = await getHabits();
    setHabits(h);
  }, []);

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  const handleDataChanged = () => {
    setRefreshKey((k) => k + 1);
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

  return (
    <div className="min-h-[100dvh] bg-[var(--color-surface)] px-6 py-5">
      <div className="max-w-3xl mx-auto">
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
