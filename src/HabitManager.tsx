import { useState } from "react";
import { type Habit, addHabit, updateHabit, deleteHabit } from "./db";
import { ICON_KEYS, HabitIcon } from "./icons";
import { XMarkIcon } from "@heroicons/react/24/solid";

const COLOR_OPTIONS = [
  "#059669", "#3b82f6", "#f59e0b", "#ef4444",
  "#8b5cf6", "#ec4899", "#14b8a6", "#f97316",
];

interface HabitManagerProps {
  habits: Habit[];
  onChanged: () => void;
}

export default function HabitManager({ habits, onChanged }: HabitManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("pencil");
  const [color, setColor] = useState("#059669");

  const handleAdd = async () => {
    if (!name.trim()) return;
    await addHabit(name.trim(), icon, color);
    setName("");
    setIcon("pencil");
    setColor("#059669");
    setIsAdding(false);
    onChanged();
  };

  const handleUpdate = async (id: number) => {
    if (!name.trim()) return;
    await updateHabit(id, name.trim(), icon, color);
    setEditingId(null);
    setName("");
    onChanged();
  };

  const handleDelete = async (id: number) => {
    await deleteHabit(id);
    onChanged();
  };

  const startEdit = (h: Habit) => {
    setEditingId(h.id);
    setName(h.name);
    setIcon(h.emoji);
    setColor(h.color);
  };

  return (
    <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border-subtle)] p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[var(--color-text-secondary)]">事项管理</h3>
        <button
          onClick={() => {
            setIsAdding(true);
            setEditingId(null);
            setName("");
            setIcon("pencil");
            setColor("#059669");
          }}
          className="text-xs px-3 py-1 rounded-lg bg-[var(--color-accent-light)] text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white transition-colors"
        >
          + 添加
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {habits.map((h) => (
          <div
            key={h.id}
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-colors cursor-pointer"
            style={{
              borderColor: h.color + "30",
              backgroundColor: h.color + "08",
            }}
            onClick={() => startEdit(h)}
          >
            <HabitIcon icon={h.emoji} className="w-4 h-4" style={{ color: h.color }} />
            <span style={{ color: h.color }} className="font-medium">
              {h.name}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(h.id);
              }}
              className="hidden group-hover:flex ml-1 items-center justify-center w-4 h-4 rounded-full text-[var(--color-text-tertiary)] hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <XMarkIcon className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {(isAdding || editingId !== null) && (
        <div className="border border-[var(--color-border)] rounded-lg p-3 space-y-3">
          <div>
            <label className="text-xs text-[var(--color-text-tertiary)] mb-1 block">事项名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：阅读、冥想"
              className="w-full text-sm px-3 py-1.5 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-opacity-30 focus:border-[var(--color-accent)] transition-colors"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  editingId !== null ? handleUpdate(editingId) : handleAdd();
                }
              }}
            />
          </div>
          <div>
            <label className="text-xs text-[var(--color-text-tertiary)] mb-1 block">选择图标</label>
            <div className="flex flex-wrap gap-1">
              {ICON_KEYS.map((key) => (
                <button
                  key={key}
                  onClick={() => setIcon(key)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all
                    ${icon === key ? "ring-2 ring-[var(--color-accent)] bg-[var(--color-accent-light)]" : "hover:bg-[var(--color-border-subtle)]"}`}
                >
                  <HabitIcon
                    icon={key}
                    className="w-5 h-5"
                    style={{ color: icon === key ? "var(--color-accent)" : "var(--color-text-tertiary)" }}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-[var(--color-text-tertiary)] mb-1 block">选择颜色</label>
            <div className="flex gap-1.5">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-transform
                    ${color === c ? "ring-2 ring-offset-2 ring-[var(--color-text-tertiary)] scale-110" : "hover:scale-110"}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() =>
                editingId !== null ? handleUpdate(editingId) : handleAdd()
              }
              className="text-xs px-4 py-1.5 rounded-lg bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors"
            >
              {editingId !== null ? "保存" : "添加"}
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setEditingId(null);
              }}
              className="text-xs px-4 py-1.5 rounded-lg text-[var(--color-text-tertiary)] hover:bg-[var(--color-border-subtle)] transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
