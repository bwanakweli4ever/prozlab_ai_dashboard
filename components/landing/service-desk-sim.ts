/**
 * A replay of a sample day on the help desk, driven by a simulated clock.
 * Pure functions only, so the homepage (React) and static previews can share it.
 */

export type DeskStatus = "waiting" | "helping" | "scheduled" | "onsite" | "resolved"

export type DeskTicket = {
  num: number
  subject: string
  area: string
  /** Client type and US city, e.g. "Dental clinic · Austin, TX". */
  client: string
  onSite: boolean
  /** Simulated minutes of work before the ticket resolves. */
  fixMinutes: number
  status: DeskStatus
  openedAt: number
  startedAt?: number
  resolvedAt?: number
}

export type DeskState = {
  elapsedMs: number
  lastEventMs: number
  eventCount: number
  tickets: DeskTicket[]
  poolIndex: number
  nextNum: number
  resolvedToday: number
}

type TicketTemplate = { subject: string; area: string; client: string; fixMinutes: number; onSite?: boolean }

/** Simulated clock starts at 10:42 AM Eastern (minutes since midnight). */
export const SIM_START = 10 * 60 + 42
/** One simulated minute passes every 1.5 real seconds. */
export const MS_PER_SIM_MINUTE = 1500
export const TICK_MS = 500
export const EVENT_EVERY_MS = 2500
export const ENGINEERS_ONLINE = 2
export const MAX_ROWS = 5
const MAX_WAITING = 2

const POOL: TicketTemplate[] = [
  { subject: "QuickBooks won't open after a Windows update", area: "Help desk", client: "Accounting firm · Columbus, OH", fixMinutes: 6 },
  { subject: "Phishing email asking to change a wire transfer", area: "Security", client: "Title company · Scottsdale, AZ", fixMinutes: 5 },
  { subject: "Square POS terminal offline at the register", area: "Field expert", client: "Restaurant · Portland, OR", fixMinutes: 10, onSite: true },
  { subject: "Teams calls dropping for remote staff", area: "Help desk", client: "Nonprofit · Chicago, IL", fixMinutes: 7 },
  { subject: "Website contact form not reaching the inbox", area: "Web", client: "Landscaping company · Raleigh, NC", fixMinutes: 9 },
  { subject: "VPN won't connect from a home office", area: "Network", client: "Insurance agency · Charlotte, NC", fixMinutes: 6 },
  { subject: "Restore a deleted project folder from yesterday", area: "Backup", client: "Construction company · Phoenix, AZ", fixMinutes: 4 },
  { subject: "Cracked laptop screen, needs a swap today", area: "Field expert", client: "Law firm · Boston, MA", fixMinutes: 9, onSite: true },
  { subject: "Set up Microsoft 365 for two new hires", area: "Sys admin", client: "Medical practice · Atlanta, GA", fixMinutes: 8 },
  { subject: "AI receptionist: add Thanksgiving hours", area: "AI agent", client: "Dental clinic · San Diego, CA", fixMinutes: 6 },
]

export const INITIAL_DESK_STATE: DeskState = {
  elapsedMs: 0,
  lastEventMs: 0,
  eventCount: 0,
  poolIndex: 0,
  nextNum: 1047,
  resolvedToday: 14,
  tickets: [
    { num: 1046, subject: "Outlook not syncing on the front-desk PC", area: "Help desk", client: "Dental clinic · Austin, TX", onSite: false, fixMinutes: 5, status: "waiting", openedAt: SIM_START - 1 },
    { num: 1045, subject: "Comcast outage: switch to backup internet", area: "Network", client: "Law firm · Denver, CO", onSite: false, fixMinutes: 9, status: "helping", openedAt: SIM_START - 9, startedAt: SIM_START - 6 },
    { num: 1044, subject: "Install Wi-Fi access points in the new suite", area: "Field expert", client: "Real estate office · Tampa, FL", onSite: true, fixMinutes: 10, status: "scheduled", openedAt: SIM_START - 25 },
    { num: 1043, subject: "HIPAA-compliant email for a new hire", area: "Sys admin", client: "Medical practice · Nashville, TN", onSite: false, fixMinutes: 8, status: "helping", openedAt: SIM_START - 14, startedAt: SIM_START - 3 },
    { num: 1042, subject: "Fake invoice email reported by staff", area: "Security", client: "Property manager · Dallas, TX", onSite: false, fixMinutes: 11, status: "resolved", openedAt: SIM_START - 40, startedAt: SIM_START - 39, resolvedAt: SIM_START - 28 },
  ],
}

export function simNow(state: DeskState): number {
  return SIM_START + Math.floor(state.elapsedMs / MS_PER_SIM_MINUTE)
}

