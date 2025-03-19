

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Pagination } from "@/components/transactions/pagination"
import TransactionDetails from "./transaction-details"
import { Transaction } from "@/types/transactions"
import { TransactionSortOptions } from "@/types/dashboard"
import DialogContainer from "./dialog"

interface TransactionTableProps {
  transactions: Transaction[]
  isLoading: boolean
  onSort: (field: keyof Transaction) => void
  currentSort: TransactionSortOptions
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

export function TransactionTable({
  transactions,
  isLoading,
  onSort,
  currentSort,
  page,
  pageSize,
  totalItems,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: TransactionTableProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
      case "refunded":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
    }
  }

  const renderSortIcon = (field: keyof Transaction) => {
    if (currentSort.field !== field) {
      return <ArrowUpDown className="ml-1 h-4 w-4" />
    }
    return currentSort.direction === "asc" ? (
      <ArrowUp className="ml-1 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-1 h-4 w-4" />
    )
  }

  if (isLoading) {
    return (
      <div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Merchant</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-[80px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[80px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[120px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[150px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-[80px] rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[80px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4">
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    )
  }

  if (!transactions.length) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center rounded-md border">
        <p className="text-sm text-muted-foreground">No transactions found</p>
      </div>
    )
  }

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">
                <Button variant="ghost" size="sm" onClick={() => onSort("id")} className="-ml-3">
                  ID
                  {renderSortIcon("id")}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => onSort("timestamp")} className="-ml-3">
                  Date & Time
                  {renderSortIcon("timestamp")}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => onSort("amount")} className="-ml-3">
                  Amount
                  {renderSortIcon("amount")}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => onSort("merchantName")} className="-ml-3">
                  Merchant
                  {renderSortIcon("merchantName")}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => onSort("status")} className="-ml-3">
                  Status
                  {renderSortIcon("status")}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => onSort("location")} className="-ml-3">
                  Location
                  {renderSortIcon("location")}
                </Button>
              </TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-mono text-xs">{transaction.id.substring(0, 8)}...</TableCell>
                <TableCell>{formatDate(transaction.timestamp)}</TableCell>
                <TableCell>
                  {transaction.amount.toLocaleString()} {transaction.currency}
                </TableCell>
                <TableCell>{transaction.merchantName}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(transaction.status)} variant="outline">
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>{transaction.location}</TableCell>
                <TableCell>

                    <DialogContainer title={'View transaction details'}>
                    <TransactionDetails transactionId={transaction.id}/>
                    </DialogContainer>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4">
        <Pagination
          currentPage={page}
          pageSize={pageSize}
          totalItems={totalItems}
          totalPages={totalPages}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </div>
    </div>
  )
}

