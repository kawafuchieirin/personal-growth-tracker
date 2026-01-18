"""Contribution calculation for habit tracking."""

from datetime import date, timedelta

from models import ContributionData, ContributionResponse


def calculate_contribution_level(count: int, max_count: int) -> int:
    """Calculate contribution level (0-4) based on count.

    Level 0: No contributions
    Level 1: 1-25% of max
    Level 2: 26-50% of max
    Level 3: 51-75% of max
    Level 4: 76-100% of max
    """
    if count == 0:
        return 0
    if max_count == 0:
        return 0

    ratio = count / max_count
    if ratio <= 0.25:
        return 1
    if ratio <= 0.50:
        return 2
    if ratio <= 0.75:
        return 3
    return 4


def generate_year_dates(year: int) -> list[str]:
    """Generate all dates for a given year."""
    start_date = date(year, 1, 1)
    end_date = date(year, 12, 31)
    dates = []
    current = start_date
    while current <= end_date:
        dates.append(current.isoformat())
        current += timedelta(days=1)
    return dates


def calculate_contributions(
    habit_logs: list[dict], year: int, habit_count: int
) -> ContributionResponse:
    """Calculate contribution data for a year.

    Args:
        habit_logs: List of habit log entries with 'date' and 'completed' fields
        year: The year to calculate contributions for
        habit_count: Total number of active habits

    Returns:
        ContributionResponse with daily contribution data
    """
    # Count completions per date
    date_counts: dict[str, int] = {}
    for log in habit_logs:
        if log.get("completed", False):
            log_date = log["date"]
            date_counts[log_date] = date_counts.get(log_date, 0) + 1

    # Get max count for level calculation
    max_count = habit_count if habit_count > 0 else 1

    # Generate all dates for the year
    all_dates = generate_year_dates(year)

    # Build contribution data
    contribution_data = []
    total_contributions = 0

    for d in all_dates:
        count = date_counts.get(d, 0)
        total_contributions += count
        level = calculate_contribution_level(count, max_count)
        contribution_data.append(ContributionData(date=d, count=count, level=level))

    return ContributionResponse(
        year=year,
        total_contributions=total_contributions,
        data=contribution_data,
    )
