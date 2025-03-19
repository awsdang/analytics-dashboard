import { Transaction, Merchant, MerchantDetails, PaginatedMerchantsResponse, TransactionData } from '@/types/transactions'
import { FilterOptions, TransactionSortOptions, MerchantSortOptions, PaginationOptions, UseWebSocketProps, PaginatedLedgerResponse } from '@/types/dashboard'
import { iraqiMerchants } from './data';
import { generateCoherentTransaction, generateVolumeOverTime, generateActivityByHour, calculatePercentageChange, generateMerchants } from './api-utils'

// Mock API Class
class DashboardAPIClass {
  public merchants: Merchant[] = [];
  private static instance: DashboardAPIClass;
  private ws: WebSocket | null = null;
  private listeners: Map<string, ((data: TransactionData) => void)[]> = new Map();
  public ledger: Transaction[] = [];
  private previousData: TransactionData | null = null;
  public merchantCache: Map<string, Merchant> = new Map();
  public currentTime: Date; // Simulated current time
  private previousPeriodData: {
    totalVolume: number;
    totalTransactions: number;
    activeUsers: number;
    failedTransactions: number;
  } = {
      totalVolume: 0,
      totalTransactions: 0,
      activeUsers: 0,
      failedTransactions: 0,
    };

  private constructor() {
    this.previousData
    // Initialize simulated current time to real current date (March 17, 2025)
    this.currentTime = new Date("2025-03-17T00:00:00Z");
    this.merchants = generateMerchants(50)
    // Initialize ledger with historical data relative to currentTime
    this.ledger = [];
    iraqiMerchants.forEach((merchant) => {
      for (let daysBack = 0; daysBack < 365; daysBack++) {
        const txCount = Math.floor(Math.random() * 3) + 1; // 1-3 transactions per day per merchant
        for (let j = 0; j < txCount; j++) {
          const txTime = new Date(this.currentTime);
          txTime.setDate(txTime.getDate() - daysBack);
          txTime.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0, 0);
          this.ledger.push(generateCoherentTransaction(merchant.id, merchant.name, txTime.toISOString()));
        }
      }
    });

