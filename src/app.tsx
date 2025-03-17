
import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, RefreshCw } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Stats } from "@/components/widgets/stats"
import { Filters } from "@/components/tools/filters"
import { VolumeChart } from "@/components/widgets/volume-chart"
import { Heatmap } from "@/components/widgets/heatmap"
import { Input } from "@/components/ui/input"
import { useState, useEffect, useCallback } from "react"
import {TransactionData} from "./types/transactions"
import { useWebSocket } from "@/hooks/use-websocket"
import { useStore } from "./lib/store"
import { mockAPI } from "./service/api"
import ToolsContainer from "./components/tools/tools-container"
import Widget from "./components/widgets/widgetWrapper"

function App() {
  
  const {searchQuery, timeRange, filters, setTimeRange, setFilters } = useStore()
  console.log(searchQuery);

  console.log(timeRange, filters);
  const handleRefresh = () => {
    console.log('Refreshing data');
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
            <ToolsContainer onRefresh={handleRefresh} onExport={handleExport}/>
            
            <Stats />
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Transaction Volume</CardTitle>
                <CardDescription>Transaction volume over time (IQD)</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
              <VolumeChart/>
              </CardContent>
            </Card>
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Transaction Activity</CardTitle>
                <CardDescription>Heatmap by hour of day</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
              <Heatmap/>
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
