#!/bin/bash

# Post-Push Hook for Pull Request Monitoring
# This script automatically runs the pull request monitoring script after each push

# Set up environment
REPO_DIR="/workspace/ALT_LAS"
PR_MONITOR_SCRIPT="$REPO_DIR/scripts/enhanced_pr_monitor.sh"
LOG_DIR="$REPO_DIR/logs"
HOOK_LOG="$LOG_DIR/post_push_hook.log"

# Create logs directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Log execution
echo "$(date): Running post-push hook" >> "$HOOK_LOG"

# Check if token is configured in environment
if [ -z "$GITHUB_TOKEN" ]; then
    echo "$(date): Error - GITHUB_TOKEN environment variable not set" >> "$HOOK_LOG"
    echo "Please set GITHUB_TOKEN environment variable in your shell profile or CI/CD configuration"
    exit 1
fi

# Check if monitoring script exists
if [ ! -f "$PR_MONITOR_SCRIPT" ]; then
    echo "$(date): Error - Pull request monitoring script not found at $PR_MONITOR_SCRIPT" >> "$HOOK_LOG"
    exit 1
fi

# Make sure script is executable
chmod +x "$PR_MONITOR_SCRIPT"

# Run the monitoring script
echo "$(date): Executing pull request monitoring script" >> "$HOOK_LOG"
"$PR_MONITOR_SCRIPT" >> "$HOOK_LOG" 2>&1

# Check result
if [ $? -eq 0 ]; then
    echo "$(date): Pull request monitoring completed successfully" >> "$HOOK_LOG"
else
    echo "$(date): Error - Pull request monitoring failed" >> "$HOOK_LOG"
fi

echo "$(date): Post-push hook completed" >> "$HOOK_LOG"
echo "" >> "$HOOK_LOG"

exit 0
