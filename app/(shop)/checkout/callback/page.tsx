"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/components/cart-context";
import { verifyPayment } from "@/lib/api/orders";
import { getErrorMessage } from "@/lib/api/errors";
import { useAuth } from "@/lib/auth/context";
import { formatPrice } from "@/lib/products";
import type { Order } from "@/lib/types/order";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";

function CheckoutCallbackContent() {
  const router = useRouter();
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

  useEffect(() => {
    if (authLoading || hasVerified) {
      return;
    }

    if (!reference) {
      setError("Missing payment reference.");
      return;
    }

    if (!isAuthenticated) {
      const nextUrl = `/checkout/callback?reference=${encodeURIComponent(reference)}`;
      router.replace(`/login?next=${encodeURIComponent(nextUrl)}`);
      return;
    }

    async function verify() {
      setIsVerifying(true);
      try {
        const result = await verifyPayment(reference);
        setOrder(result.order);
        setPaymentStatus(result.payment_status);
        if (result.payment_status === "success") {
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
  }, [
    authLoading,
    hasVerified,
    isAuthenticated,
    reference,
    refresh,
    router,
  ]);

  if (authLoading || isVerifying) {
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

  if (!isAuthenticated) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-16 text-center">
        <h1 className="font-serif text-4xl">Sign in to confirm payment</h1>
        <p className="mt-4 text-muted-foreground">
          Your payment may have gone through. Sign in so we can link it to your
          order.
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
        <div className="mt-8">
          <Button href="/">Continue shopping</Button>
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
          : "Your payment could not be confirmed. You can try checkout again from your cart."}
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
                <span>
                  {item.product_name} · {item.size} × {item.quantity}
                </span>
                <span>
                  {formatPrice((item.unit_price_cents * item.quantity) / 100)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-4">
        <Button href="/account/orders">View orders</Button>
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
