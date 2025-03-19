
import { useEffect, useState } from "react"
import { Calendar, CreditCard, MapPin, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { mockAPI} from "@/service/api"
import { Transaction } from "@/types/transactions"

interface TransactionDetailsProps {
  transactionId: string
}

export default function TransactionDetails({ transactionId }: TransactionDetailsProps) {
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTransaction = async () => {
    try {
      setIsLoading(true)
      setError(null)

      try {
        const result = await mockAPI.getTransactionById(transactionId)
        setTransaction(result)
      } catch (err) {
        console.error("Failed to fetch transaction details:", err)
        setError("Failed to load transaction details. The transaction may not exist or there was a server error.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTransaction()
  }, [transactionId])

  const handleRefresh = () => {
    loadTransaction()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
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

  if (isLoading) {
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

  if (error || !transaction) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error Loading Transaction</CardTitle>
          <CardDescription>There was a problem loading the transaction details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-destructive/15 p-4 text-destructive">
            <p>{error}</p>
            <p className="mt-2 text-sm">Transaction ID: {transactionId}</p>
            <Button variant="outline" size="sm" onClick={handleRefresh} className="mt-2">
              Try Again
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" asChild>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Transaction {transaction.id}</CardTitle>
              <CardDescription>Processed on {formatDate(transaction.timestamp)}</CardDescription>
            </div>
            <Badge className={getStatusColor(transaction.status)} variant="outline">
              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Amount</h3>
                <p className="text-2xl font-bold">
                  {transaction.amount.toLocaleString()} {transaction.currency}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Merchant</h3>
                <div className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                  <p>{transaction.merchantName}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">User ID</h3>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-muted-foreground" />
                  <p className="font-mono">{transaction.userId}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Transaction ID</h3>
                <p className="font-mono">{transaction.id}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <p>{transaction.location || "Unknown"}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Date & Time</h3>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <p>{formatDate(transaction.timestamp)}</p>
                </div>
              </div>
            </div>
          </div>

          {transaction.previousTxId && (
            <div>
              <Separator className="my-4" />
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Previous Transaction</h3>
              <Button variant="outline" asChild>
                {/* <Link href={`/transactions/${transaction.previousTxId}`}>
                  View Previous Transaction ({transaction.previousTxId.substring(0, 8)}...)
                </Link> */}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

