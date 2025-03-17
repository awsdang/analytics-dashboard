import { create } from "zustand"
import type { FilterOptions, SortOptions } from "@/types/dashboard"

interface StoreState {
    timeRange: "day" | "week" | "month" | "year"
    filters: FilterOptions
    searchQuery: string
    //   merchantSort: SortOptions
    //   transactionSort: SortOptions
    merchantId: string | null
    transactionId: string | null
    setTimeRange: (timeRange: "day" | "week" | "month" | "year") => void
    setFilters: (filters: Partial<FilterOptions>) => void
    setSearchQuery: (searchQuery: string) => void
    //   setMerchantSort: (sort: SortOptions) => void
    //   setTransactionSort: (sort: SortOptions) => void
    setMerchantId: (merchantId: string | null) => void
    setTransactionId: (transactionId: string | null) => void
    resetFilters: () => void
}

export const useStore = create<StoreState>((set) => ({
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
    //   merchantSort: {
    //     field: "timestamp",
    //     direction: "desc",
    //   },
    //   transactionSort: {
    //     field: "timestamp",
    //     direction: "desc",
    //   },
    merchantId: null,
    transactionId: null,
    setTimeRange: (timeRange) => set({ timeRange }),
    setFilters: (newFilters) =>
        set((state) => ({
            filters: {
                ...state.filters,
                ...newFilters,
            },
        })),
    setSearchQuery: (searchQuery) => set({ searchQuery }),
    //   setMerchantSort: (merchantSort) => set({ merchantSort }),
    //   setTransactionSort: (transactionSort) => set({ transactionSort }),
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

