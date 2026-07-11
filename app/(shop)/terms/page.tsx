import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, InfoSection } from "@/components/info-page";
import { APP_NAME, SUPPORT_EMAIL } from "@/lib/config";

export const metadata: Metadata = {
  title: `Terms of Service · ${APP_NAME}`,
  description: `The terms that apply when you shop with ${APP_NAME}.`,
};

export default function TermsPage() {
  return (
    <InfoPage
      title="Terms of service"
      intro={`These terms apply when you use this site or place an order with ${APP_NAME}. Placing an order means you accept them.`}
    >
      <InfoSection heading="Orders and payment">
        <p>
          An order is confirmed once your payment has been successfully
          processed by Paystack and you receive an order confirmation. All
          prices are shown in South African Rand and include VAT where
          applicable. Delivery is charged separately at the rate you select at
          checkout.
        </p>
      </InfoSection>

      <InfoSection heading="Availability">
        <p>
          Everything on the site is subject to availability. In the rare case
          that an item sells out while your payment is being confirmed, we
          cancel that order and refund you automatically and in full.
        </p>
      </InfoSection>

      <InfoSection heading="Delivery">
        <p>
          We deliver within South Africa via courier. Delivery estimates are
          set out on the <Link href="/shipping">delivery page</Link> and are
          estimates, not guarantees — though we and our couriers do our best to
          meet them.
        </p>
      </InfoSection>

      <InfoSection heading="Returns">
        <p>
          Returns and refunds are governed by our{" "}
          <Link href="/returns">returns policy</Link>, which forms part of
          these terms. Nothing in these terms limits your rights under the
          Consumer Protection Act or the Electronic Communications and
          Transactions Act.
        </p>
      </InfoSection>

      <InfoSection heading="Your account">
        <p>
          You&apos;re responsible for keeping your account credentials safe and
          for everything done under your account. Let us know immediately if
          you suspect someone else is using it.
        </p>
      </InfoSection>

      <InfoSection heading="Content and conduct">
        <p>
          Product reviews must be honest and your own. We may remove reviews
          that are abusive, off-topic, or spam. All content on this site —
          images, text, and branding — belongs to {APP_NAME} and may not be
          reused without permission.
        </p>
      </InfoSection>

      <InfoSection heading="Changes and contact">
        <p>
          We may update these terms from time to time; the version on this page
          applies to new orders. Questions? Email{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
