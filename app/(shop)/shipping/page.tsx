import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, InfoSection } from "@/components/info-page";
import { APP_NAME, SUPPORT_EMAIL } from "@/lib/config";

export const metadata: Metadata = {
  title: `Delivery · ${APP_NAME}`,
  description: `How ${APP_NAME} delivery works: couriers, costs, timing, and tracking.`,
};

export default function ShippingPage() {
  return (
    <InfoPage
      title="Delivery"
      intro="We ship across South Africa with trusted courier partners."
    >
      <InfoSection heading="Costs and options">
        <p>
          Delivery options and exact costs are quoted live at checkout for your
          address — enter your delivery details and choose the courier service
          that suits you. What you see at checkout is what you pay; there are
          no surprises later.
        </p>
      </InfoSection>

      <InfoSection heading="Timing">
        <p>
          Orders are packed and handed to the courier within 1–2 business days
          of payment. Delivery usually takes a further 2–5 business days
          depending on the service you chose and where you are — main centres
          are faster, outlying areas can take a little longer.
        </p>
      </InfoSection>

      <InfoSection heading="Tracking">
        <p>
          As soon as your order ships you&apos;ll receive an email with a
          tracking link. You can also find the tracking status any time under{" "}
          <Link href="/account/orders">My Orders</Link>.
        </p>
      </InfoSection>

      <InfoSection heading="Something wrong with your delivery?">
        <p>
          If your parcel is delayed, damaged, or hasn&apos;t arrived, email us
          at <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> with your
          order number and we&apos;ll chase it with the courier for you.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
