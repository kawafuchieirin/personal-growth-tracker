"""Tests for contribution calculation."""

from contribution import (
    calculate_contribution_level,
    calculate_contributions,
    generate_year_dates,
)


class TestCalculateContributionLevel:
    """Tests for contribution level calculation."""

    def test_level_0_no_contributions(self):
        """Test level 0 for no contributions."""
        assert calculate_contribution_level(0, 5) == 0

    def test_level_0_max_zero(self):
        """Test level 0 when max is zero."""
        assert calculate_contribution_level(1, 0) == 0

    def test_level_1_low_contributions(self):
        """Test level 1 for low contributions."""
        assert calculate_contribution_level(1, 4) == 1  # 25%

    def test_level_2_medium_low(self):
        """Test level 2 for medium-low contributions."""
        assert calculate_contribution_level(2, 4) == 2  # 50%

    def test_level_3_medium_high(self):
        """Test level 3 for medium-high contributions."""
        assert calculate_contribution_level(3, 4) == 3  # 75%

    def test_level_4_high(self):
        """Test level 4 for high contributions."""
        assert calculate_contribution_level(4, 4) == 4  # 100%


class TestGenerateYearDates:
    """Tests for year date generation."""

    def test_generates_all_dates(self):
        """Test that all dates in a year are generated."""
        dates = generate_year_dates(2024)
        assert len(dates) == 366  # 2024 is a leap year
        assert dates[0] == "2024-01-01"
        assert dates[-1] == "2024-12-31"

    def test_non_leap_year(self):
        """Test non-leap year."""
        dates = generate_year_dates(2023)
        assert len(dates) == 365


class TestCalculateContributions:
    """Tests for contribution calculation."""

    def test_empty_logs(self):
        """Test with no habit logs."""
        result = calculate_contributions([], 2024, 3)
        assert result.year == 2024
        assert result.total_contributions == 0
        assert len(result.data) == 366  # Leap year

    def test_with_logs(self):
        """Test with some habit logs."""
        logs = [
            {"date": "2024-01-01", "completed": True},
            {"date": "2024-01-01", "completed": True},
            {"date": "2024-01-02", "completed": True},
        ]
        result = calculate_contributions(logs, 2024, 3)
        assert result.total_contributions == 3

        # Check specific dates
        jan1 = next(d for d in result.data if d.date == "2024-01-01")
        assert jan1.count == 2

        jan2 = next(d for d in result.data if d.date == "2024-01-02")
        assert jan2.count == 1

    def test_incomplete_logs_ignored(self):
        """Test that incomplete logs are ignored."""
        logs = [
            {"date": "2024-01-01", "completed": True},
            {"date": "2024-01-01", "completed": False},
        ]
        result = calculate_contributions(logs, 2024, 2)
        assert result.total_contributions == 1
