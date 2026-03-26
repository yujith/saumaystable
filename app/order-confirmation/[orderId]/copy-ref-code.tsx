"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CopyRefCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select text
    }
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <p className="text-2xl font-bold font-mono tracking-wider">{code}</p>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={handleCopy}
        title="Copy reference code"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <Copy className="h-4 w-4 text-muted-foreground" />
        )}
      </Button>
    </div>
  );
}
