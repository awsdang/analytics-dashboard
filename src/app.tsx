
import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, RefreshCw } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Stats } from "./components/widgets/stats"
import { Filters } from "./components/tools/filters"


function App() {
  return (
    <>
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
          </div>
          <div className="container flex flex-col gap-4 mx-auto">

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-row gap-4">
          
              <Filters />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                  <span className="ml-2 h-2 w-2 rounded-full bg-green-500" title="Real-time updates active"></span>
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>



            <Stats />

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Transaction Volume</CardTitle>
                <CardDescription>Transaction volume over time (IQD)</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Transaction Activity</CardTitle>
                <CardDescription>Heatmap by hour of day</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
              </CardContent>
            </Card>


            <Card>
              <CardHeader>
                <CardTitle>Merchant transactions</CardTitle>
                <CardDescription>Complete history of all merchants transactions</CardDescription>
              </CardHeader>
              <CardContent>

              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transaction Ledger</CardTitle>
                <CardDescription>Complete history of all transactions</CardDescription>
              </CardHeader>
              <CardContent>
                
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
