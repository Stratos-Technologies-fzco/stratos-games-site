// The board's numbers: pure functions over the facts a refresh collected.
// Nothing here touches the engine, so the same facts always give the same board.

import type { StratosBoardData, StratosBoardIssue } from '../types'

// ---------------------------------------------------------------------------
// The team
// ---------------------------------------------------------------------------

/** GitHub login -> the name the team uses. An unknown login shows as itself. */
export const DISPLAY_NAMES: Record<string, string> = {
  'im-mohua-liza': 'Mohua',
  saiqulmodi: 'Saiqul',
  sksarfarajali: 'Sarfaraj',
  Mdsadee527: 'Sadee',
  'sumaiyahsultana821-sys': 'Sumaiyah',
  nikhatenglish89: 'Nikhat',
  shoaibul0926: 'Shoaib',
  tamannamody: 'Tamanna',
  'mody-sahariar1': 'Sahariar',
  sahidmodi45: 'Sahid',
}

/** Sahil owns the site: he is not on the makers list. */
export const OWNER_LOGIN = 'sahilmodi1965'
/** Mohua tests other makers' games, so she is often a second assignee. */
export const TESTER_LOGIN = 'im-mohua-liza'
/** How an issue for a game taken off the live site is titled. */
export const HIDDEN_ISSUE_MARK = '(hidden from live)'
/** How each maker's "connect analytics" issue is titled: the least urgent. */
export const ANALYTICS_ISSUE_START = 'stratos analytics for your games'

// ---------------------------------------------------------------------------
// Placeholders: filled by a later version, with no layout change
// ---------------------------------------------------------------------------

/** One line of a numbers table: today, the last 7 days, and a 14-day trend. */
export type MetricRow = {
  today: number | null
  week: number | null
  /** One value per day, oldest first, 14 days. */
  trend: number[] | null
}

const NOT_YET: MetricRow = { today: null, week: null, trend: null }

/**
 * Player numbers from Firebase project `stratos-analytics-497908`.
 * Every value is null until the board can read Firebase; a value that is not
 * null is drawn as it is, so filling this object fills the pane.
 */
export const firebaseMetrics = {
  /** Players a day: today, and the 7-day average. */
  dailyPlayers: NOT_YET,
  /** Minutes a player spends a day. */
  avgMinutesPerPlayer: NOT_YET,
  /** Share of players who come back after 1, 7 and 30 days, 0 to 1. */
  retentionD1: NOT_YET,
  retentionD7: NOT_YET,
  retentionD30: NOT_YET,
} satisfies Record<string, MetricRow>

/** Ad money in US dollars. Null until web ads are live. */
export const adMetrics = {
  revenue: NOT_YET,
} satisfies Record<string, MetricRow>

export type Column = 'todo' | 'doing' | 'done'
export type Card = {
  text: string
  column: Column
  /** A few words for the one-line band; left out, the text cut short. */
  short?: string
}

/** The mark each column's cards carry, in the pane and in the band. */
export const MARKS: Record<Column, string> = { todo: '○', doing: '▸', done: '✓' }

export const OBJECTIVE = 'Grow stratos.games'
/** The card whose progress is the count of hidden games retested. */
export const HIDDEN_GAMES_CARD = '9 hidden games back live'

/**
 * The objective's cards until GitHub holds them: once any issue carries the
 * label `objective`, those issues are the cards instead.
 */
export const PLACEHOLDER_CARDS: Card[] = [
  { column: 'todo', text: 'AdSense approved', short: 'AdSense' },
  { column: 'todo', text: 'Ads live on page (rewarded first)', short: 'Ads live' },
  { column: 'todo', text: 'Ad consent choice', short: 'Ad consent' },
  { column: 'todo', text: 'Daily challenge + streak on site', short: 'Daily streak' },
  { column: 'doing', text: HIDDEN_GAMES_CARD, short: '9 games back' },
  { column: 'doing', text: 'Board reads Firebase (DAU, retention, time)', short: 'Firebase numbers' },
  { column: 'done', text: 'Stratos analytics on every page', short: 'Analytics' },
  { column: 'done', text: 'Staging site + Saturday release', short: 'Staging' },
]

// ---------------------------------------------------------------------------
// What the pane draws
// ---------------------------------------------------------------------------

