export function getLoginHref(returnTo?: string): string {
  if (
    !returnTo ||
    !returnTo.startsWith("/") ||
    returnTo.startsWith("/login")
  ) {
    return "/login";
  }

  return `/login?next=${encodeURIComponent(returnTo)}`;
}

export function getPostLoginPath(
  user: { is_admin: boolean },
  next: string | null,
): string {
  if (next && next.startsWith("/")) {
    return user.is_admin ? "/admin" : next;
  }

  return user.is_admin ? "/admin" : "/account";
}
