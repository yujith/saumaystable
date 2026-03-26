"use client";

import { useState } from "react";
import { Loader2, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";

interface DeliveryZone {
  id: string;
  name: string;
  delivery_fee_lkr: number;
  is_active: boolean;
}

function formatLKR(amount: number): string {
  return `LKR ${amount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
}

export function DeliveryZonesManager({
  initialZones,
}: {
  initialZones: DeliveryZone[];
}) {
  const router = useRouter();
  const [zones] = useState<DeliveryZone[]>(initialZones);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newFee, setNewFee] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!newName.trim()) return;
    setIsCreating(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/delivery-zones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          delivery_fee_lkr: parseFloat(newFee) || 0,
          is_active: true,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create zone");
        return;
      }

      setNewName("");
      setNewFee("");
      setShowForm(false);
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleToggleActive(zone: DeliveryZone) {
    setActionLoading(zone.id);
    try {
      await fetch(`/api/admin/delivery-zones/${zone.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !zone.is_active }),
      });
      router.refresh();
    } catch {
      // silent
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete(zoneId: string) {
    if (!confirm("Delete this delivery zone?")) return;
    setActionLoading(zoneId);
    try {
      await fetch(`/api/admin/delivery-zones/${zoneId}`, {
        method: "DELETE",
      });
      router.refresh();
    } catch {
      // silent
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Delivery Zones</h1>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Zone
        </Button>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {showForm && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zone-name">Zone Name</Label>
                <Input
                  id="zone-name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Colombo 7"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zone-fee">Delivery Fee (LKR)</Label>
                <Input
                  id="zone-fee"
                  type="number"
                  min="0"
                  step="50"
                  value={newFee}
                  onChange={(e) => setNewFee(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreate} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Zone"
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {zones.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No delivery zones configured. Click &quot;Add Zone&quot; to create one.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {zones.map((zone) => (
            <div
              key={zone.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggleActive(zone)}
                  disabled={actionLoading === zone.id}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  title={zone.is_active ? "Deactivate" : "Activate"}
                >
                  {zone.is_active ? (
                    <ToggleRight className="h-5 w-5 text-green-600" />
                  ) : (
                    <ToggleLeft className="h-5 w-5" />
                  )}
                </button>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{zone.name}</p>
                    {!zone.is_active && (
                      <Badge variant="secondary" className="text-[10px]">
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold text-primary">
                  {zone.delivery_fee_lkr === 0
                    ? "Free"
                    : formatLKR(zone.delivery_fee_lkr)}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(zone.id)}
                  disabled={actionLoading === zone.id}
                >
                  {actionLoading === zone.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
