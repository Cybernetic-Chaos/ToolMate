"use client"

import { TransationLogs } from "@/types/types"
import { transactionColumns } from "../Columns"
import { DataTable } from "../data-table"

interface TransactionLogTableProps {
    transactionLogs: TransationLogs[] | undefined
}

export function TransactionLogTable({ transactionLogs }: TransactionLogTableProps) {
    if (!transactionLogs || transactionLogs.length === 0) {
        return <div className="container mx-auto py-10 rounded-md text-slate-600 font-semibold">No transaction logs To Show. Either Load The Logs Or Try Later</div>
    }

    return (
        <div className="container mx-auto py-5">
            <DataTable columns={transactionColumns} data={transactionLogs} />
        </div>
    )
}