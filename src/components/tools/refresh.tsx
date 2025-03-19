

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useStore } from "@/lib/store"
import { RefreshCw } from "lucide-react"
import { Slider } from "@/components/ui/slider"

export function RefreshTool() {
    const {connectionStatus, setConnectionStatus, refreshInterval , setRefreshInterval} = useStore()

    const handleConnection = () => {
        if (connectionStatus === 'connected') {
            setConnectionStatus('disconnected')
        } else if (connectionStatus === 'disconnected') {
            setConnectionStatus('connecting')
            // Simulate connection process
            setTimeout(() => {
                setConnectionStatus('connected')
                setRefreshInterval(refreshInterval === 5000 ? 4999 : 5000)
            }, 1000)
        } else if (connectionStatus === 'connecting') {
            // Cancel connecting attempt
            setConnectionStatus('disconnected')
        }
    }

    return (
        <div className="flex items-center gap-2">
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                    <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh

                      
                        <span className={`ml-2 h-2 w-2 rounded-full ${connectionStatus === "connected" ? "bg-green-500" : connectionStatus === "disconnected" ? "bg-red-500" :"bg-amber-500" }`} title="Real-time updates active"></span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="p-1.5 space-y-1 w-full" align="end">
                    <div className="p-1">
                    <span className="text-sm">Refresh Interval</span>
                    <span className="text-sm font-bold mx-1">{Math.round(refreshInterval/1000)}</span>
                    <span className="text-sm">s</span>
                    </div>
                   <Slider step={100} min={100} max={10000} value={[refreshInterval]} onValueChange={(e)=>setRefreshInterval(e[0])} className="w-64 p-4"/>
                   <Button onClick={handleConnection} disabled={connectionStatus==='connecting'} variant={connectionStatus === "connected" ? 'destructive' : 'secondary'} className="w-full cursor-pointer"> {connectionStatus === "connected" ? "Disconnect" : "Connect"}</Button>
                </PopoverContent>
            </Popover>
        </div>
    )
}

