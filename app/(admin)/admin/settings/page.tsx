import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = {
  title: "Settings | Admin | Saumya's Table",
};

export default async function AdminSettingsPage() {
  const supabase = createClient();

  const { data: settings } = await supabase
    .from("settings")
    .select("*")
    .order("key", { ascending: true });

  // Transform to key-value map
  const settingsMap: Record<string, unknown> = {};
  settings?.forEach((s) => {
    settingsMap[s.key] = s.value;
  });

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      <SettingsForm settings={settingsMap} />
    </div>
  );
}
