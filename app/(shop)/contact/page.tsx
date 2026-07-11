import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, InfoSection } from "@/components/info-page";
import { APP_NAME, SUPPORT_EMAIL } from "@/lib/config";

export const metadata: Metadata = {
  title: `Contact Us · ${APP_NAME}`,
  description: `Get in touch with the ${APP_NAME} team about orders, returns, or anything else.`,
};

export default function ContactPage() {
  return (
    <InfoPage
      title="Contact us"
      intro="Questions about an order, a return, or anything else — we're happy to help."
    >
      <InfoSection heading="Email">
        <p>
          Write to us at{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> and we&apos;ll
          get back to you within one business day. Include your order number
          (you&apos;ll find it in your confirmation email or under{" "}
          <Link href="/account/orders">My Orders</Link>) so we can help faster.
        </p>
      </InfoSection>

      <InfoSection heading="Order questions">
        <p>
          You can check the status of any order, track your delivery, or cancel
          an unpaid order yourself from{" "}
          <Link href="/account/orders">your order history</Link>. Delivered
          something that isn&apos;t right? Request a return straight from the
          order page — see our <Link href="/returns">returns policy</Link> for
          the details.
        </p>
      </InfoSection>

      <InfoSection heading="Hours">
        <p>
          We answer email Monday to Friday, 9:00–17:00 (SAST), excluding South
          African public holidays.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
