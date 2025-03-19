import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pagination } from "../transactions/pagination"
import { Merchant } from "@/types/transactions"

import { MerchantSortOptions } from "@/types/dashboard"
import DialogContainer from '../transactions/dialog'
import MerchantDetails from './merchant-details'

interface MerchantTableProps {
  merchants: Merchant[]
  isLoading: boolean
  onSort: (field: keyof Merchant) => void
  currentSort: MerchantSortOptions
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

export function MerchantTable({
  merchants,
  isLoading,
  onSort,
  currentSort,
  page,
  pageSize,
  totalItems,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: MerchantTableProps) {
  const renderSortIcon = (field: keyof Merchant) => {
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
                <TableHead>Merchant Name</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Transaction Count</TableHead>
                <TableHead>Transaction Volume</TableHead>
                <TableHead>Average Transaction</TableHead>
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
                      <Skeleton className="h-4 w-[150px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[80px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[80px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
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

  if (!merchants.length) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center rounded-md border">
        <p className="text-sm text-muted-foreground">No merchants found</p>
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
                <Button variant="ghost" size="sm" onClick={() => onSort("name")} className="-ml-3">
                  Merchant Name
                  {renderSortIcon("name")}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => onSort("city")} className="-ml-3">
                  City
                  {renderSortIcon("city")}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => onSort("transactionCount")} className="-ml-3">
                  Transaction Count
                  {renderSortIcon("transactionCount")}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => onSort("transactionVolume")} className="-ml-3">
                  Transaction Volume
                  {renderSortIcon("transactionVolume")}
                </Button>
              </TableHead>
              <TableHead>Average Transaction</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {merchants.map((merchant) => (
              <TableRow key={merchant.id}>
                <TableCell className="font-mono text-xs">{merchant.id.substring(0, 8)}...</TableCell>
                <TableCell className="font-medium">{merchant.name}</TableCell>
                <TableCell>{merchant.city}</TableCell>
                <TableCell>{merchant.transactionCount.toLocaleString()}</TableCell>
                <TableCell>{merchant.transactionVolume.toLocaleString()} IQD</TableCell>
                <TableCell>
                  {merchant.transactionCount > 0
                    ? (merchant.transactionVolume / merchant.transactionCount).toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      }) + " IQD"
                    : "N/A"}
                </TableCell>
                <TableCell>
                  <DialogContainer title={'View merchant details'}>
                  <MerchantDetails merchantId={merchant.id}/>
                  </DialogContainer>
                  {/* <Button variant="ghost" size="icon" asChild>
                    <a href={`/merchants/${merchant.id}`}>
                      <ExternalLink className="h-4 w-4" />
                      <span className="sr-only">View merchant details</span>
                    </a>
                  </Button> */}
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
