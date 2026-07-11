import { apiRequest, apiRequestWithAuth } from "@/lib/api/client";
import type { Review, ReviewInput, ReviewList } from "@/lib/types/review";

export async function listProductReviews(
  productId: number,
  limit = 10,
  offset = 0,
): Promise<ReviewList> {
  return apiRequest<ReviewList>(
    `/reviews/product/${productId}?limit=${limit}&offset=${offset}`,
  );
}

export async function listFeaturedReviews(limit = 3): Promise<Review[]> {
  return apiRequest<Review[]>(`/reviews/featured?limit=${limit}`);
}

export async function createReview(
  productId: number,
  input: ReviewInput,
): Promise<Review> {
  return apiRequestWithAuth<Review>(`/reviews/product/${productId}`, {
    method: "POST",
    body: input,
  });
}
