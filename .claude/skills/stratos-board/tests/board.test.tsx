import { expect, mock, test } from 'claude-code/testing'
import type { Engine } from 'claude-code/testing'
import type { On } from 'claude-code'

import {
  daysToSaturday,
  makersOf,
  nextIssue,
  parseNumbers,
  projectName,
  projectRows,
  shortName,
  summarize,
  taskCount,
} from '../hooks/board'

const PANE = {
  plugin: 'stratos-board',
  component: 'Pane',
  requestId: 'stratos-board',
  props: {
    title: 'Stratos board',
    isFocused: false,
    bodyColumns: 100,
    placement: 'dock',
    scroll: { offset: 0, bodyRows: 60 },
    view: {},
  },
} as const

/** /board as the person types it. */
const BOARD = {
  command: 'board',
  args: '',
  origin: { kind: 'composer' },
  presentation: { isFullscreen: true, columns: 160 },
} as const

// Thursday 12 November 2026, midday UTC: a Thursday in every time zone.
const THURSDAY = Date.UTC(2026, 10, 12, 12, 0, 0)

const GAMES = ['Mdsadee527', 'Mdsadee527-mega-ramp', 'im-mohua-liza', 'notes']
const SITE = { hidden_on_live: { Mdsadee527: 'no cover', 'Mdsadee527-mega-ramp': 'no restart' } }
const ISSUES = [
  { number: 7, title: 'Stratos analytics for your games', state: 'OPEN', assignees: [{ login: 'Mdsadee527' }], labels: [] },
  { number: 13, title: 'Old bug', state: 'CLOSED', assignees: [{ login: 'im-mohua-liza' }], labels: [] },
  { number: 33, title: 'Staging check', state: 'OPEN', assignees: [], labels: [] },
  { number: 34, title: 'Mega Ramp: no restart (hidden from live)', state: 'OPEN', assignees: [{ login: 'im-mohua-liza' }, { login: 'Mdsadee527' }], labels: [] },
  { number: 35, title: 'Racing Mania: needs a cover (hidden from live)', state: 'CLOSED', assignees: [{ login: 'im-mohua-liza' }, { login: 'Mdsadee527' }], labels: [] },
]

const NUMBERS = {
  version: 1,
  at: '2026-11-12T09:17:00Z',
  dailyPlayers: { today: 42, week: 37.5, trend: [20, 30, 42] },
  avgMinutesPerPlayer: { today: 6.25, week: 5.5, trend: [5, 6, 6.25] },
  retentionD1: { today: 0.18, week: 0.21, trend: [0.2, 0.18] },
  retentionD7: { today: null, week: null, trend: null },
  retentionD30: { today: null, week: null, trend: null },
}

const PROJECTS = [
  {
    number: 73, title: 'Feature requirement: Stratos Coins, one coin for every game', state: 'OPEN',
    assignees: [{ login: 'sksarfarajali' }], body: '- [x] Wallet\n- [ ] Ledger\n  - [ ] Game API\n* [X] Earn rules',
  },
  {
    number: 74, title: 'Project: an always-online shooting game everyone can join', state: 'OPEN',
    assignees: [{ login: 'im-mohua-liza' }], body: 'No checklist yet',
  },
]

type Gh = { isDown: boolean; runs: number; numbers?: 'set' | 'unset' | 'broken' }

