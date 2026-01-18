import { useState, type FormEvent } from "react";
import { Button } from "@/components/common/Button";
import { Input, Textarea } from "@/components/common/Input";
import { Select } from "@/components/common/Select";
import type {
  Habit,
  CreateHabitInput,
  UpdateHabitInput,
  HabitFrequency,
} from "@/types";
import { HABIT_FREQUENCY_LABELS, DEFAULT_HABIT_COLORS } from "@/types";
import styles from "./HabitForm.module.css";

interface HabitFormBaseProps {
  onCancel: () => void;
  loading?: boolean;
}

interface CreateHabitFormProps extends HabitFormBaseProps {
  habit?: undefined;
  onSubmit: (data: CreateHabitInput) => Promise<void>;
}

interface EditHabitFormProps extends HabitFormBaseProps {
  habit: Habit;
  onSubmit: (data: UpdateHabitInput) => Promise<void>;
}

type HabitFormProps = CreateHabitFormProps | EditHabitFormProps;

const frequencyOptions = (
  Object.entries(HABIT_FREQUENCY_LABELS) as [HabitFrequency, string][]
).map(([value, label]) => ({ value, label }));

export function HabitForm({
  habit,
  onSubmit,
  onCancel,
  loading = false,
}: HabitFormProps) {
  const [name, setName] = useState(habit?.name || "");
  const [description, setDescription] = useState(habit?.description || "");
  const [frequency, setFrequency] = useState<HabitFrequency>(
    habit?.frequency || "daily"
  );
  const [reminderTime, setReminderTime] = useState(habit?.reminder_time || "");
  const [reminderEnabled, setReminderEnabled] = useState(
    habit?.reminder_enabled || false
  );
  const [color, setColor] = useState(habit?.color || DEFAULT_HABIT_COLORS[0]);
  const [isActive, setIsActive] = useState(habit?.is_active ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!habit;

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "名前は必須です";
    }
    if (reminderEnabled && !reminderTime) {
      newErrors.reminderTime = "リマインダー時間を設定してください";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const baseData = {
      name: name.trim(),
      description: description.trim() || undefined,
      frequency,
      reminder_time: reminderTime || undefined,
      reminder_enabled: reminderEnabled,
      color,
    };

    if (isEditing) {
      await onSubmit({
        ...baseData,
        is_active: isActive,
      });
    } else {
      await onSubmit(baseData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Input
        label="習慣名"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="例: 毎朝のジョギング"
        error={errors.name}
        fullWidth
        required
      />
      <Textarea
        label="説明 (任意)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="この習慣の目的や詳細"
        fullWidth
        rows={3}
      />
      <Select
        label="頻度"
        value={frequency}
        onChange={(e) => setFrequency(e.target.value as HabitFrequency)}
        options={frequencyOptions}
        fullWidth
      />

      <div className={styles.colorSection}>
        <label className={styles.label}>色</label>
        <div className={styles.colorPicker}>
          {DEFAULT_HABIT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={`${styles.colorOption} ${color === c ? styles.selected : ""}`}
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
              aria-label={`色: ${c}`}
            />
          ))}
        </div>
      </div>

      <div className={styles.reminderSection}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={reminderEnabled}
            onChange={(e) => setReminderEnabled(e.target.checked)}
          />
          <span>Slackリマインダーを有効にする</span>
        </label>
        {reminderEnabled && (
          <Input
            label="リマインダー時間"
            type="time"
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
            error={errors.reminderTime}
            fullWidth
          />
        )}
      </div>

      {isEditing && (
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          <span>アクティブ</span>
        </label>
      )}

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel}>
          キャンセル
        </Button>
        <Button type="submit" loading={loading}>
          {isEditing ? "更新" : "作成"}
        </Button>
      </div>
    </form>
  );
}
