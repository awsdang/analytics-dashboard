
import { useMemo } from "react"
import { Skeleton } from "@/components/ui/skeleton"



export function Heatmap() {
  const heatmapData = [
    { day: 0, hour: 0, count: 0 },
    { day: 0, hour: 1, count: 0 },
    { day: 0, hour: 2, count: 0 },
    { day: 0, hour: 3, count: 4 },
    { day: 0, hour: 4, count: 0 },
    { day: 0, hour: 5, count: 0 },
    { day: 0, hour: 6, count: 3 },
    { day: 0, hour: 7, count: 0 },
    { day: 0, hour: 8, count: 0 },
    { day: 0, hour: 9, count: 0 },
    { day: 0, hour: 10, count: 0 },
    { day: 0, hour: 11, count: 0 },
    { day: 0, hour: 12, count: 5 },
    { day: 0, hour: 13, count: 0 },
    { day: 0, hour: 14, count: 0 },
    { day: 0, hour: 15, count: 4 },
    { day: 0, hour: 16, count: 0 },
    { day: 0, hour: 17, count: 0 },
    { day: 0, hour: 18, count: 0 },
    { day: 0, hour: 19, count: 0 },
    { day: 0, hour: 20, count: 0 },
    { day: 0, hour: 21, count: 0 },
    { day: 0, hour: 22, count: 0 },
    { day: 0, hour: 23, count: 0 },
    { day: 1, hour: 0, count: 0 },
    { day: 1, hour: 1, count: 5 },
    { day: 1, hour: 2, count: 0 },
    { day: 1, hour: 3, count: 0 },
    { day: 1, hour: 4, count: 0 },
    { day: 1, hour: 5,  count: 0}]
    

  const maxValue = useMemo(() => {
    if (!heatmapData.length) return 0
    return Math.max(...heatmapData.map((item) => item.count))
  }, [heatmapData])

  const getColor = (value: number) => {
    const intensity = maxValue > 0 ? value / maxValue : 0
    // Use a CSS variable for the primary color
    return `rgba(22, 78, 99, ${Math.max(0.1, intensity)})`
  }

 
  // Create a 7x24 grid for days of week and hours
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const hours = Array.from({ length: 24 }, (_, i) => i)

  return (
    <div className="h-full w-full overflow-x-auto">
      <div className="flex min-w-[600px] flex-col">
        <div className="flex border-b">
          <div className="w-12"></div>
          {hours.map((hour) => (
            <div key={hour} className="flex-1 text-center text-xs text-muted-foreground">
              {hour}
            </div>
          ))}
        </div>

        {days.map((day, dayIndex) => (
          <div key={day} className="flex">
            <div className="w-12 py-2 text-xs font-medium">{day}</div>
            {hours.map((hour) => {
              const dataPoint = heatmapData.find((d) => d.day === dayIndex && d.hour === hour)
              const count = dataPoint?.count || 0

              return (
                <div key={`${day}-${hour}`} className="flex-1 p-1" title={`${day} ${hour}:00 - ${count} transactions`}>
                  <div
                    className="flex h-full w-full items-center justify-center rounded"
                    style={{ backgroundColor: getColor(count) }}
                  >
                    {count > 0 && (
                      <span className="text-[8px] font-medium text-white">{count > 999 ? "999+" : count}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

