
import {Transaction, Merchant, VolumeDataPoint, ActivityHourData} from '@/types/transactions'
import { iraqiMerchants } from './data';

export const generateCoherentTransaction = (merchantId: string, merchantName: string, timestamp: string): Transaction => {
  const statuses: Transaction["status"][] = ["completed", "pending", "failed", "refunded"];
  
  return {
    id: `txn_${Math.random().toString(36).substring(2, 9)}`,
    amount: Math.floor(Math.random() * 1000000) + 1000,
    merchantId,
    merchantName,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    timestamp,
    userId: `user_${Math.random().toString(36).substring(2, 6)}`,
    currency: "IQD",
    location: ["Baghdad", "Erbil", "Basra", "Mosul", "Najaf"][Math.floor(Math.random() * 5)],
  };
};

export const generateVolumeOverTime = (
  transactions: Transaction[],
  timeRange: "day" | "week" | "month" | "year" = "week",
  currentTime?: Date
): VolumeDataPoint[] => {
  const now = currentTime ?? new Date()
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

export const generateActivityByHour = (
  transactions: Transaction[],
  timeRange: "day" | "week" | "month" | "year" = "week",
  currentTime?: Date
): ActivityHourData[] => {
  const now = currentTime || new Date();
  let start: Date, end: Date;

  // Determine the start and end of the period based on the timeRange.
  switch (timeRange) {
    case "day":
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      end = new Date(start);
      end.setDate(start.getDate() + 1);
      break;
    case "week": {
      // Assume week starts on Sunday.
      const dayOfWeek = now.getDay();
      start = new Date(now);
      start.setDate(now.getDate() - dayOfWeek);
      start = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      end = new Date(start);
      end.setDate(start.getDate() + 7);
      break;
    }
    case "month":
      // For month, we’ll use the first 30 days of the current month.
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(start);
      end.setDate(start.getDate() + 30);
      break;
    case "year":
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear() + 1, 0, 1);
      break;
    default:
      // Fallback to an all-time range.
      start = new Date(0);
      end = new Date();
  }

  // Filter transactions to only include those within the period.
  const filteredTransactions = transactions.filter((txn) => {
    const txnDate = new Date(txn.timestamp);
    return txnDate >= start && txnDate < end;
  });

  // Group transactions based on the selected timeRange.
  if (timeRange === "day") {
    // Create 24 hourly buckets for the current day.
    const activity: { [key: string]: number } = {};
    for (let hour = 0; hour < 24; hour++) {
      // We use the current day’s index (0–6) for consistency.
      activity[`${start.getDay()}-${hour}`] = 0;
    }
    filteredTransactions.forEach((txn) => {
      const date = new Date(txn.timestamp);
      const key = `${date.getDay()}-${date.getHours()}`;
      if (key in activity) {
        activity[key] += 1;
      }
    });
    return Object.entries(activity).map(([key, count]) => {
      const [day, hour] = key.split("-").map(Number);
      return { day, hour, count };
    });
  } else if (timeRange === "week") {
    // Create a 7 x 24 grid for the week.
    const activity: { [key: string]: number } = {};
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        activity[`${day}-${hour}`] = 0;
      }
    }
    filteredTransactions.forEach((txn) => {
      const date = new Date(txn.timestamp);
      const key = `${date.getDay()}-${date.getHours()}`;
      if (key in activity) {
        activity[key] += 1;
      }
    });
    return Object.entries(activity).map(([key, count]) => {
      const [day, hour] = key.split("-").map(Number);
      return { day, hour, count };
    });
  } else if (timeRange === "month") {
    // Group by day of month – assume 30 buckets.
    const activity: { [day: number]: number } = {};
    for (let day = 1; day <= 30; day++) {
      activity[day] = 0;
    }
    filteredTransactions.forEach((txn) => {
      const date = new Date(txn.timestamp);
      const day = date.getDate();
      if (day >= 1 && day <= 30) {
        activity[day] += 1;
      }
    });
    return Object.entries(activity).map(([day, count]) => ({
      // For month view, we return the day (1–30) in the `day` field.
      day: Number(day),
      hour: 0, // hour is not used for month-level grouping
      count,
    }));
  } else if (timeRange === "year") {
    // Group transactions into 52 weekly buckets.
    const activity: { [week: number]: number } = {};
    for (let week = 0; week < 52; week++) {
      activity[week] = 0;
    }
    filteredTransactions.forEach((txn) => {
      const date = new Date(txn.timestamp);
      // Calculate the number of days since the start of the year.
      const diffTime = date.getTime() - start.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const weekIndex = Math.floor(diffDays / 7);
      if (weekIndex >= 0 && weekIndex < 52) {
        activity[weekIndex] += 1;
      }
    });
    return Object.entries(activity).map(([week, count]) => ({
      // For the year view, we use `day` to represent the week index.
      day: Number(week),
      hour: 0,
      count,
    }));
  }

  return [];
};


// Calculate percentage change between two periods
export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

// Helper function to generate merchants
export function generateMerchants(count: number): Merchant[] {
  const cities = ["Baghdad", "Erbil", "Basra", "Mosul", "Najaf"]
  const merchantNames = iraqiMerchants.map((m) => m.name)
  const merchantIds = iraqiMerchants.map((m) => m.id)

  return Array.from({ length: count }, (_, i) => {
    const transactionCount = Math.floor(Math.random() * 5000) + 50
    const avgTransactionValue = Math.floor(Math.random() * 50000) + 5000

    return {
      id: merchantIds[i % merchantIds.length],
      name: merchantNames[i % merchantNames.length],
      city: cities[Math.floor(Math.random() * cities.length)],
      joinedDate: new Date(Date.now() - Math.floor(Math.random() * 3 * 365 * 24 * 60 * 60 * 1000)).toISOString(),
      transactionCount,
      transactionVolume: transactionCount * avgTransactionValue,
    }
  })
}
