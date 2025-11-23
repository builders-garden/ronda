"use client";

import { Check, Shield } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { useCreateRonda } from "./create-ronda-context";

type Step5SuccessProps = {
  onVerifyIdentity?: () => void;
};

export function Step5Success({ onVerifyIdentity }: Step5SuccessProps) {
  const { formData, totalPot } = useCreateRonda();

  return (
    <div className="flex flex-col items-center gap-6 pt-8 pb-4">
      {/* Success Icon */}
      <motion.div
        animate={{ scale: [0.8, 1] }}
        className="flex size-24 items-center justify-center rounded-full bg-gradient-to-b from-[rgba(107,155,122,0.2)] to-[rgba(107,155,122,0.1)]"
        initial={{ scale: 0.8 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="flex size-16 items-center justify-center rounded-full bg-success">
          <Check className="size-8 text-white" strokeWidth={3} />
        </div>
      </motion.div>

      {/* Success Message */}
      <div className="flex flex-col items-center gap-4 text-center">
        <h2 className="font-bold text-[30px] text-zinc-950 leading-[36px] tracking-[-0.75px]">
          Circle Created Successfully!
        </h2>
        <p className="max-w-[363px] text-[#6f7780] text-base leading-[26px]">
          Your ROSCA has been created. To ensure security and trust within your
          circle, please verify your identity.
        </p>
      </div>

      {/* Why Verification Card */}
      <div className="gradient-to-b w-full rounded-2xl border border-[rgba(123,143,245,0.3)] bg-primary/10 from-[rgba(123,143,245,0.1)] to-[rgba(123,143,245,0.05)] p-5">
        <div className="flex gap-3">
          <div className="mt-0.5 shrink-0">
            <div className="flex size-6 items-center justify-center rounded-full bg-[#7b8ff5]">
              <Shield className="size-4 text-white" />
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <p className="font-bold text-[#7b8ff5] text-sm tracking-[-0.35px]">
              Why Verification?
            </p>
            <p className="text-[#6f7780] text-xs leading-[19.5px]">
              Identity verification helps protect all members, prevents fraud,
              and ensures everyone meets the circle requirements. This step is
              required before you can start participating.
            </p>
          </div>
        </div>
      </div>

      {/* Circle Details Summary */}
      <div className="w-full rounded-2xl border border-[rgba(232,235,237,0.3)] bg-white p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-[#6f7780] text-xs">Circle Name</p>
            <p className="font-semibold text-sm text-zinc-950">
              {formData.roscaName || "—"}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[#6f7780] text-xs">Total Pool</p>
            <p className="font-semibold text-[#7b8ff5] text-sm">${totalPot}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[#6f7780] text-xs">Members</p>
            <p className="font-semibold text-sm text-zinc-950">
              {formData.participants.length} participants
            </p>
          </div>
        </div>
      </div>

      {/* Verify Identity Button */}
      <div className="w-full pt-2">
        <Button
          className="h-[52px] w-full rounded-2xl bg-[#7b8ff5] font-semibold text-base text-white tracking-[-0.4px] hover:bg-[#7b8ff5]/90"
          onClick={onVerifyIdentity}
        >
          <div className="flex size-5 items-center justify-center rounded-full bg-white/20">
            <Check className="size-4 text-white" />
          </div>
          Verify Identity Now
        </Button>
      </div>
    </div>
  );
}