    // Sort ledger by timestamp (newest first)
    this.ledger.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Initialize previous period data
    this.initializeMerchantCache();
    this.calculatePreviousPeriodData();
  }

  private updateLedgerAndCache(newTransactions: Transaction[]) {
    newTransactions.forEach((txn) => {
      this.ledger.unshift(txn); // Add to start of ledger
      this.updateMerchantCache(txn); // Update cache
    });
    if (this.ledger.length > 10000) {
      const removedTxns = this.ledger.splice(10000); // Remove old transactions
      this.recomputeMerchantCacheForRemovedTxns(removedTxns);
    }
  }

  private recomputeMerchantCacheForRemovedTxns(removedTxns: Transaction[]) {
    removedTxns.forEach((txn) => {
      const merchant = this.merchantCache.get(txn.merchantId);
      if (merchant) {
        merchant.transactionCount -= 1;
        merchant.transactionVolume -= txn.amount;
        if (merchant.transactionCount <= 0) {
          this.merchantCache.delete(txn.merchantId);
        }
      }
    });
  }

  private initializeMerchantCache() {
    this.merchantCache.clear();
    this.ledger.forEach((txn) => {
      this.updateMerchantCache(txn);
    });
  }

  private updateMerchantCache(txn: Transaction) {
    const merchantId = txn.merchantId;
    let merchant = this.merchantCache.get(merchantId);

    if (!merchant) {
      const extra = this.merchants.find(m => m.id === merchantId);
      merchant = {
        id: merchantId,
        name: txn.merchantName,
        transactionCount: 0,
        transactionVolume: 0,
        city: extra?.city || "",
        joinedDate: extra?.joinedDate || new Date(0).toISOString(),
      };
      this.merchantCache.set(merchantId, merchant);
    }

    merchant.transactionCount += 1;
    merchant.transactionVolume += txn.amount;
  }


  private calculatePreviousPeriodData() {
    const currentPeriodStart = new Date(this.currentTime.getTime() - 7 * 24 * 60 * 60 * 1000); // Last 7 days
    const previousPeriodStart = new Date(this.currentTime.getTime() - 14 * 24 * 60 * 60 * 1000); // 7-14 days ago

    const previousPeriodTxs = this.ledger.filter(
      (tx) => new Date(tx.timestamp) >= previousPeriodStart && new Date(tx.timestamp) < currentPeriodStart
    );

    this.previousPeriodData = {
      totalVolume: previousPeriodTxs.reduce((sum, tx) => sum + tx.amount, 0),
      totalTransactions: previousPeriodTxs.length,
      activeUsers: new Set(previousPeriodTxs.map((tx) => tx.userId)).size,
      failedTransactions: previousPeriodTxs.filter((tx) => tx.status === "failed").length,
    };
  }

  public static getInstance(): DashboardAPIClass {
    if (!DashboardAPIClass.instance) {
      DashboardAPIClass.instance = new DashboardAPIClass();
    }
    return DashboardAPIClass.instance;
  }

  private computeTransactionData(
    newTransactions: Transaction[] = [],
    timeRange: "day" | "week" | "month" | "year" = "week"
  ): TransactionData {
    if (newTransactions.length > 0) {
      this.ledger = [...newTransactions, ...this.ledger];
      this.updateLedgerAndCache(newTransactions)
      if (this.ledger.length > 20) {
        this.ledger = this.ledger.slice(0, 20);
      }
    }

    const transactions = this.ledger

    // Use currentTime instead of new Date()
    let currentPeriodStart: Date;
    switch (timeRange) {
      case "day":
        currentPeriodStart = new Date(this.currentTime.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "week":
        currentPeriodStart = new Date(this.currentTime.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        currentPeriodStart = new Date(this.currentTime.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "year":
        currentPeriodStart = new Date(this.currentTime.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        currentPeriodStart = new Date(this.currentTime.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const currentPeriodTxs = transactions.filter(
      (tx) => new Date(tx.timestamp) >= currentPeriodStart && new Date(tx.timestamp) <= this.currentTime
    );

    const totalVolume = currentPeriodTxs.reduce((sum, txn) => sum + txn.amount, 0);
    const totalTransactions = currentPeriodTxs.length;
    const activeUsers = new Set(currentPeriodTxs.map((txn) => txn.userId)).size;
    const failedTransactions = currentPeriodTxs.filter((txn) => txn.status === "failed").length;

    const volumeChange = calculatePercentageChange(totalVolume, this.previousPeriodData.totalVolume);
    const transactionChange = calculatePercentageChange(totalTransactions, this.previousPeriodData.totalTransactions);
    const userChange = calculatePercentageChange(activeUsers, this.previousPeriodData.activeUsers);
    const failedChange = calculatePercentageChange(failedTransactions, this.previousPeriodData.failedTransactions);

    const volumeOverTime = generateVolumeOverTime(transactions, timeRange, this.currentTime);
    const topMerchants = this.merchants;
    const activityByHour = generateActivityByHour(transactions, timeRange, this.currentTime);

    const data: TransactionData = {
      transactions: this.ledger.sort().slice(0, 40),
      totalVolume,
      totalTransactions,
      activeUsers,
      failedTransactions,
      volumeChange,
      transactionChange,
      userChange,
      failedChange,
      volumeOverTime,
      topMerchants,
      activityByHour,
    };

    this.previousData = { ...data };
    return data;
  }

  public async fetchTransactionData(
    timeRange: "day" | "week" | "month" | "year" = "week",
    filter: FilterOptions = {}
  ): Promise<TransactionData> {
    try {
      let filteredLedger = [...this.ledger];

      // Use currentTime instead of new Date()
      let startDate: Date;
      switch (timeRange) {
        case "day":
          startDate = new Date(this.currentTime.getTime() - 24 * 60 * 60 * 1000);
          break;
        case "week":
          startDate = new Date(this.currentTime.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          startDate = new Date(this.currentTime.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "year":
          startDate = new Date(this.currentTime.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(this.currentTime.getTime() - 7 * 24 * 60 * 60 * 1000);
      }

      filteredLedger = filteredLedger.filter((tx) => new Date(tx.timestamp) >= startDate);

      if (filter.minAmount !== undefined) {
        filteredLedger = filteredLedger.filter((tx) => tx.amount >= filter.minAmount!);
      }
      if (filter.maxAmount !== undefined) {
        filteredLedger = filteredLedger.filter((tx) => tx.amount <= filter.maxAmount!);
      }
      if (filter.status && filter.status !== "all") {
        filteredLedger = filteredLedger.filter((tx) => tx.status === filter.status);
      }
      if (filter.location) {
        filteredLedger = filteredLedger.filter((tx) => tx.location === filter.location);
      }
      if (filter.merchantId) {
        filteredLedger = filteredLedger.filter((tx) => tx.merchantId === filter.merchantId);
      }

      const originalLedger = this.ledger;
      this.ledger = filteredLedger;
      const data = this.computeTransactionData([], timeRange);
      this.ledger = originalLedger;
      return data;
    } catch (error) {
      console.error("Failed to fetch transaction data:", error);
      return this.getFallbackData();
    }
  }

  public async fetchPaginatedLedger(
    pagination: PaginationOptions,
    filter: FilterOptions = {},
    sort?: TransactionSortOptions
  ): Promise<PaginatedLedgerResponse> {
    try {
      let result = [...this.ledger];

      if (filter.minAmount !== undefined) {
        result = result.filter((txn) => txn.amount >= filter.minAmount!);
      }
      if (filter.maxAmount !== undefined) {
        result = result.filter((txn) => txn.amount <= filter.maxAmount!);
      }
      if (filter.status && filter.status !== "all") {
        result = result.filter((txn) => txn.status === filter.status);
      }
      if (filter.startDate) {
        result = result.filter((txn) => new Date(txn.timestamp) >= new Date(filter.startDate!));
      }
      if (filter.endDate) {
        result = result.filter((txn) => new Date(txn.timestamp) <= new Date(filter.endDate!));
      }
      if (filter.merchantId) {
        result = result.filter((txn) => txn.merchantId === filter.merchantId);
      }
      if (filter.location) {
        result = result.filter((txn) => txn.location === filter.location);
      }

      if (sort) {
        result.sort((a, b) => {
          const aValue = a[sort.field];
          const bValue = b[sort.field];
          if (typeof aValue === "string" && typeof bValue === "string") {
            return sort.direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
          }
          if (typeof aValue === "number" && typeof bValue === "number") {
            return sort.direction === "asc" ? aValue - bValue : bValue - aValue;
          }
          return 0;
        });
      }

      const totalItems = result.length;
      const totalPages = Math.ceil(totalItems / pagination.limit);
      const startIndex = (pagination.page - 1) * pagination.limit;
      const endIndex = startIndex + pagination.limit;
      const paginatedTransactions = result.slice(startIndex, endIndex);

      return {
        transactions: paginatedTransactions,
        totalItems,
        totalPages,
        currentPage: pagination.page,
      };
    } catch (error) {
      console.error("Failed to fetch paginated ledger:", error);
      return { transactions: [], totalItems: 0, totalPages: 0, currentPage: pagination.page };
    }
  }

  public async searchLedger(query: string): Promise<Transaction[]> {
    try {
      const lowerQuery = query.toLowerCase();
      return this.ledger.filter((txn) =>
        [txn.id, txn.merchantName, txn.userId, txn.location || "", txn.status].some((field) =>
          field.toLowerCase().includes(lowerQuery)
        )
      );
    } catch (error) {
      console.error("Failed to search ledger:", error);
      return [];
    }
  }

  public connectWebSocket({
    onMessage,
    reconnectInterval = 5000,
    maxReconnectAttempts = 5,
    filters = {},
    timeRange = "week",
    merchantId,
    refreshInterval = 1000,
  }: UseWebSocketProps & { merchantId?: string }) {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    const currentFilters = { ...filters };
    let currentTimeRange = timeRange;

    const simulateWebSocket = () => {
      this.ws = {
        send: (data: string) => {
          try {
            const parsedData = JSON.parse(data);
            if (parsedData.type === "updateFilters") {
              Object.keys(parsedData.filters).forEach((key) => {
                currentFilters[key as keyof typeof currentFilters] = parsedData.filters[key];
              });
            }
            if (parsedData.type === "updateTimeRange") {
              currentTimeRange = parsedData.timeRange;
            }
          } catch (e) { }
        },
        close: () => {
          if (intervalId) {
            clearInterval(intervalId);
          }
        },
      } as any;

      const merchant = merchantId ? iraqiMerchants.find((m) => m.id === merchantId) : null;
      const intervalId = setInterval(() => {
        // Move time forward by 1 hour
        this.currentTime.setMilliseconds(this.currentTime.getMilliseconds() +  Math.round(Math.random()*10000000));
        const newTx = merchant
          ? generateCoherentTransaction(merchant.id, merchant.name, this.currentTime.toISOString())
          : generateCoherentTransaction(
            iraqiMerchants[Math.floor(Math.random() * iraqiMerchants.length)].id,
            iraqiMerchants[Math.floor(Math.random() * iraqiMerchants.length)].name,
            this.currentTime.toISOString()
          );
          

        this.updateLedgerAndCache([newTx]);


        let matchesFilters = true;
        if (currentFilters.minAmount !== undefined && newTx.amount < currentFilters.minAmount) {
          matchesFilters = false;
        }
        if (currentFilters.maxAmount !== undefined && newTx.amount > currentFilters.maxAmount) {
          matchesFilters = false;
        }
        if (
          currentFilters.status &&
          currentFilters.status !== "all" &&
          newTx.status !== currentFilters.status
        ) {
          matchesFilters = false;
        }
        if (currentFilters.location && newTx.location !== currentFilters.location) {
          matchesFilters = false;
        }

        let startDate: Date;
        switch (currentTimeRange) {
          case "day":
            startDate = new Date(this.currentTime.getTime() - 24 * 60 * 60 * 1000);
            break;
          case "week":
            startDate = new Date(this.currentTime.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case "month":
            startDate = new Date(this.currentTime.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case "year":
            startDate = new Date(this.currentTime.getTime() - 365 * 24 * 60 * 60 * 1000);
            break;
          default:
            startDate = new Date(this.currentTime.getTime() - 7 * 24 * 60 * 60 * 1000);
        }

        const txDate = new Date(newTx.timestamp);
        if (txDate < startDate) {
          matchesFilters = false;
        }

        if (matchesFilters) {
          const filteredData = this.computeFilteredData(currentFilters, currentTimeRange);
          if (onMessage) {
            onMessage({
              type: "newTransaction",
              transaction: newTx,
              updatedData: filteredData,
              matchesFilters: true,
            });
          }
          this.listeners.get(merchantId || "dashboard")?.forEach((listener) => listener(filteredData));
        } else if (onMessage) {
          onMessage({
            type: "newTransaction",
            transaction: newTx,
            matchesFilters: false,
          });
        }
      }, refreshInterval);

      (this.ws as any).intervalId = intervalId;
      if (!this.ws) return;

      this.ws.close = () => {
        // console.log("Closing WebSocket connection");
        clearInterval(intervalId);
      };
    };

    let attempts = 0;
    const connect = () => {
      try {
        simulateWebSocket();
      } catch (error) {
        console.error("Error connecting to WebSocket:", error);
        if (attempts < maxReconnectAttempts) {
          attempts++;
          console.log(`Reconnecting to WebSocket (attempt ${attempts}/${maxReconnectAttempts})...`);
          setTimeout(connect, reconnectInterval);
        } else {
          console.error("Max reconnect attempts reached");
        }
      }
    };

    connect();

    return this.ws!;
  }

  private computeFilteredData(filters: FilterOptions, timeRange: "day" | "week" | "month" | "year"): TransactionData {
    let filteredLedger = [...this.ledger];

    let startDate: Date;
    switch (timeRange) {
      case "day":
        startDate = new Date(this.currentTime.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "week":
        startDate = new Date(this.currentTime.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(this.currentTime.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "year":
        startDate = new Date(this.currentTime.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(this.currentTime.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    filteredLedger = filteredLedger.filter((tx) => new Date(tx.timestamp) >= startDate);

    if (filters.minAmount !== undefined) {
      filteredLedger = filteredLedger.filter((tx) => tx.amount >= filters.minAmount!);
    }
    if (filters.maxAmount !== undefined) {
      filteredLedger = filteredLedger.filter((tx) => tx.amount <= filters.maxAmount!);
    }
    if (filters.status && filters.status !== "all") {
      filteredLedger = filteredLedger.filter((tx) => tx.status === filters.status);
    }
    if (filters.location) {
      filteredLedger = filteredLedger.filter((tx) => tx.location === filters.location);
    }

    const originalLedger = this.ledger;
    this.ledger = filteredLedger;
    const data = this.computeTransactionData([], timeRange);
    this.ledger = originalLedger;

    return data;
  }

  public subscribeToUpdates(callback: (data: TransactionData) => void, merchantId?: string) {
    const key = merchantId || "dashboard";
    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }
    this.listeners.get(key)!.push(callback);
  }

  public unsubscribeFromUpdates(callback: (data: TransactionData) => void, merchantId?: string) {
    const key = merchantId || "dashboard";
    const listeners = this.listeners.get(key);
    if (listeners) {
      this.listeners.set(key, listeners.filter((listener) => listener !== callback));
    }
  }

  public async exportData(
    timeRange: "day" | "week" | "month" | "year" = "week",
    format: "csv" | "json",
    filter: FilterOptions = {},
    sort?: TransactionSortOptions,
    merchantId?: string,
    transactionId?: string
  ): Promise<string> {
    let transactions = [...this.ledger];
    
    // Filter by time range using this.currentTime
    let startDate: Date;
    switch (timeRange) {
      case "day":
        startDate = new Date(this.currentTime.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "week":
        startDate = new Date(this.currentTime.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(this.currentTime.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "year":
        startDate = new Date(this.currentTime.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(this.currentTime.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    
    transactions = transactions.filter((tx) => new Date(tx.timestamp) >= startDate);
    
    if (merchantId) {
      transactions = transactions.filter((tx) => tx.merchantId === merchantId);
    }
    if (transactionId) {
      transactions = transactions.filter((tx) => tx.id === transactionId);
    }

    if (filter.minAmount !== undefined) {
      transactions = transactions.filter((tx) => tx.amount >= filter.minAmount!);
    }
    if (filter.maxAmount !== undefined) {
      transactions = transactions.filter((tx) => tx.amount <= filter.maxAmount!);
    }
    if (filter.status && filter.status !== "all") {
      transactions = transactions.filter((tx) => tx.status === filter.status);
    }
    if (filter.startDate) {
      transactions = transactions.filter((tx) => new Date(tx.timestamp) >= new Date(filter.startDate!));
    }
    if (filter.endDate) {
      transactions = transactions.filter((tx) => new Date(tx.timestamp) <= new Date(filter.endDate!));
    }
    if (filter.merchantId && !merchantId) {
      transactions = transactions.filter((tx) => tx.merchantId === filter.merchantId);
    }
    if (filter.location) {
      transactions = transactions.filter((tx) => tx.location === filter.location);
    }

    if (sort) {
      transactions.sort((a, b) => {
        const aValue = a[sort.field];
        const bValue = b[sort.field];
        if (typeof aValue === "string" && typeof bValue === "string") {
          return sort.direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        if (typeof aValue === "number" && typeof bValue === "number") {
          return sort.direction === "asc" ? aValue - bValue : bValue - aValue;
        }
        return 0;
      });
    }

    if (format === "json") {
      return JSON.stringify({ transactions }, null, 2);
    } else {
      const headers = ["id", "amount", "merchantName", "status", "timestamp", "userId", "location", "currency"];
      const csvRows = [
        headers.join(","),
        ...transactions.map((txn) =>
          headers.map((header) => {
            const value = txn[header as keyof Transaction];
            if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value || "";
          }).join(",")
        ),
      ];
      return csvRows.join("\n");
    }
  }

  private getFallbackData(): TransactionData {
    return {
      transactions: [],
      totalVolume: 0,
      totalTransactions: 0,
      activeUsers: 0,
      failedTransactions: 0,
      volumeChange: 0,
      transactionChange: 0,
      userChange: 0,
      failedChange: 0,
      volumeOverTime: [],
      topMerchants: [],
      activityByHour: [],
    };
  }

  public disconnectWebSocket() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

}

// Export a singleton instance for use throughout the app
export const mockAPI = {
  getTransactionData: async (
    timeRange: "day" | "week" | "month" | "year" = "day",
    options?: { filter?: FilterOptions; sort?: TransactionSortOptions }
  ): Promise<TransactionData> => {
    const api = DashboardAPIClass.getInstance();
    return api.fetchTransactionData(timeRange, options?.filter || {});
  },

  getTransactionHistory: async (
    timeRange: "day" | "week" | "month" | "year" = "week",
    page = 1,
    pageSize = 10,
    filter: FilterOptions = {},
    sort?: TransactionSortOptions,
    searchQuery?: string
  ): Promise<PaginatedLedgerResponse> => {
    const api = DashboardAPIClass.getInstance();
    const currentTime = api.currentTime

    let startDate: Date;
    switch (timeRange) {
      case "day":
        startDate = new Date(currentTime.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "week":
        startDate = new Date(currentTime.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(currentTime.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "year":
        startDate = new Date(currentTime.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(currentTime.getTime() - 24 * 60 * 60 * 1000);
    }
    filter.startDate = startDate.toISOString();


    if (searchQuery && searchQuery.trim() !== "") {
      const searchResults = await api.searchLedger(searchQuery);
      let filteredResults = searchResults;

      if (filter.minAmount !== undefined) {
        filteredResults = filteredResults.filter((txn) => txn.amount >= filter.minAmount!);
      }
      if (filter.maxAmount !== undefined) {
        filteredResults = filteredResults.filter((txn) => txn.amount <= filter.maxAmount!);
      }
      if (filter.status && filter.status !== "all") {
        filteredResults = filteredResults.filter((txn) => txn.status === filter.status);
      }
      if (filter.startDate) {
        filteredResults = filteredResults.filter((txn) => new Date(txn.timestamp) >= new Date(filter.startDate!));
      }
      if (filter.endDate) {
        filteredResults = filteredResults.filter((txn) => new Date(txn.timestamp) <= new Date(filter.endDate!));
      }
      if (filter.location) {
        filteredResults = filteredResults.filter((txn) => txn.location === filter.location);
      }

      if (sort) {
        filteredResults.sort((a, b) => {
          const aValue = a[sort.field];
          const bValue = b[sort.field];
          if (typeof aValue === "string" && typeof bValue === "string") {
            return sort.direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
          }
          if (typeof aValue === "number" && typeof bValue === "number") {
            return sort.direction === "asc" ? aValue - bValue : bValue - aValue;
          }
          return 0;
        });
      }


      const totalItems = filteredResults.length;
      const totalPages = Math.ceil(totalItems / pageSize);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedTransactions = filteredResults.slice(startIndex, endIndex);


      return {
        transactions: paginatedTransactions,
        totalItems,
        totalPages,
        currentPage: page,
      };
    }
    return api.fetchPaginatedLedger({ page, limit: pageSize }, filter, sort);
  },

  exportData: async (
    timeRange: "day" | "week" | "month" | "year" = "week",
    format: "csv" | "json",
    filter: FilterOptions = {},
    sort?: TransactionSortOptions,
    merchantId?: string,
    transactionId?: string
  ): Promise<string> => {
    const api = DashboardAPIClass.getInstance();
    return api.exportData(timeRange, format, filter, sort, merchantId, transactionId);
  },

  connectWebSocket: (props: UseWebSocketProps): WebSocket => {
    const api = DashboardAPIClass.getInstance();
    return api.connectWebSocket(props) as WebSocket;
  },

  getTransactionById: async (id: string): Promise<Transaction | null> => {
    const api = DashboardAPIClass.getInstance();
    await new Promise((resolve) => setTimeout(resolve, 800));
    const transaction = api.ledger.find((tx) => tx.id === id);
    return transaction || null;
  },

  getMerchants: async (
    timeRange: "day" | "week" | "month" | "year" = "week",
    page: number = 1,
    pageSize: number = 10,
    filter: FilterOptions = {},
    sort?: MerchantSortOptions,
    searchQuery?: string
  ): Promise<PaginatedMerchantsResponse> => {
    const api = DashboardAPIClass.getInstance();
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay
  
    const currentTime = api.currentTime;
    let startDate: Date;
    switch (timeRange) {
      case "day":
        startDate = new Date(currentTime.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "week":
        startDate = new Date(currentTime.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(currentTime.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "year":
        startDate = new Date(currentTime.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(currentTime.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
  
    // Clone merchants from cache and filter by time range
    let merchants = Array.from(api.merchantCache.values()).map((merchant) => {
      const merchantTxns = api.ledger.filter(
        (txn) => txn.merchantId === merchant.id && new Date(txn.timestamp) >= startDate
      );
      return {
        ...merchant,
        transactionCount: merchantTxns.length,
        transactionVolume: merchantTxns.reduce((sum, txn) => sum + txn.amount, 0),
      };
    });
  
    // Apply filters
    if (searchQuery && searchQuery.trim() !== "") {
      merchants = merchants.filter(
        (m) => m.name.includes(searchQuery) || (m.city && m.city.includes(searchQuery))
      );
    }
    if (filter.minAmount !== undefined) {
      merchants = merchants.filter((m) => m.transactionVolume >= filter.minAmount!);
    }
    if (filter.maxAmount !== undefined) {
      merchants = merchants.filter((m) => m.transactionVolume <= filter.maxAmount!);
    }
    if (filter.status && filter.status !== "all") {
      merchants = merchants.filter((m) =>
        api.ledger.some(
          (txn) =>
            txn.merchantId === m.id &&
            txn.status === filter.status &&
            new Date(txn.timestamp) >= startDate
        )
      );
    }
    if (filter.startDate) {
      merchants = merchants.filter((m) =>
        api.ledger.some(
          (txn) => txn.merchantId === m.id && new Date(txn.timestamp) >= new Date(filter.startDate!)
        )
      );
    }
    if (filter.endDate) {
      merchants = merchants.filter((m) =>
        api.ledger.some(
          (txn) => txn.merchantId === m.id && new Date(txn.timestamp) <= new Date(filter.endDate!)
        )
      );
    }
    if (filter.name) {
      merchants = merchants.filter((m) => m.name === filter.name);
    }
    if (filter.city) {
      merchants = merchants.filter((m) => m.city === filter.city);
    }
  
    // Apply sorting
    if (sort) {
      merchants.sort((a, b) => {
        const aValue = a[sort.field];
        const bValue = b[sort.field];
        if (typeof aValue === "string" && typeof bValue === "string") {
          return sort.direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        if (typeof aValue === "number" && typeof bValue === "number") {
          return sort.direction === "asc" ? aValue - bValue : bValue - aValue;
        }
        return 0;
      });
    }
  
    // Pagination
    const totalItems = merchants.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedMerchants = merchants.slice(startIndex, endIndex);
    return {
      merchants: paginatedMerchants,
      totalItems,
      totalPages,
      currentPage: page,
    };
  },

  getMerchantById: async (id: string): Promise<MerchantDetails | null> => {
    const api = DashboardAPIClass.getInstance();
    await new Promise((resolve) => setTimeout(resolve, 800));
    const merchant = api.merchants.find((m) => m.id === id) || iraqiMerchants.find((m) => m.id === id);
    if (!merchant) return null;

    return {
      id: merchant.id,
      name: merchant.name,
      transactionCount: (merchant as any).transactionCount || 0,
      transactionVolume: (merchant as any).transactionVolume || 0,
      city: (merchant as any).city || "Baghdad",
      joinedDate: new Date((api as any).currentTime.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      contactEmail: `contact@${merchant.name.toLowerCase().replace(/\s+/g, "")}.iq`,
      contactPhone: `+964 ${Math.floor(Math.random() * 10000000)}`,
      address: "123 Main Street, " + ((merchant as any).city || "Baghdad"),
      category: ["Retail", "Food", "Electronics", "Services", "Healthcare"][Math.floor(Math.random() * 5)],
      status: "active",
    };
  },

  getMerchantStats: async (merchantId: string) => {
    const api = DashboardAPIClass.getInstance();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const transactions = api.ledger.filter((tx) => tx.merchantId === merchantId);
    return {
      totalVolume: transactions.reduce((sum, tx) => sum + tx.amount, 0),
      totalTransactions: transactions.length,
      activeUsers: new Set(transactions.map((tx) => tx.userId)).size,
      averageTransactionTime: Math.random() * 5 + 1,
      volumeChange: Math.floor(Math.random() * 40) - 20,
      transactionChange: Math.floor(Math.random() * 30) - 10,
      userChange: Math.floor(Math.random() * 25) - 5,
      timeChange: Math.floor(Math.random() * 30) - 20,
    };
  },

  exportMerchants: async (
    timeRange: "day" | "week" | "month" | "year" = "week",
    format: "csv" | "json",
    filter: FilterOptions = {},
    sort?: { field: keyof Merchant; direction: "asc" | "desc" }
  ): Promise<string> => {
    const result = await mockAPI.getMerchants(timeRange, 1, 1000, filter, sort);
    const merchants = result.merchants;

    if (format === "json") {
      return JSON.stringify({ merchants }, null, 2);
    } else {
      const headers = ["id", "name", "city", "transactionCount", "transactionVolume"];
      const csvRows = [
        headers.join(","),
        ...merchants.map((merchant) =>
          headers.map((header) => {
            const value = merchant[header as keyof Merchant];
            if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value || "";
          }).join(",")
        ),
      ];
      return csvRows.join("\n");
    }
  },
};