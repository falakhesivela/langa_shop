"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/components/cart-context";
import { guestVerifyPayment, verifyPayment } from "@/lib/api/orders";
import {
  clearGuestCart,
  clearGuestCheckoutEmail,
  getGuestCheckoutEmail,
} from "@/lib/cart/guest-cart";
import { getErrorMessage } from "@/lib/api/errors";
import { useAuth } from "@/lib/auth/context";
import { formatPrice } from "@/lib/products";
import { ColorSwatch } from "@/components/color-swatch";
import type { Order } from "@/lib/types/order";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";

function CheckoutCallbackContent() {
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { refresh } = useCart();
  const reference =
    searchParams.get("reference") ?? searchParams.get("trxref") ?? "";
  const [order, setOrder] = useState<Order | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasVerified, setHasVerified] = useState(false);
  // A guest whose checkout email we no longer have (cleared storage / new
  // device) can't be verified automatically and is asked to sign in.
  const [needsSignIn, setNeedsSignIn] = useState(false);

  useEffect(() => {
    if (authLoading || hasVerified || !reference) {
      return;
    }

    async function verify() {
      const guestEmail = getGuestCheckoutEmail();
      if (!isAuthenticated && !guestEmail) {
        setNeedsSignIn(true);
        setHasVerified(true);
        return;
      }

      setIsVerifying(true);
      try {
        const result = isAuthenticated
          ? await verifyPayment(reference)
          : await guestVerifyPayment(reference, guestEmail as string);
        setOrder(result.order);
        setPaymentStatus(result.payment_status);
        if (result.payment_status === "success") {
          if (!isAuthenticated) {
            clearGuestCart();
            clearGuestCheckoutEmail();
          }
          await refresh();
        }
      } catch (err) {
        setError(getErrorMessage(err, "Unable to verify payment."));
      } finally {
        setIsVerifying(false);
        setHasVerified(true);
      }
    }

    void verify();
  }, [authLoading, hasVerified, isAuthenticated, reference, refresh]);

  if (!reference) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-16">
        <h1 className="font-serif text-4xl">Payment verification failed</h1>
        <Alert className="mt-6">Missing payment reference.</Alert>
        <div className="mt-8">
          <Button href="/">Continue shopping</Button>
        </div>
      </main>
    );
  }

  if (authLoading || isVerifying || (!hasVerified && !needsSignIn)) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-16 text-center">
        <h1 className="font-serif text-4xl">Verifying payment</h1>
        <p className="mt-4 text-muted-foreground">
          {authLoading
            ? "Restoring your session after checkout..."
            : "Please wait while we confirm your order with Paystack."}
        </p>
      </main>
    );
  }

  // Guest with no stored email (e.g. cleared storage or a different device):
  // we can't verify automatically, so offer to sign in and link the order.
  if (needsSignIn) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-16 text-center">
        <h1 className="font-serif text-4xl">Confirm your payment</h1>
        <p className="mt-4 text-muted-foreground">
          Your payment may have gone through, but we couldn&apos;t match it to
          your order automatically. Sign in with the email you used at checkout
          to view your order.
        </p>
        <div className="mt-8">
          <Button
            href={`/login?next=${encodeURIComponent(`/checkout/callback?reference=${reference}`)}`}
          >
            Sign in
          </Button>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-16">
        <h1 className="font-serif text-4xl">Payment verification failed</h1>
        <Alert className="mt-6">{error}</Alert>
        <p className="mt-4 text-sm text-muted-foreground">
          This can be a temporary glitch — if you completed the payment, checking
          again usually resolves it. Your card is never charged twice.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button
            onClick={() => {
              setError(null);
              setHasVerified(false);
            }}
          >
            Check again
          </Button>
          <Button variant="secondary" href="/checkout">
            Back to checkout
          </Button>
        </div>
      </main>
    );
  }

  const isSuccess =
    paymentStatus === "success" && order?.status === "paid";

  return (
    <main className="mx-auto max-w-2xl px-5 py-16">
      <h1 className="font-serif text-4xl">
        {isSuccess ? "Thank you for your order" : "Payment incomplete"}
      </h1>
      <p className="mt-4 text-muted-foreground">
        {isSuccess
          ? "Your payment was confirmed. We will prepare your order for shipping."
          : "Your payment could not be confirmed. Your bag is untouched — you can try again below, or check once more if you did complete the payment."}
      </p>

      {order ? (
        <div className="mt-10 rounded-sm border border-border p-6">
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Order</dt>
              <dd>#{order.id}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Status</dt>
              <dd className="capitalize">{order.status}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Total</dt>
              <dd>{formatPrice(order.total_cents / 100)}</dd>
            </div>
            {order.paystack_reference ? (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Reference</dt>
                <dd className="break-all text-right">{order.paystack_reference}</dd>
              </div>
            ) : null}
          </dl>

          <ul className="mt-6 divide-y divide-border border-t border-border">
            {order.items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-4 py-3 text-sm"
              >
                <span className="inline-flex items-center gap-2">
                  {item.product_name} · {item.size}
                  {item.color ? (
                    <ColorSwatch color={item.color} size="sm" />
                  ) : null}{" "}
                  × {item.quantity}
                </span>
                <span>
                  {formatPrice((item.unit_price_cents * item.quantity) / 100)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {isSuccess && !isAuthenticated ? (
        <p className="mt-8 text-sm text-muted-foreground">
          We&apos;ve emailed your confirmation. Want to track this and future
          orders?{" "}
          <Link
            href="/register"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Create an account
          </Link>{" "}
          with the same email to see your order history.
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center gap-4">
        {isSuccess ? (
          isAuthenticated ? (
            <Button href="/account/orders">View orders</Button>
          ) : null
        ) : (
          <>
            <Button href="/checkout">Try payment again</Button>
            <Button
              variant="secondary"
              onClick={() => {
                setError(null);
                setHasVerified(false);
              }}
            >
              Check payment again
            </Button>
          </>
        )}
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium uppercase tracking-wide text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Continue shopping
        </Link>
      </div>
    </main>
  );
}

export default function CheckoutCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-2xl px-5 py-16 text-center">
          <h1 className="font-serif text-4xl">Verifying payment</h1>
        </main>
      }
    >
      <CheckoutCallbackContent />
    </Suspense>
  );
}
