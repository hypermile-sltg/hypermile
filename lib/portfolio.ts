export type PortfolioRecord = {
  id: string
  url: string
  title?: string
  createdAt?: string | { seconds: number; nanoseconds?: number } | null
}

function portfolioTimestamp(item: PortfolioRecord): number {
  const raw = item.createdAt
  if (!raw) return 0

  if (typeof raw === 'string') {
    const time = new Date(raw).getTime()
    return Number.isNaN(time) ? 0 : time
  }

  if (typeof raw === 'object' && 'seconds' in raw) {
    return raw.seconds * 1000
  }

  return 0
}

export function sortPortfolioNewestFirst<T extends PortfolioRecord>(items: T[]): T[] {
  return [...items].sort((a, b) => portfolioTimestamp(b) - portfolioTimestamp(a))
}
