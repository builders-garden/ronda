import { ArrowLeft, Calendar, MessageCircle } from "lucide-react";
import { motion } from "motion/react";
import type { Dispatch, SetStateAction } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/utils";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import { Progress } from "../ui/progress";
import { ActivityMessage } from "./activity-message";
import { ProfileCard } from "./profile-card";

type RondaDrawerProps = {
  isDrawerOpen: boolean;
  setIsDrawerOpen: Dispatch<SetStateAction<boolean>>;
  triggerClassName?: string;
  children: React.ReactNode;
  asChild?: boolean;
};

export const RondaDrawer = ({
  isDrawerOpen,
  setIsDrawerOpen,
  triggerClassName,
  children,
  asChild,
}: RondaDrawerProps) => (
  <Drawer onOpenChange={setIsDrawerOpen} open={isDrawerOpen}>
    <DrawerTrigger
      asChild={asChild}
      className={cn(
        "w-full cursor-pointer focus:outline-none",
        triggerClassName
      )}
    >
      {children}
    </DrawerTrigger>
    <DrawerContent className="w-full rounded-none border-none focus:outline-none">
      <DrawerHeader className="hidden">
        <DrawerTitle />
        <DrawerDescription />
      </DrawerHeader>
      <div className="flex h-[64px] w-full items-center justify-between border-border border-b bg-foreground p-4">
        <motion.button
          className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full bg-popover"
          onClick={() => setIsDrawerOpen(false)}
          type="button"
          whileTap={{ scale: 0.98 }}
        >
          <ArrowLeft className="size-4 text-muted" strokeWidth={2} />
        </motion.button>
        <div className="flex flex-col items-center justify-center">
          <span className="font-semibold text-base text-muted">Ronda Name</span>
          <span className="text-gray-600 text-xs">12 members • $100/week</span>
        </div>
        <div className="size-7 shrink-0 rounded-full bg-transparent" />
      </div>

      <ScrollArea
        className="h-screen w-full"
        scrollBarClassName="opacity-0 w-0"
      >
        <div className="flex w-full flex-col items-center justify-center gap-4 px-4 py-6">
          <Card className="flex w-full flex-col items-center justify-center gap-4 border border-border p-5 shadow-sm">
            <div className="flex w-full items-start justify-between">
              <div className="flex flex-col items-start justify-center gap-0.5">
                <span className="font-medium text-muted text-sm">
                  Ronda Name
                </span>
                <div className="flex items-center justify-start gap-1">
                  <Calendar className="size-3 text-muted" strokeWidth={2} />
                  <span className="text-muted-foreground text-xs">
                    Created Dec 1, 2025
                  </span>
                </div>
              </div>

              <Badge
                className="border-success/20 border-none bg-success/10 px-2 py-1 font-medium text-success text-xs"
                variant="outline"
              >
                Active
              </Badge>
            </div>

            <div className="flex w-full items-center justify-between px-8">
              <div className="flex flex-col items-center justify-center gap-1">
                <span className="font-medium text-muted text-sm">$600,000</span>
                <span className="text-muted-foreground text-xs">
                  Pot Amount
                </span>
              </div>

              <div className="flex flex-col items-center justify-center gap-1">
                <span className="font-medium text-muted text-sm">Dec 1st</span>
                <span className="text-muted-foreground text-xs">
                  Next Payout
                </span>
              </div>

              <div className="flex flex-col items-center justify-center gap-1">
                <span className="font-medium text-muted text-sm">3/8</span>
                <span className="text-muted-foreground text-xs">Weeks</span>
              </div>
            </div>

            <div className="flex w-full flex-col items-center justify-center gap-1">
              <div className="flex w-full items-center justify-between">
                <span className="font-medium text-muted text-xs">Progress</span>
                <span className="font-light text-muted text-xs">
                  $50 per member, per week
                </span>
              </div>

              <Progress
                className="h-1"
                progressBarClassName="bg-primary"
                value={50}
              />
            </div>
          </Card>

          <div className="flex w-full items-center justify-between">
            <h2 className="font-semibold text-lg text-muted">Members</h2>
            <motion.button
              className="cursor-pointer text-muted-foreground text-sm hover:underline"
              whileTap={{ scale: 0.98 }}
            >
              View all 12 members
            </motion.button>
          </div>

          <div className="flex w-full flex-col items-center justify-center gap-2">
            <ProfileCard
              avatar="https://github.com/shadcn.png"
              name="John Doe"
              status="pending"
              statusMessage="Pending Invite"
            />

            <ProfileCard
              avatar="https://github.com/shadcn.png"
              name="John Doe"
              status="accepted"
              statusMessage="Accepted Invite"
            />

            <ProfileCard
              avatar="https://github.com/shadcn.png"
              name="John Doe"
              status="declined"
              statusMessage="Declined Invite"
            />
          </div>

          <div className="flex w-full items-center justify-start">
            <h2 className="font-semibold text-lg text-muted">
              Recent Activity
            </h2>
          </div>

          <ActivityMessage
            IconComponent={MessageCircle}
            message="John Doe joined the Ronda"
            timestamp="12:00 PM"
            title="John Doe joined the Ronda"
          />
        </div>
      </ScrollArea>
    </DrawerContent>
  </Drawer>
);
