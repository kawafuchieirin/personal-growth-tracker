import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import type { Skill } from '@/types';
import { SKILL_LEVEL_LABELS } from '@/types';
import styles from './SkillCard.module.css';

interface SkillCardProps {
  skill: Skill;
  onEdit: (skill: Skill) => void;
  onDelete: (skillId: string) => void;
}

function getLevelVariant(level: number) {
  if (level >= 5) return 'success';
  if (level >= 3) return 'primary';
  if (level >= 2) return 'warning';
  return 'default';
}

export function SkillCard({ skill, onEdit, onDelete }: SkillCardProps) {
  return (
    <Card padding="md">
      <div className={styles.header}>
        <h4 className={styles.title}>{skill.name}</h4>
        <Badge variant={getLevelVariant(skill.level)} size="sm">
          Lv.{skill.level} {SKILL_LEVEL_LABELS[skill.level]}
        </Badge>
      </div>
      <div className={styles.levelBar}>
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`${styles.levelDot} ${level <= skill.level ? styles.filled : ''}`}
          />
        ))}
      </div>
      {skill.description && (
        <p className={styles.description}>{skill.description}</p>
      )}
      <div className={styles.footer}>
        <Badge variant="default" size="sm">
          {skill.category}
        </Badge>
        <div className={styles.actions}>
          <Button variant="ghost" size="sm" onClick={() => onEdit(skill)}>
            編集
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(skill.skill_id)}>
            削除
          </Button>
        </div>
      </div>
    </Card>
  );
}