export type Progress = { done: number; total: number }

export type MakerRow = {
  login: string
  name: string
  liveGames: number
  builtGames: number
  openIssues: number
  fixedIssues: number
  /** The open issue to fix first, as "#N short name"; null when none is open. */
  next: string | null
}

export type BoardView = {
  liveGames: Progress
  issuesFixed: Progress
  makers: MakerRow[]
  /** Issues titled "(hidden from live)" that are closed, out of all of them. */
  retested: Progress
  /** Issues with no maker on them. Provisional: a stand-in for site work. */
  siteFixes: Progress
  /** The open ones among them, lowest number first. */
  openSiteIssues: number[]
  cards: Card[]
}

/** The login a game folder belongs to: the folder is `X` or starts with `X-`. */
export function ownerOf(folder: string, logins: readonly string[]): string {
  const lower = folder.toLowerCase()
  // Longest first, so a login that is the start of another never wins.
  const byLength = [...logins].sort((a, b) => b.length - a.length)
  const owner = byLength.find(login => {
    const start = login.toLowerCase()

    return lower === start || lower.startsWith(`${start}-`)
  })

  return owner ?? folder
}

/**
 * The makers an issue counts for. Sahil never counts; Mohua counts only when
 * she is the one maker on it, since elsewhere she is the tester.
 */
export function makersOf(issue: StratosBoardIssue): string[] {
  const makers = issue.assignees.filter(login => login !== OWNER_LOGIN)
  const others = makers.filter(login => login !== TESTER_LOGIN)

  return others.length > 0 ? others : makers
}

const isHiddenIssue = (issue: StratosBoardIssue): boolean =>
  issue.title.toLowerCase().includes(HIDDEN_ISSUE_MARK)

const isAnalyticsIssue = (issue: StratosBoardIssue): boolean =>
  issue.title.toLowerCase().startsWith(ANALYTICS_ISSUE_START)

/** What to fix first: a hidden game, then anything else, analytics last. */
function urgency(issue: StratosBoardIssue): number {
  if (isHiddenIssue(issue)) return 0

  return isAnalyticsIssue(issue) ? 2 : 1
}

/** The open issue a maker should fix first; undefined when none is open. */
export function nextIssue(
  open: readonly StratosBoardIssue[],
): StratosBoardIssue | undefined {
  return [...open].sort(
    (a, b) => urgency(a) - urgency(b) || a.number - b.number,
  )[0]
}

/** "#N" and the game's name: the title up to its first colon. */
export function shortName(issue: StratosBoardIssue): string {
  if (isAnalyticsIssue(issue)) return `#${issue.number} analytics`
  const name = issue.title.split(':')[0] ?? issue.title

  return `#${issue.number} ${name.trim()}`
}

function cardsFrom(issues: readonly StratosBoardIssue[]): Card[] {
  const objectives = issues.filter(issue => issue.labels.includes('objective'))
  if (objectives.length === 0) return PLACEHOLDER_CARDS

  return objectives.map(issue => {
    const openColumn = issue.labels.includes('doing') ? 'doing' : 'todo'

    return {
      column: issue.isOpen ? openColumn : 'done',
      text: `#${issue.number} ${issue.title}`,
      short: `#${issue.number} ${fit(shortName(issue).replace(/^#\d+ /, ''), 14)}`,
    }
  })
}

