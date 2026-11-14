// stratos-board: a pane beside the chat that shows how stratos.games grows.
//
// It reads shared sources only (the repo's games/ and site.json, and the
// repo's GitHub issues, and the player numbers the `board numbers` workflow
// stores in the repo variable BOARD_NUMBERS), so every teammate sees the
// same numbers. It
// refreshes when the session starts, every 10 minutes, and on /board.

import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, RenderChildren } from 'claude-code'

import type { StratosBoardData, StratosBoardIssue, StratosBoardNumbers } from '../types'
import {
  adMetrics,
  bar,
  cells,
  dateTime,
  daysToSaturday,
  firebaseMetrics,
  fit,
  HIDDEN_GAMES_CARD,
  MARKS,
  missionItems,
  OBJECTIVE,
  parseNumbers,
  percent,
  sparkline,
  summarize,
  TREND_DAYS,
} from './board'
import type { Card, Column, MetricRow, Progress } from './board'

const PANE = 'stratos-board'
const TITLE = 'Stratos board'
const REPO = 'Stratos-Technologies-fzco/stratos-games-site'
const REFRESH_MS = 10 * 60 * 1000
/** The widest the board draws, and the width it asks a docked pane for. */
const MAX_COLUMNS = 100
const OPEN = { id: PANE, title: TITLE, columns: MAX_COLUMNS } as const

const EMPTY: StratosBoardData = {
  updatedAt: null,
  folders: [],
  hidden: [],
  issues: [],
  numbers: null,
  offline: [],
}

// Change the tag when StratosBoardData changes: it declines what an earlier
// version stored, which outlives a reload.
const board = atom({ plugin: 'stratos-board', key: 'data' } as const, EMPTY, {
  shape: 'board-4',
})

// ---------------------------------------------------------------------------
// Reading the sources
// ---------------------------------------------------------------------------

/** Folders under games/ that hold a game.json. */
async function loadFolders($: EngineInterface): Promise<string[]> {
  const entries = await $.fs.list('games')
  const names = entries.filter(one => one.kind === 'dir').map(one => one.name)
  const isGame = await Promise.all(
    names.map(name => $.fs.exists(`games/${name}/game.json`)),
  )

  return names.filter((_, index) => isGame[index]).sort()
}

/** Folder names under `hidden_on_live` in site.json: the games not live. */
async function loadHidden($: EngineInterface): Promise<string[]> {
  const site: unknown = JSON.parse(await $.fs.read('site.json'))
  const hidden =
    typeof site === 'object' && site !== null && 'hidden_on_live' in site
      ? site.hidden_on_live
      : undefined

  return typeof hidden === 'object' && hidden !== null
    ? Object.keys(hidden)
    : []
}

type GhIssue = {
  number: number
  title: string
  state: string
  assignees?: { login: string }[]
  labels?: { name: string }[]
}

/** Every issue of the repo, through the `gh` command the team already uses. */
async function loadIssues($: EngineInterface): Promise<StratosBoardIssue[]> {
  const ran = await $.process.run(
    [
      'gh', 'issue', 'list',
      '--repo', REPO,
      '--state', 'all',
      '--limit', '200',
      '--json', 'number,title,state,assignees,labels',
    ],
    { timeoutMs: 20_000 },
  )
  if (ran.exitCode !== 0) throw new Error('gh could not list the issues')
  const listed = JSON.parse(ran.stdout) as GhIssue[]

  return listed
    .map(issue => ({
      number: issue.number,
      title: issue.title,
      isOpen: issue.state.toUpperCase() === 'OPEN',
      assignees: (issue.assignees ?? []).map(one => one.login),
      labels: (issue.labels ?? []).map(one => one.name),
    }))
    .sort((a, b) => a.number - b.number)
}

/**
 * The player numbers the `board numbers` workflow stored. Null while the
 * variable does not exist yet: that is not a failure, only not set up.
 */
