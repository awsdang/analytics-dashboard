
import { useEffect, useState } from "react"
import { ArrowDownIcon, ArrowUpIcon, CreditCard, DollarSign, Users, Clock } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { mockAPI } from "@/service/api"
import {MerchantStatsData} from "@/types/transactions"

export function MerchantStats({ merchantId }: { merchantId: string}) {
  const [data, setData] = useState<MerchantStatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const result = await mockAPI.getMerchantStats(merchantId)
        setData(result)
      } catch (err) {
        console.error("Failed to fetch merchant stats:", err)
        setError("Failed to load merchant statistics")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [merchantId])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-[200px]" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      <Skeleton className="h-4 w-24" />
                    </CardTitle>
                    <Skeleton className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-36 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </CardContent>
                </Card>
              ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Merchant Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-destructive/15 p-4 text-destructive">
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  const stats = [
    {
      title: "Total Volume",
      value: `${(data.totalVolume / 1000000).toFixed(2)}M IQD`,
      change: data.volumeChange,
      icon: DollarSign,
    },
    {
      title: "Transactions",
      value: data.totalTransactions.toLocaleString(),
      change: data.transactionChange,
      icon: CreditCard,
    },
    {
      title: "Active Users",
      value: data.activeUsers.toLocaleString(),
      change: data.userChange,
      icon: Users,
    },
    {
      title: "Avg. Processing Time",
      value: `${data.averageTransactionTime.toFixed(1)}s`,
      change: data.timeChange,
      icon: Clock,
      negative: true, // Lower is better for processing time
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Merchant Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span
                    className={cn(
                      "inline-flex items-center",
                      stat.change > 0
                        ? stat.negative
                          ? "text-destructive"
                          : "text-emerald-500"
                        : stat.negative
                          ? "text-emerald-500"
                          : "text-destructive",
                    )}
                  >
                    {stat.change > 0 ? (
                      <ArrowUpIcon className="mr-1 h-3 w-3" />
                    ) : (
                      <ArrowDownIcon className="mr-1 h-3 w-3" />
                    )}
                    {Math.abs(stat.change)}%
                  </span>{" "}
                  from previous period
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
