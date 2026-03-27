import type { Metadata } from "next";
import { RoutePlannerClient } from "./route-planner-client";
import { getDeliveryWeek } from "@/lib/cutoff";
import { format, startOfWeek, addWeeks } from "date-fns";

export const metadata: Metadata = {
  title: "Route Planner | Admin | Saumya's Table",
};

export default function RoutePlannerPage() {
  const { deliverySat } = getDeliveryWeek();
  const currentWeekStart = startOfWeek(deliverySat, { weekStartsOn: 1 });
  const nextWeekStart = addWeeks(currentWeekStart, 1);

  const weeks = [
    {
      label: `This week (${format(currentWeekStart, "dd MMM yyyy")})`,
      value: format(currentWeekStart, "yyyy-MM-dd"),
    },
    {
      label: `Next week (${format(nextWeekStart, "dd MMM yyyy")})`,
      value: format(nextWeekStart, "yyyy-MM-dd"),
    },
  ];

  return <RoutePlannerClient weeks={weeks} defaultWeek={weeks[0].value} />;
}
