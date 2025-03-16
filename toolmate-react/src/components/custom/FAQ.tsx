import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQSection({
  isVisible
}: {
  isVisible: boolean
}) {
  return (
    <section className={`${isVisible && "hidden"} w-full max-w-4xl mx-auto px-4 py-12`}>
      <div className="text-center mb-12 w-full flex items-center justify-center flex-col">
        <h2 className="text-3xl font-bold mb-4 text-center">Frequently Asked Questions</h2>
        <p className="text-muted-foreground">
          Can't find the answer you're looking for? Reach out to our{" "}
          <Link to="/contact" className="text-primary hover:underline">
            customer support
          </Link>{" "}
          team.
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {/* Question 1: Plan Changes */}
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-[8px]">Can I change my subscription plan later?</AccordionTrigger>
          <AccordionContent className="text-left flex items-start w-full flex-col leading-8 font-semibold">
            Yes, you can change your subscription plan at any time.
            <ul className="list-disc pl-4">
              <li><strong>Upgrading:</strong> Upgrades take effect immediately. The unused portion of your current plan will be credited toward the new plan, and the new billing cycle will begin on the upgrade date.</li>
              <li><strong>Downgrading:</strong> Downgrades take effect at the end of your current billing cycle.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        {/* Question 2: Refund Policy */}
        <AccordionItem value="item-2">
          <AccordionTrigger className="text-[8px]">What is the refund policy for subscriptions?</AccordionTrigger>
          <AccordionContent className="text-left flex items-start w-full flex-col leading-8 font-semibold">
            Refunds are available under specific conditions:
            <ul className="list-disc pl-4">
              <li>You cancel your subscription within 7 days of purchase or renewal.</li>
              <li>You have not used any premium features during this period.</li>
            </ul>
            To request a refund, email us at{" "}
            <Link to="mailto:contact@toolmate.com.au" className="text-primary hover:underline">
              contact@toolmate.com.au
            </Link>. Refunds are reviewed on a case-by-case basis and processed within 7 business days.
          </AccordionContent>
        </AccordionItem>

        {/* Question 3: Subscription Cancellation */}
        <AccordionItem value="item-3">
          <AccordionTrigger className="text-[8px]">How can I cancel my subscription?</AccordionTrigger>
          <AccordionContent className="text-left flex items-start w-full flex-col leading-8 font-semibold">
            You can cancel your subscription in two ways:
            <ul className="list-disc pl-4">
              <li><strong>Through Your Account:</strong> Log into your ToolMate account, go to the Subscription section under Account Settings, and select Cancel Subscription.</li>
              <li><strong>Email Support:</strong> If you face issues, email us at{" "}
                <Link to="mailto:contact@toolmate.com.au" className="text-primary hover:underline">
                  contact@toolmate.com.au
                </Link> with your account details.
              </li>
            </ul>
            Cancellations take effect at the end of the current billing cycle, and no prorated refunds are provided.
          </AccordionContent>
        </AccordionItem>

        {/* Question 4: Recurring Renewal */}
        <AccordionItem value="item-4">
          <AccordionTrigger className="text-[8px]">Will my subscription renewal price remain the same?</AccordionTrigger>
          <AccordionContent className="text-left flex items-start w-full flex-col leading-8 font-semibold">
            Yes, your subscription renewal price will remain locked at the original rate as long as your subscription remains active. If changes are made to plans or pricing, we will notify you in advance.
          </AccordionContent>
        </AccordionItem>

        {/* Question 5: Failed Payment */}
        <AccordionItem value="item-5">
          <AccordionTrigger className="text-[8px]">What happens if my payment fails?</AccordionTrigger>
          <AccordionContent className="text-left flex items-start w-full flex-col leading-8 font-semibold">
            If your payment fails, your subscription will remain active until the end of the current billing cycle. Please update your payment method in your account to ensure uninterrupted access.
          </AccordionContent>
        </AccordionItem>

        {/* Question 6: Payment Issues */}
        <AccordionItem value="item-6">
          <AccordionTrigger className="text-[8px]">I am unable to pay with my Amex card. What should I do?</AccordionTrigger>
          <AccordionContent className="text-left flex items-start w-full flex-col leading-8 font-semibold">
            If you're experiencing issues with Amex payments, try an alternative payment method or contact our support team for assistance.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}
