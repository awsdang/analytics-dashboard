
import { Filter, X, CalendarClock} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useStore } from "@/lib/store"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"



export function Filters() {
    const {filters, timeRange, setFilters, resetFilters, setTimeRange,  } = useStore()

    const handleTimeRangeChange = (value: string) => {
        setTimeRange(value as "day" | "week" | "month" | "year")
    }

    const handleAmountChange = (values: number[]) => {
        setFilters({
            ...filters,
            minAmount: values[0],
            maxAmount: values[1],
        })
    }

    const handleStatusChange = (value: string) => {
        setFilters({
            ...filters,
            status: value,
        })
    }

    const handleLocationChange = (value: string) => {
        setFilters({
            ...filters,
            location: value === "all" ? undefined : value,
        })
    }

    const handleResetFilters = () => {
        resetFilters()
    }

    const hasActiveFilters =
        filters.minAmount !== undefined ||
        filters.maxAmount !== undefined ||
        filters.status !== "all" ||
        filters.location !== undefined

    const activeFilterCount = [
        filters.minAmount !== undefined || filters.maxAmount !== undefined,
        filters.status !== "all" && filters.status !== undefined,
        filters.location !== undefined,
    ].filter(Boolean).length
    
    return (
        <div className="flex items-center gap-2">
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                        <Filter className="h-3.5 w-3.5" />
                        <span>Filters</span>
                        {hasActiveFilters && (
                            <Badge variant="secondary" className="ml-1 rounded-sm px-1 font-normal">
                                {activeFilterCount}
                            </Badge>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[280px] p-4"  align="start">
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <h4 className="font-medium leading-none">Transaction Amount (IQD)</h4>
                            <div className="flex items-center justify-between pt-2">
                                <span className="text-xs text-muted-foreground">{filters.minAmount?.toLocaleString() || 0} IQD</span>
                                <span className="text-xs text-muted-foreground">
                                    {filters.maxAmount?.toLocaleString() || 1000000} IQD
                                </span>
                            </div>
                            <Slider
                                defaultValue={[filters.minAmount || 0, filters.maxAmount || 1000000]}
                                max={1000000}
                                step={10000}
                                onValueChange={handleAmountChange}
                                className="py-2"
                            />
                        </div>
                        <Separator />
                        <div className="space-y-2">
                            <h4 className="font-medium leading-none">Transaction Status</h4>
                            <Select defaultValue={filters.status || "all"} onValueChange={handleStatusChange}>
                                <SelectTrigger className="h-8 w-full">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="failed">Failed</SelectItem>
                                    <SelectItem value="refunded">Refunded</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Separator />
                        <div className="space-y-2">
                            <h4 className="font-medium leading-none">Location</h4>
                            <Select defaultValue={filters.location || "all"} onValueChange={handleLocationChange}>
                                <SelectTrigger className="h-8 w-full">
                                    <SelectValue placeholder="Select location" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Locations</SelectItem>
                                    <SelectItem value="Baghdad">Baghdad</SelectItem>
                                    <SelectItem value="Erbil">Erbil</SelectItem>
                                    <SelectItem value="Basra">Basra</SelectItem>
                                    <SelectItem value="Mosul">Mosul</SelectItem>
                                    <SelectItem value="Najaf">Najaf</SelectItem>
                                </SelectContent>
                            </Select>

                        </div>
                        <Button variant="outline" size="sm" onClick={handleResetFilters} className="mt-2">
                            <X className="mr-2 h-3.5 w-3.5" />
                            Reset Filters
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                        <CalendarClock className="h-3.5 w-3.5" />
                        <span>Time</span>
                        {timeRange && (
                            <Badge variant="secondary" className="ml-1 rounded-sm px-1 font-normal">
                                {timeRange.toUpperCase()}
                            </Badge>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[280px] p-4" align="start">
                    <div className="grid gap-4">
                        <Tabs defaultValue="week" className="w-full" value={timeRange} onValueChange={handleTimeRangeChange} >
                            <h4 className="font-medium leading-none">Time period</h4>
                            <TabsList className="w-full">
                                <TabsTrigger value="day">24h</TabsTrigger>
                                <TabsTrigger value="week">Week</TabsTrigger>
                                <TabsTrigger value="month">Month</TabsTrigger>
                                <TabsTrigger value="year">Year</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}

