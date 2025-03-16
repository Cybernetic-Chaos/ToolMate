"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { RefundLog, TransationLogs } from "@/types/types"
import { RefundDetailsDialog } from "./tableDialogs/Refund-logs-dialog"
import { useEffect, useState } from "react"
import TransationDetailsDialog from "./tableDialogs/TransationDetailsDialog"

export const columns: ColumnDef<RefundLog>[] = [
    {
        accessorKey: "id",
        header: "Refund ID",
    },
    {
        accessorKey: "status",
        header: "Status",
    },
    {
        accessorKey: "amount",
        header: "Amount",
    },
    {
        accessorKey: "createdAt",
        header: "Activity Date",
        cell: ({ row }) => row.getValue("createdAt"),
    },
    {
        id: "actions",
        header: "Refund Details",
        accessorKey: "actions",
        cell: ({ row }) => {
            const refund = row.original
            const [isVisible, setIsVisible] = useState(false)
            useEffect(() => {
                console.log("isVisible", isVisible)
            }, [isVisible])
            return <div>
                <Button onClick={() => setIsVisible(true)}>View</Button>
                <RefundDetailsDialog refund={refund} isVisible={isVisible} setIsVisible={setIsVisible} />
            </div>

        },
    },
]

export const transactionColumns: ColumnDef<TransationLogs>[] = [
    {
        accessorKey: "id",
        header: "Transaction ID",
    },
    {
        accessorKey: "status",
        header: "Status",
    },
    {
        accessorKey: "time",
        header: "Activity Date",
    },
    {
        id: "actions",
        header: "Transaction Amount ",
        accessorKey: "actions",
        cell: ({ row }) => {
            const transaction = row.original
            const [isVisible, setIsVisible] = useState(false)
            return <div>
                <Button onClick={() => setIsVisible(true)} className="bg-amberYellow text-black hover:bg-yellow">View</Button>
                <TransationDetailsDialog transaction={transaction} isVisible={isVisible} setIsVisible={setIsVisible} />
            </div>

        },
    }


]
