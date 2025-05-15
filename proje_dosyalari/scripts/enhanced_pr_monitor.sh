#!/bin/bash

# Enhanced Pull Request Monitoring Script (Secure Version)
# This script checks for pull requests in the ALT_LAS repository,
# analyzes them for security implications, and logs them for review
# by Worker 8 (Security and DevOps Specialist)

# Configuration
REPO_OWNER="krozenking"
REPO_NAME="ALT_LAS"
LOG_FILE="/workspace/ALT_LAS/pr_monitoring.log"
SECURITY_REPORT_FILE="/workspace/ALT_LAS/pr_security_analysis.md"

# Check if GitHub token is provided as environment variable
if [ -z "$GITHUB_TOKEN" ]; then
    echo "Error: GITHUB_TOKEN environment variable is not set."
    echo "Please set the GITHUB_TOKEN environment variable before running this script."
    echo "Example: export GITHUB_TOKEN=your_github_token"
    exit 1
fi

# Create log file if it doesn't exist
if [ ! -f "$LOG_FILE" ]; then
    touch "$LOG_FILE"
    echo "$(date): Pull Request Monitoring Log Created" >> "$LOG_FILE"
fi

# Create security report file if it doesn't exist
if [ ! -f "$SECURITY_REPORT_FILE" ]; then
    touch "$SECURITY_REPORT_FILE"
    echo "# Pull Request Security Analysis" > "$SECURITY_REPORT_FILE"
    echo "" >> "$SECURITY_REPORT_FILE"
    echo "This document contains security analysis of pull requests in the ALT_LAS repository." >> "$SECURITY_REPORT_FILE"
    echo "" >> "$SECURITY_REPORT_FILE"
fi

# Log start of check
echo "$(date): Checking for pull requests..." >> "$LOG_FILE"

# Get pull requests using GitHub API
PR_DATA=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
    "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/pulls")

# Check if there are any pull requests
PR_COUNT=$(echo "$PR_DATA" | grep -c '"id":')

if [ "$PR_COUNT" -eq 0 ]; then
    echo "$(date): No pull requests found." >> "$LOG_FILE"
else
    echo "$(date): Found $PR_COUNT pull requests:" >> "$LOG_FILE"
    
    # Extract and log pull request details
    echo "$PR_DATA" | grep -E '"number"|"title"|"user"|"created_at"|"body"' | \
        sed 's/^[[:space:]]*//g' | \
        sed 's/"user": {/"user": /g' | \
        sed 's/"login": /User: /g' >> "$LOG_FILE"
    
    # Update security report with new analysis
    echo "## Security Analysis - $(date)" >> "$SECURITY_REPORT_FILE"
    echo "" >> "$SECURITY_REPORT_FILE"
    echo "Found $PR_COUNT pull requests. Analyzing security implications:" >> "$SECURITY_REPORT_FILE"
    echo "" >> "$SECURITY_REPORT_FILE"
    
    # Extract dependency updates for security analysis
    DEPENDENCY_UPDATES=$(echo "$PR_DATA" | grep -E '"title": "deps' | sed 's/^[[:space:]]*"title": "//g' | sed 's/",//g')
    
    if [ -n "$DEPENDENCY_UPDATES" ]; then
        echo "### Dependency Updates" >> "$SECURITY_REPORT_FILE"
        echo "" >> "$SECURITY_REPORT_FILE"
        echo "The following dependency updates were found:" >> "$SECURITY_REPORT_FILE"
        echo "" >> "$SECURITY_REPORT_FILE"
        
        echo "$DEPENDENCY_UPDATES" | while read -r line; do
            echo "- $line" >> "$SECURITY_REPORT_FILE"
            
            # Check if it's a major version update (potential breaking changes)
            if [[ "$line" =~ from\ [0-9]+\.[0-9]+\.[0-9]+\ to\ ([0-9]+)\.[0-9]+\.[0-9]+ ]]; then
                FROM_VERSION=$(echo "$line" | grep -o "from [0-9]\+\.[0-9]\+\.[0-9]\+" | cut -d' ' -f2)
                TO_VERSION=$(echo "$line" | grep -o "to [0-9]\+\.[0-9]\+\.[0-9]\+" | cut -d' ' -f2)
                FROM_MAJOR=$(echo "$FROM_VERSION" | cut -d'.' -f1)
                TO_MAJOR=$(echo "$TO_VERSION" | cut -d'.' -f1)
                
                if [ "$FROM_MAJOR" -ne "$TO_MAJOR" ]; then
                    echo "  - ⚠️ **Major version update**: This is a major version update from $FROM_VERSION to $TO_VERSION and may contain breaking changes." >> "$SECURITY_REPORT_FILE"
                fi
            fi
            
            # Check for security-related keywords in PR title
            if [[ "$line" =~ security|vulnerability|CVE|exploit|patch|fix ]]; then
                echo "  - 🔒 **Security update**: This update may address security vulnerabilities." >> "$SECURITY_REPORT_FILE"
            fi
        done
        
        echo "" >> "$SECURITY_REPORT_FILE"
        echo "### Security Recommendations" >> "$SECURITY_REPORT_FILE"
        echo "" >> "$SECURITY_REPORT_FILE"
        echo "1. Review changelogs for each dependency update to understand security implications" >> "$SECURITY_REPORT_FILE"
        echo "2. Run automated tests to ensure updates don't break existing functionality" >> "$SECURITY_REPORT_FILE"
        echo "3. Consider staging dependency updates in a test environment before merging to main" >> "$SECURITY_REPORT_FILE"
        echo "4. For major version updates, carefully review breaking changes and migration guides" >> "$SECURITY_REPORT_FILE"
        echo "" >> "$SECURITY_REPORT_FILE"
    else
        echo "No dependency updates found in current pull requests." >> "$SECURITY_REPORT_FILE"
        echo "" >> "$SECURITY_REPORT_FILE"
    fi
    
    echo "----------------------------------------" >> "$LOG_FILE"
fi

echo "$(date): Pull request check completed." >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Output to console
if [ "$PR_COUNT" -eq 0 ]; then
    echo "No pull requests found."
else
    echo "Found $PR_COUNT pull requests. Details logged to $LOG_FILE"
    echo "Security analysis saved to $SECURITY_REPORT_FILE"
fi

exit 0
