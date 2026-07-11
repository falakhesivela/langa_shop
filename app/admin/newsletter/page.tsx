"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import {
  downloadAdminFile,
  listNewsletterSubscribers,
  type NewsletterSubscriber,
} from "@/lib/api/admin";
import { getErrorMessage } from "@/lib/api/errors";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export default function AdminNewsletterPage() {
  const { toast } = useToast();
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listNewsletterSubscribers()
      .then((data) => {
        if (!cancelled) setSubscribers(data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(getErrorMessage(err, "Unable to load subscribers."));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleExport() {
    setIsExporting(true);
    try {
      await downloadAdminFile("/admin/export/newsletter.csv", "newsletter.csv");
    } catch (err) {
      toast(getErrorMessage(err, "Export failed."), "error");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl">Newsletter</h1>
          <p className="mt-2 text-muted-foreground">
            {isLoading
              ? "Loading subscribers..."
              : `${subscribers.length} subscriber${subscribers.length === 1 ? "" : "s"}. Export the list to use in your mailing tool.`}
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => void handleExport()}
          isLoading={isExporting}
          disabled={subscribers.length === 0}
        >
          <Download className="size-4" aria-hidden />
          Export CSV
        </Button>
      </div>

      {error ? <Alert className="mt-6">{error}</Alert> : null}

      <div className="mt-8 overflow-x-auto rounded-sm border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Subscribed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {!isLoading && subscribers.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-5 py-6 text-muted-foreground">
                  No subscribers yet.
                </td>
              </tr>
            ) : (
              subscribers.map((subscriber) => (
                <tr key={subscriber.id}>
                  <td className="px-5 py-3">{subscriber.email}</td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {new Date(subscriber.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
