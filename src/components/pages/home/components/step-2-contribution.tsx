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
          className="font-semibold text-muted text-sm tracking-[-0.35px]"
          htmlFor="amount"
        >
          Contribution Amount per Cycle{" "}
          <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <span className="-translate-y-1/2 absolute top-1/2 left-4 font-medium text-base text-muted">
            $
          </span>
          <Input
            className="h-[50px] rounded-2xl border border-border bg-foreground pl-8 font-medium text-muted text-sm placeholder:text-muted-foreground/50"
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
          className="font-semibold text-muted text-sm tracking-[-0.35px]"
          htmlFor="frequency"
        >
          Frequency <span className="text-destructive">*</span>
        </Label>
        <Select
          onValueChange={(value: string) => updateFormData("frequency", value)}
          value={formData.frequency}
        >
          <SelectTrigger
            className="h-[50px] rounded-2xl border border-border bg-foreground font-medium text-muted text-sm placeholder:text-muted-foreground/50"
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
          className="font-semibold text-muted text-sm tracking-[-0.35px]"
          htmlFor="number-of-cycles"
        >
          Number of Cycles <span className="text-destructive">*</span>
        </Label>
        <Input
          className="h-[50px] rounded-2xl border border-border bg-foreground font-medium text-muted text-sm placeholder:text-muted-foreground/50"
          id="number-of-cycles"
          max={12}
          min={1}
          onChange={(e) => updateFormData("numberOfCycles", e.target.value)}
          placeholder="1-12"
          type="number"
          value={formData.numberOfCycles}
        />
      </div>

      <div className="rounded-2xl border border-border bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <p className="font-bold text-muted text-sm tracking-[-0.35px]">
              Total Pot Amount
            </p>
            <p className="text-muted-foreground text-xs">
              Calculated automatically
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <p className="font-bold text-2xl text-primary">${totalPot}</p>
            <p className="text-muted-foreground text-xs">Per cycle</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-border/50 p-4">
        <div className="flex gap-2">
          <span className="font-bold text-success">●</span>
          <div className="flex flex-col gap-1 pt-[3px]">
            <p className="font-bold text-sm text-success tracking-[-0.35px]">
              How it works
            </p>
            <p className="text-muted-foreground text-xs leading-[19.5px]">
              Each member contributes the same amount every cycle. The total pot
              goes to one member each round until everyone has received it once.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
