
import { Button } from "@/components/ui/button"
import { Download, RefreshCw } from "lucide-react"
import { Filters } from "@/components/tools/filters"
import { Input } from "@/components/ui/input"
import { useStore } from "@/lib/store"
import { useEffect, useState } from "react"

function ToolsContainer({isConnected, onRefresh, onExport}: {isConnected:boolean, onRefresh: () => void, onExport: () => void}) {
    const { setSearchQuery } = useStore()
    const [searchInput, setSearchInput] = useState<string>('')
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchQuery(searchInput)
        }, 1000)

        return () => clearTimeout(timer)
    }, [searchInput, setSearchQuery])


    return (
        <>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-row gap-4">
                    <Filters />
                </div>
                <div className="flex items-center gap-2">
                    <Input type="search" placeholder="Search..." className="md:w-[300px] lg:w-[400px]" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
                    <Button variant="outline" size="sm" onClick={onRefresh}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                        {isConnected &&
                        <span className="ml-2 h-2 w-2 rounded-full bg-green-500" title="Real-time updates active"></span>}
                    </Button>
                    <Button variant="outline" size="sm" onClick={onExport}>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </div>
            </div>
        </>
    )
}

export default ToolsContainer
