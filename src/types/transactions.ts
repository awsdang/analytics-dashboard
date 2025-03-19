

  export interface Transaction {
    id: string
    amount: number // In Iraqi Dinar (IQD)
    merchantId: string
    merchantName: string
    status: "completed" | "pending" | "failed" | "refunded"
    timestamp: string // ISO 8601 format
    userId: string
    currency: "IQD"
    location?: string // Optional Iraqi city
    previousTxId?: string // Optional: Links to previous transaction
  }
  
  export interface VolumeDataPoint {
    time: string
    volume: number
  }
  
  export interface ActivityHourData {
    day: number
    hour: number
    count: number
  }
  
  export interface TransactionData {
    transactions: Transaction[]
    totalVolume: number
    totalTransactions: number
    activeUsers: number
    failedTransactions: number
    volumeChange: number
    transactionChange: number
    userChange: number
    failedChange: number
    volumeOverTime: VolumeDataPoint[]
    topMerchants: Merchant[]
    activityByHour: ActivityHourData[]
}
  
export interface PaginatedMerchantsResponse {
    merchants: Merchant[]
    totalItems: number
    totalPages: number
    currentPage: number
}

export interface VolumeDataPoint {
    time: string
    volume: number // In IQD
}

export interface ActivityHourData {
    day: number // 0-6
    hour: number // 0-23
    count: number
}

export interface Merchant {
    id: string
    name: string
    transactionCount: number
    transactionVolume: number
    city?: string
    joinedDate?: string
}

export interface MerchantDetails extends Merchant {
    joinedDate: string
    contactEmail?: string
    contactPhone?: string
    address?: string
    category?: string
    status: "active" | "inactive" | "pending"
}

export interface MerchantTransactionData {
    transactions: Transaction[]
    totalVolume: number
    totalTransactions: number
    activeUsers: number
    failedTransactions: number
    volumeChange: number
    transactionChange: number
    userChange: number
    failedChange: number
    volumeOverTime: VolumeDataPoint[]
    activityByHour: ActivityHourData[]
}

export interface MerchantTransactionFilterOptions {
    minAmount?: number
    maxAmount?: number
    status?: string
    startDate?: string
    endDate?: string
    location?: string
}



export interface MerchantStatsData {
  totalVolume: number
  totalTransactions: number
  activeUsers: number
  averageTransactionTime: number
  volumeChange: number
  transactionChange: number
  userChange: number
  timeChange: number
}