import { useEffect, useState } from "react"
import { MerchantTable } from "@/components/merchants/merchant-table"
import { Merchant } from "@/types/transactions"
import { useStore } from "@/lib/store"

interface MerchantProps {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  isLoading: boolean
}

export default function MerchantHistory({ merchants, merchantsProps, setMerchantsProps }: { merchants: Merchant[], merchantsProps: MerchantProps, setMerchantsProps: ({ }: MerchantProps) => void }) {

  if (!merchants) {
    return null
  }

  const { merchantSort, setMerchantSort } = useStore()
  const [page, setPage] = useState(merchantsProps.page)
  const [pageSize, setPageSize] = useState(merchantsProps.pageSize)

  useEffect(() => {
    setMerchantsProps({
      ...merchantsProps,
      page: page,
      pageSize: pageSize,
    })
  }, [page, pageSize])

  const handleSort = (field: keyof Merchant) => {
    setMerchantSort({
      field,
      direction: merchantSort.field === field && merchantSort.direction === "asc" ? "desc" : "asc",
    })
  }

  return (
    <div className="">
      <MerchantTable
        merchants={merchants}
        isLoading={merchantsProps.isLoading}
        onSort={handleSort}
        currentSort={merchantSort}
        page={merchantsProps.page}
        pageSize={merchantsProps.pageSize}
        totalItems={merchantsProps.totalItems}
        totalPages={merchantsProps.totalPages}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  )
}
