"""Slack notification module for habit reminders."""

import json
import logging
import urllib.request
from datetime import datetime

logger = logging.getLogger(__name__)


def send_slack_notification(webhook_url: str, message: str) -> bool:
    """Send a notification to Slack via webhook.

    Args:
        webhook_url: Slack webhook URL
        message: Message to send

    Returns:
        True if successful, False otherwise
    """
    if not webhook_url:
        logger.warning("Slack webhook URL is not configured")
        return False

    payload = {"text": message}
    data = json.dumps(payload).encode("utf-8")

    req = urllib.request.Request(
        webhook_url,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            if response.status == 200:
                logger.info("Slack notification sent successfully")
                return True
            else:
                logger.error(f"Slack notification failed: {response.status}")
                return False
    except Exception as e:
        logger.error(f"Failed to send Slack notification: {e}")
        return False


def format_reminder_message(
    incomplete_habits: list[dict],
    total_habits: int,
    completed_count: int,
) -> str:
    """Format a reminder message for incomplete habits.

    Args:
        incomplete_habits: List of incomplete habit dicts with 'name' and optionally 'reminder_time'
        total_habits: Total number of habits for today
        completed_count: Number of completed habits

    Returns:
        Formatted message string
    """
    now = datetime.now()
    date_str = now.strftime("%Y年%m月%d日")

    message_lines = [
        f":bell: *習慣リマインダー* ({date_str})",
        "",
        f"今日の進捗: {completed_count}/{total_habits} 完了",
        "",
        "*未完了の習慣:*",
    ]

    for habit in incomplete_habits:
        name = habit.get("name", "不明")
        reminder_time = habit.get("reminder_time")
        if reminder_time:
            message_lines.append(f"• {name} (予定: {reminder_time})")
        else:
            message_lines.append(f"• {name}")

    message_lines.extend(
        [
            "",
            "今日も頑張りましょう! :muscle:",
        ]
    )

    return "\n".join(message_lines)
