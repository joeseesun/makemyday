import { useEffect, useState } from "react";
import { type Habit, getStreak, getWeeklyStats, getTotalCheckIns } from "./db";
import { FireIcon } from "@heroicons/react/24/solid";
import { HabitIcon } from "./icons";

interface StreakInfo {
  name: string;
  streak: number;
  color: string;
  icon: string;
}

interface StatsBarProps {
  habits: Habit[];
  refreshKey: number;
}

export default function StatsBar({ habits, refreshKey }: StatsBarProps) {
  const [streaks, setStreaks] = useState<StreakInfo[]>([]);
  const [streakIndex, setStreakIndex] = useState(0);
  const [weeklyRate, setWeeklyRate] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    async function load() {
      if (habits.length === 0) return;

      // Collect all streaks
      const all: StreakInfo[] = [];
      for (const h of habits) {
        const s = await getStreak(h.id);
        all.push({ name: h.name, streak: s, color: h.color, icon: h.emoji });
      }
      // Sort by streak descending so best is first
      all.sort((a, b) => b.streak - a.streak);
      setStreaks(all);

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

  // Reset index when habits change
  useEffect(() => {
    setStreakIndex(0);
  }, [habits.length]);

  if (habits.length === 0) return null;

  const current = streaks[streakIndex % streaks.length] ?? null;

  const cycleStreak = () => {
    if (streaks.length <= 1) return;
    setStreakIndex((i) => (i + 1) % streaks.length);
  };

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

      {/* Streak — clickable to cycle through habits */}
      <div
        onClick={cycleStreak}
        className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border-subtle)] p-3 text-center transition-all cursor-pointer hover:bg-[var(--color-border-subtle)]"
      >
        {current && (
          <>
            <div className="flex items-center justify-center gap-1 mb-1">
              <span className="text-[22px] font-bold tabular-nums leading-none" style={{ color: current.color }}>
                {current.streak}
              </span>
              {current.streak >= 7 && (
                <FireIcon
                  className="w-4 h-4"
                  style={{ color: "var(--color-streak-fire)" }}
                />
              )}
            </div>
            <div className="flex items-center justify-center gap-1">
              <HabitIcon icon={current.icon} className="w-3 h-3" style={{ color: current.color }} />
              <span className="text-[11px] text-[var(--color-text-tertiary)] truncate">
                {current.name}
              </span>
            </div>
            {streaks.length > 1 && (
              <div className="flex items-center justify-center gap-0.5 mt-1">
                {streaks.map((_, i) => (
                  <span
                    key={i}
                    className="block w-1 h-1 rounded-full transition-colors"
                    style={{
                      backgroundColor: i === streakIndex % streaks.length
                        ? "var(--color-accent)"
                        : "var(--color-border)",
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}
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
