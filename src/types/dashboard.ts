import { Transaction } from "./transactions"

export interface FilterOptions {
    minAmount?: number
    maxAmount?: number
    status?: string
    startDate?: string // ISO 8601
    endDate?: string // ISO 8601
    merchantId?: string
    location?: string
  }
  
  export interface SortOptions {
    field: keyof Transaction
    direction: "asc" | "desc"
  }

  export interface PaginationOptions {
    page: number // Page number (1-based)
    limit: number // Items per page
}

export interface PaginatedLedgerResponse {
  transactions: Transaction[]
  totalItems: number
  totalPages: number
  currentPage: number
}

export interface DashboardState {
    activePage: string;
    timeRange: "day" | "week" | "month" | "year"
    filters: FilterOptions
    sort: SortOptions
    merchantId: string | null
    transactionId: string | null
    setActivePage: (activePage:string) => void
    setTimeRange: (timeRange: "day" | "week" | "month" | "year") => void
    setFilters: (filters: Partial<FilterOptions>) => void
    setSort: (sort: SortOptions) => void
    setMerchantId: (merchantId: string | null) => void
    setTransactionId: (transactionId: string | null) => void
    resetFilters: () => void
  }
  
export interface UseWebSocketProps {
  url: string
  onMessage?: (data: any) => void
  reconnectInterval?: number
  maxReconnectAttempts?: number
  filters?: FilterOptions
  timeRange?: "day" | "week" | "month" | "year"
  merchantId?: string
}
