import type { EventRecord, ExpenseRecord } from './types'

const EVENTS_KEY = 'festfund-events'
const EXPENSES_KEY = 'festfund-expenses'
const INITIALIZED_KEY = 'festfund-storage-initialized'
const LEGACY_SEEDED_KEY = 'festfund-demo-seeded'

const demoEvents: EventRecord[] = [
  { id: 'demo-tech-workshop', name: 'Tech Workshop', societyName: 'Code Society', date: '2026-12-12', budget: 30000, description: 'Hands-on workshop for the society community.' },
  { id: 'demo-freshers-meetup', name: 'Freshers Meetup', societyName: 'Code Society', date: '2026-12-20', budget: 25000, description: 'A warm welcome for new members.' },
  { id: 'demo-coding-competition', name: 'Coding Competition', societyName: 'Code Society', date: '2027-01-05', budget: 20000, description: 'An inter-college coding challenge.' },
]

const demoExpenses: ExpenseRecord[] = [
  { id: 'demo-refreshments', title: 'Workshop refreshments', amount: 4500, eventId: 'demo-tech-workshop', category: 'Food', vendor: 'Campus Cafe', date: '2026-11-05', notes: 'Snacks and drinks for workshop attendees.' },
  { id: 'demo-posters', title: 'Event posters', amount: 2000, eventId: 'demo-tech-workshop', category: 'Marketing', vendor: 'Print House', date: '2026-11-04', notes: '' },
  { id: 'demo-equipment', title: 'Technical equipment', amount: 8000, eventId: 'demo-tech-workshop', category: 'Equipment', vendor: 'AV Rentals', date: '2026-11-03', notes: 'Projector and microphones.' },
  { id: 'demo-prizes', title: 'Certificates and prizes', amount: 3500, eventId: 'demo-coding-competition', category: 'Prizes', vendor: 'Awards Co.', date: '2026-11-01', notes: '' },
]

function read<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) as T : fallback
  } catch {
    return fallback
  }
}

export function loadData(): { events: EventRecord[]; expenses: ExpenseRecord[] } {
  const isInitialized = localStorage.getItem(INITIALIZED_KEY) === 'true' || localStorage.getItem(LEGACY_SEEDED_KEY) === 'true'
  const events = read<EventRecord[]>(EVENTS_KEY, isInitialized ? [] : demoEvents)
  const expenses = read<ExpenseRecord[]>(EXPENSES_KEY, isInitialized ? [] : demoExpenses)

  if (!isInitialized) {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events))
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses))
  }
  if (localStorage.getItem(INITIALIZED_KEY) !== 'true') {
    localStorage.setItem(INITIALIZED_KEY, 'true')
  }

  return { events, expenses }
}

export function saveData(events: EventRecord[], expenses: ExpenseRecord[]) {
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events))
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses))
  localStorage.setItem(INITIALIZED_KEY, 'true')
}

export function formatCurrency(value: number) {
  return `₹${Math.round(value).toLocaleString('en-IN')}`
}

export function formatDate(date: string) {
  if (!date) return 'No date'
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${date}T00:00:00`))
}

export function todayString() {
  return new Date().toISOString().slice(0, 10)
}
