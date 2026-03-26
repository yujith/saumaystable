import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { z } from "zod";

const createMealSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  description: z.string().nullable().optional(),
  price_lkr: z.number().positive(),
  category_id: z.string().uuid(),
  tags: z.array(z.string()).optional(),
  portion_info: z.string().nullable().optional(),
  is_available: z.boolean().optional(),
  stock_limit: z.number().int().min(0).nullable().optional(),
  sort_order: z.number().int().min(0).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = createMealSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const serviceClient = createServiceClient();

    const { data, error } = await serviceClient
      .from("meals")
      .insert({
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description ?? null,
        price_lkr: parsed.data.price_lkr,
        category_id: parsed.data.category_id,
        tags: parsed.data.tags ?? [],
        portion_info: parsed.data.portion_info ?? null,
        is_available: parsed.data.is_available ?? true,
        stock_limit: parsed.data.stock_limit ?? null,
        sort_order: parsed.data.sort_order ?? 0,
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id: data.id });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
