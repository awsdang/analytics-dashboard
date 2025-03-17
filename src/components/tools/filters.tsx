
import { Filter, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"


export function Filters() {

    return (
        <div className="flex items-center gap-2">
            <Popover >
                <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                        <Filter className="h-3.5 w-3.5" />
                        <span>Filters</span>

                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[280px] p-4" align="start">
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <h4 className="font-medium leading-none">Transaction Amount (IQD)</h4>
                            <div className="flex items-center justify-between pt-2">
                                <span className="text-xs text-muted-foreground"> IQD</span>
                                <span className="text-xs text-muted-foreground">
                                    {/* {filters.maxAmount?.toLocaleString() || 1000000} IQD */}
                                </span>
                            </div>
                            <Slider
                                defaultValue={[0, 1000000]}
                                max={1000000}
                                step={10000}
                                className="py-2"
                            />
                        </div>
                        <Separator />
                        <div className="space-y-2">
                            <h4 className="font-medium leading-none">Transaction Status</h4>
                            <Select>
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
                            <Select>
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
                        <Tabs className="w-full">
                            <h4 className="font-medium leading-none">Time period</h4>
                            <TabsList className="w-full">
                                <TabsTrigger value="day">24h</TabsTrigger>
                                <TabsTrigger value="week">Week</TabsTrigger>
                                <TabsTrigger value="month">Month</TabsTrigger>
                                <TabsTrigger value="year">Year</TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <Button variant="outline" size="sm" className="mt-2">
                            <X className="mr-2 h-3.5 w-3.5" />
                            Reset Filters
                        </Button>
                    </div>

                </PopoverContent>
            </Popover>
        </div>
    )
}

