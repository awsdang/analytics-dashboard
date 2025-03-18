
import Header from "@/components/header"
import { Stats } from "@/components/widgets/stats"
import { VolumeChart } from "@/components/widgets/volume-chart"
import { Heatmap } from "@/components/widgets/heatmap"
import { useStore } from "@/lib/store"
import ToolsContainer from "@/components/tools/tools-container"
import Widget from "@/components/widgets/widgetWrapper"
import { TransactionData } from "@/types/transactions"
import { useCallback, useEffect, useState } from "react"
import { useWebSocket } from "@/hooks/use-websocket"
import { mockAPI } from "@/service/api"


function App() {
  const [data, setData] = useState<TransactionData | null>(null)

  const { searchQuery, timeRange, filters, setTimeRange, setFilters } = useStore()

  const handleWebSocketMessage = useCallback((message: any) => {
    if (message.type === "newTransaction") {
      // Only update if the transaction matches our filters
      if (message.matchesFilters && message.updatedData) {
        setData(message.updatedData)
      } else {
        console.log("Transaction doesn't match current filters, ignoring update")
      }
    }
  }, [])

  // Set up the WebSocket connection with filters and timeRange
  const { connectionStatus } = useWebSocket({
    url: "wss://api.qicard.iq/transactions/ws",
    onMessage: handleWebSocketMessage,
    filters: filters,
    timeRange: timeRange,
  })
  const loadData = useCallback(async () => {
    try {
      const result = await mockAPI.getTransactionData(timeRange, {
        filter: {
          minAmount: filters.minAmount,
          maxAmount: filters.maxAmount,
          status: filters.status !== "all" ? filters.status : undefined,
          location: filters.location,
          startDate: filters.startDate,
          endDate: filters.endDate,
          merchantId: filters.merchantId,
        },
      })
      setData(result)
    } catch (err) {
      console.error("Failed to fetch transaction data:", err)
    } finally {
    }
  }, [timeRange, filters])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleRefresh = () => {
    loadData()
  }

  const handleExport = () => {
    console.log('Exporting data');
  }

  return (
    <>
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
          </div>
          <div className="container flex flex-col gap-4 mx-auto">
            <ToolsContainer onRefresh={handleRefresh} onExport={handleExport} isConnected={connectionStatus === "connected"}/>
            <Stats data={data} />
            <Widget title="Transaction Volume" description="Transaction volume over time (IQD)" >
              {data &&
              <VolumeChart className="h-[300px]" data={data}/>}
            </Widget>
            <Widget title="Transaction Activity" description="Heatmap by hour of day">
            {data &&
              <Heatmap  data={data}/>}
            </Widget>

            <Widget title="Merchant transactions" description="Complete history of all merchants transactions">
              <></>
            </Widget>
            <Widget title="Transaction Ledger" description="Complete history of all transactions">
              <></>
            </Widget>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
