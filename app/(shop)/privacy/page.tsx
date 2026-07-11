import type { Metadata } from "next";
import { InfoPage, InfoSection } from "@/components/info-page";
import { APP_NAME, SUPPORT_EMAIL } from "@/lib/config";

export const metadata: Metadata = {
  title: `Privacy Policy · ${APP_NAME}`,
  description: `How ${APP_NAME} collects, uses, and protects your personal information.`,
};

export default function PrivacyPage() {
  return (
    <InfoPage
      title="Privacy policy"
      intro="We collect only what we need to run the shop, and we treat it with care — in line with South Africa's Protection of Personal Information Act (POPIA)."
    >
      <InfoSection heading="What we collect">
        <p>
          When you shop with us we collect your name, email address, phone
          number, and delivery address, plus a record of your orders. If you
          create an account, we also store your login details (your password is
          stored only as a secure hash). If you join our newsletter or ask for
          a stock alert, we store the email address you gave us for that
          purpose.
        </p>
      </InfoSection>

      <InfoSection heading="How we use it">
        <p>
          Your information is used to process and deliver your orders, to send
          you transactional emails about them (confirmations, shipping updates,
          refunds), to respond when you contact us, and — only if you opted in —
          to send the newsletter. We don&apos;t sell or rent your personal
          information to anyone.
        </p>
      </InfoSection>

      <InfoSection heading="Who we share it with">
        <p>
          We share only what each partner needs to do its job: payment details
          are handled directly by <strong>Paystack</strong> (we never see your
          card number), delivery details go to our courier partners to get your
          parcel to you, and our email provider processes the emails we send
          you. These providers may not use your information for anything else.
        </p>
      </InfoSection>

      <InfoSection heading="Cookies and storage">
        <p>
          We use browser storage for the essentials only: keeping you signed
          in, remembering your bag, and remembering a guest checkout email so
          we can confirm your payment. We don&apos;t run third-party
          advertising trackers.
        </p>
      </InfoSection>

      <InfoSection heading="Your rights">
        <p>
          You may ask us at any time what personal information we hold about
          you, ask us to correct it, or ask us to delete it (subject to
          records we must keep by law, such as invoices). Unsubscribe links are
          included in every newsletter. To exercise any of these rights, email{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
        </p>
      </InfoSection>

      <InfoSection heading="Contact">
        <p>
          Questions about this policy or your data? Email{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
