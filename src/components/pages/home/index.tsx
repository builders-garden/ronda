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
      className="flex h-full w-full flex-col overflow-y-auto bg-white pb-20"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      <HomeHeader />

      <div className="flex gap-3 px-6 pb-4">
        <SummaryCard
          icon={Camera}
          iconColor="text-blue-600"
          label="Total Saved"
          value="$2,450"
        />
        <SummaryCard
          icon={UsersRound}
          iconColor="text-green-600"
          label="Active Rondas"
          value="3"
        />
        <SummaryCard
          icon={Star}
          iconColor="text-yellow-600"
          label="Reliability score"
          value="98%"
        />
      </div>

      <div className="px-6 pb-6">
        <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">
          <Plus className="size-5" />
          Create New Ronda
        </Button>
        <p className="mt-2 text-center text-gray-600 text-xs">
          Start a new savings group
        </p>
      </div>

      <div className="px-6 pb-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold text-black text-lg">Invitations</h2>
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

      <div className="px-6 pb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold text-black text-lg">Your Rondas</h2>
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
