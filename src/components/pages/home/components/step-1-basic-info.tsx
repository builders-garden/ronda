"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateRonda } from "./create-ronda-context";

export function Step1BasicInfo() {
  const { formData, updateFormData } = useCreateRonda();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label
          className="font-semibold text-sm text-zinc-950 tracking-[-0.35px]"
          htmlFor="rosca-name"
        >
          ROSCA Name *
        </Label>
        <Input
          className="h-[50px] rounded-2xl border border-[rgba(232,235,237,0.3)] bg-[#f5f7f9] font-medium text-sm text-zinc-950 placeholder:text-zinc-950"
          id="rosca-name"
          onChange={(e) => updateFormData("roscaName", e.target.value)}
          placeholder="e.g., Work Friends Savings"
          value={formData.roscaName}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label
          className="font-semibold text-sm text-zinc-950 tracking-[-0.35px]"
          htmlFor="description"
        >
          Description (Optional)
        </Label>
        <Textarea
          className="min-h-[110px] resize-none rounded-2xl border border-[rgba(232,235,237,0.3)] bg-[#f5f7f9] p-4 font-medium text-sm text-zinc-950 placeholder:text-zinc-950"
          id="description"
          onChange={(e) => updateFormData("description", e.target.value)}
          placeholder="Tell your group what this is for..."
          value={formData.description}
        />
      </div>

      <div className="rounded-xl bg-[rgba(232,235,237,0.3)] p-4">
        <div className="flex gap-2">
          <div className="flex size-1.5 shrink-0 items-center justify-center pt-1">
            <div className="size-1.5 rounded-lg bg-[#6b9b7a]" />
          </div>
          <div className="flex flex-col gap-2">
            <p className="font-medium text-[#6b9b7a] text-sm tracking-[-0.35px]">
              Pro tip
            </p>
            <p className="text-[#6f7780] text-xs leading-[19.5px]">
              Choose a clear name that describes your group and purpose. This
              helps members remember what the group is for!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
