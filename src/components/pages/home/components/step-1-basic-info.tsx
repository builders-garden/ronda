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
          className="font-semibold text-muted text-sm tracking-[-0.35px]"
          htmlFor="rosca-name"
        >
          ROSCA Name <span className="text-destructive">*</span>
        </Label>
        <Input
          className="h-[50px] rounded-2xl border border-border bg-foreground font-medium text-muted text-sm placeholder:text-muted-foreground/50"
          id="rosca-name"
          onChange={(e) => updateFormData("roscaName", e.target.value)}
          placeholder="e.g., Work Friends Savings"
          value={formData.roscaName}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label
          className="font-semibold text-muted text-sm tracking-[-0.35px]"
          htmlFor="description"
        >
          Description (Optional)
        </Label>
        <Textarea
          className="min-h-[110px] resize-none rounded-2xl border border-border bg-foreground p-4 font-medium text-muted text-sm placeholder:text-muted-foreground/50"
          id="description"
          onChange={(e) => updateFormData("description", e.target.value)}
          placeholder="Tell your group what this is for..."
          value={formData.description}
        />
      </div>

      <div className="rounded-xl bg-border/50 p-4">
        <div className="flex items-start justify-center gap-2">
          <span className="text-success">●</span>
          <div className="flex flex-col gap-1 pt-[3px]">
            <p className="font-bold text-sm text-success tracking-[-0.35px]">
              Pro tip
            </p>
            <p className="text-muted-foreground text-xs leading-[19.5px]">
              Choose a clear name that describes your group and purpose. This
              helps members remember what the group is for!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
