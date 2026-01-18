#!/bin/bash

# Slack Webhook URL (環境変数から取得)
SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"

if [ -z "$SLACK_WEBHOOK_URL" ]; then
  echo "SLACK_WEBHOOK_URL is not set. Skipping Slack notification."
  exit 0
fi

# 通知メッセージを作成
MESSAGE="${1:-Claude Code task completed}"
PROJECT_NAME="personal-growth-tracker"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Slack に送信
curl -s -X POST "$SLACK_WEBHOOK_URL" \
  -H 'Content-Type: application/json' \
  -d @- << EOF
{
  "blocks": [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "Claude Code Task Completed",
        "emoji": true
      }
    },
    {
      "type": "section",
      "fields": [
        {
          "type": "mrkdwn",
          "text": "*Project:*\n${PROJECT_NAME}"
        },
        {
          "type": "mrkdwn",
          "text": "*Time:*\n${TIMESTAMP}"
        }
      ]
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Message:*\n${MESSAGE}"
      }
    }
  ]
}
EOF

echo "Slack notification sent."
