export type Review = {
  id: number;
  product_id: number;
  rating: number;
  title: string | null;
  body: string;
  reviewer_name: string;
  created_at: string;
};

export type ReviewList = {
  items: Review[];
  total: number;
  average_rating: number | null;
  rating_counts: Record<string, number>;
};

export type AdminReview = Review & {
  user_id: number;
  user_email: string;
  product_name: string;
  product_slug: string;
  is_approved: boolean;
};

export type AdminReviewList = {
  items: AdminReview[];
  total: number;
};

export type ReviewInput = {
  rating: number;
  title?: string | null;
  body: string;
};
