import {Transaction, Merchant, MerchantDetails, PaginatedMerchantsResponse, MerchantFilterOptions, TransactionData} from '@/types/transactions'
import {FilterOptions, SortOptions, PaginationOptions, UseWebSocketProps, PaginatedLedgerResponse} from '@/types/dashboard'
import { iraqiMerchants } from './data';
import {generateCoherentTransaction, generateMerchantData, generateVolumeOverTime, generateActivityByHour, calculatePercentageChange, generateMerchants} from './api-utils'

// Mock API Class
class DashboardAPIClass {
  public merchants: Merchant[] = [];
  private static instance: DashboardAPIClass;
  private ws: WebSocket | null = null;
  private listeners: Map<string, ((data: TransactionData) => void)[]> = new Map();
  public ledger: Transaction[] = [];
  private previousData: TransactionData | null = null;
  private currentTime: Date; // Simulated current time
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
    // Initialize simulated current time to real current date (March 17, 2025)
    this.currentTime = new Date("2025-03-17T00:00:00Z");

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
    this.calculatePreviousPeriodData();
  }

  private calculatePreviousPeriodData() {
    const currentPeriodStart = new Date(this.currentTime.getTime() - 7 * 24 * 60 * 60 * 1000); // Last 7 days
    const previousPeriodStart = new Date(this.currentTime.getTime() - 14 * 24 * 60 * 60 * 1000); // 7-14 days ago

    const currentPeriodTxs = this.ledger.filter(
      (tx) => new Date(tx.timestamp) >= currentPeriodStart && new Date(tx.timestamp) <= this.currentTime
    );

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
      if (this.ledger.length > 500) {
        this.ledger = this.ledger.slice(0, 500);
      }
    }

    const transactions = this.ledger;

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

    const volumeOverTime = generateVolumeOverTime(transactions, timeRange);
    const topMerchants = generateMerchantData(transactions);
    const activityByHour = generateActivityByHour(transactions);

    const data: TransactionData = {
      transactions,
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
    sort?: SortOptions
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
    url,
    onMessage,
    reconnectInterval = 5000,
    maxReconnectAttempts = 5,
    filters = {},
    timeRange = "week",
    merchantId,
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
          } catch (e) {}
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
        this.currentTime.setHours(this.currentTime.getHours() + 1);

        const newTx = merchant
          ? generateCoherentTransaction(merchant.id, merchant.name, this.currentTime.toISOString())
          : generateCoherentTransaction(
              iraqiMerchants[Math.floor(Math.random() * iraqiMerchants.length)].id,
              iraqiMerchants[Math.floor(Math.random() * iraqiMerchants.length)].name,
              this.currentTime.toISOString()
            );
        this.ledger.unshift(newTx);

        if (this.ledger.length > 2000) this.ledger.pop();

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
      }, 5000);

      (this.ws as any).intervalId = intervalId;
      if (!this.ws) return;

      this.ws.close = () => {
        console.log("Closing WebSocket connection");
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
    if (!this.ws) return
    return this.ws as WebSocket;
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
    format: "csv" | "json",
    filter: FilterOptions = {},
    sort?: SortOptions,
    merchantId?: string,
    transactionId?: string
  ): Promise<string> {
    let transactions = [...this.ledger];
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
    options?: { filter?: FilterOptions; sort?: SortOptions }
  ): Promise<TransactionData> => {
    const api = DashboardAPIClass.getInstance();
    return api.fetchTransactionData(timeRange, options?.filter || {});
  },

  getTransactionHistory: async (
    page = 1,
    pageSize = 10,
    filter: FilterOptions = {},
    sort?: SortOptions,
    searchQuery?: string
  ): Promise<PaginatedLedgerResponse> => {
    const api = DashboardAPIClass.getInstance();

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
    format: "csv" | "json",
    filter: FilterOptions = {},
    sort?: SortOptions,
    merchantId?: string,
    transactionId?: string
  ): Promise<string> => {
    const api = DashboardAPIClass.getInstance();
    return api.exportData(format, filter, sort, merchantId, transactionId);
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

  getTransactionsByMerchant: async (merchantId: string, sort?: SortOptions): Promise<Transaction[]> => {
    const api = DashboardAPIClass.getInstance();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const transactions = api.ledger.filter((tx) => tx.merchantId === merchantId);

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

    return transactions;
  },

  getMerchants: async (
    page = 1,
    pageSize = 10,
    filter: MerchantFilterOptions = {},
    sort?: { field: keyof Merchant; direction: "asc" | "desc" },
    searchQuery?: string
  ): Promise<PaginatedMerchantsResponse> => {
    const api = DashboardAPIClass.getInstance();

    if (!api.merchants || api.merchants.length === 0) {
      api.merchants = iraqiMerchants.map((merchant) => {
        const transactionCount = Math.floor(Math.random() * 5000) + 50;
        const avgTransactionValue = Math.floor(Math.random() * 50000) + 5000;

        return {
          id: merchant.id,
          name: merchant.name,
          city: ["Baghdad", "Erbil", "Basra", "Mosul", "Najaf"][Math.floor(Math.random() * 5)],
          transactionCount,
          transactionVolume: transactionCount * avgTransactionValue,
        };
      });

      if (api.merchants.length < 50) {
        const additionalMerchants = generateMerchants(50 - api.merchants.length);
        api.merchants = [...api.merchants, ...additionalMerchants];
      }
    }

    let filteredMerchants = [...api.merchants];

    if (searchQuery && searchQuery.trim() !== "") {
      const lowerQuery = searchQuery.toLowerCase();
      filteredMerchants = filteredMerchants.filter(
        (merchant) =>
          merchant.name.toLowerCase().includes(lowerQuery) ||
          merchant.id.toLowerCase().includes(lowerQuery) ||
          merchant.city.toLowerCase().includes(lowerQuery)
      );
    }

    if (filter.city && filter.city !== "all") {
      filteredMerchants = filteredMerchants.filter((merchant) => merchant.city === filter.city);
    }
    if (filter.minTransactions !== undefined) {
      filteredMerchants = filteredMerchants.filter((merchant) => merchant.transactionCount >= filter.minTransactions!);
    }
    if (filter.maxTransactions !== undefined) {
      filteredMerchants = filteredMerchants.filter((merchant) => merchant.transactionCount <= filter.maxTransactions!);
    }
    if (filter.minVolume !== undefined) {
      filteredMerchants = filteredMerchants.filter((merchant) => merchant.transactionVolume >= filter.minVolume!);
    }
    if (filter.maxVolume !== undefined) {
      filteredMerchants = filteredMerchants.filter((merchant) => merchant.transactionVolume <= filter.maxVolume!);
    }

    if (sort) {
      filteredMerchants.sort((a, b) => {
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

    const totalItems = filteredMerchants.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedMerchants = filteredMerchants.slice(startIndex, endIndex);

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
    format: "csv" | "json",
    filter: MerchantFilterOptions = {},
    sort?: { field: keyof Merchant; direction: "asc" | "desc" }
  ): Promise<string> => {
    const result = await mockAPI.getMerchants(1, 1000, filter, sort);
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