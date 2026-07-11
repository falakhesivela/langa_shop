import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, InfoSection } from "@/components/info-page";
import { APP_NAME, SUPPORT_EMAIL } from "@/lib/config";

export const metadata: Metadata = {
  title: `Returns & Refunds · ${APP_NAME}`,
  description: `${APP_NAME}'s returns and refunds policy: what qualifies, how to request a return, and when you'll be refunded.`,
};

export default function ReturnsPage() {
  return (
    <InfoPage
      title="Returns & refunds"
      intro="Changed your mind, or something isn't right? Here's how returns work."
    >
      <InfoSection heading="What can be returned">
        <p>
          You can return any item within <strong>30 days of delivery</strong>{" "}
          as long as it is unworn, unwashed, and has its original tags
          attached. For hygiene reasons, underwear and swimwear can only be
          returned if the hygiene liner is intact.
        </p>
        <p>
          Defective or incorrectly supplied items can of course always be
          returned, in line with the Consumer Protection Act.
        </p>
      </InfoSection>

      <InfoSection heading="How to request a return">
        <p>
          Open the order under <Link href="/account/orders">My Orders</Link>{" "}
          and choose <strong>Request a return</strong> once the order shows as
          delivered, telling us briefly what you&apos;d like to return and why.
          We&apos;ll review the request and email you the return instructions.
          Checked out as a guest? Email{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> with your
          order number instead.
        </p>
      </InfoSection>

      <InfoSection heading="Refunds">
        <p>
          Once we&apos;ve received and checked the returned items, we&apos;ll
          refund you to your original payment method. Refunds usually reflect
          within 3–5 business days of being processed.
        </p>
        <p>
          If an order is cancelled after you&apos;ve paid — by you, by us, or
          because an item sold out as your payment was confirming — the full
          amount is refunded automatically and you&apos;ll be notified by
          email.
        </p>
      </InfoSection>

      <InfoSection heading="Return shipping">
        <p>
          For defective or incorrect items we cover the return courier. For
          change-of-mind returns the return shipping cost is for your account —
          we&apos;ll let you know the options when we approve the return.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
