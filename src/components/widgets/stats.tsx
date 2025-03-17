
import { AlertTriangle, ArrowUpIcon, ArrowDownIcon, Banknote, CreditCard, Users } from "lucide-react"
import Widget from "./widgetWrapper"
import { TransactionData } from "@/types/transactions"
import { cn } from "@/lib/utils"

export function Stats({ data }: { data: TransactionData|null }) {

  if (!data) return null

  const stats = [
    {
      title: "Total Volume",
      value: `${(data.totalVolume / 1000000).toFixed(2)} M IQD`,
      change: Math.round(data.volumeChange),
      icon: Banknote,
    },
    {
      title: "Transactions",
      value: data.totalTransactions.toLocaleString(),
      change: Math.round(data.transactionChange),
      icon: CreditCard,
    },
    {
      title: "Active Users",
      value: data.activeUsers.toLocaleString(),
      change: Math.round(data.userChange),
      icon: Users,
    },
    {
      title: "Failed Transactions",
      value: data.failedTransactions.toLocaleString(),
      change: Math.round(data.failedChange),
      icon: AlertTriangle,
      negative: true,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((data, i) => (
        <Widget title={data.title} Icon={data.icon} key={i}>
          <div className="text-2xl font-bold">{data.value}</div>
          <p className="text-xs text-muted-foreground">
            <span
              className={cn(
                "inline-flex items-center",
                data.change > 0
                  ? data.negative
                    ? "text-destructive"
                    : "text-emerald-500"
                  : data.negative
                    ? "text-emerald-500"
                    : "text-destructive",
              )}
            >
              {data.change > 0 ? (
                <ArrowUpIcon className="mr-1 h-3 w-3" />
              ) : (
                <ArrowDownIcon className="mr-1 h-3 w-3" />
              )}
              {Math.abs(data.change)}%
            </span>{" "}
            from previous period
          </p>
        </Widget>
      ))
      }
    </div>
  )
}

