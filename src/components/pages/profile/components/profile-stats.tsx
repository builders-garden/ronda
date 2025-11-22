import { Banknote, CircleDollarSign, CircleUser, Star } from "lucide-react";
import { StatCard } from "./stat-card";

export function ProfileStats() {
  return (
    <div className="grid w-full grid-cols-2 gap-4">
      {/* Circles Joined */}
      <StatCard
        bgColor="bg-muted/5"
        icon={CircleUser}
        iconColor="text-muted"
        label="Circles Joined"
        value="12"
      />

      {/* Total Saved */}
      <StatCard
        bgColor="bg-success/10"
        icon={CircleDollarSign}
        iconColor="text-success"
        label="Total Saved"
        value="$8,450"
      />

      {/* Payouts Received */}
      <StatCard
        bgColor="bg-primary/10"
        icon={Banknote}
        iconColor="text-primary"
        label="Payouts Received"
        value="8"
      />

      {/* Active Circles */}
      <StatCard
        bgColor="bg-warning/10"
        icon={Star}
        iconColor="text-warning"
        label="Active Circles"
        value="3"
      />
    </div>
  );
}
