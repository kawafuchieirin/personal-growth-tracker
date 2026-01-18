import { useState, useMemo } from "react";
import { Card } from "@/components/common/Card";
import { useContributions } from "@/hooks";
import type { ContributionData } from "@/types";
import styles from "./ContributionGraph.module.css";

interface ContributionGraphProps {
  color?: string;
}

const MONTHS = [
  "1月",
  "2月",
  "3月",
  "4月",
  "5月",
  "6月",
  "7月",
  "8月",
  "9月",
  "10月",
  "11月",
  "12月",
];

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

function getLevelColor(level: number, baseColor: string): string {
  const opacity = [0, 0.2, 0.4, 0.6, 1][level] || 0;
  if (level === 0) return "var(--contribution-empty, #161b22)";

  // Convert hex to rgba
  const hex = baseColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

interface WeekData {
  days: (ContributionData | null)[];
}

function organizeDataByWeek(data: ContributionData[]): WeekData[] {
  const firstData = data[0];
  const lastData = data[data.length - 1];
  if (!firstData || !lastData) return [];

  const weeks: WeekData[] = [];
  const dataMap = new Map(data.map((d) => [d.date, d]));

  // Find the first day and adjust to start of week (Sunday)
  const firstDate = new Date(firstData.date);
  const startOfWeek = new Date(firstDate);
  startOfWeek.setDate(firstDate.getDate() - firstDate.getDay());

  // Find the last day and adjust to end of week (Saturday)
  const lastDate = new Date(lastData.date);
  const endOfWeek = new Date(lastDate);
  endOfWeek.setDate(lastDate.getDate() + (6 - lastDate.getDay()));

  const currentDate = new Date(startOfWeek);
  let currentWeek: (ContributionData | null)[] = [];

  while (currentDate <= endOfWeek) {
    const dateStr = currentDate.toISOString().split("T")[0] ?? "";
    const contribution = dataMap.get(dateStr) ?? null;

    currentWeek.push(contribution);

    if (currentWeek.length === 7) {
      weeks.push({ days: currentWeek });
      currentWeek = [];
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return weeks;
}

function getMonthLabels(
  weeks: WeekData[]
): { month: string; position: number }[] {
  const labels: { month: string; position: number }[] = [];
  let lastMonth = -1;

  weeks.forEach((week, weekIndex) => {
    const firstValidDay = week.days.find((d) => d !== null);
    if (firstValidDay) {
      const date = new Date(firstValidDay.date);
      const month = date.getMonth();
      const monthLabel = MONTHS[month];
      if (month !== lastMonth && monthLabel) {
        labels.push({ month: monthLabel, position: weekIndex });
        lastMonth = month;
      }
    }
  });

  return labels;
}

export function ContributionGraph({
  color = "#22c55e",
}: ContributionGraphProps) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const { contributions, loading, error } = useContributions(selectedYear);
  const [tooltip, setTooltip] = useState<{
    data: ContributionData;
    x: number;
    y: number;
  } | null>(null);

  const weeks = useMemo(() => {
    if (!contributions?.data) return [];
    return organizeDataByWeek(contributions.data);
  }, [contributions?.data]);

  const monthLabels = useMemo(() => getMonthLabels(weeks), [weeks]);

  const handleCellHover = (
    event: React.MouseEvent,
    data: ContributionData | null
  ) => {
    if (!data) {
      setTooltip(null);
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltip({
      data,
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
    });
  };

  const handleCellLeave = () => {
    setTooltip(null);
  };

  const yearOptions = [currentYear, currentYear - 1, currentYear - 2];

  if (loading) {
    return (
      <Card padding="md">
        <div className={styles.loading}>読み込み中...</div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card padding="md">
        <div className={styles.error}>{error}</div>
      </Card>
    );
  }

  if (!contributions) {
    return (
      <Card padding="md">
        <div className={styles.empty}>データがありません</div>
      </Card>
    );
  }

  return (
    <Card padding="md" className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          {contributions.total_contributions} contributions in {selectedYear}
        </h3>
        <select
          className={styles.yearSelect}
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
        >
          {yearOptions.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.graphContainer}>
        <div className={styles.weekdayLabels}>
          {WEEKDAYS.map((day, i) => (
            <span
              key={day}
              className={styles.weekdayLabel}
              style={{ visibility: i % 2 === 1 ? "visible" : "hidden" }}
            >
              {day}
            </span>
          ))}
        </div>

        <div className={styles.graphWrapper}>
          <div className={styles.monthLabels}>
            {monthLabels.map(({ month, position }, i) => (
              <span
                key={i}
                className={styles.monthLabel}
                style={{ left: `${position * 13}px` }}
              >
                {month}
              </span>
            ))}
          </div>

          <div className={styles.graph}>
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className={styles.week}>
                {week.days.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    className={styles.cell}
                    style={{
                      backgroundColor: day
                        ? getLevelColor(day.level, color)
                        : "var(--contribution-empty, #161b22)",
                    }}
                    onMouseEnter={(e) => handleCellHover(e, day)}
                    onMouseLeave={handleCellLeave}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.legend}>
        <span className={styles.legendLabel}>Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={styles.legendCell}
            style={{ backgroundColor: getLevelColor(level, color) }}
          />
        ))}
        <span className={styles.legendLabel}>More</span>
      </div>

      {tooltip && (
        <div
          className={styles.tooltip}
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
          }}
        >
          <strong>{tooltip.data.count} contributions</strong>
          <br />
          {new Date(tooltip.data.date).toLocaleDateString("ja-JP", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      )}
    </Card>
  );
}
