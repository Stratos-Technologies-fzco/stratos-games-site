// The stratos-board contract: what the board keeps in `$.state`.
// Everything here is read from shared sources (the repo and GitHub), so
// every teammate's board computes the same numbers.

/** One GitHub issue, trimmed to what the board needs. */
export type StratosBoardIssue = {
  number: number
  title: string
  isOpen: boolean
  /** GitHub logins. */
  assignees: string[]
  /** Label names. */
  labels: string[]
}

/** One numbers row: the latest full day, the last 7 days, a 14-day trend. */
export type StratosBoardMetric = {
  today: number | null
  week: number | null
  /** One value per day, oldest first, up to 14. */
  trend: number[] | null
}

/**
 * Player numbers from Stratos analytics, as the `board numbers` workflow
 * stores them in the repo variable BOARD_NUMBERS.
 */
export type StratosBoardNumbers = {
  /** When the workflow read them, ISO time. */
  at: string
  dailyPlayers: StratosBoardMetric
  avgMinutesPerPlayer: StratosBoardMetric
  retentionD1: StratosBoardMetric
  retentionD7: StratosBoardMetric
  retentionD30: StratosBoardMetric
}

/** The raw facts of the last refresh. The pane computes its numbers from these. */
export type StratosBoardData = {
  /** When the last refresh finished, in milliseconds; null before the first. */
  updatedAt: number | null
  /** Folders under `games/` that hold a `game.json`. */
  folders: string[]
  /** Folder names listed under `hidden_on_live` in `site.json`. */
  hidden: string[]
  /** Every issue of the repo, open and closed. */
  issues: StratosBoardIssue[]
  /** Player numbers; null until the workflow first stored them. */
  numbers: StratosBoardNumbers | null
  /** The sources that failed at the last refresh; their last values are kept. */
  offline: string[]
}

declare module 'claude-code' {
  interface PluginState {
    'stratos-board': { data: Shaped<StratosBoardData> }
  }
}
