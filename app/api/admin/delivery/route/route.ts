import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getDeliveryWeek } from "@/lib/cutoff";
import { format, startOfWeek, parseISO } from "date-fns";

// Origin: Mangala Mawatha, Kadawatha
const ORIGIN_LAT = 7.001;
const ORIGIN_LNG = 79.9478;
const ORIGIN_LABEL = "Mangala Mawatha, Kadawatha";

interface LatLng {
  lat: number;
  lng: number;
}

function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h =
    sinDLat * sinDLat +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      sinDLng *
      sinDLng;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/**
 * Nearest-neighbour TSP heuristic.
 * Mutates nothing — returns a new ordered array of indices into `points`.
 */
function nearestNeighbour(origin: LatLng, points: LatLng[]): number[] {
  const visited = new Array<boolean>(points.length).fill(false);
  const order: number[] = [];
  let current = origin;

  for (let step = 0; step < points.length; step++) {
    let bestIdx = -1;
    let bestDist = Infinity;
    for (let i = 0; i < points.length; i++) {
      if (visited[i]) continue;
      const d = haversineKm(current, points[i]);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    if (bestIdx === -1) break;
    visited[bestIdx] = true;
    order.push(bestIdx);
    current = points[bestIdx];
  }

  return order;
}

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const day = searchParams.get("day") as "saturday" | "sunday" | null;
    const weekStartParam = searchParams.get("week_start");

    if (!day || !["saturday", "sunday"].includes(day)) {
      return NextResponse.json(
        { error: "Query param `day` must be `saturday` or `sunday`" },
        { status: 400 }
      );
    }

    // Determine the delivery week start (Monday)
    let weekStart: Date;
    if (weekStartParam) {
      try {
        weekStart = startOfWeek(parseISO(weekStartParam), { weekStartsOn: 1 });
      } catch {
        return NextResponse.json(
          { error: "Invalid `week_start` date format. Use ISO 8601." },
          { status: 400 }
        );
      }
    } else {
      const { deliverySat } = getDeliveryWeek();
      // Monday of the delivery week
      weekStart = startOfWeek(deliverySat, { weekStartsOn: 1 });
    }

    const weekStartIso = format(weekStart, "yyyy-MM-dd");

    const serviceClient = createServiceClient();

    // Fetch orders for the given day + week, joined with address and profile
    const { data: orders, error } = await serviceClient
      .from("orders")
      .select(
        `id, order_reference_code, status, payment_method, payment_status,
         total_lkr, delivery_fee_lkr, notes, guest_email,
         delivery_date_preference, delivery_week_start,
         profiles(name, phone, email),
         addresses(street, city, district, lat, lng),
         order_items(quantity, unit_price_lkr, meals(name))`
      )
      .eq("delivery_date_preference", day)
      .eq("delivery_week_start", weekStartIso)
      .not("status", "eq", "cancelled")
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json({
        stops: [],
        ungeocoded: [],
        origin: { lat: ORIGIN_LAT, lng: ORIGIN_LNG, label: ORIGIN_LABEL },
        weekStart: weekStartIso,
        day,
        totalOrders: 0,
      });
    }

    // Separate geocoded and un-geocoded orders
    type RawOrder = (typeof orders)[number];

    const geocoded: RawOrder[] = [];
    const ungeocoded: RawOrder[] = [];

    for (const o of orders) {
      const addr = o.addresses as unknown as {
        lat: number | null;
        lng: number | null;
        street: string;
        city: string;
        district: string;
      } | null;

      if (addr?.lat != null && addr?.lng != null) {
        geocoded.push(o);
      } else {
        ungeocoded.push(o);
      }
    }

    // Run nearest-neighbour on geocoded orders
    const points: LatLng[] = geocoded.map((o) => {
      const addr = o.addresses as unknown as { lat: number; lng: number };
      return { lat: addr.lat, lng: addr.lng };
    });

    const orderedIndices = nearestNeighbour(
      { lat: ORIGIN_LAT, lng: ORIGIN_LNG },
      points
    );

    // Build stop list
    const stops = orderedIndices.map((idx, stopZeroIndex) => {
      const o = geocoded[idx];
      const addr = o.addresses as unknown as {
        street: string;
        city: string;
        district: string;
        lat: number;
        lng: number;
      };
      const prof = o.profiles as unknown as {
        name: string | null;
        phone: string | null;
        email: string | null;
      } | null;
      const items = (
        o.order_items as unknown as {
          quantity: number;
          unit_price_lkr: number;
          meals: { name: string } | null;
        }[]
      ).map((item) => ({
        name: item.meals?.name ?? "Unknown item",
        quantity: item.quantity,
        unitPriceLkr: item.unit_price_lkr,
      }));

      return {
        stopNumber: stopZeroIndex + 1,
        orderId: o.id,
        orderReferenceCode: o.order_reference_code,
        status: o.status,
        customerName: prof?.name ?? (o as unknown as { guest_email?: string }).guest_email ?? "Guest",
        customerPhone: prof?.phone ?? null,
        address: [addr.street, addr.city, addr.district]
          .filter(Boolean)
          .join(", "),
        lat: addr.lat,
        lng: addr.lng,
        items,
        totalLkr: o.total_lkr,
        deliveryFeeLkr: o.delivery_fee_lkr,
        paymentMethod: o.payment_method,
        paymentStatus: o.payment_status,
        notes: o.notes ?? null,
      };
    });

    // Append ungeocoded at end with a flag
    const ungeocodedStops = ungeocoded.map((o, i) => {
      const addr = o.addresses as unknown as {
        street: string;
        city: string;
        district: string;
        lat: number | null;
        lng: number | null;
      } | null;
      const prof = o.profiles as unknown as {
        name: string | null;
        phone: string | null;
      } | null;
      const items = (
        o.order_items as unknown as {
          quantity: number;
          unit_price_lkr: number;
          meals: { name: string } | null;
        }[]
      ).map((item) => ({
        name: item.meals?.name ?? "Unknown item",
        quantity: item.quantity,
        unitPriceLkr: item.unit_price_lkr,
      }));

      return {
        stopNumber: stops.length + i + 1,
        orderId: o.id,
        orderReferenceCode: o.order_reference_code,
        status: o.status,
        customerName: prof?.name ?? "Guest",
        customerPhone: prof?.phone ?? null,
        address: addr
          ? [addr.street, addr.city, addr.district].filter(Boolean).join(", ")
          : "Address not set",
        lat: null,
        lng: null,
        items,
        totalLkr: o.total_lkr,
        deliveryFeeLkr: o.delivery_fee_lkr,
        paymentMethod: o.payment_method,
        paymentStatus: o.payment_status,
        notes: o.notes ?? null,
        ungeocodedWarning: true,
      };
    });

    return NextResponse.json({
      stops: [...stops, ...ungeocodedStops],
      ungeocodedCount: ungeocoded.length,
      origin: { lat: ORIGIN_LAT, lng: ORIGIN_LNG, label: ORIGIN_LABEL },
      weekStart: weekStartIso,
      day,
      totalOrders: orders.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
