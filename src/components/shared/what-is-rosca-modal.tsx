"use client";

import { RotateCcw, ShieldCheck, Users, X } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type WhatIsRoscaModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function WhatIsRoscaModal({
  open,
  onOpenChange,
}: WhatIsRoscaModalProps) {
  useEffect(() => {
    if (open) {
      const overlay = document.querySelector("[data-radix-dialog-overlay]");
      if (overlay) {
        (overlay as HTMLElement).style.backgroundColor = "rgba(9, 9, 11, 0.6)";
        (overlay as HTMLElement).style.backdropFilter = "none";
      }
    }
  }, [open]);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[85vh] w-[calc(100%-3rem)] max-w-[398px] overflow-y-auto rounded-3xl border-0 bg-white p-0 shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] [&>button]:hidden">
        <div className="flex flex-col">
          {/* Header */}
          <div className="relative flex h-[180px] flex-col items-center justify-center px-6 pt-6">
            <DialogClose asChild>
              <button
                className="absolute top-4 right-4 z-10 flex size-10 items-center justify-center rounded-xl border border-zinc-200 bg-white shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50"
                type="button"
              >
                <X className="size-5 text-zinc-700" />
              </button>
            </DialogClose>
            <div className="mb-4 flex size-20 items-center justify-center rounded-3xl bg-[rgba(123,143,245,0.1)]">
              <span className="text-5xl">🤝</span>
            </div>
            <DialogHeader className="gap-0">
              <DialogTitle className="text-center font-bold text-2xl text-zinc-950 tracking-[-0.6px]">
                What is a ROSCA?
              </DialogTitle>
            </DialogHeader>
          </div>

          {/* Content */}
          <div className="flex flex-col gap-6 px-6 pb-6">
            {/* Definition Box */}
            <div className="rounded-2xl bg-[rgba(232,235,237,0.3)] p-4">
              <div className="flex flex-col gap-2">
                <p className="text-sm text-zinc-950">
                  <span className="font-semibold">ROSCA</span> stands for{" "}
                  <span className="font-semibold">
                    Rotating Savings and Credit Association
                  </span>
                  . It&apos;s a group-based savings system
                  <br className="sm:hidden" /> where members contribute a fixed
                  amount regularly.
                </p>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="flex flex-col gap-4">
              {/* Group Contributions */}
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[rgba(107,155,122,0.1)]">
                  <Users className="size-5 text-[#6b9b7a]" />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="font-semibold text-sm text-zinc-950 tracking-[-0.35px]">
                    Group Contributions
                  </p>
                  <p className="text-[#6f7780] text-xs leading-[19.5px]">
                    Members pool money together on a regular schedule
                  </p>
                </div>
              </div>

              {/* Rotating Payouts */}
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[rgba(123,143,245,0.1)]">
                  <RotateCcw className="size-5 text-[#7b8ff5]" />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="font-semibold text-sm text-zinc-950 tracking-[-0.35px]">
                    Rotating Payouts
                  </p>
                  <p className="text-[#6f7780] text-xs leading-[19.5px]">
                    Each cycle, one member receives the total pot
                  </p>
                </div>
              </div>

              {/* Community Trust */}
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[rgba(245,158,66,0.1)]">
                  <ShieldCheck className="size-5 text-[#f59e42]" />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="font-semibold text-sm text-zinc-950 tracking-[-0.35px]">
                    Community Trust
                  </p>
                  <p className="text-[#6f7780] text-xs leading-[19.5px]">
                    A trusted way to save and access funds with your community
                  </p>
                </div>
              </div>
            </div>

            {/* Got it Button */}
            <Button
              className="h-[52px] w-full rounded-2xl bg-[#7b8ff5] font-semibold text-base text-white tracking-[-0.4px] shadow-sm hover:bg-[#7b8ff5]/90"
              onClick={() => onOpenChange(false)}
            >
              Got it
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
