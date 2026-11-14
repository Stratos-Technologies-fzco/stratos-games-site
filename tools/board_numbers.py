#!/usr/bin/env python3
"""Player numbers for the team board, read from Stratos analytics (GA4).

Run by .github/workflows/board-numbers.yml. Reads the GA4 property behind
Firebase project stratos-analytics-497908 (read only) and prints one small
JSON object to stdout. The workflow stores it in the repo variable
BOARD_NUMBERS, which every teammate's board reads.

Needs an OAuth access token with the analytics.readonly scope in
GA_ACCESS_TOKEN. Uses the standard library only.

Every number is about full days (up to yesterday, in the property's time
zone), so the board is the same for everyone all day.
"""

import json
import os
import sys
import urllib.error
import urllib.request
from datetime import date, datetime, timedelta, timezone

PROPERTY = os.environ.get("GA_PROPERTY", "561723361")
API = f"https://analyticsdata.googleapis.com/v1beta/properties/{PROPERTY}"
TREND = 14  # days drawn on the board
COHORT_BATCH = 12  # GA4 takes at most 12 cohorts per report


def call(method, body):
    req = urllib.request.Request(
        f"{API}:{method}",
        data=json.dumps(body).encode(),
        headers={
            "Authorization": f"Bearer {os.environ['GA_ACCESS_TOKEN']}",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as res:
            return json.load(res)
    except urllib.error.HTTPError as err:
        sys.exit(f"GA4 {method} failed: {err.code} {err.read().decode()[:400]}")


def rows(report):
    for row in report.get("rows", []):
        dims = [d["value"] for d in row.get("dimensionValues", [])]
        mets = [float(m["value"]) for m in row.get("metricValues", [])]
        yield dims, mets


def row_of(values, week):
    """One board row: the latest full day, the 7-day figure, the trend."""
    if not values:
        return {"today": None, "week": None, "trend": None}
    return {
        "today": round(values[-1], 4),
        "week": None if week is None else round(week, 4),
        "trend": [round(v, 4) for v in values[-TREND:]],
    }


def daily():
    """Daily players and minutes per player, one value per full day."""
    report = call("runReport", {
        "dateRanges": [{"startDate": f"{TREND}daysAgo", "endDate": "yesterday"}],
        "dimensions": [{"name": "date"}],
        "metrics": [{"name": "activeUsers"}, {"name": "userEngagementDuration"}],
        "orderBys": [{"dimension": {"dimensionName": "date"}}],
        "keepEmptyRows": True,
    })
    days = [(dims[0], mets[0], mets[1]) for dims, mets in rows(report)]
    # The last row is yesterday in the property's own time zone.
    yesterday = datetime.strptime(days[-1][0], "%Y%m%d").date() if days else None
    # Days before analytics went live have no players: leave them out.
    while days and days[0][1] == 0:
        days.pop(0)
    players = [p for _, p, _ in days]
    minutes = [(s / 60 / p) if p else 0 for _, p, s in days]

    last7 = days[-7:]
    sum_players = sum(p for _, p, _ in last7)
    sum_seconds = sum(s for _, _, s in last7)
    return yesterday, (
        row_of(players, sum_players / len(last7) if last7 else None),
        row_of(minutes, sum_seconds / 60 / sum_players if sum_players else None),
    )


def retention(yesterday: date):
    """Share of new players back on day 1, 7 and 30, per day they arrived.

    A cohort is the players whose first visit was k days ago. Its day-n
    number is complete once day n is over: k - n >= 1.
    """
    wanted = {1: range(2, 2 + TREND), 7: range(8, 8 + TREND), 30: range(31, 31 + TREND)}
    offsets = sorted({k for ks in wanted.values() for k in ks})

    total = {}  # k -> players who arrived k days ago
    back = {}  # (k, n) -> of them, active on day n
    for start in range(0, len(offsets), COHORT_BATCH):
        batch = offsets[start:start + COHORT_BATCH]
        report = call("runReport", {
            "dimensions": [{"name": "cohort"}, {"name": "cohortNthDay"}],
            "metrics": [{"name": "cohortActiveUsers"}, {"name": "cohortTotalUsers"}],
            "cohortSpec": {
                "cohorts": [{
                    "name": f"k{k}",
                    "dimension": "firstSessionDate",
                    # Cohort dates must be YYYY-MM-DD: k days ago is yesterday - (k - 1).
                    "dateRange": {"startDate": str(yesterday - timedelta(days=k - 1)),
                                  "endDate": str(yesterday - timedelta(days=k - 1))},
                } for k in batch],
                "cohortsRange": {"granularity": "DAILY", "startOffset": 0, "endOffset": 30},
            },
        })
        for dims, mets in rows(report):
            k, n = int(dims[0][1:]), int(dims[1])
            total[k] = mets[1]
            back[(k, n)] = mets[0]

    result = {}
    for n, ks in wanted.items():
        # Oldest first; cohorts with nobody in them (before launch) are left out.
        ks = [k for k in sorted(ks, reverse=True) if total.get(k)]
        shares = [back.get((k, n), 0) / total[k] for k in ks]
        last7 = ks[-7:]
        arrived = sum(total[k] for k in last7)
        returned = sum(back.get((k, n), 0) for k in last7)
        result[n] = row_of(shares, returned / arrived if arrived else None)
    return result


def main():
    yesterday, (players, minutes) = daily()
    if yesterday is None:
        sys.exit("GA4 returned no days at all")
    back = retention(yesterday)
    print(json.dumps({
        "version": 1,
        "at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "dailyPlayers": players,
        "avgMinutesPerPlayer": minutes,
        "retentionD1": back[1],
        "retentionD7": back[7],
        "retentionD30": back[30],
    }, separators=(",", ":")))


if __name__ == "__main__":
    main()
