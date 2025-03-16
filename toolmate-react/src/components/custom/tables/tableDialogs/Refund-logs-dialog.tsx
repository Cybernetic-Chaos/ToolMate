import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RefundLog } from "@/types/types"
interface RefundDetailsDialogProps {
    refund: RefundLog
  }
  
  export function RefundDetailsDialog({ refund,isVisible,setIsVisible }: {
    refund: RefundLog,
    isVisible: boolean,
    setIsVisible: (value: boolean) => void
  }) {
    return (
      <Dialog open={isVisible} onOpenChange={(isOpen) => setIsVisible(isOpen)}>
        <DialogContent className={`sm:max-w-[425px] ${isVisible ? 'block' : 'hidden'}`}>
          <Card>
            <CardHeader>
              <CardTitle>Seller Payable Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="font-semibold">Gross Amount:</div>
                <div>{`${refund.seller_payable_breakdown.gross_amount.value} ${refund.seller_payable_breakdown.gross_amount.currency_code}`}</div>
                <div className="font-semibold">PayPal Fee:</div>
                <div>{`${refund.seller_payable_breakdown.paypal_fee.value} ${refund.seller_payable_breakdown.paypal_fee.currency_code}`}</div>
                <div className="font-semibold">Net Amount:</div>
                <div>{`${refund.seller_payable_breakdown.net_amount.value} ${refund.seller_payable_breakdown.net_amount.currency_code}`}</div>
                <div className="font-semibold">Total Refunded:</div>
                <div>{`${refund.seller_payable_breakdown.total_refunded_amount.value} ${refund.seller_payable_breakdown.total_refunded_amount.currency_code}`}</div>
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    )
  }
  
  