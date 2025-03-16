import { TransationLogs } from "@/types/types";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TransationDetailsDialog({
    transaction,
    isVisible,
    setIsVisible
}: {
    transaction: TransationLogs;
    isVisible: boolean;
    setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
}){

    return (
        <Dialog open={isVisible} onOpenChange={(isOpen) => setIsVisible(isOpen)}>
            <DialogContent className={`sm:max-w-[425px] ${isVisible ? 'block' : 'hidden'}`}>
                <Card>
                    <CardHeader>
                        <CardTitle>Transaction Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="font-semibold">Gross Amount:</div>
                            <div>{`${transaction.amount_with_breakdown.gross_amount.value} ${transaction.amount_with_breakdown.gross_amount.currency_code}`}</div>
                            <div className="font-semibold">Fee Amount:</div>
                            <div>{`${transaction.amount_with_breakdown.fee_amount.value} ${transaction.amount_with_breakdown.fee_amount.currency_code}`}</div>
                            <div className="font-semibold">Net Amount:</div>
                            <div>{`${transaction.amount_with_breakdown.net_amount.value} ${transaction.amount_with_breakdown.net_amount.currency_code}`}</div>
                        </div>
                    </CardContent>
                </Card>
            </DialogContent>
        </Dialog>
    )




}