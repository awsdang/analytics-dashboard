
import Header from "@/components/header"
import { Stats } from "@/components/widgets/stats"
import { VolumeChart } from "@/components/widgets/volume-chart"
import { Heatmap } from "@/components/widgets/heatmap"
import { useStore } from "@/lib/store"
import ToolsContainer from "@/components/tools/tools-container"
import Widget from "@/components/widgets/widgetWrapper"
import { TransactionData, Transaction, Merchant } from "@/types/transactions"
import { useCallback, useEffect, useState } from "react"
import { useWebSocket } from "@/hooks/use-websocket"
import { mockAPI } from "@/service/api"
import TransactionHistory from "@/components/transactions/transaction-history"
import MerchantHistory from "@/components/merchants/merchant-history"

interface Error {
  dataMessage?: string
  transactionsMessage?: string
  merchantsMessage?: string
}

function App() {
  const [data, setData] = useState<TransactionData>()
  const [transactions, setTransactions] = useState<Transaction[]>()
  const [merchants, setMerchants] = useState<Merchant[]>()
  const [error, setError] = useState<Error>({})


  const { searchQuery, timeRange, filters, transactionSort, merchantSort } = useStore()

  const [transactionsProps, setTransactionProps] = useState(
    {
      page: 1,
      pageSize: 10,
      totalItems: 0,
      totalPages: 0,
      isLoading: false,
    }
  )
  const [merchantsProps, setMerchantsProps] = useState(
    {
      page: 1,
      pageSize: 10,
      totalItems: 0,
      totalPages: 0,
      isLoading: false,
    }
  )
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
      setError(prev => ({ ...prev, dataMessage: (err as any).message }))
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
    } catch (err) {
      setError(prev => ({ ...prev, transactionsMessage: (err as any).message }))
    } finally {
      setTransactionProps(prev => ({ ...prev, isLoading: false }))
    }
  }, [transactionsProps.page, transactionsProps.pageSize, filters, transactionSort, searchQuery, timeRange])

  const loadMerchants = useCallback(async () => {
    try {
      const result = await mockAPI.getMerchants(
        timeRange,
        merchantsProps.page,
        merchantsProps.pageSize,
        filters,
        merchantSort,
        searchQuery.trim() !== "" ? searchQuery : undefined,
      )
      setMerchants(result.merchants)

      setMerchantsProps(prev => ({
        ...prev,
        totalItems: result.totalItems,
        totalPages: result.totalPages,
        isLoading: false,
      }))
    } catch (err) {
      setError(prev => ({ ...prev, merchantsMessage: (err as any).message }))
    } finally {
      setMerchantsProps(prev => ({ ...prev, isLoading: false }))
    }
  }, [merchantsProps.page, merchantsProps.pageSize, filters, merchantSort, searchQuery, timeRange])

  const handleWebSocketMessage = useCallback((message: any) => {
    if (message.type === "newTransaction") {
      if (message.matchesFilters) {
        loadData()
        loadTransactions()
        loadMerchants()
      } else {
        console.log("Transaction doesn't match current filters, ignoring update")
      }
    }
  }, [loadData, loadTransactions, loadMerchants])

  useWebSocket({
    onMessage: handleWebSocketMessage,
    filters: filters,
    timeRange: timeRange,
  })

  useEffect(() => {
    loadData()
    loadTransactions()
    loadMerchants()
  }, [loadData, loadTransactions, loadMerchants])


  return (
    <>
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
          </div>
          <div className="container flex flex-col gap-4 mx-auto">
            <ToolsContainer />
            {searchQuery === "" && data &&
              <>
                <Stats error={error.dataMessage} data={data} />
                <Widget error={error.dataMessage} title="Transaction Volume" description="Transaction volume over time (IQD)" >
                  <VolumeChart className="h-[300px]" data={data} />
                </Widget>
                <Widget error={error.dataMessage} title="Transaction Activity" description="Heatmap by hour of day">
                  <Heatmap data={data} />
                </Widget>
              </>
            }
            <Widget error={error.transactionsMessage} title="Transaction Ledger" description="Complete history of all transactions">
              <>
                {transactions &&
                  <TransactionHistory transactions={transactions} transactionsProps={transactionsProps} setTransactionProps={setTransactionProps} />
                }
              </>
            </Widget>
            <Widget error={error.merchantsMessage} title="Top Merchants" description={`Top merchants based on transaction volume per ${timeRange}`} className="w-full">
              <>
                {merchants &&
                  <MerchantHistory merchants={merchants} merchantsProps={merchantsProps} setMerchantsProps={setMerchantsProps} />
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