/** Every number on the board, from the facts of the last refresh. */
export function summarize(data: StratosBoardData): BoardView {
  const { folders, issues } = data
  const hidden = new Set(data.hidden)
  const fixed = issues.filter(issue => !issue.isOpen)

  const assigned = issues.flatMap(makersOf)
  const knownLogins = [...new Set([...Object.keys(DISPLAY_NAMES), ...assigned])]
  const ownerByFolder = new Map(
    folders.map(folder => [folder, ownerOf(folder, knownLogins)] as const),
  )
  const logins = [...new Set([...ownerByFolder.values(), ...assigned])].filter(
    login => login !== OWNER_LOGIN,
  )

  const makers = logins.map((login): MakerRow => {
    const games = folders.filter(folder => ownerByFolder.get(folder) === login)
    const mine = issues.filter(issue => makersOf(issue).includes(login))
    const open = mine.filter(issue => issue.isOpen)
    const first = nextIssue(open)

    return {
      login,
      name: DISPLAY_NAMES[login] ?? login,
      liveGames: games.filter(folder => !hidden.has(folder)).length,
      builtGames: games.length,
      openIssues: open.length,
      fixedIssues: mine.length - open.length,
      next: first ? shortName(first) : null,
    }
  })
  // Most open issues first; then by name, so the order is the same everywhere.
  makers.sort(
    (a, b) => b.openIssues - a.openIssues || a.name.localeCompare(b.name),
  )

  const hiddenIssues = issues.filter(isHiddenIssue)
  const siteIssues = issues.filter(issue => makersOf(issue).length === 0)
  const openSiteIssues = siteIssues.filter(issue => issue.isOpen)

  return {
    liveGames: {
      done: folders.filter(folder => !hidden.has(folder)).length,
      total: folders.length,
    },
    issuesFixed: { done: fixed.length, total: issues.length },
    makers,
    retested: {
      done: hiddenIssues.filter(issue => !issue.isOpen).length,
      total: hiddenIssues.length,
    },
    siteFixes: {
      done: siteIssues.length - openSiteIssues.length,
      total: siteIssues.length,
    },
    openSiteIssues: openSiteIssues
      .map(issue => issue.number)
      .sort((a, b) => a - b),
    cards: cardsFrom(issues),
  }
}

/**
 * The band's mission items, short enough for one line: what the team is
 * doing first, then what is still to do. The same cards as the pane's.
 */
export function missionItems(view: BoardView): string[] {
  const inOrder = [
    ...view.cards.filter(card => card.column === 'doing'),
    ...view.cards.filter(card => card.column === 'todo'),
  ]

  return inOrder.map(card => {
    const progress =
      card.text === HIDDEN_GAMES_CARD
        ? ` ${view.retested.done}/${view.retested.total}`
        : ''

    return `${card.short ?? fit(card.text, 18)}${progress} ${MARKS[card.column]}`
  })
}

// ---------------------------------------------------------------------------
// Small text helpers
// ---------------------------------------------------------------------------

/** A bar of `width` cells for `done` out of `total`: its full and empty parts. */
export function bar(
  { done, total }: Progress,
  width: number,
): { full: string; empty: string } {
  const share = total > 0 ? Math.min(1, Math.max(0, done / total)) : 0
  const filled = Math.round(share * width)

  return { full: '█'.repeat(filled), empty: '░'.repeat(width - filled) }
}

export function percent({ done, total }: Progress): string {
  return total > 0 ? `${Math.round((done / total) * 100)}%` : '0%'
}

const SPARKS = '▁▂▃▄▅▆▇█'
export const TREND_DAYS = 14

/** A 14-day trend as one glyph per day; null when there are no numbers yet. */
export function sparkline(values: readonly number[] | null): string | null {
  if (!values || values.length === 0) return null
  const recent = values.slice(-TREND_DAYS)
  const low = Math.min(...recent)
  const span = Math.max(...recent) - low

  return recent
    .map(value => {
      const step = span === 0 ? 0 : (value - low) / span

      return SPARKS[Math.round(step * (SPARKS.length - 1))] ?? SPARKS[0]
    })
    .join('')
}

/** The cells `text` takes on screen: the tick is two wide. */
export function cells(text: string): number {
  return [...text].reduce((sum, letter) => sum + (letter === '✅' ? 2 : 1), 0)
}

/** Cuts `text` to `width` cells, ending in an ellipsis when it was cut. */
export function fit(text: string, width: number): string {
  if (width <= 0) return ''
  const letters = [...text]

  return letters.length <= width
    ? text
    : `${letters.slice(0, width - 1).join('').trimEnd()}…`
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

/** "12 Nov 14:05" in the computer's own time. */
export function dateTime(ms: number): string {
  const at = new Date(ms)
  const two = (n: number): string => String(n).padStart(2, '0')
  const month = MONTHS[at.getMonth()] ?? ''

  return `${at.getDate()} ${month} ${two(at.getHours())}:${two(at.getMinutes())}`
}

/** Days until the next Saturday release; 0 on a Saturday. */
export function daysToSaturday(ms: number): number {
  const SATURDAY = 6

  return (SATURDAY - new Date(ms).getDay() + 7) % 7
}
