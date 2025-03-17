
import { AlertTriangle, Banknote, CreditCard, Users } from "lucide-react"
import Widget from "./widgetWrapper"


export function Stats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Widget title="Total Cash Volume" Icon={Banknote}>
            <div className="text-2xl font-bold">0</div>
        </Widget>
        {/* <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cash Volume</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card> */}
        <Widget title="Transactions" Icon={CreditCard}> 
            <div className="text-2xl font-bold">0</div>
        </Widget>
        <Widget title="Active Users" Icon={Users}>
            <div className="text-2xl font-bold">0</div>
        </Widget>
        <Widget title="Failed Transactions" Icon={AlertTriangle}>
            <div className="text-2xl font-bold">0</div>
        </Widget>
    </div>
  )
}

