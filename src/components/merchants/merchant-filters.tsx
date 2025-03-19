
import { Filter, X } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface MerchantFiltersProps {
  filters: {
    city: string
    minTransactions?: number
    maxTransactions?: number
    minVolume?: number
    maxVolume?: number
  }
  setFilters: (filters: any) => void
}

export function MerchantFilters({ filters, setFilters }: MerchantFiltersProps) {
  const handleTransactionCountChange = (values: number[]) => {
    setFilters({
      ...filters,
      minTransactions: values[0],
      maxTransactions: values[1],
    })
  }

  const handleVolumeChange = (values: number[]) => {
    setFilters({
      ...filters,
      minVolume: values[0],
      maxVolume: values[1],
    })
  }

  const handleCityChange = (value: string) => {
    setFilters({
      ...filters,
      city: value,
    })
  }

  const resetFilters = () => {
    setFilters({
      city: "all",
      minTransactions: undefined,
      maxTransactions: undefined,
      minVolume: undefined,
      maxVolume: undefined,
    })
  }

  const hasActiveFilters =
    filters.minTransactions !== undefined ||
    filters.maxTransactions !== undefined ||
    filters.minVolume !== undefined ||
    filters.maxVolume !== undefined ||
    filters.city !== "all"

  const activeFilterCount = [
    filters.minTransactions !== undefined || filters.maxTransactions !== undefined,
    filters.minVolume !== undefined || filters.maxVolume !== undefined,
    filters.city !== "all",
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
        <PopoverContent className="w-[320px] p-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Transaction Count</h4>
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-muted-foreground">
                  {filters.minTransactions?.toLocaleString() || 0}
                </span>
                <span className="text-xs text-muted-foreground">
                  {filters.maxTransactions?.toLocaleString() || 10000}
                </span>
              </div>
              <Slider
                defaultValue={[filters.minTransactions || 0, filters.maxTransactions || 10000]}
                max={10000}
                step={100}
                onValueChange={handleTransactionCountChange}
                className="py-2"
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Transaction Volume (IQD)</h4>
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-muted-foreground">{filters.minVolume?.toLocaleString() || 0} IQD</span>
                <span className="text-xs text-muted-foreground">
                  {filters.maxVolume?.toLocaleString() || 10000000} IQD
                </span>
              </div>
              <Slider
                defaultValue={[filters.minVolume || 0, filters.maxVolume || 10000000]}
                max={10000000}
                step={100000}
                onValueChange={handleVolumeChange}
                className="py-2"
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-medium leading-none">City</h4>
              <Select defaultValue={filters.city || "all"} onValueChange={handleCityChange}>
                <SelectTrigger className="h-8 w-full">
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  <SelectItem value="Baghdad">Baghdad</SelectItem>
                  <SelectItem value="Erbil">Erbil</SelectItem>
                  <SelectItem value="Basra">Basra</SelectItem>
                  <SelectItem value="Mosul">Mosul</SelectItem>
                  <SelectItem value="Najaf">Najaf</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm" onClick={resetFilters} className="mt-2">
              <X className="mr-2 h-3.5 w-3.5" />
              Reset Filters
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
