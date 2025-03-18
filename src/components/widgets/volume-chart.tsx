
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts"

import { Card } from "@/components/ui/card"
import {ChartContainer  } from "@/components/ui/chart"
import { TransactionData} from '@/types/transactions'
import { useEffect, useState } from "react"
import { useStore } from "@/lib/store"

export function VolumeChart({className, data}: {data: TransactionData, className?: string}) {
 const [chartData, setChartData] = useState<{time:string, volume:number}[]>([])

  const {timeRange} = useStore()

  useEffect(() => {
    if (!data) return
    setChartData(data.volumeOverTime.map((item) => ({
      time: item.time,
      volume: item.volume,
    }

  )))
  },[data])

  if (!data || chartData.length === 0) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center">
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    )
  }
  
  const formatXAxis = (value: string) => {
    if (!value) return ""

    const date = new Date(value)

    switch (timeRange) {
      case "day":
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      case "week":
        return date.toLocaleDateString([], { weekday: "short" })
      case "month":
        return date.toLocaleDateString([], { day: "numeric", month: "short" })
      case "year":
        const month = date.toLocaleDateString([], { month: "short" })
        const year = date.getFullYear()
        return `${month} ${year}`
      default:
        return value
    }
  }

  // Format large numbers in IQD
  const formatYAxis = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M IQD`
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K IQD`
    }
    return `${value} IQD`
  }


  return (
    <div className={className}>
    <ChartContainer className="w-full h-full" config={{ title: { label: "Transaction Volume" }, description: { label: "Transaction volume over time (IQD)" } }}>
      <AreaChart
        data={chartData}
        margin={{
          top: 20,
          right: 10,
          left: 10,
          bottom: 20,
        }}>
        <XAxis
          dataKey="time"
          tickFormatter={formatXAxis}
          tick={{ fontSize: 12 }}
          tickMargin={10}
          axisLine={false}
          tickLine={false}
        />
        <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
        <CartesianGrid strokeDasharray="6 9" vertical={false} stroke="gray" opacity={50} />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
          <Card className="p-2 border shadow-sm">
            <div className="text-xs text-muted-foreground -mb-6">{formatXAxis(payload[0].payload.time)}</div>
            <div className="font-medium">{formatYAxis(Number(payload[0].value))}</div>
          </Card>
              )
            }
            return null
          }}
        />
        <Area
          type="monotone"
          dataKey="volume"
          stroke="black"
          fill="none"
          strokeWidth={2}
        />
            </AreaChart>
    </ChartContainer>
    </div>
  )
}