/** Stands for the engine: the repo's files, the `gh` command and the clock. */
function world(on: On, gh: Gh) {
  on('command.register', () => ({ value: { command: 'board' } }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('fs.list', () => ({
    value: GAMES.map(name => ({
      name,
      kind: 'dir' as const,
      size: 0,
      mtimeMs: 0,
      isLink: false,
    })),
  }))
  // "notes" is a folder with no game.json: not a game.
  on('fs.exists', (_, e) => ({ value: !e.path.includes('games/notes/') }))
  on('fs.read', () => ({ value: JSON.stringify(SITE) }))
  on('process.run', (_, e) => {
    gh.runs += 1
    if (e.argv.includes('--label')) {
      return {
        value: {
          exitCode: gh.isDown ? 1 : 0,
          stdout: gh.isDown ? '' : JSON.stringify(PROJECTS),
          stderr: '',
          isStdoutTruncated: false,
          isStderrTruncated: false,
        },
      }
    }
    if (e.argv.includes('api')) {
      const state = gh.isDown ? 'broken' : (gh.numbers ?? 'unset')

      return {
        value: {
          exitCode: state === 'set' ? 0 : 1,
          stdout: state === 'set' ? JSON.stringify(NUMBERS) : '',
          stderr: state === 'unset' ? 'gh: Not Found (HTTP 404)' : 'gh: HTTP 502',
          isStdoutTruncated: false,
          isStderrTruncated: false,
        },
      }
    }

    return {
      value: {
        exitCode: gh.isDown ? 1 : 0,
        stdout: gh.isDown ? '' : JSON.stringify(ISSUES),
        stderr: '',
        isStdoutTruncated: false,
        isStderrTruncated: false,
      },
    }
  })

  return mock.clock(on, { now: THURSDAY })
}

test('the board shows the numbers it read, on every surface', async ($, on) => {
  const gh = { isDown: false, runs: 0 }
  world(on, gh)

  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  const ran = await $.command.run(BOARD)
  expect(ran.text).toContain('Live games 1/3')
  expect(ran.text).toContain('issues fixed 2/5')

  for (const surface of ['terminal', 'desktop', 'vscode', 'mobile'] as const) {
    const ui = await $.ui.mount({ ...PANE, surface })

    expect(await ui.find({ type: 'Text', text: /STRATOS\.GAMES · GROW/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /updated \d+ Nov \d\d:\d\d/ })).toBeDefined()
    // No numbers stored yet: the rows wait, and that is not "offline".
    expect(await ui.find({ type: 'Text', text: /waiting for the first numbers/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /web ads not live yet/ })).toBeDefined()
    // 3 games built, 2 hidden.
    expect(await ui.find({ type: 'Text', text: /1\/3/ })).toBeDefined()
    // Sadee: his hidden game comes before his older analytics issue.
    expect(await ui.find({ type: 'Text', text: /#34 Mega Ramp/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /#7 analytics/ })).toBe(undefined)
    // Mohua: nothing open and one fixed.
    expect(await ui.find({ type: 'Text', text: /keep building/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /✅/ })).toBeDefined()
    // One of the two hidden games is retested; both are still hidden.
    expect(await ui.find({ type: 'Text', text: /1\/2 retested/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /0\/1 site fixes/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /#33/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /Saturday release: 2 days/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /9 hidden games back live 1\/2/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /offline/ })).toBe(undefined)
    // Big projects, under the objective: lead, name, checklist progress.
    expect(await ui.find({ type: 'Text', text: /BIG PROJECTS/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /#73 Stratos Coins/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /#74 an always-online/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /^Sarfaraj/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /2\/4$/ })).toBeDefined()
    await ui.unmount()
  }
})

test('a source that fails keeps the last numbers and says offline', async ($, on) => {
  const gh = { isDown: false, runs: 0 }
  world(on, gh)

  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  await $.command.run(BOARD)
  gh.isDown = true
  const ran = await $.command.run(BOARD)
  expect(ran.text).toContain('issues fixed 2/5')
  expect(ran.text).toContain('Offline: GitHub issues')

  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect(await ui.find({ type: 'Text', text: /offline: GitHub issues/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /#34 Mega Ramp/ })).toBeDefined()
  await ui.unmount()
})

test('the board refreshes itself every 10 minutes', async ($, on) => {
  const gh = { isDown: false, runs: 0 }
  const clock = world(on, gh)

  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  await clock.settle()
  // Each refresh runs gh three times: issues, projects, player numbers.
  expect(gh.runs).toBe(3)
  await clock.advance(10 * 60 * 1000)
  expect(gh.runs).toBe(6)
  await clock.advance(10 * 60 * 1000)
  expect(gh.runs).toBe(9)
})

const BAND = {
  plugin: 'stratos-board',
  component: 'AbovePrompt',
  requestId: 'band',
  props: {
    hasSurvey: false,
    isCollapsed: false,
    isWorking: false,
    maxRows: 3,
    bodyColumns: 120,
    scroll: { offset: 0, bodyRows: 3 },
    view: {},
  },
} as const

/** The band's one line, as the person reads it. */
async function bandLine(
  $: Engine,
  bodyColumns: number,
): Promise<string> {
  const ui = await $.ui.mount({
    ...BAND,
    props: { ...BAND.props, bodyColumns },
    surface: 'terminal',
  })
  const texts = await ui.findAll({ type: 'Text' })
  await ui.unmount()

  return texts[0]?.text ?? ''
}

test('the band shows one line, the same for everyone', async ($, on) => {
  world(on, { isDown: false, runs: 0 })

  expect(await bandLine($, 140)).toContain('board loading…')

  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  await $.command.run(BOARD)

  // Doing first, then to do; the hidden games card carries its progress.
  expect(await bandLine($, 140)).toBe(
    'STRATOS  Live 1/3 ███░░░░░░░  Fixed 2/5  ·  Mission: 9 games back 1/2 ▸ · AdSense ○ · Ads live ○' +
      '  ·  Sat release 2d  ·  /board',
  )
  // Narrower: the mission shortens, then parts are dropped from the right.
  expect(await bandLine($, 104)).toBe(
    'STRATOS  Live 1/3 ███░░░░░░░  Fixed 2/5  ·  Mission: 9 games back 1/2 ▸  ·  Sat release 2d  ·  /board',
  )
  expect(await bandLine($, 76)).toBe(
    'STRATOS  Live 1/3 ███░░░░░░░  Fixed 2/5  ·  Mission: 9 games back 1/2 ▸',
  )
  expect(await bandLine($, 30)).toBe('STRATOS  Live 1/3 ███░░░░░░░')
})

test('issues count for the maker, not for Mohua as tester', async () => {
  const issue = (number: number, isOpen: boolean, assignees: string[], labels: string[] = []) => ({
    number, title: `Issue ${number}`, isOpen, assignees, labels,
  })

  expect(makersOf(issue(1, true, ['im-mohua-liza', 'saiqulmodi']))).toEqual(['saiqulmodi'])
  expect(makersOf(issue(2, true, ['im-mohua-liza']))).toEqual(['im-mohua-liza'])
  expect(makersOf(issue(3, true, ['sahilmodi1965']))).toEqual([])

  const view = summarize({
    updatedAt: 0,
    folders: ['saiqulmodi', 'saiqulmodi-poker', 'someone-new'],
    hidden: ['saiqulmodi-poker'],
    issues: [
      issue(1, true, ['im-mohua-liza', 'saiqulmodi']),
      issue(2, true, ['im-mohua-liza']),
      issue(3, true, ['sahilmodi1965']),
      issue(4, true, [], ['objective', 'doing']),
      issue(5, false, [], ['objective']),
    ],
    projects: [],
    numbers: null,
    offline: [],
  })

  expect(view.makers.map(maker => maker.name)).toEqual(['Mohua', 'Saiqul', 'someone-new'])
  expect(view.makers[1]).toMatchObject({ liveGames: 1, builtGames: 2, openIssues: 1, next: '#1 Issue 1' })
  expect(view.siteFixes).toEqual({ done: 1, total: 3 })
  expect(view.openSiteIssues).toEqual([3, 4])
  expect(view.makers.some(maker => maker.login === 'sahilmodi1965')).toBe(false)
  // Issues labelled `objective` take the place of the placeholder cards.
  expect(view.cards).toEqual([
    { column: 'doing', text: '#4 Issue 4', short: '#4 Issue 4' },
    { column: 'done', text: '#5 Issue 5', short: '#5 Issue 5' },
  ])
})

test('next to fix: a hidden game first, analytics last', async () => {
  const issue = (number: number, title: string) => ({
    number, title, isOpen: true, assignees: ['saiqulmodi'], labels: [],
  })
  const analytics = issue(11, 'Stratos analytics for your games (@saiqulmodi)')
  const cover = issue(20, 'BridgeWorks Campus uses the FAILSPAN cover photo')
  const fight = issue(38, 'Fight for Right: needs a home screen (hidden from live)')
  const poker = issue(42, 'Poker Arena: remove the sign-up (hidden from live)')

  expect(nextIssue([analytics, cover, poker, fight])).toBe(fight)
  expect(nextIssue([analytics, cover])).toBe(cover)
  expect(nextIssue([analytics])).toBe(analytics)
  expect(nextIssue([])).toBe(undefined)

  expect(shortName(fight)).toBe('#38 Fight for Right')
  expect(shortName(cover)).toBe('#20 BridgeWorks Campus uses the FAILSPAN cover photo')
  expect(shortName(analytics)).toBe('#11 analytics')
})

test('the Saturday countdown', async () => {
  expect(daysToSaturday(THURSDAY)).toBe(2)
  expect(daysToSaturday(THURSDAY + 2 * 86_400_000)).toBe(0)
  expect(daysToSaturday(THURSDAY + 3 * 86_400_000)).toBe(6)
})

test('the players rows show the numbers the workflow stored', async ($, on) => {
  const gh: Gh = { isDown: false, runs: 0, numbers: 'set' }
  world(on, gh)

  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  await $.command.run(BOARD)

  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect(await ui.find({ type: 'Text', text: /full days · read 12 Nov/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /^42\s*$/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /^38\s*$/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /^6\.3 min/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /^18%/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /^21%/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /offline/ })).toBe(undefined)
  await ui.unmount()

  // GitHub fails later: the last numbers stay, marked offline.
  gh.numbers = 'broken'
  const ran = await $.command.run(BOARD)
  expect(ran.text).toContain('Offline: player numbers')
  const again = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect(await again.find({ type: 'Text', text: /^42\s*$/ })).toBeDefined()
  await again.unmount()
})

test('stored numbers are read safely', async () => {
  const numbers = parseNumbers(JSON.stringify({ at: 'x', dailyPlayers: { today: 'lots', week: 3, trend: [1, 'a', 2] } }))
  expect(numbers.dailyPlayers).toEqual({ today: null, week: 3, trend: [1, 2] })
  expect(numbers.retentionD30).toEqual({ today: null, week: null, trend: null })
  expect(() => parseNumbers('[]')).toThrow()
})

test('big projects: checklist counted, open first, Sahil never a lead', async () => {
  expect(taskCount('- [x] a\n- [ ] b\n  * [X] c\ntext [ ] not a box')).toEqual({ done: 2, total: 3 })
  expect(projectName('Project: Online shooter')).toBe('Online shooter')
  expect(projectName('Feature requirement: Stratos Coins')).toBe('Stratos Coins')

  const rows = projectRows([
    { number: 9, title: 'Project: Old', isOpen: false, leads: ['saiqulmodi'], tasksDone: 3, tasksTotal: 3 },
    { number: 74, title: 'Project: Shooter', isOpen: true, leads: ['im-mohua-liza', 'sahilmodi1965'], tasksDone: 0, tasksTotal: 9 },
    { number: 80, title: 'Project: Nobody', isOpen: true, leads: ['sahilmodi1965'], tasksDone: 0, tasksTotal: 0 },
  ])
  expect(rows.map(row => row.number)).toEqual([74, 80, 9])
  expect(rows[0]?.leads).toBe('Mohua')
  expect(rows[1]?.leads).toBe('no lead yet')
})
