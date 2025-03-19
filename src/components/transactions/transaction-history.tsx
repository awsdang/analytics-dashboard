import { useEffect, useState } from "react"
import { TransactionTable } from "@/components/transactions/transaction-table"
import { useStore } from "@/lib/store"
import { Transaction } from "@/types/transactions"
interface TransactionProps {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  isLoading: boolean
}

export default function TransactionHistory({transactions, transactionsProps, setTransactionProps}:{transactions: Transaction[], transactionsProps:TransactionProps , setTransactionProps: ({}:TransactionProps)=>void}) {
  if (!transactions) {
    return null
  }
  const {transactionSort, setTransactionSort} = useStore()
  const [page, setPage] = useState(transactionsProps.page)
  const [pageSize, setPageSize] = useState(transactionsProps.pageSize)
  useEffect(() => {
    setTransactionProps({
      ...transactionsProps,
      page: page,
      pageSize: pageSize,
    })
  }, [page, pageSize])


  const handleSort = (field: keyof Transaction) => {
    setTransactionSort({
      field,
      direction: transactionSort.field === field && transactionSort.direction === "asc" ? "desc" : "asc",
    })
  }

  return (
    <div className="">
          <TransactionTable
            transactions={transactions}
            isLoading={transactionsProps.isLoading}
            onSort={handleSort}
            currentSort={transactionSort}
            page={transactionsProps.page}
            pageSize={transactionsProps.pageSize}
            totalItems={transactionsProps.totalItems}
            totalPages={transactionsProps.totalPages}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
    </div>
  )
}

