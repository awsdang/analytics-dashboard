import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function MerchantHistorySkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Skeleton className="h-10 w-[300px]" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      <Skeleton className="h-10 w-[200px]" />

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[200px] mb-2" />
          <Skeleton className="h-4 w-[300px]" />
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="h-10 border-b px-4 flex items-center">
              <div className="flex w-full justify-between">
                {Array(7)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} className="h-4 w-[100px]" />
                  ))}
              </div>
            </div>
            <div className="px-4 py-2">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex w-full justify-between items-center py-3">
                    {Array(7)
                      .fill(0)
                      .map((_, j) => (
                        <Skeleton key={j} className="h-4 w-[100px]" />
                      ))}
                  </div>
                ))}
            </div>
          </div>
          <div className="mt-4">
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