export function formatClock(minutesSinceMidnight: number): string {
  const h24 = Math.floor(minutesSinceMidnight / 60) % 24
  const m = minutesSinceMidnight % 60
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12
  return `${h12}:${String(m).padStart(2, "0")} ${h24 < 12 ? "AM" : "PM"}`
}

export function formatMinutes(n: number): string {
  return n <= 0 ? "just now" : `${n} min`
}

function oldestBy(list: DeskTicket[], key: (t: DeskTicket) => number): DeskTicket | undefined {
  return list.reduce<DeskTicket | undefined>((best, t) => (best === undefined || key(t) < key(best) ? t : best), undefined)
}

function update(state: DeskState, num: number, patch: Partial<DeskTicket>): DeskTicket[] {
  return state.tickets.map((t) => (t.num === num ? { ...t, ...patch } : t))
}

/** A free engineer picks up the longest-waiting request, so nobody waits while someone is idle. */
function pickUp(state: DeskState): DeskState {
  const now = simNow(state)
  const busy = state.tickets.filter((t) => t.status === "helping").length
  if (busy >= ENGINEERS_ONLINE) return state
  const next = oldestBy(
    state.tickets.filter((t) => t.status === "waiting" && now - t.openedAt >= 1),
    (t) => t.openedAt,
  )
  return next ? { ...state, tickets: update(state, next.num, { status: "helping", startedAt: now }) } : state
}

/** Progress existing work: dispatch on site or resolve. Returns null when nothing is ready. */
function progressWork(state: DeskState): DeskState | null {
  const now = simNow(state)
  const tickets = state.tickets

  // Field experts work independently of the remote engineers, so a booked visit never waits on them.
  const visit = oldestBy(
    tickets.filter((t) => t.status === "scheduled" && now - t.openedAt >= 3),
    (t) => t.openedAt,
  )
  if (visit && !tickets.some((t) => t.status === "onsite")) {
    return { ...state, tickets: update(state, visit.num, { status: "onsite", startedAt: now }) }
  }

  const finished = oldestBy(
    tickets.filter(
      (t) => (t.status === "helping" || t.status === "onsite") && t.startedAt !== undefined && now - t.startedAt >= t.fixMinutes,
    ),
    (t) => t.startedAt ?? 0,
  )
  if (finished) {
    return { ...state, resolvedToday: state.resolvedToday + 1, tickets: update(state, finished.num, { status: "resolved", resolvedAt: now }) }
  }

  return null
}

/** A new request comes in at the top of the queue. Returns null when the queue is already full. */
function arrive(state: DeskState): DeskState | null {
  const now = simNow(state)
  const tickets = state.tickets
  if (tickets.filter((t) => t.status === "waiting").length >= MAX_WAITING) return null

  const template = POOL[state.poolIndex % POOL.length]
  const arrival: DeskTicket = {
    num: state.nextNum,
    subject: template.subject,
    area: template.area,
    client: template.client,
    onSite: Boolean(template.onSite),
    fixMinutes: template.fixMinutes,
    status: template.onSite ? "scheduled" : "waiting",
    openedAt: now,
  }
  let list = [arrival, ...tickets]
  while (list.length > MAX_ROWS) {
    const resolved = list.filter((t) => t.status === "resolved")
    const drop = oldestBy(resolved.length > 0 ? resolved : list, (t) => t.num)
    list = list.filter((t) => t !== drop)
  }
  return { ...state, tickets: list, poolIndex: state.poolIndex + 1, nextNum: state.nextNum + 1 }
}

/** One thing happens per event. Arrivals and work alternate so the queue stays busy. */
function runEvent(state: DeskState): DeskState {
  const arrivalTurn = state.eventCount % 2 === 1
  const first = arrivalTurn ? arrive : progressWork
  const second = arrivalTurn ? progressWork : arrive
  const next = first(state) ?? second(state) ?? state
  return { ...next, eventCount: state.eventCount + 1 }
}

/** Advance the replay by one tick; runs an event whenever enough time has passed. */
export function tickDesk(state: DeskState): DeskState {
  const elapsedMs = state.elapsedMs + TICK_MS
  const advanced = pickUp({ ...state, elapsedMs })
  if (elapsedMs - state.lastEventMs < EVENT_EVERY_MS) return advanced
  return { ...runEvent(advanced), lastEventMs: elapsedMs }
}

export function deskCounts(state: DeskState) {
  return {
    waiting: state.tickets.filter((t) => t.status === "waiting").length,
    helping: state.tickets.filter((t) => t.status === "helping" || t.status === "onsite").length,
    resolvedToday: state.resolvedToday,
  }
}
