export const expenseCategories = ['Food', 'Marketing', 'Equipment', 'Venue', 'Decoration', 'Prizes', 'Miscellaneous'] as const
export type ExpenseCategory = typeof expenseCategories[number]

export type EventRecord = {
  id: string
  name: string
  societyName: string
  date: string
  budget: number
  description: string
}

export type ExpenseRecord = {
  id: string
  title: string
  amount: number
  eventId: string
  category: ExpenseCategory
  vendor: string
  date: string
  notes: string
}

export type EventForm = Omit<EventRecord, 'id' | 'budget'> & { budget: string }
export type ExpenseForm = Omit<ExpenseRecord, 'id' | 'amount'> & { amount: string }
