import { Transaction, Merchant } from "./transactions"

export interface FilterOptions {
    minAmount?: number
    maxAmount?: number
    status?: string
    startDate?: string // ISO 8601
    endDate?: string // ISO 8601
    merchantId?: string
    location?: string
    name?: string
    city?: string
  }
  
  export interface TransactionSortOptions {
    field: keyof Transaction 
    direction: "asc" | "desc"
  }

  export interface MerchantSortOptions {
    field: keyof Merchant
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
    merchantId: string | null
    transactionId: string | null
    setActivePage: (activePage:string) => void
    setTimeRange: (timeRange: "day" | "week" | "month" | "year") => void
    setFilters: (filters: Partial<FilterOptions>) => void
    setMerchantId: (merchantId: string | null) => void
    setTransactionId: (transactionId: string | null) => void
    resetFilters: () => void
  }
  
export interface UseWebSocketProps {
  onMessage?: (data: any) => void
  reconnectInterval?: number
  maxReconnectAttempts?: number
  filters?: FilterOptions
  timeRange?: "day" | "week" | "month" | "year"
  merchantId?: string
  refreshInterval?:number
  connectionStatus?: "connected" | "connecting" | "disconnected" ,
}
