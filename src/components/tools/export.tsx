

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { useStore } from "@/lib/store"
import { Download } from "lucide-react"
import { exportData, exportMerchants} from "@/service/export-data"


export function ExportTool() {
    const {timeRange, filters, merchantSort, transactionSort} = useStore()

    const handleTransactionData = async () => {
        try {
            await exportData(timeRange, 'qi-transactions', 'csv', filters, transactionSort)
        }
        catch (err) {
            console.error("Failed to export transaction data:", err)
        }
    }  
    const handleMerchantsData = async () => {
        try {
            await exportMerchants(timeRange, 'qi-merchants','csv', filters, merchantSort)
        }
        catch (err) {
            console.error("Failed to export merchants data:", err)
        }
    }

    return (
        <div className="flex items-center gap-2">
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="p-1.5 space-y-1 w-full" align="end">
                    <Button variant={'ghost'} onClick={handleTransactionData}>
                        Export Transactions Data
                    </Button>
                    <Separator/>
                    <Button variant={'ghost'} onClick={handleMerchantsData}>
                        Export Merchants Data
                    </Button>
                </PopoverContent>
            </Popover>
        </div>
    )
}

