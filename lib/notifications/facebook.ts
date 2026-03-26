const GRAPH_API_URL = "https://graph.facebook.com/v18.0";

// TODO: v2 — Instagram cross-post

interface PostToPageParams {
  photoUrl: string;
  caption: string;
  pageId: string;
  accessToken: string;
}

interface PostResult {
  success: boolean;
  postId?: string;
  error?: string;
}

/**
 * Post a photo + caption to the Facebook Page via Graph API.
 * Uses native fetch — no third-party SDK.
 */
export async function postToPage({
  photoUrl,
  caption,
  pageId,
  accessToken,
}: PostToPageParams): Promise<PostResult> {
  try {
    const response = await fetch(
      `${GRAPH_API_URL}/${pageId}/photos`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: photoUrl,
          message: caption,
          access_token: accessToken,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok || result.error) {
      return {
        success: false,
        error: result.error?.message || `HTTP ${response.status}`,
      };
    }

    return {
      success: true,
      postId: result.post_id || result.id,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown Facebook API error",
    };
  }
}

/**
 * Generate a Facebook post caption from this week's available meals.
 */
export function generateMenuCaption(
  meals: { name: string; price_lkr: number; description?: string | null }[],
  menuUrl: string,
  hashtags: string[]
): string {
  const lines: string[] = [
    "🍛 This Week's Menu from Saumya's Table",
    "",
  ];

  for (const meal of meals) {
    lines.push(
      `✅ ${meal.name} — LKR ${meal.price_lkr.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`
    );
    if (meal.description) {
      lines.push(`   ${meal.description}`);
    }
  }

  lines.push("");
  lines.push("⏰ Order by Thursday 7PM for weekend delivery →");
  lines.push(menuUrl);
  lines.push("");
  lines.push(hashtags.join(" "));

  return lines.join("\n");
}

// TODO: v2 — WhatsApp Channel post (pending Meta API)
