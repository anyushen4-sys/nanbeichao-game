#!/usr/bin/env python3
"""Daily triage runner for GitHub Actions."""
import os
import sys
import json
import urllib.request
from datetime import datetime, timezone, timedelta

REPO = "anyushen4-sys/nanbeichao-game"
TOKEN = os.environ.get("GITHUB_TOKEN", "")
REPORT_FILE = ".github/triage-report.md"

if not TOKEN:
    print("ERROR: GITHUB_TOKEN is required", file=sys.stderr)
    sys.exit(1)

API = "https://api.github.com"
HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
}


def gh_get(path):
    req = urllib.request.Request(f"{API}{path}", headers=HEADERS)
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode())


def main():
    print("Fetching recent workflow runs...")
    runs_data = gh_get(f"/repos/{REPO}/actions/runs?per_page=20")
    failed_runs = [
        r for r in runs_data.get("workflow_runs", []) if r.get("conclusion") == "failure"
    ]

    print("Fetching open issues...")
    issues_data = gh_get(f"/repos/{REPO}/issues?state=open&per_page=20")
    issue_count = len(issues_data)

    print("Fetching recent commits...")
    commits_data = gh_get(f"/repos/{REPO}/commits?per_page=10")
    recent_commit = ""
    if commits_data:
        c = commits_data[0]
        sha = c.get("sha", "")[:7]
        msg = c.get("commit", {}).get("message", "").split("\n")[0]
        dt = c.get("commit", {}).get("author", {}).get("date", "")
        recent_commit = f"{sha} | {msg} | {dt}"

    today = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    next_triage = (datetime.now(timezone.utc) + timedelta(days=1)).strftime(
        "%Y-%m-%dT%H:%M:%SZ"
    )

    lines = []
    lines.append("# Daily Triage Report")
    lines.append("")
    lines.append(f"**Generated:** {today}")
    lines.append("")
    lines.append("## 1. High-Priority Items (act on these)")
    lines.append("")

    if failed_runs:
        lines.append("### CI/Workflow Failures")
        lines.append(
            "- **Impact:** Broken CI blocks merges and may indicate regressions"
        )
        lines.append(
            "- **Suggested action:** Investigate failing workflows, draft minimal fix in isolated worktree"
        )
        lines.append("- **Effort:** Medium")
        lines.append("")
        lines.append("| Workflow | Date | Link |")
        lines.append("|----------|------|------|")
        for r in failed_runs:
            wf = r.get("name", "")
            dt = r.get("created_at", "")
            url = r.get("html_url", "")
            lines.append(f"| {wf} | {dt} | [link]({url}) |")
        lines.append("")
    else:
        lines.append("- None detected — all recent workflows passed.")
        lines.append("")

    lines.append("## 2. Watch Items (monitor, do not act yet)")
    lines.append("")

    if issue_count > 0:
        lines.append(
            f"- **Open issues:** {issue_count} issues need team attention"
        )
        lines.append(
            "- **Suggested action:** Review and label incoming issues weekly"
        )
        lines.append("- **Effort:** Low")
        lines.append("")

    lines.append("- Monitor dependency updates and game asset changes")
    lines.append("")

    lines.append("## 3. Noise / Ignore")
    lines.append("")
    lines.append("- Routine commits and non-critical workflow noise")
    lines.append("")

    lines.append("## 4. State Updates")
    lines.append("")
    if recent_commit:
        lines.append(f"- Latest commit: {recent_commit}")
    else:
        lines.append("- No recent commits detected")
    lines.append(f"- Next triage: {next_triage}")
    lines.append("")

    report = "\n".join(lines)

    os.makedirs(os.path.dirname(REPORT_FILE) or ".", exist_ok=True)
    with open(REPORT_FILE, "w", encoding="utf-8") as f:
        f.write(report)

    print(f"Triage report generated at {REPORT_FILE}")


if __name__ == "__main__":
    main()
