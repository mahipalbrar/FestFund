import type { EventRecord, ExpenseRecord } from './types'

export type InsightTone = 'healthy' | 'warning' | 'critical' | 'over' | 'info'

export type BudgetHealth = {
  event: EventRecord
  spent: number
  utilization: number
  tone: Exclude<InsightTone, 'info'>
}

export type SmartInsight = {
  id: string
  tone: InsightTone
  title: string
  message: string
}

export function getBudgetHealth(events: EventRecord[], expenses: ExpenseRecord[]): BudgetHealth[] {
  return events.map((event) => {
    const spent = expenses.filter((expense) => expense.eventId === event.id).reduce((sum, expense) => sum + expense.amount, 0)
    const utilization = event.budget > 0 ? (spent / event.budget) * 100 : 0
    const tone: BudgetHealth['tone'] = utilization > 100 ? 'over' : utilization >= 90 ? 'critical' : utilization >= 70 ? 'warning' : 'healthy'
    return { event, spent, utilization, tone }
  })
}

export function getSmartInsights(events: EventRecord[], expenses: ExpenseRecord[]): SmartInsight[] {
  if (!events.length && !expenses.length) return []

  const insights: SmartInsight[] = []
  const health = getBudgetHealth(events, expenses)
  health.filter((item) => item.tone === 'over').forEach(({ event, spent }) => {
    insights.push({ id: `over-${event.id}`, tone: 'over', title: `${event.name} is over budget`, message: `Spending is ${formatCompact(spent - event.budget)} above the allocated budget.` })
  })
  health.filter((item) => item.tone === 'critical').forEach(({ event, spent, utilization }) => {
    insights.push({ id: `critical-${event.id}`, tone: 'critical', title: `${event.name} needs attention`, message: `${utilization.toFixed(0)}% of its budget is used (${formatCompact(spent)} spent).` })
  })
  health.filter((item) => item.tone === 'warning').forEach(({ event, utilization }) => {
    insights.push({ id: `warning-${event.id}`, tone: 'warning', title: `${event.name} is nearing its limit`, message: `${utilization.toFixed(0)}% of the event budget has been consumed.` })
  })

  const categoryTotals = new Map<string, number>()
  expenses.forEach((expense) => categoryTotals.set(expense.category, (categoryTotals.get(expense.category) ?? 0) + expense.amount))
  const rankedCategories = [...categoryTotals.entries()].sort((a, b) => b[1] - a[1])
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  if (rankedCategories.length && totalSpent > 0) {
    const [highest, highestAmount] = rankedCategories[0]
    if (rankedCategories.length === 1) {
      insights.push({ id: 'only-category', tone: 'info', title: `${highest} is currently your only recorded spending category`, message: `${formatCompact(highestAmount)} has been recorded in ${highest.toLowerCase()} so far.` })
    } else {
      const [lowest, lowestAmount] = rankedCategories[rankedCategories.length - 1]
      insights.push({ id: 'highest-category', tone: 'info', title: `${highest} is your largest spend`, message: `${highest} accounts for ${((highestAmount / totalSpent) * 100).toFixed(0)}% of total spending (${formatCompact(highestAmount)}).` })
      insights.push({ id: 'lowest-category', tone: 'healthy', title: `${lowest} is your smallest spend`, message: `${lowest} represents ${((lowestAmount / totalSpent) * 100).toFixed(0)}% of total spending (${formatCompact(lowestAmount)}).` })
    }
  }

  health.filter(({ utilization }) => utilization < 30 && events.length > 1).slice(0, 1).forEach(({ event, utilization }) => {
    insights.push({ id: `unused-${event.id}`, tone: 'healthy', title: `${event.name} has room to plan`, message: `Only ${utilization.toFixed(0)}% of this event's budget is currently allocated to expenses.` })
  })
  return insights.slice(0, 6)
}

function formatCompact(value: number) {
  return `₹${Math.round(value).toLocaleString('en-IN')}`
}