async function loadNumbers($: EngineInterface): Promise<StratosBoardNumbers | null> {
  const ran = await $.process.run(
    ['gh', 'api', `repos/${REPO}/actions/variables/BOARD_NUMBERS`, '--jq', '.value'],
    { timeoutMs: 20_000 },
  )
  if (ran.exitCode !== 0) {
    if (/404|Not Found/i.test(ran.stderr)) return null
    throw new Error('gh could not read BOARD_NUMBERS')
  }

  return parseNumbers(ran.stdout)
}

/**
 * Reads every source and stores what it found. A source that fails keeps
 * its last values and is named in `offline`; this never throws.
 */
async function refresh($: EngineInterface): Promise<StratosBoardData> {
  const failed: string[] = []
  const attempt = async <T,>(
    source: string,
    load: () => Promise<T>,
  ): Promise<T | undefined> => {
    try {
      return await load()
    } catch {
      failed.push(source)

      return undefined
    }
  }

  try {
    const [folders, hidden, issues, numbers] = await Promise.all([
      attempt('games folder', () => loadFolders($)),
      attempt('site.json', () => loadHidden($)),
      attempt('GitHub issues', () => loadIssues($)),
      attempt('player numbers', () => loadNumbers($)),
    ])
    const isAnyRead = failed.length < 4
    const now = await $.clock.now()

    return await update($, board, last => ({
      updatedAt: isAnyRead ? now : last.updatedAt,
      folders: folders ?? last.folders,
      hidden: hidden ?? last.hidden,
      issues: issues ?? last.issues,
      numbers: numbers === undefined ? last.numbers : numbers,
      offline: failed,
    }))
  } catch {
    return read($, board)
  }
}

// ---------------------------------------------------------------------------
// The mod
// ---------------------------------------------------------------------------

