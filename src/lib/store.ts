import { create } from "zustand"
import type { FilterOptions, TransactionSortOptions, MerchantSortOptions } from "@/types/dashboard"

interface StoreState {
    refreshInterval: number
    connectionStatus: "connected" | "connecting" | "disconnected"
    timeRange: "day" | "week" | "month" | "year"
    filters: FilterOptions
    searchQuery: string
    merchantSort: MerchantSortOptions
    transactionSort: TransactionSortOptions
    merchantId: string | null
    transactionId: string | null
    setRefreshInterval: (refreshInterval:number) => void
    setConnectionStatus: (status: "connected" | "connecting" | "disconnected") => void
    setTimeRange: (timeRange: "day" | "week" | "month" | "year") => void
    setFilters: (filters: Partial<FilterOptions>) => void
    setSearchQuery: (searchQuery: string) => void
    setMerchantSort: (sort: MerchantSortOptions) => void
    setTransactionSort: (sort: TransactionSortOptions) => void
    setMerchantId: (merchantId: string | null) => void
    setTransactionId: (transactionId: string | null) => void
    resetFilters: () => void
}

export const useStore = create<StoreState>((set) => ({
    refreshInterval: 2000,
    connectionStatus: "connecting",
    timeRange: "week",
    filters: {
        minAmount: undefined,
        maxAmount: undefined,
        status: "all",
        startDate: undefined,
        endDate: undefined,
        location: undefined,
        merchantId: undefined,
    },
    searchQuery: "",
    merchantSort: {
        field: "transactionVolume",
        direction: "desc",
    },
    transactionSort: {
        field: "timestamp",
        direction: "desc",
    },
    merchantId: null,
    transactionId: null,
    setRefreshInterval: (refreshInterval) => set({ refreshInterval }),
    setConnectionStatus: (status) => set({ connectionStatus: status }),
    setTimeRange: (timeRange) => set({ timeRange }),
    setFilters: (newFilters) =>
        set((state) => ({
            filters: {
                ...state.filters,
                ...newFilters,
            },
        })),
    setSearchQuery: (searchQuery) => set({ searchQuery }),
    setMerchantSort: (merchantSort) => set({ merchantSort }),
    setTransactionSort: (transactionSort) => set({ transactionSort }),
    setMerchantId: (merchantId) => set({ merchantId }),
    setTransactionId: (transactionId) => set({ transactionId }),
    resetFilters: () =>
        set({
            filters: {
                minAmount: undefined,
                maxAmount: undefined,
                status: "all",
                startDate: undefined,
                endDate: undefined,
                location: undefined,
                merchantId: undefined,
            },
        }),
}))

