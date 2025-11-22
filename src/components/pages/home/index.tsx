"use client";

import { Camera, Plus, Star, UsersRound } from "lucide-react";
import { motion } from "motion/react";
import { RondaStatus } from "@/lib/enum";
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

      {/* Create New Ronda Button */}
      <motion.button
        className="flex w-full cursor-pointer items-center justify-start gap-2 rounded-lg bg-linear-to-b from-primary to-primary/50 p-4 drop-shadow-sm"
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex size-6 items-center justify-center rounded-full bg-foreground">
          <Plus className="size-3.5 text-primary" strokeWidth={3.3} />
        </div>
        <div className="flex flex-col items-start justify-center">
          <span className="font-semibold text-sm text-white">
            Create New Ronda
          </span>
          <span className="font-light text-white text-xs">
            Start a new savings group
          </span>
        </div>
      </motion.button>

      {/* Invitations */}
      <div className="flex w-full flex-col items-center justify-start gap-3">
        <div className="flex w-full items-center justify-between">
          <h2 className="font-semibold text-lg text-muted">Invitations</h2>
          <motion.button
            className="cursor-pointer text-primary text-sm hover:underline"
            whileTap={{ scale: 0.98 }}
          >
            View All
          </motion.button>
        </div>
        <div className="flex w-full flex-col items-center justify-start gap-2">
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

      {/* Your Rondas */}
      <div className="flex w-full flex-col items-center justify-start gap-3">
        <div className="flex w-full items-center justify-between">
          <h2 className="font-semibold text-2xl text-muted">Your Rondas</h2>
          <motion.button
            className="cursor-pointer text-primary text-sm hover:underline"
            whileTap={{ scale: 0.98 }}
          >
            View All
          </motion.button>
        </div>
        <div className="flex w-full flex-col items-center justify-start gap-4">
          <RondaCard
            avatars={["", "", "", ""]}
            currentWeek={4}
            memberCount={12}
            name="College Friends"
            status={RondaStatus.DEPOSIT_DUE}
            totalWeeks={7}
            weeklyAmount="$50"
          />
          <RondaCard
            avatars={["", "", "", ""]}
            currentWeek={4}
            memberCount={8}
            name="Work Friends Circle"
            status={RondaStatus.ACTIVE}
            totalWeeks={5}
            weeklyAmount="$100"
          />
          <RondaCard
            avatars={["", "", "", "", ""]}
            currentWeek={5}
            memberCount={5}
            name="Family Circle"
            status={RondaStatus.COMPLETED}
            totalWeeks={5}
            weeklyAmount="$200"
          />
        </div>
      </div>
    </motion.div>
  );
}
