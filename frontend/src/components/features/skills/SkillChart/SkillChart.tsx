import { useRef, useEffect } from 'react';
import type { Skill } from '@/types';
import styles from './SkillChart.module.css';

interface SkillChartProps {
  skills: Skill[];
  size?: number;
}

interface ChartData {
  label: string;
  value: number;
}

export function SkillChart({ skills, size = 300 }: SkillChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const data: ChartData[] = skills.map((skill) => ({
    label: skill.name,
    value: skill.level,
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, size, size);

    if (data.length < 3) {
      ctx.fillStyle = '#9ca3af';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('3つ以上のスキルが必要です', size / 2, size / 2);
      return;
    }

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.35;
    const maxValue = 5;
    const levels = 5;
    const angleStep = (2 * Math.PI) / data.length;
    const startAngle = -Math.PI / 2;

    // Draw background circles
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;

    for (let i = 1; i <= levels; i++) {
      const levelRadius = (radius / levels) * i;
      ctx.beginPath();
      for (let j = 0; j <= data.length; j++) {
        const angle = startAngle + j * angleStep;
        const x = centerX + levelRadius * Math.cos(angle);
        const y = centerY + levelRadius * Math.sin(angle);
        if (j === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.stroke();
    }

    // Draw axis lines
    ctx.strokeStyle = '#4b5563';
    data.forEach((_, i) => {
      const angle = startAngle + i * angleStep;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle));
      ctx.stroke();
    });

    // Draw data polygon
    ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;

    ctx.beginPath();
    data.forEach((item, i) => {
      const angle = startAngle + i * angleStep;
      const valueRadius = (item.value / maxValue) * radius;
      const x = centerX + valueRadius * Math.cos(angle);
      const y = centerY + valueRadius * Math.sin(angle);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw data points
    ctx.fillStyle = '#3b82f6';
    data.forEach((item, i) => {
      const angle = startAngle + i * angleStep;
      const valueRadius = (item.value / maxValue) * radius;
      const x = centerX + valueRadius * Math.cos(angle);
      const y = centerY + valueRadius * Math.sin(angle);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw labels
    ctx.fillStyle = '#e5e7eb';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    data.forEach((item, i) => {
      const angle = startAngle + i * angleStep;
      const labelRadius = radius + 24;
      const x = centerX + labelRadius * Math.cos(angle);
      const y = centerY + labelRadius * Math.sin(angle);

      // Truncate long labels
      const maxLength = 10;
      const label =
        item.label.length > maxLength
          ? item.label.slice(0, maxLength) + '...'
          : item.label;

      ctx.fillText(label, x, y);
    });
  }, [data, size]);

  return (
    <div className={styles.container}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
