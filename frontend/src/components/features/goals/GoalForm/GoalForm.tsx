import { useState, type FormEvent } from 'react';
import { Button } from '@/components/common/Button';
import { Input, Textarea } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import type { Goal, CreateGoalInput, UpdateGoalInput, GoalStatus, GoalPriority } from '@/types';
import { GOAL_STATUS_LABELS, GOAL_PRIORITY_LABELS } from '@/types';
import { formatDateInput } from '@/utils';
import styles from './GoalForm.module.css';

interface GoalFormBaseProps {
  onCancel: () => void;
  loading?: boolean;
}

interface CreateGoalFormProps extends GoalFormBaseProps {
  goal?: undefined;
  onSubmit: (data: CreateGoalInput) => Promise<void>;
}

interface EditGoalFormProps extends GoalFormBaseProps {
  goal: Goal;
  onSubmit: (data: UpdateGoalInput) => Promise<void>;
}

type GoalFormProps = CreateGoalFormProps | EditGoalFormProps;

const priorityOptions = (Object.entries(GOAL_PRIORITY_LABELS) as [GoalPriority, string][]).map(
  ([value, label]) => ({ value, label })
);

const statusOptions = (Object.entries(GOAL_STATUS_LABELS) as [GoalStatus, string][]).map(
  ([value, label]) => ({ value, label })
);

export function GoalForm({ goal, onSubmit, onCancel, loading = false }: GoalFormProps) {
  const [title, setTitle] = useState(goal?.title || '');
  const [description, setDescription] = useState(goal?.description || '');
  const [targetDate, setTargetDate] = useState(
    goal?.target_date ? formatDateInput(goal.target_date) : ''
  );
  const [priority, setPriority] = useState<GoalPriority>(goal?.priority || 'medium');
  const [status, setStatus] = useState<GoalStatus>(goal?.status || 'not_started');
  const [progress, setProgress] = useState(goal?.progress?.toString() || '0');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!goal;

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'タイトルは必須です';
    }
    if (!description.trim()) {
      newErrors.description = '説明は必須です';
    }
    if (!targetDate) {
      newErrors.targetDate = '期限は必須です';
    }
    if (isEditing) {
      const progressNum = parseInt(progress, 10);
      if (isNaN(progressNum) || progressNum < 0 || progressNum > 100) {
        newErrors.progress = '進捗は0〜100の数値で入力してください';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEditing) {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        target_date: targetDate,
        priority,
        status,
        progress: parseInt(progress, 10),
      });
    } else {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        target_date: targetDate,
        priority,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Input
        label="タイトル"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="目標のタイトルを入力"
        error={errors.title}
        fullWidth
        required
      />
      <Textarea
        label="説明"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="目標の詳細を入力"
        error={errors.description}
        fullWidth
        required
      />
      <Input
        label="期限"
        type="date"
        value={targetDate}
        onChange={(e) => setTargetDate(e.target.value)}
        error={errors.targetDate}
        fullWidth
        required
      />
      <Select
        label="優先度"
        value={priority}
        onChange={(e) => setPriority(e.target.value as GoalPriority)}
        options={priorityOptions}
        fullWidth
      />
      {isEditing && (
        <>
          <Select
            label="ステータス"
            value={status}
            onChange={(e) => setStatus(e.target.value as GoalStatus)}
            options={statusOptions}
            fullWidth
          />
          <Input
            label="進捗 (%)"
            type="number"
            min="0"
            max="100"
            value={progress}
            onChange={(e) => setProgress(e.target.value)}
            error={errors.progress}
            fullWidth
          />
        </>
      )}
      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel}>
          キャンセル
        </Button>
        <Button type="submit" loading={loading}>
          {isEditing ? '更新' : '作成'}
        </Button>
      </div>
    </form>
  );
}
