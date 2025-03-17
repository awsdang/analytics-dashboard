
import {Transaction, Merchant, VolumeDataPoint, ActivityHourData} from '@/types/transactions'
import { iraqiMerchants } from './data';

export const generateCoherentTransaction = (merchantId: string, merchantName: string, timestamp: string): Transaction => {
  const statuses: Transaction["status"][] = ["completed", "pending", "failed", "refunded"];
  
  return {
    id: `txn_${Math.random().toString(36).substr(2, 9)}`,
    amount: Math.floor(Math.random() * 1000000) + 1000,
    merchantId,
    merchantName,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    timestamp,
    userId: `user_${Math.random().toString(36).substr(2, 6)}`,
    currency: "IQD",
    location: ["Baghdad", "Erbil", "Basra", "Mosul", "Najaf"][Math.floor(Math.random() * 5)],
  };
};

export const generateMerchantData = (transactions: Transaction[]): Merchant[] => {
  const merchantMap: { [key: string]: Merchant } = {}
  transactions.forEach((txn) => {
    if (!merchantMap[txn.merchantId]) {
      merchantMap[txn.merchantId] = {
        id: txn.merchantId,
        name: txn.merchantName,
        transactionCount: 0,
        transactionVolume: 0,
        city: "Baghdad", // All merchants are Baghdad-based
      }
    }
    merchantMap[txn.merchantId].transactionCount += 1
    merchantMap[txn.merchantId].transactionVolume += txn.amount
  })
  return Object.values(merchantMap)
    .sort((a, b) => b.transactionVolume - a.transactionVolume)
    .slice(0, 5)
}

export const generateVolumeOverTime = (
  transactions: Transaction[],
  timeRange: "day" | "week" | "month" | "year" = "week",
): VolumeDataPoint[] => {
  const now = new Date()
  let startDate: Date
  let format: "hour" | "day" | "month" = "day"

  // Determine start date and format based on time range
  switch (timeRange) {
    case "day":
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      format = "hour"
      break
    case "week":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      format = "day"
      break
    case "month":
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      format = "day"
      break
    case "year":
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
      format = "month"
      break
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      format = "day"
  }

  // Filter transactions by date range
  const filteredTransactions = transactions.filter((txn) => new Date(txn.timestamp) >= startDate)

  // Group transactions by time period
  const volumeByTime: { [key: string]: number } = {}

  filteredTransactions.forEach((txn) => {
    const date = new Date(txn.timestamp)
    let key: string

    if (format === "hour") {
      // For 24h view, group by hour
      key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:00`
    } else if (format === "day") {
      // For week/month view, group by day
      key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    } else {
      // For year view, group by month
      key = `${date.getFullYear()}-${date.getMonth() + 1}`
    }

    volumeByTime[key] = (volumeByTime[key] || 0) + txn.amount
  })

  // Generate data points for the entire range (including zeros for periods with no transactions)
  const dataPoints: VolumeDataPoint[] = []

  if (format === "hour") {
    // For 24h view, generate hourly points
    for (let i = 0; i < 24; i++) {
      const pointDate = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000)
      const key = `${pointDate.getFullYear()}-${pointDate.getMonth() + 1}-${pointDate.getDate()} ${pointDate.getHours()}:00`
      dataPoints.push({
        time: pointDate.toISOString(),
        volume: volumeByTime[key] || 0,
      })
    }
  } else if (format === "day") {
    // For week/month view, generate daily points
    const days = timeRange === "week" ? 7 : 30
    for (let i = 0; i < days; i++) {
      const pointDate = new Date(now.getTime() - (days - 1 - i) * 24 * 60 * 60 * 1000)
      const key = `${pointDate.getFullYear()}-${pointDate.getMonth() + 1}-${pointDate.getDate()}`
      dataPoints.push({
        time: pointDate.toISOString(),
        volume: volumeByTime[key] || 0,
      })
    }
  } else {
    // For year view, generate monthly points
    for (let i = 0; i < 12; i++) {
      const pointDate = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1)
      const key = `${pointDate.getFullYear()}-${pointDate.getMonth() + 1}`
      dataPoints.push({
        time: pointDate.toISOString(),
        volume: volumeByTime[key] || 0,
      })
    }
  }

  return dataPoints
}

export const generateActivityByHour = (transactions: Transaction[]): ActivityHourData[] => {
  const activity: { [key: string]: number } = {}

  // Initialize all day/hour combinations with zero
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      activity[`${day}-${hour}`] = 0
    }
  }

  // Count transactions by day and hour
  transactions.forEach((txn) => {
    const date = new Date(txn.timestamp)
    const key = `${date.getDay()}-${date.getHours()}`
    activity[key] = (activity[key] || 0) + 1
  })

  // Convert to array format
  return Object.entries(activity).map(([key, count]) => {
    const [day, hour] = key.split("-").map(Number)
    return { day, hour, count }
  })
}

// Calculate percentage change between two periods
export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

// Helper function to generate merchants
export function generateMerchants(count: number): Merchant[] {
  const cities = ["Baghdad", "Erbil", "Basra", "Mosul", "Najaf"]
  const merchantNames = iraqiMerchants.map((m) => m.name)

  return Array.from({ length: count }, (_, i) => {
    const transactionCount = Math.floor(Math.random() * 5000) + 50
    const avgTransactionValue = Math.floor(Math.random() * 50000) + 5000

    return {
      id: `m${i + 1}`,
      name: merchantNames[i % merchantNames.length],
      city: cities[Math.floor(Math.random() * cities.length)],
      transactionCount,
      transactionVolume: transactionCount * avgTransactionValue,
    }
  })
}
