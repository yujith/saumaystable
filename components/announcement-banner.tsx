import { createClient } from "@/lib/supabase/server";

export async function AnnouncementBanner() {
  const supabase = createClient();

  const { data: setting } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "announcement_banner")
    .single();

  const bannerConfig = setting?.value as { enabled?: boolean; text?: string; colour?: string } | null;
  const bannerText = bannerConfig?.text;
  const isEnabled = bannerConfig?.enabled ?? false;

  if (!isEnabled || !bannerText || bannerText.trim() === "") {
    return null;
  }

  return (
    <div className="bg-primary text-primary-foreground text-center py-2 px-4 text-sm font-medium">
      {bannerText}
    </div>
  );
}
