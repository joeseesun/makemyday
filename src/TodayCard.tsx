import { useState, useEffect, useCallback } from "react";
import {
  type Habit,
  getCheckInsForDate,
  toggleCheckIn,
  formatDate,
} from "./db";
import { HabitIcon } from "./icons";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

interface TodayCardProps {
  habits: Habit[];
  onDataChanged: () => void;
  refreshKey: number;
}

export default function TodayCard({
  habits,
  onDataChanged,
  refreshKey,
}: TodayCardProps) {
  const [checkedIds, setCheckedIds] = useState<number[]>([]);
  const [animatingId, setAnimatingId] = useState<number | null>(null);
  const today = formatDate(new Date());

  const load = useCallback(async () => {
    const ids = await getCheckInsForDate(today);
    setCheckedIds(ids);
  }, [today]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const handleToggle = async (habitId: number) => {
    setAnimatingId(habitId);
    await toggleCheckIn(today, habitId);
    await load();
    onDataChanged();
    setTimeout(() => setAnimatingId(null), 300);
  };

  if (habits.length === 0) {
    return (
      <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border-subtle)] p-6 text-center">
        <p className="text-sm text-[var(--color-text-tertiary)]">
          还没有习惯，点击下方「管理」添加第一个
        </p>
      </div>
    );
  }

  const doneCount = checkedIds.length;
  const totalCount = habits.length;
  const allDone = doneCount === totalCount;

  return (
    <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border-subtle)] p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-baseline gap-2">
          <h2 className="text-sm font-semibold text-[var(--color-text-secondary)]">
            今日打卡
          </h2>
          <span className="text-xs text-[var(--color-text-tertiary)]">
            {today}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="text-lg font-bold tabular-nums leading-none"
            style={{
              color: allDone
                ? "var(--color-accent)"
                : "var(--color-text-secondary)",
            }}
          >
            {doneCount}
          </span>
          <span className="text-xs text-[var(--color-text-tertiary)]">
            / {totalCount}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-[var(--color-border-subtle)] rounded-full mb-4 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${totalCount > 0 ? (doneCount / totalCount) * 100 : 0}%`,
            backgroundColor: allDone
              ? "var(--color-accent)"
              : "var(--color-accent)",
            opacity: allDone ? 1 : 0.7,
          }}
        />
      </div>

      {/* Habit rows */}
      <div className="flex flex-col gap-1">
        {habits.map((h) => {
          const checked = checkedIds.includes(h.id);
          const isAnimating = animatingId === h.id;
          return (
            <button
              key={h.id}
              onClick={() => handleToggle(h.id)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all"
              style={{
                backgroundColor: checked ? h.color + "10" : "transparent",
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all"
                style={{
                  backgroundColor: checked ? h.color + "20" : h.color + "10",
                  transform: isAnimating && checked ? "scale(1.15)" : "scale(1)",
                }}
              >
                <HabitIcon
                  icon={h.emoji}
                  className="w-4.5 h-4.5"
                  style={{ color: h.color }}
                />
              </div>
              <span
                className="text-sm font-medium flex-1 text-left transition-colors"
                style={{
                  color: checked
                    ? h.color
                    : "var(--color-text-primary)",
                }}
              >
                {h.name}
              </span>
              <div
                className="w-6 h-6 flex items-center justify-center transition-all"
                style={{
                  transform: isAnimating && checked ? "scale(1.3)" : "scale(1)",
                }}
              >
                {checked ? (
                  <CheckCircleIcon
                    className="w-5 h-5"
                    style={{ color: h.color }}
                  />
                ) : (
                  <div
                    className="w-5 h-5 rounded-full border-2 transition-colors"
                    style={{ borderColor: "var(--color-border)" }}
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* All done message */}
      {allDone && (
        <div className="mt-3 pt-3 border-t border-[var(--color-border-subtle)] text-center">
          <span className="text-xs font-medium text-[var(--color-accent)]">
            All Done
          </span>
        </div>
      )}
    </div>
  );
}
