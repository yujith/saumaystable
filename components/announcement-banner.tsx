import { createClient } from "@/lib/supabase/server";

export async function AnnouncementBanner() {
  const supabase = createClient();

  const { data: setting } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "announcement_banner")
    .single();

  const bannerText = setting?.value as string | null;

  if (!bannerText || bannerText.trim() === "") {
    return null;
  }

  return (
    <div className="bg-primary text-primary-foreground text-center py-2 px-4 text-sm font-medium">
      {bannerText}
    </div>
  );
}
