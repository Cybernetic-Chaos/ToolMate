"use client"


import { RefundLog } from "@/types/types"
import { columns } from "../Columns"
import { DataTable } from "../data-table"

interface RefundLogsTableProps {
    refundLogs: RefundLog[] | undefined
}

export function RefundLogsTable({ refundLogs }: RefundLogsTableProps) {
    if (!refundLogs || refundLogs.length === 0) {
        return <div className="container mx-auto py-10 rounded-md text-slate-600 font-semibold">No refund logs To Show. Either Load The Logs Or Try Later</div>
    }

    return (
        <div className="container mx-auto py-10">
            <DataTable columns={columns} data={refundLogs} />
        </div>
    )
}
