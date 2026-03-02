import { useEffect, useState } from "react";
import { type Habit, getStreak, getWeeklyStats, getTotalCheckIns } from "./db";
import { FireIcon } from "@heroicons/react/24/solid";

interface StatsBarProps {
  habits: Habit[];
  refreshKey: number;
}

export default function StatsBar({ habits, refreshKey }: StatsBarProps) {
  const [maxStreak, setMaxStreak] = useState(0);
  const [maxStreakHabit, setMaxStreakHabit] = useState<string>("");
  const [weeklyRate, setWeeklyRate] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    async function load() {
      if (habits.length === 0) return;

      // Find max streak
      let best = 0;
      let bestName = "";
      for (const h of habits) {
        const s = await getStreak(h.id);
        if (s > best) {
          best = s;
          bestName = h.name;
        }
      }
      setMaxStreak(best);
      setMaxStreakHabit(bestName);

      // Weekly stats
      const weekly = await getWeeklyStats(habits);
      setWeeklyRate(
        weekly.total > 0 ? Math.round((weekly.completed / weekly.total) * 100) : 0
      );

      // Total
      const total = await getTotalCheckIns(habits);
      setTotalCount(total);
    }
    load();
  }, [habits, refreshKey]);

  if (habits.length === 0) return null;

  return (
    <div className="grid grid-cols-3 gap-2">
      {/* Weekly rate */}
      <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border-subtle)] p-3 text-center">
        <div className="text-[22px] font-bold tabular-nums text-[var(--color-text-primary)] leading-none mb-1">
          {weeklyRate}%
        </div>
        <div className="text-[11px] text-[var(--color-text-tertiary)]">
          本周完成率
        </div>
      </div>

      {/* Max streak */}
      <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border-subtle)] p-3 text-center">
        <div className="flex items-center justify-center gap-1 mb-1">
          <span className="text-[22px] font-bold tabular-nums text-[var(--color-text-primary)] leading-none">
            {maxStreak}
          </span>
          {maxStreak >= 7 && (
            <FireIcon
              className="w-4 h-4"
              style={{ color: "var(--color-streak-fire)" }}
            />
          )}
        </div>
        <div className="text-[11px] text-[var(--color-text-tertiary)] truncate">
          {maxStreakHabit ? `${maxStreakHabit} 连续` : "最长连续"}
        </div>
      </div>

      {/* Total */}
      <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border-subtle)] p-3 text-center">
        <div className="text-[22px] font-bold tabular-nums text-[var(--color-text-primary)] leading-none mb-1">
          {totalCount}
        </div>
        <div className="text-[11px] text-[var(--color-text-tertiary)]">
          总打卡次数
        </div>
      </div>
    </div>
  );
}
