import { AnnouncementBar } from "@/components/announcement-bar";
import { SiteShell } from "@/components/site-shell";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AnnouncementBar />
      <SiteShell>{children}</SiteShell>
    </>
  );
}
