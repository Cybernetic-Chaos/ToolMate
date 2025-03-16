import { useSubscription } from "@/context/SubscriptionDetailsContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function PaymentLogs() {
    const { paymentLogs } = useSubscription();




    if (paymentLogs.length === 0) {
        return <div className="w-full p-4 text-center">No subscription logs found.</div>;
    }

    return (
        <div className="w-full p-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-[#FF8F00]">Subscription ID</TableHead>
                        <TableHead className="text-[#FF8F00]">Plan Name</TableHead>
                        <TableHead className="text-[#FF8F00]">Coupon Applied</TableHead>
                        <TableHead className="text-[#FF8F00]">Coupon Code</TableHead>
                        <TableHead className="text-[#FF8F00]">Base Billing Plan ID</TableHead>
                        <TableHead className="text-[#FF8F00]">Status</TableHead>
                        <TableHead className="text-[#FF8F00]">Activity Date</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paymentLogs.map((payment, index) => (
                        <TableRow key={index}>
                            <TableCell className="font-medium text-[#FF5900]">
                                {payment.subscriptionId}
                            </TableCell>
                            <TableCell>{payment.planName}</TableCell>
                            <TableCell>{payment.isCouponApplied ? "Yes" : "No"}</TableCell>
                            <TableCell>{payment.couponCode || "-"}</TableCell>
                            <TableCell>{payment.baseBillingPlanId || "-"}</TableCell>
                            <TableCell className={payment.status.includes("ACTIVE") ? "text-green-600" : "text-red-600"}>
                                {payment.status}
                            </TableCell>
                            <TableCell>{new Date(payment.createdAt).toLocaleString()}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}