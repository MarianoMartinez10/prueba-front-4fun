"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface TableSkeletonProps {
    rows?: number;
    columns?: number;
    showImage?: boolean; // If true, first column is bigger for image
    showCheckbox?: boolean;
}

export function TableSkeleton({
    rows = 5,
    columns = 4,
    showImage = true,
    showCheckbox = false,
}: TableSkeletonProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        {showCheckbox && (
                            <TableHead className="w-[50px]">
                                <Skeleton className="h-4 w-4" />
                            </TableHead>
                        )}
                        {Array.from({ length: columns }).map((_, i) => (
                            <TableHead key={i}>
                                <Skeleton className="h-4 w-24" />
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: rows }).map((_, i) => (
                        <TableRow key={i}>
                            {showCheckbox && (
                                <TableCell>
                                    <Skeleton className="h-4 w-4" />
                                </TableCell>
                            )}
                            {Array.from({ length: columns }).map((_, j) => (
                                <TableCell key={j}>
                                    {j === 0 && showImage ? (
                                        <Skeleton className="h-12 w-20 rounded" />
                                    ) : (
                                        <Skeleton className="h-4 w-full" />
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

export function DashboardCardSkeleton() {
    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow space-y-2 p-6">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-3/4" />
        </div>
    )
}
