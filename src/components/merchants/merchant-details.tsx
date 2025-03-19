
import { useEffect, useState } from "react"
import {ArrowUpIcon, ArrowDownIcon, Building, Calendar, CreditCard, MapPin} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { mockAPI } from "@/service/api"
import { Merchant, MerchantStatsData } from "@/types/transactions"
import { cn } from "@/lib/utils"


export default function MerchantDetails({ merchantId }: { merchantId: string }) {
  const [merchant, setMerchant] = useState<Merchant | null>(null)
  const [data, setData] = useState<MerchantStatsData | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [_, setError] = useState<string | null>(null)

  const loadMerchant = async () => {
    try {
      setIsLoading(true)
      setError(null)

      try {
        const result = await mockAPI.getMerchantById(merchantId)
        const data = await mockAPI.getMerchantStats(merchantId)
        setMerchant(result)
        setData(data)
      } catch (err) {
        console.error("Failed to fetch merchant details:", err)
        setError("Failed to load merchant details. The merchant may not exist or there was a server error.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadMerchant()
  }, [merchantId])


  if (isLoading || !merchant || !data) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[250px] mb-2" />
            <Skeleton className="h-4 w-[350px]" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-5 w-[120px]" />
                  <Skeleton className="h-5 w-[200px]" />
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    )
  }
  

  const stats = [
    {
      title: "Total Volume",
      value: `${(data.totalVolume / 1000000).toFixed(2)}M IQD`,
      change: data.volumeChange,
    },
    {
      title: "Transactions",
      value: data.totalTransactions.toLocaleString(),
      change: data.transactionChange,
    },
    {
      title: "Active Users",
      value: data.activeUsers.toLocaleString(),
      change: data.userChange,
    },
    {
      title: "Avg. Processing Time",
      value: `${data.averageTransactionTime.toFixed(1)}s`,
      change: data.timeChange,
      negative: true, // Lower is better for processing time
    },
  ]


  return (
    <div className="space-y-6">
      <Card className="max-h-[70vh] overflow-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{merchant.name}</CardTitle>
              <CardDescription>Merchant ID: {merchant.id}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Merchant Name</h3>
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                  <p className="text-lg font-medium">{merchant.name}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">City</h3>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <p>{merchant.city}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Transaction Count</h3>
                <div className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                  <p>{merchant.transactionCount.toLocaleString()} transactions</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Transaction Volume</h3>
                <p className="text-2xl font-bold">{merchant.transactionVolume.toLocaleString()} IQD</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Average Transaction</h3>
                <p>
                  {merchant.transactionCount > 0
                    ? (merchant.transactionVolume / merchant.transactionCount).toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    }) + " IQD"
                    : "N/A"}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Joined Date</h3>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <p>{new Date((merchant as any).joinedDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            {stats.map((stat) => (
            <div key={stat.title}>
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="text-sm font-medium">{stat.title}</div>
              </div>
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
            </div>
          ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
