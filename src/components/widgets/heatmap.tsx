import { useMemo, useState, useEffect } from "react"
import { TransactionData } from "@/types/transactions"
import { useStore } from "@/lib/store"

export function Heatmap({ data }: { data: TransactionData }) {
  const { timeRange } = useStore()
  let currentData: any[] = []
  switch (timeRange) {
    case "day":
      currentData = data.activityByHour
      break
    case "week":
      currentData = data.activityByHour // expects objects with both day & hour keys
      break
    case "month":
      currentData = data.activityByHour
      break
    case "year":
      currentData = data.activityByHour
      break
    default:
      currentData = []
  }

  // State for saving the previous (old) data.
  // When currentData changes, we update oldData by dropping the last element.
  const [_, setOldData] = useState(currentData)

  useEffect(() => {
    setOldData(currentData.slice(0, currentData.length - 1))
  }, [currentData])

  // Calculate the maximum count value to scale colors.
  const maxValue = useMemo(() => {
    if (!currentData.length) return 0
    return Math.max(...currentData.map((item) => item.count))
  }, [currentData])

  // Given a count value, compute a color intensity.
  const getColor = (value: number) => {
    const intensity = maxValue > 0 ? value / maxValue : 0
    return `rgba(22, 78, 99, ${Math.max(0.1, intensity)})`
  }

  // Render different grid layouts based on the selected time range.
  let gridContent = null

  if (timeRange === "day") {
    // Render a single row of 24 boxes for a day.
    gridContent = (
      <div className="grid grid-cols-12 gap-2">
        {currentData.map((item, hour) => (
          <div
            key={hour}
            className="p-1"
            title={`${hour}:00 - ${item.count} transactions`}
          >

            <div
              className="flex h-6 w-6 items-center justify-center rounded"
              style={{ backgroundColor: getColor(item.count) }}
            >
              {item.count > 0 && (
                <span className="text-[8px] font-medium text-white">
                  {item.count > 999 ? "999+" : item.count}
                </span>
              )}
            </div>
            <span className="text-center text-xs">{hour}:00</span>

          </div>
        ))}
      </div>
    )
  } else if (timeRange === "week") {
    // Render a grid with a header row for hours and one row per day.
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const hours = Array.from({ length: 24 }, (_, i) => i)
    gridContent = (
      <div className="flex min-w-[600px] flex-col">
        {/* Header row for hours */}
        <div className="flex border-b">
          <div className="w-12"></div>
          {hours.map((hour) => (
            <div
              key={hour}
              className="flex-1 text-center text-xs text-muted-foreground"
            >
              {hour}
            </div>
          ))}
        </div>
        {/* One row per day */}
        {days.map((day, dayIndex) => (
          <div key={day} className="flex">
            <div className="w-12 py-2 text-xs font-medium">{day}</div>
            {hours.map((hour) => {
              const dataPoint = currentData.find(
                (d: any) => d.day === dayIndex && d.hour === hour
              )
              const count = dataPoint?.count || 0
              return (
                <div
                  key={`${day}-${hour}`}
                  className="flex-1 p-1"
                  title={`${day} ${hour}:00 - ${count} transactions`}
                >
                  <div
                    className="flex h-full w-full items-center justify-center rounded"
                    style={{ backgroundColor: getColor(count) }}
                  >
                    {count > 0 && (
                      <span className="text-[8px] font-medium text-white">
                        {count > 999 ? "999+" : count}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    )
  } else if (timeRange === "month") {
    // Render a grid of 30 boxes. Here we use a 6-column grid.
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    gridContent = (
      <div className="grid grid-cols-3 md:grid-cols-7 gap-1">
        {days.map((day) => (
          <div className="text-xs font-medium text-center md:block hidden">{day}</div>
        ))}
        {currentData.map((item, index) => (

          <div
            key={index}
            className="p-1 flex flex-col justify-center items-center"
            title={`Day ${index + 1} - ${item.count} transactions`}
          >
            <div
              className="flex h-6 w-6 items-center justify-center rounded"
              style={{ backgroundColor: getColor(item.count) }}
            >
              {item.count > 0 && (
                <span className="text-[8px] font-medium text-white">
                  {item.count > 999 ? "999+" : item.count}
                </span>
              )}
            </div>
            <span className="text-center text-xs">Day {index + 1}</span>
          </div>
        ))}
      </div>
    )
  } else if (timeRange === "year") {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


    // Render a single row of 52 boxes representing weeks.
    gridContent = (
      <div className="space-y-2">
        {months.map((month, monthIndex) => {
          // For each month, extract 4 week items from currentData.
          // This assumes currentData is ordered and contains enough week items.
          const startIndex = monthIndex * 4;
          const weeksForMonth = currentData.slice(startIndex, startIndex + 4);
          return (
            <div key={monthIndex} className="grid grid-cols-5 gap-1 items-center">
              {/* Month label cell */}
              <div className="p-1 flex items-center justify-center text-xs font-medium">
                {month}
              </div>
              {/* Week boxes */}
              {weeksForMonth.map((item, weekIndex) => (
                <div
                  key={weekIndex}
                  className="p-1 flex flex-col justify-center items-center"
                  title={`Week ${startIndex + weekIndex + 1} - ${item.count} transactions`}
                >
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded"
                    style={{ backgroundColor: getColor(item.count) }}
                  >
                    {item.count > 0 && (
                      <span className="text-[8px] font-medium text-white">
                        {item.count > 999 ? "999+" : item.count}
                      </span>
                    )}
                  </div>
                  <span className="text-center text-xs">Week {startIndex + weekIndex + 1}</span>
                </div>
              ))}
            </div>
          )
        })}
      </div>
    );
  }

  return <div className="h-full w-full overflow-x-auto">{gridContent}</div>
}
