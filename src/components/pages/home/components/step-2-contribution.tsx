"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateRonda } from "./create-ronda-context";

export function Step2Contribution() {
  const { formData, updateFormData, totalPot } = useCreateRonda();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label
          className="font-semibold text-sm text-zinc-950 tracking-[-0.35px]"
          htmlFor="amount"
        >
          Contribution Amount per Cycle *
        </Label>
        <div className="relative">
          <span className="-translate-y-1/2 absolute top-1/2 left-4 font-medium text-[#6f7780] text-base">
            $
          </span>
          <Input
            className="h-[50px] rounded-2xl border border-[rgba(232,235,237,0.3)] bg-[#f5f7f9] pl-8 font-medium text-sm text-zinc-950 placeholder:text-zinc-950"
            id="amount"
            onChange={(e) =>
              updateFormData("contributionAmount", e.target.value)
            }
            placeholder="0.00"
            type="number"
            value={formData.contributionAmount}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label
          className="font-semibold text-sm text-zinc-950 tracking-[-0.35px]"
          htmlFor="frequency"
        >
          Frequency *
        </Label>
        <Select
          onValueChange={(value) => updateFormData("frequency", value)}
          value={formData.frequency}
        >
          <SelectTrigger
            className="h-[50px] rounded-2xl border border-[rgba(232,235,237,0.3)] bg-[#f5f7f9] font-medium text-sm text-zinc-950"
            id="frequency"
          >
            <SelectValue placeholder="Select frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="biweekly">Bi-weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="quarterly">Quarterly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label
          className="font-semibold text-sm text-zinc-950 tracking-[-0.35px]"
          htmlFor="start-date"
        >
          Start Date *
        </Label>
        <Input
          className="h-[50px] rounded-2xl border border-[rgba(232,235,237,0.3)] bg-[#f5f7f9] font-medium text-sm text-zinc-950"
          id="start-date"
          onChange={(e) => updateFormData("startDate", e.target.value)}
          type="date"
          value={formData.startDate}
        />
      </div>

      <div className="rounded-2xl bg-[rgba(244,244,245,0.5)] p-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <p className="font-bold text-sm text-zinc-950 tracking-[-0.35px]">
              Total Pot Amount
            </p>
            <p className="text-[#6f7780] text-xs">Calculated automatically</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <p className="font-bold text-2xl text-[#7b8ff5]">${totalPot}</p>
            <p className="text-[#6f7780] text-xs">Per cycle</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#e8ebed] bg-white p-4">
        <div className="flex gap-2">
          <div className="flex size-2 shrink-0 items-center justify-center pt-1">
            <span className="font-bold text-[#6b9b7a] text-sm">■</span>
          </div>
          <div className="flex flex-col gap-2">
            <p className="font-bold text-[#6b9b7a] text-sm tracking-[-0.35px]">
              How it works
            </p>
            <p className="text-[#6f7780] text-xs leading-[19.5px]">
              Each member contributes the same amount every cycle. The total pot
              goes to one member each round until everyone has received it once.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
