"use client";

import { useState } from "react";
import { useCart } from "@/components/cart-context";
import { useToast } from "@/components/ui/Toast";
import { getProduct } from "@/lib/api/products";
import { mapShopProduct } from "@/lib/products";
import { getVariantStock } from "@/lib/stock";
import type { OrderItem } from "@/lib/types/order";
import { Button } from "@/components/ui/Button";

/**
 * Re-adds an order's items to the bag. Each product is re-fetched so prices,
 * availability, and stock are current — unavailable lines are skipped and
 * reported rather than failing the whole action.
 */
export function ReorderButton({
  items,
  className,
}: {
  items: OrderItem[];
  className?: string;
}) {
  const { addItem, open } = useCart();
  const { toast } = useToast();
  const [isBusy, setIsBusy] = useState(false);

  async function handleReorder() {
    setIsBusy(true);
    let added = 0;
    let skipped = 0;

    for (const item of items) {
      if (!item.product_id) {
        skipped += 1;
        continue;
      }
      try {
        const product = mapShopProduct(await getProduct(item.product_id));
        const color = item.color ?? "";
        const stock = getVariantStock(
          product.variantStock,
          product.stock,
          item.size,
          color,
        );
        if (stock <= 0) {
          skipped += 1;
          continue;
        }
        const ok = await addItem(
          {
            productId: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            image: product.image,
            size: item.size,
            color,
            stock,
            sharesProductStock: Object.keys(product.variantStock).length === 0,
          },
          Math.min(item.quantity, stock),
        );
        if (ok) added += 1;
        else skipped += 1;
      } catch {
        skipped += 1;
      }
    }

    setIsBusy(false);
    if (added > 0 && skipped === 0) {
      toast(`${added} item${added === 1 ? "" : "s"} added to your bag.`);
      open();
    } else if (added > 0) {
      toast(
        `${added} item${added === 1 ? "" : "s"} added — ${skipped} no longer available.`,
        "info",
      );
      open();
    } else {
      toast("These items are no longer available.", "error");
    }
  }

  return (
    <Button
      variant="secondary"
      className={className}
      onClick={() => void handleReorder()}
      disabled={isBusy}
    >
      {isBusy ? "Adding..." : "Buy again"}
    </Button>
  );
}
