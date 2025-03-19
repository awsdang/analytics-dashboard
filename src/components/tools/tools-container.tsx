
import { Filters } from "@/components/tools/filters"
import { Input } from "@/components/ui/input"
import { useStore } from "@/lib/store"
import { useEffect, useState } from "react"
import { ExportTool } from "./export"
import { RefreshTool } from "./refresh"

function ToolsContainer() {
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
                    <RefreshTool/>
                    <ExportTool/>
                   
                </div>
            </div>
        </>
    )
}

export default ToolsContainer