export const register: Register = on => {
  let timer: { cancel: () => void } | undefined

  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'board',
      description: 'Open the Stratos board and refresh its numbers',
    })
    void $.ui.open(OPEN)

    // The first read is not awaited, so the session starts at once.
    void refresh($)
    timer?.cancel()
    timer = $.clock.every(REFRESH_MS, () => void refresh($))

    return next(e)
  })

  on('command.run', { command: 'board' }, async $ => {
    await $.ui.open(OPEN)
    const data = await refresh($)
    const view = summarize(data)
    const offline =
      data.offline.length > 0
        ? ` Offline: ${data.offline.join(', ')} (showing the last numbers).`
        : ''

    return {
      text:
        `Stratos board refreshed. Live games ${view.liveGames.done}/${view.liveGames.total}, ` +
        `issues fixed ${view.issuesFixed.done}/${view.issuesFixed.total}.${offline}`,
    }
  })

  // The band: one line above the prompt, at any terminal width.
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) return next(e)

    const { Box, Text } = $.ui.resolve(e)
    const data = await read($, board)
    if (data.updatedAt === null) {
      return (
        <Box>
          <Text>
            <Text color="claude" bold>STRATOS</Text>
            <Text dimColor> board loading…</Text>
          </Text>
        </Box>
      )
    }

    const now = await $.clock.now()
    const view = summarize(data)
    const { full, empty } = bar(view.liveGames, 10)
    const live = `Live ${view.liveGames.done}/${view.liveGames.total} `
    const fixed = `  Fixed ${view.issuesFixed.done}/${view.issuesFixed.total}`
    const days = daysToSaturday(now)
    const release = `Sat release ${days === 0 ? 'today' : `${days}d`}`
    const [firstMission, ...moreMissions] = missionItems(view)
    const SEPARATOR = '  ·  '

    // Left to right, most important first: what does not fit is dropped
    // from the right.
    const parts: { text: string; node: RenderChildren }[] = [
      { text: 'STRATOS', node: <Text bold color="claude">STRATOS</Text> },
      {
        text: `  ${live}${full}${empty}`,
        node: (
          <Text>
            {`  ${live}`}
            <Text color="claude">{full}</Text>
            <Text dimColor>{empty}</Text>
          </Text>
        ),
      },
      { text: fixed, node: fixed },
      ...(firstMission === undefined
        ? []
        : [{ text: `${SEPARATOR}Mission: ${firstMission}`, node: 'mission' }]),
      { text: SEPARATOR + release, node: SEPARATOR + release },
      { text: `${SEPARATOR}/board`, node: <Text dimColor>{`${SEPARATOR}/board`}</Text> },
    ]

    let room = e.props.bodyColumns
    const fitting: typeof parts = []
    for (const part of parts) {
      if (cells(part.text) > room) break
      room -= cells(part.text)
      fitting.push(part)
    }

    // The room left over goes to more of the mission, in the same order.
    const missions = firstMission === undefined ? [] : [firstMission]
    for (const item of moreMissions) {
      if (cells(` · ${item}`) > room) break
      room -= cells(` · ${item}`)
      missions.push(item)
    }
    const mission = (
      <Text>
        {SEPARATOR}
        <Text bold>Mission: </Text>
        {missions.join(' · ')}
      </Text>
    )
    const shown = fitting.map(part =>
      part.node === 'mission' ? mission : part.node,
    )

    return (
      <Box>
        <Text wrap="truncate-end">{shown}</Text>
      </Box>
    )
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    const data = await read($, board)
    const now = await $.clock.now()
    const view = summarize(data)

    // The box takes the pane's whole width, up to MAX_COLUMNS; `inner` is
    // the room inside its border and padding.
    const width = Math.min(MAX_COLUMNS, Math.max(48, e.props.bodyColumns))
    const inner = width - 4
    const isWide = inner >= 72

    // -- small pieces -------------------------------------------------------

    /** `text` in a table cell exactly `cells` wide. */
    const cell = (text: string, cells: number): string =>
      fit(text, cells).padEnd(cells)

    const rule = <Text dimColor>{'─'.repeat(inner)}</Text>

    const heading = (label: string, note?: string) => (
      <Text wrap="truncate-end">
        <Text bold color="claude">{label}</Text>
        {note ? <Text dimColor>{`  ${note}`}</Text> : ''}
      </Text>
    )

    /** A bar: the done part purple, the rest dim. */
    const barOf = (of: Progress, cells: number) => {
      const { full, empty } = bar(of, cells)

      return (
        <Text>
          <Text color="claude">{full}</Text>
          <Text dimColor>{empty}</Text>
        </Text>
      )
    }

    // -- SITE ---------------------------------------------------------------

    const siteBar = isWide ? 14 : 10
    const siteStat = (label: string, of: Progress) => (
      <Text wrap="truncate-end">
        {`${label} `}
        <Text bold>{`${of.done}/${of.total}`}</Text>{' '}
        {barOf(of, siteBar)}
        <Text dimColor>{` ${percent(of)}`}</Text>
      </Text>
    )

    // -- PLAYERS and MONEY: one table, today | 7 days | trend ---------------

    const LABEL = isWide ? 24 : 20
    const VALUE = 10
    const hasTrendRoom = inner >= LABEL + 2 * VALUE + TREND_DAYS

    const asCount = (n: number): string => String(Math.round(n))
    const asMinutes = (minutes: number): string =>
      `${minutes < 10 ? minutes.toFixed(1) : Math.round(minutes)} min`
    const asPercent = (share: number): string => `${Math.round(share * 100)}%`
    const asDollars = (dollars: number): string => `$${dollars.toFixed(2)}`

    /** A number that may not be known yet: `··` until it is. */
    const valueCell = (known: number | null, format: (n: number) => string) =>
      known === null ? (
        <Text dimColor>{cell('··', VALUE)}</Text>
      ) : (
        <Text bold>{cell(format(known), VALUE)}</Text>
      )

    const trendCell = (trend: readonly number[] | null) => {
      const drawn = sparkline(trend)

      return drawn === null ? (
        <Text dimColor>{'·'.repeat(TREND_DAYS)}</Text>
      ) : (
        <Text color="claude">{drawn.padStart(TREND_DAYS)}</Text>
      )
    }

    const numbersHeader = (
      <Text dimColor wrap="truncate-end">
        {cell('', LABEL) + cell('latest', VALUE) + cell('7 days', VALUE)}
        {hasTrendRoom ? 'trend (14 days)' : ''}
      </Text>
    )

    const numbersRow = (
      label: string,
      row: MetricRow,
      format: (n: number) => string,
    ) => (
      <Text wrap="truncate-end">
        {cell(label, LABEL)}
        {valueCell(row.today, format)}
        {valueCell(row.week, format)}
        {hasTrendRoom ? trendCell(row.trend) : ''}
      </Text>
    )

    // -- MAKERS -------------------------------------------------------------

    const NAME = isWide ? 12 : 9
    const RATIO = isWide ? 6 : 5
    const LIVE_BAR = 6
    const LIVE = RATIO + LIVE_BAR + 2
    const OPEN_CELLS = isWide ? 7 : 5
    const FIXED = isWide ? 9 : 7
    const NEXT = inner - NAME - LIVE - OPEN_CELLS - FIXED

    const makerRows = view.makers.map(maker => {
      const hasNoLiveGame = maker.liveGames === 0
      const isAllFixed = maker.openIssues === 0 && maker.fixedIssues > 0
      const live = { done: maker.liveGames, total: maker.builtGames }
      const warning = hasNoLiveGame ? 'warning' : undefined
      const next = isAllFixed ? 'keep building' : (maker.next ?? 'nothing open')

      return (
        <Text wrap="truncate-end">
          <Text color={warning} bold={hasNoLiveGame}>{cell(maker.name, NAME)}</Text>
          <Text color={warning}>
            {cell(`${maker.liveGames}/${maker.builtGames}`, RATIO)}
          </Text>
          {hasNoLiveGame ? (
            <Text color="warning">{'░'.repeat(LIVE_BAR)}</Text>
          ) : (
            barOf(live, LIVE_BAR)
          )}
          {'  '}
          <Text bold={maker.openIssues > 0}>
            {cell(String(maker.openIssues), OPEN_CELLS)}
          </Text>
          {/* The tick is two cells wide, as the two spaces in its place are. */}
          {`${String(maker.fixedIssues).padEnd(2)} ${isAllFixed ? '✅' : '  '}`.padEnd(FIXED - (isAllFixed ? 1 : 0))}
          <Text dimColor={maker.openIssues === 0}>{fit(next, NEXT)}</Text>
        </Text>
      )
    })

    // -- ADMIN --------------------------------------------------------------

    const ADMIN_LABEL = 17
    const ADMIN_COUNT = 16
    const days = daysToSaturday(now)
    const release =
      days === 0 ? 'today' : days === 1 ? '1 day' : `${days} days`
    const openSite = view.openSiteIssues
    const siteNumbers =
      openSite.slice(0, 5).map(number => `#${number}`).join(' ') +
      (openSite.length > 5 ? ' …' : '')

    /** A person, their count with a bar, and a note: at the right when wide. */
    const adminLine = (
      who: string,
      count: string,
      of: Progress,
      note: RenderChildren,
    ) => (
      <Box
        flexDirection={isWide ? 'row' : 'column'}
        justifyContent="space-between"
        width={inner}
      >
        <Text wrap="truncate-end">
          <Text bold>{cell(who, ADMIN_LABEL)}</Text>
          {cell(count, ADMIN_COUNT)}
          {barOf(of, 10)}
        </Text>
        <Text wrap="truncate-end">
          {isWide ? '' : ' '.repeat(ADMIN_LABEL)}
          {note}
        </Text>
      </Box>
    )

    // -- OBJECTIVE ----------------------------------------------------------

    const COLUMNS: { column: Column; label: string }[] = [
      { column: 'todo', label: 'To do' },
      { column: 'doing', label: 'Doing' },
      { column: 'done', label: 'Done' },
    ]
    const columnWidth = Math.floor(inner / COLUMNS.length)

    const cardText = (card: Card): string =>
      card.text === HIDDEN_GAMES_CARD
        ? `${card.text} ${view.retested.done}/${view.retested.total}`
        : card.text

    const objectiveColumns = COLUMNS.map(({ column, label }) => {
      const cards = view.cards.filter(card => card.column === column)

      return (
        <Box flexDirection="column" width={columnWidth} paddingRight={2}>
          <Text bold>{`${label} (${cards.length})`}</Text>
          <Text dimColor>{'─'.repeat(columnWidth - 2)}</Text>
          {cards.map(card => (
            // The mark stands in a cell of its own, so a long card wraps
            // under its words.
            <Box flexDirection="row">
              <Text color={column === 'doing' ? 'claude' : undefined} dimColor={column === 'done'}>
                {`${MARKS[column]} `}
              </Text>
              <Box width={columnWidth - 4}>
                <Text dimColor={column === 'done'}>{cardText(card)}</Text>
              </Box>
            </Box>
          ))}
        </Box>
      )
    })

    const players = firebaseMetrics(data.numbers)
    const readAt = data.numbers ? Date.parse(data.numbers.at) : Number.NaN
    const playersNote = Number.isNaN(readAt)
      ? 'waiting for the first numbers'
      : `full days · read ${dateTime(readAt)}`

    // -- the board, top to bottom -------------------------------------------

    const updated =
      data.updatedAt === null ? 'loading…' : `updated ${dateTime(data.updatedAt)}`

    return (
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor="claude"
        paddingX={1}
        width={width}
      >
        <Box flexDirection="row" justifyContent="space-between" width={inner}>
          <Text bold color="claude">STRATOS.GAMES · GROW</Text>
          <Text dimColor>{updated}</Text>
        </Box>
        {data.offline.length > 0 && (
          <Text dimColor wrap="truncate-end">
            {`offline: ${data.offline.join(', ')} · showing the last numbers`}
          </Text>
        )}

        {rule}
        <Box flexDirection={isWide ? 'row' : 'column'} columnGap={4} width={inner}>
          {siteStat('Live games', view.liveGames)}
          {siteStat('Issues fixed', view.issuesFixed)}
        </Box>

        {rule}
        {heading('PLAYERS (Firebase)', playersNote)}
        {numbersHeader}
        {numbersRow('Daily players', players.dailyPlayers, asCount)}
        {numbersRow('Avg time per player', players.avgMinutesPerPlayer, asMinutes)}
        {numbersRow('Day 1 back', players.retentionD1, asPercent)}
        {numbersRow('Day 7 back', players.retentionD7, asPercent)}
        {numbersRow('Day 30 back', players.retentionD30, asPercent)}
        <Text> </Text>
        {heading('MONEY', 'web ads not live yet')}
        {numbersRow('Ad revenue', adMetrics.revenue, asDollars)}

        {rule}
        {heading('MAKERS', 'most open issues first')}
        <Text dimColor wrap="truncate-end">
          {cell('NAME', NAME) + cell('LIVE', LIVE) + cell('OPEN', OPEN_CELLS) + cell('FIXED', FIXED) + 'NEXT'}
        </Text>
        {makerRows.length === 0 && <Text dimColor>No makers found yet.</Text>}
        {makerRows}

        {rule}
        {heading('ADMIN')}
        {adminLine(
          'Mohua · tests',
          `${view.retested.done}/${view.retested.total} retested`,
          view.retested,
          <Text>
            Saturday release: <Text bold>{release}</Text>
          </Text>,
        )}
        {adminLine(
          'Sahariar · site',
          `${view.siteFixes.done}/${view.siteFixes.total} site fixes`,
          view.siteFixes,
          <Text>
            {siteNumbers}
            <Text dimColor>{siteNumbers ? ' · provisional' : 'provisional'}</Text>
          </Text>,
        )}

        {rule}
        {heading(`OBJECTIVE · ${OBJECTIVE}`)}
        <Box flexDirection="row" width={inner}>
          {objectiveColumns}
        </Box>
      </Box>
    )
  })
}
