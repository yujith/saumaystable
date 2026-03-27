"use client";

import { useState } from "react";
import {
  Loader2,
  Route,
  MapPin,
  Phone,
  Printer,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Package,
  Navigation,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Week {
  label: string;
  value: string;
}

interface StopItem {
  name: string;
  quantity: number;
  unitPriceLkr: number;
}

interface Stop {
  stopNumber: number;
  orderId: string;
  orderReferenceCode: string;
  status: string;
  customerName: string;
  customerPhone: string | null;
  address: string;
  lat: number | null;
  lng: number | null;
  items: StopItem[];
  totalLkr: number;
  deliveryFeeLkr: number;
  paymentMethod: string;
  paymentStatus: string;
  notes: string | null;
  ungeocodedWarning?: boolean;
}

interface RouteResult {
  stops: Stop[];
  ungeocodedCount: number;
  origin: { lat: number; lng: number; label: string };
  weekStart: string;
  day: string;
  totalOrders: number;
}

function formatLKR(amount: number): string {
  return `LKR ${amount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
}

const statusColors: Record<string, string> = {
  placed: "bg-blue-100 text-blue-800",
  confirmed: "bg-indigo-100 text-indigo-800",
  preparing: "bg-yellow-100 text-yellow-800",
  out_for_delivery: "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const paymentStatusColors: Record<string, string> = {
  pending: "bg-gray-100 text-gray-800",
  awaiting_verification: "bg-yellow-100 text-yellow-800",
  verified: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

/** Build Google Maps Directions URL with all geocoded stops as waypoints (max 25 total) */
function buildMapsUrl(origin: RouteResult["origin"], stops: Stop[]): string {
  const geocoded = stops.filter((s) => s.lat != null && s.lng != null);
  if (geocoded.length === 0) return "";

  const MAX_WAYPOINTS = 23; // origin + 23 waypoints + 1 destination = 25 total
  const destination = geocoded[geocoded.length - 1];
  const waypointStops = geocoded.slice(0, -1).slice(0, MAX_WAYPOINTS);
  const waypointStr = waypointStops.map((s) => `${s.lat},${s.lng}`).join("|");

  const params = new URLSearchParams({
    api: "1",
    origin: `${origin.lat},${origin.lng}`,
    destination: `${destination.lat},${destination.lng}`,
    travelmode: "driving",
  });
  if (waypointStr) params.set("waypoints", waypointStr);

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

/**
 * Build Google Maps Embed Directions URL.
 * Requires NEXT_PUBLIC_GOOGLE_MAPS_API_KEY — returns null if key is missing.
 */
function buildEmbedUrl(
  origin: RouteResult["origin"],
  stops: Stop[]
): string | null {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return null;

  const geocoded = stops.filter((s) => s.lat != null && s.lng != null);
  if (geocoded.length === 0) return null;

  // Maps Embed Directions API supports a limited number of waypoints
  const destination = geocoded[geocoded.length - 1];
  // Use intermediate stops (not first, not last) as waypoints, up to 8
  const waypointStops = geocoded.slice(1, Math.min(geocoded.length - 1, 9));
  const waypointStr = waypointStops.map((s) => `${s.lat},${s.lng}`).join("|");

  const params = new URLSearchParams({
    key: apiKey,
    origin: `${origin.lat},${origin.lng}`,
    destination: `${destination.lat},${destination.lng}`,
    mode: "driving",
  });
  if (waypointStr) params.set("waypoints", waypointStr);

  return `https://www.google.com/maps/embed/v1/directions?${params.toString()}`;
}

export function RoutePlannerClient({
  weeks,
  defaultWeek,
}: {
  weeks: Week[];
  defaultWeek: string;
}) {
  const [selectedDay, setSelectedDay] = useState<"saturday" | "sunday">(
    "saturday"
  );
  const [selectedWeek, setSelectedWeek] = useState(defaultWeek);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RouteResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleOptimise() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const params = new URLSearchParams({
        day: selectedDay,
        week_start: selectedWeek,
      });

      const res = await fetch(`/api/admin/delivery/route?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to optimise route");
        return;
      }

      setResult(data as RouteResult);
    } catch {
      setError("Failed to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Compute derived values only when result exists
  const geocodedStops =
    result?.stops.filter((s) => s.lat != null && s.lng != null) ?? [];
  const mapsUrl = result ? buildMapsUrl(result.origin, result.stops) : "";
  const embedUrl = result ? buildEmbedUrl(result.origin, result.stops) : null;
  const hasApiKey = !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Route className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Route Planner</h1>
            <p className="text-xs text-muted-foreground">
              Optimised delivery order from Mangala Mawatha, Kadawatha
            </p>
          </div>
        </div>
        {result && (
          <div className="flex items-center gap-2 print:hidden">
            {mapsUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(mapsUrl, "_blank")}
              >
                <ExternalLink className="mr-1.5 h-4 w-4" />
                Open in Google Maps
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="mr-1.5 h-4 w-4" />
              Print Sheet
            </Button>
          </div>
        )}
      </div>

      {/* ── Controls ── */}
      <Card className="print:hidden">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            {/* Day selector */}
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Delivery Day</p>
              <div className="flex rounded-md border overflow-hidden">
                <button
                  id="day-saturday"
                  onClick={() => setSelectedDay("saturday")}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    selectedDay === "saturday"
                      ? "bg-primary text-primary-foreground"
                      : "bg-background hover:bg-muted"
                  }`}
                >
                  Saturday
                </button>
                <button
                  id="day-sunday"
                  onClick={() => setSelectedDay("sunday")}
                  className={`px-4 py-2 text-sm font-medium border-l transition-colors ${
                    selectedDay === "sunday"
                      ? "bg-primary text-primary-foreground"
                      : "bg-background hover:bg-muted"
                  }`}
                >
                  Sunday
                </button>
              </div>
            </div>

            {/* Week selector */}
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Delivery Week</p>
              <select
                id="week-selector"
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {weeks.map((w) => (
                  <option key={w.value} value={w.value}>
                    {w.label}
                  </option>
                ))}
              </select>
            </div>

            <Button
              id="optimise-route-btn"
              onClick={handleOptimise}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Optimising...
                </>
              ) : (
                <>
                  <Route className="mr-2 h-4 w-4" />
                  Optimise Route
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Error ── */}
      {error && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* ── Results ── */}
      {result && (
        <div className="space-y-4">
          {/* Summary bar */}
          <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
              <span>
                <strong>{result.totalOrders}</strong>{" "}
                {result.totalOrders === 1 ? "order" : "orders"} ·{" "}
                <span className="capitalize">{result.day}</span>
              </span>
              <span>
                Week of <strong>{result.weekStart}</strong>
              </span>
              <span>
                Start: <strong>{result.origin.label}</strong>
              </span>
            </div>
          </div>

          {/* Ungeocoded warning */}
          {result.ungeocodedCount > 0 && (
            <div className="rounded-md border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>
                <strong>{result.ungeocodedCount} order(s)</strong> have no GPS
                coordinates and couldn&apos;t be placed on the optimised route.
                They&apos;re shown at the bottom marked ⚠. Ask the customer to
                update their address.
              </span>
            </div>
          )}

          {result.stops.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Route className="h-8 w-8 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-sm font-medium">No orders found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  There are no active orders for {result.day},{" "}
                  {result.weekStart}.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-2 gap-6 items-start">
              {/* ── Stop list ── */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Delivery Stops ({result.stops.length})
                  </h2>
                  {mapsUrl && (
                    <button
                      onClick={() => window.open(mapsUrl, "_blank")}
                      className="print:hidden flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <Navigation className="h-3 w-3" />
                      Full route in Maps
                    </button>
                  )}
                </div>

                {result.stops.map((stop) => (
                  <Card
                    key={stop.orderId}
                    className={`transition-shadow hover:shadow-sm ${
                      stop.ungeocodedWarning ? "border-yellow-300" : ""
                    }`}
                  >
                    <CardHeader className="pb-2 pt-4 px-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          {/* Stop number bubble */}
                          <span
                            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shrink-0 ${
                              stop.ungeocodedWarning
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-primary text-primary-foreground"
                            }`}
                          >
                            {stop.ungeocodedWarning ? "⚠" : stop.stopNumber}
                          </span>
                          <div>
                            <CardTitle className="text-sm leading-snug">
                              {stop.customerName}
                            </CardTitle>
                            {stop.customerPhone && (
                              <a
                                href={`tel:${stop.customerPhone}`}
                                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-0.5"
                              >
                                <Phone className="h-3 w-3" />
                                {stop.customerPhone}
                              </a>
                            )}
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="font-mono text-[10px] shrink-0"
                        >
                          {stop.orderReferenceCode}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="px-4 pb-4 space-y-2">
                      {/* Address */}
                      <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary/60" />
                        <span>{stop.address || "Address not set"}</span>
                      </div>

                      {/* Items */}
                      <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                        <Package className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        <span>
                          {stop.items.length > 0
                            ? stop.items
                                .map((i) => `${i.name} ×${i.quantity}`)
                                .join(" · ")
                            : "No items"}
                        </span>
                      </div>

                      {/* Notes */}
                      {stop.notes && (
                        <p className="text-xs italic text-muted-foreground border-l-2 border-muted pl-2.5">
                          {stop.notes}
                        </p>
                      )}

                      {/* Footer row */}
                      <div className="flex items-center justify-between pt-1.5 border-t">
                        <div className="flex flex-wrap gap-1">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              statusColors[stop.status] ??
                              "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {stop.status.replace(/_/g, " ")}
                          </span>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              paymentStatusColors[stop.paymentStatus] ??
                              "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {stop.paymentMethod === "cod"
                              ? "COD"
                              : "Bank Transfer"}
                          </span>
                        </div>
                        <span className="text-sm font-semibold tabular-nums">
                          {formatLKR(stop.totalLkr)}
                        </span>
                      </div>

                      {/* Navigate link (per stop) */}
                      {stop.lat != null && stop.lng != null && (
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${stop.lat},${stop.lng}&travelmode=driving`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="print:hidden inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <Navigation className="h-3 w-3" />
                          Navigate to this stop
                        </a>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* ── Map panel ── */}
              <div className="space-y-3 lg:sticky lg:top-6 print:hidden">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Route Map
                </h2>

                {geocodedStops.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <MapPin className="h-8 w-8 mx-auto text-muted-foreground/40 mb-3" />
                      <p className="text-sm font-medium">
                        No geocoded stops to map
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Addresses need GPS coordinates.
                      </p>
                    </CardContent>
                  </Card>
                ) : embedUrl ? (
                  <div className="rounded-lg overflow-hidden border">
                    <iframe
                      title="Optimised delivery route map"
                      src={embedUrl}
                      width="100%"
                      height="520"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="block"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  /* No API key — show placeholder card with Maps link */
                  <Card>
                    <CardContent className="py-10 text-center space-y-3">
                      <MapPin className="h-8 w-8 mx-auto text-muted-foreground/40" />
                      <div>
                        <p className="text-sm font-medium">
                          Map embed not configured
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                          Add{" "}
                          <code className="font-mono text-[11px] bg-muted px-1 py-0.5 rounded">
                            NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
                          </code>{" "}
                          to your environment variables to enable the embedded
                          map.
                        </p>
                      </div>
                      {mapsUrl && (
                        <Button
                          onClick={() => window.open(mapsUrl, "_blank")}
                          className="mt-2"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Open Full Route in Google Maps
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Note when embed shows fewer stops than total */}
                {embedUrl && geocodedStops.length > 9 && (
                  <p className="text-xs text-muted-foreground">
                    The embedded map shows the first 9 stops.{" "}
                    <button
                      className="text-primary underline"
                      onClick={() => window.open(mapsUrl, "_blank")}
                    >
                      Open in Google Maps
                    </button>{" "}
                    for all {geocodedStops.length} stops with turn-by-turn
                    directions.
                  </p>
                )}

                {/* Full route CTA */}
                {mapsUrl && (
                  <Button
                    className="w-full"
                    onClick={() => window.open(mapsUrl, "_blank")}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open Full Route in Google Maps ({geocodedStops.length}{" "}
                    stops)
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Empty state (before first optimise) ── */}
      {!result && !loading && !error && (
        <Card className="print:hidden">
          <CardContent className="py-16 text-center">
            <Route className="h-10 w-10 mx-auto text-primary/30 mb-4" />
            <p className="text-sm font-medium text-muted-foreground">
              Select a day and week, then click{" "}
              <strong className="text-foreground">Optimise Route</strong> to
              generate the delivery order.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
