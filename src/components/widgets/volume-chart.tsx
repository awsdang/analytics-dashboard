
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { Card } from "@/components/ui/card"
import {ChartContainer, ChartTooltip, ChartTooltipContent  } from "@/components/ui/chart"

export function VolumeChart() {
    const timeRange = "week"
    
    const chartData = [
        { time: "2022-01-01T00:00:00.000Z", volume: 1000000 },
        { time: "2022-01-02T00:00:00.000Z", volume: 1200000 },
        { time: "2022-01-03T00:00:00.000Z", volume: 1800000 },
        { time: "2022-01-04T00:00:00.000Z", volume: 1600000 },
        { time: "2022-01-05T00:00:00.000Z", volume: 1700000 },
        { time: "2022-01-06T00:00:00.000Z", volume: 1800000 },
        { time: "2022-01-07T00:00:00.000Z", volume: 2200000 },
        { time: "2022-01-07T00:00:00.000Z", volume: 1700000 },
        { time: "2022-01-07T00:00:00.000Z", volume: 2200000 },
    ]

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
  )
}

