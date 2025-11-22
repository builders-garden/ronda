"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { InvitationCard } from "@/components/pages/home/components/invitation-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CircleCard } from "./components";

export default function CirclesPage() {
  const [activeTab, setActiveTab] = useState("active");

  // Mock data - will be replaced with real data
  const activeCircles = [
    {
      id: 1,
      name: "Weekend Savers",
      memberCount: 12,
      weeklyAmount: "$50",
      currentWeek: 8,
      totalWeeks: 12,
      currentPot: "$600",
      nextPayout: "Dec 28",
      status: "deposit_due" as const,
      avatars: ["", "", "", ""],
    },
    {
      id: 3,
      name: "College Fund",
      memberCount: 10,
      weeklyAmount: "$75",
      currentWeek: 6,
      totalWeeks: 10,
      currentPot: "$750",
      nextPayout: "Jan 8",
      status: "active" as const,
      avatars: ["", "", "", ""],
    },
  ];

  const completedCircles = [
    {
      id: 2,
      name: "Family Goals",
      memberCount: 8,
      weeklyAmount: "$100",
      currentWeek: 8,
      totalWeeks: 8,
      currentPot: "$800",
      lastPayout: "Dec 20",
      status: "completed" as const,
      avatars: ["", "", "", ""],
    },
  ];

  const invitations = [
    {
      id: 1,
      name: "Friends Holiday Fund",
      memberCount: 15,
      weeklyAmount: "$80",
      totalWeeks: 12,
      dueDate: "Jan 15",
      avatars: ["", "", ""],
    },
    {
      id: 2,
      name: "Fitness Challenge Pool",
      memberCount: 6,
      weeklyAmount: "$30",
      totalWeeks: 8,
      dueDate: "Jan 22",
      avatars: ["", "", ""],
    },
  ];

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="relative flex w-full flex-col items-center justify-start pb-20"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 flex w-full items-center justify-center border-border/50 border-b bg-white px-6 py-4">
        <h1 className="font-bold text-[20px] text-muted tracking-tight">
          Your Circles
        </h1>
      </div>

      {/* Tabs */}
      <Tabs
        className="w-full"
        defaultValue="active"
        onValueChange={setActiveTab}
      >
        <div className="border-border/50 border-b px-6 py-6">
          <TabsList className="h-auto w-auto bg-transparent p-0">
            <TabsTrigger
              className="relative h-6 rounded-none border-0 bg-transparent px-0 pr-7 pb-[22px] font-semibold text-[14px] text-muted-foreground shadow-none transition-none data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:text-muted data-[state=active]:shadow-none"
              value="active"
            >
              Active
              {activeTab === "active" && (
                <motion.div
                  className="absolute right-0 bottom-0 left-0 h-[2px] rounded-full bg-primary"
                  layoutId="activeTab"
                />
              )}
            </TabsTrigger>
            <TabsTrigger
              className="relative h-6 rounded-none border-0 bg-transparent px-0 pr-7 pb-[22px] font-medium text-[14px] text-muted-foreground shadow-none transition-none data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:text-muted data-[state=active]:shadow-none"
              value="completed"
            >
              Completed
              {activeTab === "completed" && (
                <motion.div
                  className="absolute right-0 bottom-0 left-0 h-[2px] rounded-full bg-primary"
                  layoutId="activeTab"
                />
              )}
            </TabsTrigger>
            <TabsTrigger
              className="relative h-6 rounded-none border-0 bg-transparent px-0 pb-[22px] font-medium text-[14px] text-muted-foreground shadow-none transition-none data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:text-muted data-[state=active]:shadow-none"
              value="invites"
            >
              Invites
              {activeTab === "invites" && (
                <motion.div
                  className="absolute right-0 bottom-0 left-0 h-[2px] rounded-full bg-primary"
                  layoutId="activeTab"
                />
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent className="mt-0 px-6 py-6" value="active">
          <div className="flex flex-col gap-4">
            {activeCircles.map((circle) => (
              <CircleCard key={circle.id} {...circle} />
            ))}
          </div>
        </TabsContent>

        <TabsContent className="mt-0 px-6 py-6" value="completed">
          <div className="flex flex-col gap-4">
            {completedCircles.map((circle) => (
              <CircleCard key={circle.id} {...circle} />
            ))}
          </div>
        </TabsContent>

        <TabsContent className="mt-0 px-6 py-6" value="invites">
          <div className="flex flex-col gap-4">
            {invitations.map((invitation) => (
              <InvitationCard
                avatars={invitation.avatars}
                dueDate={invitation.dueDate}
                key={invitation.id}
                memberCount={invitation.memberCount}
                name={invitation.name}
                totalWeeks={invitation.totalWeeks}
                weeklyAmount={invitation.weeklyAmount}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
