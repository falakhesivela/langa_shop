import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, InfoSection } from "@/components/info-page";
import { APP_NAME, SUPPORT_EMAIL } from "@/lib/config";

export const metadata: Metadata = {
  title: `FAQ · ${APP_NAME}`,
  description: `Answers to common questions about ${APP_NAME} orders, delivery, payments, and returns.`,
};

export default function FaqPage() {
  return (
    <InfoPage
      title="Frequently asked questions"
      intro="The quick answers. If yours isn't here, get in touch — we're happy to help."
    >
      <InfoSection heading="Do I need an account to order?">
        <p>
          No — you can check out as a guest with just an email address for your
          confirmation. Creating an account lets you track orders, save
          delivery addresses, keep a wishlist, and request returns.
        </p>
      </InfoSection>

      <InfoSection heading="How do I pay?">
        <p>
          Payments are processed securely by Paystack. You can pay by card and
          the other methods Paystack offers at checkout. We never see or store
          your card details.
        </p>
      </InfoSection>

      <InfoSection heading="How long does delivery take?">
        <p>
          Most orders ship within 1–2 business days and arrive within 2–5
          business days depending on the courier service you choose at
          checkout. Once your order ships you&apos;ll get a tracking link by
          email. More detail on our <Link href="/shipping">delivery page</Link>.
        </p>
      </InfoSection>

      <InfoSection heading="Can I cancel or change my order?">
        <p>
          You can cancel an order yourself while it&apos;s still awaiting
          payment, from the order&apos;s page under{" "}
          <Link href="/account/orders">My Orders</Link>. Once an order is paid
          we may already be packing it — email{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> as soon as
          possible and we&apos;ll do our best.
        </p>
      </InfoSection>

      <InfoSection heading="What's your returns policy?">
        <p>
          Unworn items with tags attached can be returned within 30 days of
          delivery. Request the return from the order&apos;s page and
          we&apos;ll take it from there. Full details in the{" "}
          <Link href="/returns">returns policy</Link>.
        </p>
      </InfoSection>

      <InfoSection heading="An item I want is sold out — now what?">
        <p>
          On the product page, tap &quot;Notify me&quot; for your size and
          we&apos;ll email you the moment it&apos;s back in stock.
        </p>
      </InfoSection>

      <InfoSection heading="What if my payment goes through but the item sells out?">
        <p>
          Very occasionally the last unit sells while a payment is confirming.
          If that happens, we refund you automatically and in full — you&apos;ll
          get an email, and the money returns to your original payment method
          within a few business days.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
