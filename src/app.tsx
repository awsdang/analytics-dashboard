
import Header from "@/components/header"
import { Stats } from "@/components/widgets/stats"
import { VolumeChart } from "@/components/widgets/volume-chart"
import { Heatmap } from "@/components/widgets/heatmap"
import { useStore } from "@/lib/store"
import ToolsContainer from "@/components/tools/tools-container"
import Widget from "@/components/widgets/widgetWrapper"
import { TransactionData, Transaction} from "@/types/transactions"
import { useCallback, useEffect, useState } from "react"
import { useWebSocket } from "@/hooks/use-websocket"
import { mockAPI } from "@/service/api"
import TransactionHistory from "@/components/transactions/transaction-history"


function App() {
  const [data, setData] = useState<TransactionData | null>(null)

  const { searchQuery, timeRange, filters, setTimeRange, setFilters, setTransactionSort, transactionSort } = useStore()


  const [transactions, setTransactions] = useState<Transaction[]>()
  const [transactionsProps,setTransactionProps] = useState(
    {
      page: 1,
      pageSize: 10,
      totalItems: 0,
      totalPages: 0,
      isLoading: false,
    }
  )
  

  // const [totalItems, setTotalItems] = useState()

  // const [isLoading, setIsLoading] = useState(false)
  // const [error, setError] = useState<string | null>(null)
  // const [page, setPage] = useState(1)
  // const [pageSize, setPageSize] = useState(10)

  // const [totalPages, setTotalPages] = useState()
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

  const loadTransactions = useCallback(async () => {
    try {
      const result = await mockAPI.getTransactionHistory(
        timeRange,
        transactionsProps.page,
        transactionsProps.pageSize,
        filters,
        transactionSort,
        searchQuery.trim() !== "" ? searchQuery : undefined,
      )
      
      setTransactions(result.transactions)

      setTransactionProps({
        ...transactionsProps,
        totalItems: (result as any).totalItems, 
        totalPages: (result as any).totalPages, 
        isLoading: false
      })
    } finally {
      setTransactionProps(prev => ({ ...prev, isLoading: false }))
    }
  }, [transactionsProps.page, transactionsProps.pageSize, filters, transactionSort, searchQuery, timeRange])
  

  

  const handleWebSocketMessage = useCallback((message: any) => {
    if (message.type === "newTransaction") {
      // Only update if the transaction matches our filters
      if (message.matchesFilters) {
        loadData()
        loadTransactions()
      } else {
        console.log("Transaction doesn't match current filters, ignoring update")
      }
    }
  }, [loadData,loadTransactions])

  // Set up the WebSocket connection with filters and timeRange
  const { connectionStatus } = useWebSocket({
    url: "wss://api.qicard.iq/transactions/ws",
    onMessage: handleWebSocketMessage,
    filters: filters,
    timeRange: timeRange,
  })



  useEffect(() => {
    loadData()
    loadTransactions()
  }, [loadData, loadTransactions])

  const handleRefresh = () => {
    loadData()
    loadTransactions()
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
             {/* <Widget title="Transaction Volume" description="Transaction volume over time (IQD)" >
              {data &&
              <VolumeChart className="h-[300px]" data={data}/>}
            </Widget>
            <Widget title="Transaction Activity" description="Heatmap by hour of day">
            {data &&
              <Heatmap  data={data}/>}
            </Widget> */}

            {/* <Widget title="Merchant transactions" description="Complete history of all merchants transactions" className="w-full">
              <>

              </>
            </Widget>  */}

            <Widget title="Transaction Ledger" description="Complete history of all transactions">
              <>
              { transactions && 
                <TransactionHistory transactions={transactions} transactionsProps={transactionsProps} setTransactionProps={setTransactionProps}/>
              }
              </>
            </Widget>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
