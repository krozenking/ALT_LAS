#!/bin/bash

# Script to push changes to krozenking/ALT_LAS with token and retry logic
# Usage: ./push_alt_las.sh "Your commit message"

COMMIT_MSG="$1"
REPO_DIR="/alt_las_repo"
REPO_URL="https://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@github.com/krozenking/ALT_LAS.git"
BRANCH="main"

if [ -z "$COMMIT_MSG" ]; then
  echo "Error: Commit message is required."
  echo "Usage: $0 \"Your commit message\""
  exit 1
fi

cd "$REPO_DIR" || exit 1

echo "Pulling latest changes from $BRANCH..."
git pull "$REPO_URL" "$BRANCH"
if [ $? -ne 0 ]; then
  echo "Error: Failed to pull latest changes. Please resolve conflicts manually before pushing."
  exit 1
fi

echo "Adding changes..."
git add .

echo "Committing changes with message: $COMMIT_MSG"
git commit -m "$COMMIT_MSG"
# Ignore commit errors if there are no changes to commit
if [ $? -ne 0 ]; then
    echo "Warning: Commit failed, possibly no changes to commit."
fi

echo "Attempting to push changes to $BRANCH... (Attempt 1)"
git push "$REPO_URL" "$BRANCH"

if [ $? -ne 0 ]; then
  echo "Push failed. Waiting 3 minutes (180 seconds) before retrying..."
  sleep 180
  echo "Attempting to push changes to $BRANCH... (Attempt 2)"
  git push "$REPO_URL" "$BRANCH"
  
  if [ $? -ne 0 ]; then
    echo "Error: Push failed after two attempts. Please notify the user/project owner."
    exit 1
  else
    echo "Push successful on the second attempt."
  fi
else
  echo "Push successful on the first attempt."
fi

exit 0

