import { apiRequest } from "@/lib/api/client";

export async function subscribeToNewsletter(email: string): Promise<void> {
  await apiRequest("/newsletter/subscribe", {
    method: "POST",
    body: { email },
  });
}
