"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function AnnouncementBanner() {
  const [banner, setBanner] = useState<{ text: string; enabled: boolean } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    
    async function loadBanner() {
      const { data: setting } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "announcement_banner")
        .single();

      const config = setting?.value as { enabled?: boolean; text?: string } | null;
      if (config?.enabled && config?.text?.trim()) {
        setBanner({ text: config.text, enabled: true });
      }
    }

    loadBanner();
  }, []);

  if (!banner?.enabled) {
    return null;
  }

  return (
    <div className="bg-primary text-primary-foreground text-center py-2 px-4 text-sm font-medium">
      {banner.text}
    </div>
  );
}
