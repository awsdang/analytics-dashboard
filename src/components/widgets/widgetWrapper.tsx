import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export default function Widget({ title, description, Icon, children, className }: { title: string, description?: string, Icon?: React.ComponentType<{ className?: string }>, children: React.ReactNode, className?: string }) {
    return (
        <Card className={className}>
            <CardHeader className={Icon ? "flex flex-row items-center justify-between space-y-0 pb-2" : ""}>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
                {Icon &&
                <Icon className="h-4 w-4 text-muted-foreground"/>
                }
            </CardHeader>
            <CardContent>
                {children}
            </CardContent>
        </Card>
    )
}


