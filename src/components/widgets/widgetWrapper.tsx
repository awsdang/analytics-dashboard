import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { XCircle } from "lucide-react"
import { Button } from "../ui/button"
import { Skeleton } from "../ui/skeleton"


interface WidgetProps {
    title: string
    description?: string
    Icon?: React.ComponentType<{ className?: string }>
    children: React.ReactNode
    className?: string
    error?: string
}




export default function Widget({ title, description, Icon, children, className, error }: WidgetProps) {
    return (
        <Card className={className}>
            <CardHeader className={Icon ? "flex flex-row items-center justify-between space-y-0 pb-2" : ""}>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
                {Icon &&
                    <Icon className="h-4 w-4 text-muted-foreground" />
                }
            </CardHeader>
            <CardContent>
                {error ? (
                    <div className="flex flex-col gap-2">
                        <Skeleton className="w-full h-4"/>
                        <Skeleton className="w-full h-4"/>
                        <Skeleton className="w-full h-36"/>
                        <div className="flex items-center space-x-2 rounded-md bg-red-50 border p-3">
                        <XCircle className="h-5 w-5 text-red-600" />
                        <span className="text-sm text-red-600">{error}</span>
                        </div>
                    <Button variant={'ghost'}>Retry</Button>
                  </div>
                ) : (
                    children
                )}
            </CardContent>
        </Card>
    )
}


