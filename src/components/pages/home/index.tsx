"use client";

import { Plus, Star, UsersRound, Wallet } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { CircleCard } from "@/components/pages/circles/components/circle-card";
import { CreateRondaModal } from "./components/create-ronda-modal";
import { HomeHeader } from "./components/home-header";
import { InvitationCard } from "./components/invitation-card";
import { SummaryCard } from "./components/summary-card";

export default function HomePage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <>
      <motion.div
        animate={{ opacity: 1 }}
        className="relative flex w-full flex-col items-center justify-start bg-white pb-24"
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
      >
        <HomeHeader />

        {/* Main Content */}
        <div className="flex w-full flex-col items-center justify-start gap-8 px-6 pt-8">
          {/* Summary Cards */}
          <div className="grid w-full grid-cols-3 gap-4">
            <SummaryCard
              bgColor="bg-[rgba(244,244,245,0.5)]"
              icon={Wallet}
              iconColor="text-zinc-900"
              label="Total Saved"
              value="$2,450"
            />
            <SummaryCard
              bgColor="bg-[rgba(123,143,245,0.1)]"
              icon={UsersRound}
              iconColor="text-[#7b8ff5]"
              label="Active Circles"
              value="3"
            />
            <SummaryCard
              bgColor="bg-[rgba(245,158,66,0.1)]"
              icon={Star}
              iconColor="text-[#f59e42]"
              label="Reliability"
              value="98%"
            />
          </div>

          {/* Create New Circle Button */}
          <motion.button
            className="flex h-16 w-full cursor-pointer items-center justify-center gap-3 rounded-[24px] bg-linear-to-b from-primary to-primary/80"
            onClick={() => setIsCreateModalOpen(true)}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="size-5 text-white" strokeWidth={2.5} />
            <span className="font-semibold text-[16px] text-white tracking-[-0.4px]">
              Create New Circle
            </span>
          </motion.button>

          {/* Your Circles */}
          <div className="flex w-full flex-col items-center justify-start gap-4">
            <div className="flex w-full items-center justify-between">
              <h2 className="font-bold text-[20px] text-zinc-950 tracking-[-0.5px]">
                Your Circles
              </h2>
              <motion.button
                className="cursor-pointer font-semibold text-[14px] text-zinc-900 tracking-[-0.35px] hover:underline"
                whileTap={{ scale: 0.98 }}
              >
                View All
              </motion.button>
            </div>
            <div className="flex w-full flex-col items-center justify-start gap-4">
              <CircleCard
                avatars={["", "", "", ""]}
                currentPot="$600"
                currentWeek={8}
                memberCount={12}
                name="Weekend Savers"
                nextPayout="Dec 28"
                status="deposit_due"
                totalWeeks={12}
                weeklyAmount="$50"
              />
              <CircleCard
                avatars={["", "", "", ""]}
                currentPot="$800"
                currentWeek={8}
                lastPayout="Dec 20"
                memberCount={8}
                name="Family Goals"
                status="completed"
                totalWeeks={8}
                weeklyAmount="$100"
              />
              <CircleCard
                avatars={["", "", "", ""]}
                currentPot="$750"
                currentWeek={6}
                memberCount={10}
                name="College Fund"
                nextPayout="Jan 8"
                status="active"
                totalWeeks={10}
                weeklyAmount="$75"
              />
            </div>
          </div>

          {/* Invitations */}
          <div className="flex w-full flex-col items-center justify-start gap-4">
            <div className="flex w-full items-center justify-between">
              <h2 className="font-bold text-[20px] text-zinc-950 tracking-[-0.5px]">
                Invitations
              </h2>
              <div className="flex items-center gap-2">
                <div className="flex size-6 items-center justify-center rounded-full bg-red-500">
                  <span className="font-bold text-[12px] text-white">2</span>
                </div>
              </div>
            </div>
            <div className="flex w-full flex-col items-center justify-start gap-4">
              <InvitationCard
                avatars={["", "", ""]}
                dueDate="Jan 15"
                memberCount={15}
                name="Friends Holiday Fund"
                totalWeeks={12}
                weeklyAmount="$80"
              />
              <InvitationCard
                avatars={["", "", ""]}
                dueDate="Jan 22"
                memberCount={6}
                name="Fitness Challenge Pool"
                totalWeeks={8}
                weeklyAmount="$30"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Create Ronda Modal */}
      <CreateRondaModal
        onOpenChange={setIsCreateModalOpen}
        open={isCreateModalOpen}
      />
    </>
  );
}
