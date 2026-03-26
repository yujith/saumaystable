"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PublishMenuButton() {
  const [isPublishing, setIsPublishing] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  async function handlePublish() {
    if (
      !confirm(
        "This will send the weekly menu notification to all customers (email + WhatsApp) and post to Facebook. Continue?"
      )
    ) {
      return;
    }

    setIsPublishing(true);
    setResult(null);

    try {
      const res = await fetch("/api/admin/notifications/send-menu", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setResult({ success: false, message: data.error || "Failed to publish" });
        return;
      }

      setResult({
        success: true,
        message: `Published ${data.mealsPublished} meals. Sent ${data.emailsSent} emails, ${data.whatsappSent} WhatsApp messages.`,
      });
    } catch {
      setResult({ success: false, message: "An unexpected error occurred" });
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        size="sm"
        variant="outline"
        onClick={handlePublish}
        disabled={isPublishing}
        className="gap-1.5"
      >
        {isPublishing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Publishing...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Publish Menu
          </>
        )}
      </Button>
      {result && (
        <p
          className={`text-xs ${
            result.success ? "text-green-700" : "text-destructive"
          }`}
        >
          {result.message}
        </p>
      )}
    </div>
  );
}
