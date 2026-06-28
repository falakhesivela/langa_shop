"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart-context";

export default function CartPage() {
  const router = useRouter();
  const { open } = useCart();

  useEffect(() => {
    open();
    router.replace("/");
  }, [open, router]);

  return null;
}
