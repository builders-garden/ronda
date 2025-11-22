"use client";

import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Plus,
  Star,
  UsersRound,
} from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { HomeHeader } from "./components/home-header";
import { InvitationCard } from "./components/invitation-card";
import { RondaCard } from "./components/ronda-card";
import { SummaryCard } from "./components/summary-card";

export default function HomePage() {
  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="relative flex w-full flex-col items-center justify-start gap-5 px-4 py-22"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      <HomeHeader />

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard
          bgColor="bg-primary/10"
          icon={Camera}
          iconColor="text-primary"
          label="Total Saved"
          value="$2,450"
        />
        <SummaryCard
          bgColor="bg-success/10"
          icon={UsersRound}
          iconColor="text-success"
          label="Active Rondas"
          value="3"
        />
        <SummaryCard
          bgColor="bg-warning/10"
          icon={Star}
          iconColor="text-warning"
          label="Reliability score"
          value="98%"
        />
      </div>

      <Button className="flex w-full cursor-pointer items-center justify-start gap-2 rounded-xl bg-linear-to-b from-primary to-primary/10 py-10">
        <div className="flex items-center justify-center rounded-full bg-foreground p-1">
          <Plus className="size-4 text-primary" strokeWidth={2} />
        </div>
        <div className="flex flex-col items-start justify-center">
          <span className="font-semibold text-sm text-white">
            Create New Ronda
          </span>
          <span className="font-light text-white text-xs">
            Start a new savings group
          </span>
        </div>
      </Button>

      <div className="">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold text-lg text-muted">Invitations</h2>
          <button
            className="text-blue-600 text-sm hover:underline"
            type="button"
          >
            View All
          </button>
        </div>
        <div className="flex flex-col gap-3">
          <InvitationCard
            avatars={["", "", ""]}
            memberCount={6}
            name="Gym Buddies Circle"
            weeklyAmount="$75"
          />
          <InvitationCard
            avatars={["", "", "", ""]}
            memberCount={10}
            name="Neighborhood Group"
            weeklyAmount="$120"
          />
        </div>
      </div>

      <div className="">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold text-lg text-muted">Your Rondas</h2>
          <button
            className="text-blue-600 text-sm hover:underline"
            type="button"
          >
            View All
          </button>
        </div>
        <div className="flex flex-col gap-4">
          <RondaCard
            avatars={["", "", "", ""]}
            currentWeek={4}
            memberCount={12}
            name="College Friends"
            status="deposit-due"
            statusIcon={AlertCircle}
            statusMessage="Deposit Required Make your $50 deposit by Dec 15"
            totalWeeks={7}
            weeklyAmount="$50"
          />
          <RondaCard
            avatars={["", "", "", ""]}
            currentWeek={4}
            memberCount={8}
            name="Work Friends Circle"
            status="active"
            statusIcon={AlertCircle}
            statusMessage="Pending Contributions Waiting on 2 people to deposit"
            totalWeeks={5}
            weeklyAmount="$100"
          />
          <RondaCard
            avatars={["", "", "", "", ""]}
            currentWeek={5}
            memberCount={5}
            name="Family Circle"
            status="completed"
            statusIcon={CheckCircle2}
            statusMessage="Your Ronda is complete! You hit your savings goal"
            totalWeeks={5}
            weeklyAmount="$200"
          />
        </div>
      </div>
    </motion.div>
  );
}
