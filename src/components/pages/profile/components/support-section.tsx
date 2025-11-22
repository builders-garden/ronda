"use client";

import { BookOpen, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { WhatIsRoscaModal } from "@/components/shared/what-is-rosca-modal";

export function SupportSection() {
  const [showWhatIsRosca, setShowWhatIsRosca] = useState(false);

  return (
    <>
      <div className="flex w-full flex-col gap-5">
        {/* Support Title */}
        <h2 className="font-bold text-lg text-muted">Support</h2>

        {/* What is a ROSCA Card */}
        <motion.button
          className="flex w-full items-center justify-between rounded-3xl border border-border/50 bg-white p-5 drop-shadow-xs"
          onClick={() => setShowWhatIsRosca(true)}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-4">
            {/* Icon */}
            <div className="flex size-11 items-center justify-center rounded-2xl bg-muted/10">
              <BookOpen className="size-5 text-muted" strokeWidth={2} />
            </div>

            {/* Label */}
            <span className="font-semibold text-base text-muted">
              What is a ROSCA?
            </span>
          </div>

          {/* Arrow */}
          <ChevronRight className="size-5 text-muted-foreground" />
        </motion.button>
      </div>

      {/* What is ROSCA Modal */}
      <WhatIsRoscaModal
        onOpenChange={setShowWhatIsRosca}
        open={showWhatIsRosca}
      />
    </>
  );
}
