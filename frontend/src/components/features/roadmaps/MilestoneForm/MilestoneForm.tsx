import { useState, type FormEvent } from "react";
import { Button } from "@/components/common/Button";
import { Input, Textarea } from "@/components/common/Input";
import type {
  Milestone,
  CreateMilestoneInput,
  UpdateMilestoneInput,
} from "@/types";
import { formatDateInput } from "@/utils";
import styles from "./MilestoneForm.module.css";

interface MilestoneFormBaseProps {
  onCancel: () => void;
  loading?: boolean;
}

interface CreateMilestoneFormProps extends MilestoneFormBaseProps {
  milestone?: undefined;
  onSubmit: (data: CreateMilestoneInput) => Promise<void>;
}

interface EditMilestoneFormProps extends MilestoneFormBaseProps {
  milestone: Milestone;
  onSubmit: (data: UpdateMilestoneInput) => Promise<void>;
}

type MilestoneFormProps = CreateMilestoneFormProps | EditMilestoneFormProps;

export function MilestoneForm({
  milestone,
  onSubmit,
  onCancel,
  loading = false,
}: MilestoneFormProps) {
  const [title, setTitle] = useState(milestone?.title || "");
  const [description, setDescription] = useState(milestone?.description || "");
  const [dueDate, setDueDate] = useState(
    milestone?.due_date ? formatDateInput(milestone.due_date) : ""
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!milestone;

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "タイトルは必須です";
    }
    if (!dueDate) {
      newErrors.dueDate = "期限は必須です";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      title: title.trim(),
      description: description.trim(),
      due_date: dueDate,
    });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Input
        label="タイトル"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="マイルストーンのタイトル"
        error={errors.title}
        fullWidth
        required
      />
      <Textarea
        label="説明"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="マイルストーンの詳細（任意）"
        fullWidth
      />
      <Input
        label="期限"
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        error={errors.dueDate}
        fullWidth
        required
      />
      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel}>
          キャンセル
        </Button>
        <Button type="submit" loading={loading}>
          {isEditing ? "更新" : "追加"}
        </Button>
      </div>
    </form>
  );
}
