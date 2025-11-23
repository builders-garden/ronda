"use client";

import { Info, SquarePen } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Genders } from "@/lib/enum";
import { useCreateRonda } from "./create-ronda-context";

type Step4ReviewProps = {
  onEditStep?: (step: number) => void;
};

export function Step4Review({ onEditStep }: Step4ReviewProps) {
  const { formData, totalPot } = useCreateRonda();

  const handleEdit = (step: number) => {
    if (onEditStep) {
      onEditStep(step);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ROSCA Details */}
      <div className="rounded-2xl border border-[rgba(232,235,237,0.3)] bg-white p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-sm text-zinc-950 tracking-[-0.35px]">
            ROSCA Details
          </h3>
          <button
            className="flex cursor-pointer items-center gap-1 font-medium text-primary text-xs hover:underline"
            onClick={() => handleEdit(1)}
            type="button"
          >
            Edit
            <SquarePen className="size-3" />
          </button>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-[#6f7780] text-xs">Name</p>
            <p className="text-right font-semibold text-sm text-zinc-950">
              {formData.roscaName || "—"}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[#6f7780] text-xs">Description</p>
            <p className="text-right font-semibold text-sm text-zinc-950">
              {formData.description || "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Contribution Details */}
      <div className="rounded-2xl border border-[rgba(232,235,237,0.3)] bg-white p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-sm text-zinc-950 tracking-[-0.35px]">
            Contribution Details
          </h3>
          <button
            className="flex cursor-pointer items-center gap-1 font-medium text-primary text-xs hover:underline"
            onClick={() => handleEdit(2)}
            type="button"
          >
            Edit
            <SquarePen className="size-3" />
          </button>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-[#6f7780] text-xs">Amount</p>
            <p className="text-right font-semibold text-sm text-zinc-950">
              ${formData.contributionAmount || "0.00"}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[#6f7780] text-xs">Frequency</p>
            <p className="text-right font-semibold text-sm text-zinc-950">
              {formData.frequency
                ? formData.frequency.charAt(0).toUpperCase() +
                  formData.frequency.slice(1)
                : "—"}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[#6f7780] text-xs">Total Pool</p>
            <p className="text-right font-semibold text-primary text-sm">
              ${totalPot}
            </p>
          </div>
        </div>
      </div>

      {/* Participants */}
      <div className="rounded-2xl border border-[rgba(232,235,237,0.3)] bg-white p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-sm text-zinc-950 tracking-[-0.35px]">
            Participants
          </h3>
          <button
            className="flex cursor-pointer items-center gap-1 font-medium text-primary text-xs hover:underline"
            onClick={() => handleEdit(3)}
            type="button"
          >
            Edit
            <SquarePen className="size-3" />
          </button>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-[#6f7780] text-xs">Total Members</p>
            <p className="text-right font-semibold text-sm text-zinc-950">
              {formData.participants.length} participants
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {formData.participants.map((participant) => (
              <div className="flex items-center gap-3" key={participant.id}>
                <Avatar className="size-10">
                  <AvatarImage src={participant.avatar} />
                  <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <p className="flex-1 font-bold text-sm text-zinc-950 tracking-[-0.35px]">
                  {participant.name} {participant.isHost && "(You)"}
                </p>
                {participant.isHost && (
                  <Badge className="h-6 rounded-full bg-success/20 px-2 font-semibold text-success text-xs">
                    Host
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Verification Requirements */}
      <div className="rounded-2xl border border-[rgba(232,235,237,0.3)] bg-white p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-sm text-zinc-950 tracking-[-0.35px]">
            Verification Requirements
          </h3>
          <button
            className="flex cursor-pointer items-center gap-1 font-medium text-primary text-xs hover:underline"
            onClick={() => handleEdit(3)}
            type="button"
          >
            Edit
            <SquarePen className="size-3" />
          </button>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-[#6f7780] text-xs">Proof of Human</p>
            <p className="text-right font-semibold text-sm text-zinc-950">
              {formData.proofOfHuman ? "Enabled" : "Disabled"}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <p className="text-[#6f7780] text-xs">Age Verification</p>
              <p className="text-right font-semibold text-sm text-zinc-950">
                {formData.ageVerification ? "Enabled" : "Disabled"}
              </p>
            </div>
            {formData.ageVerification && (
              <p className="text-right text-[#6f7780] text-xs">
                Min: {formData.minAge}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[#6f7780] text-xs">Gender Verification</p>
            <p className="text-right font-semibold text-sm text-zinc-950">
              {formData.genderVerification
                ? formData.allowedGenders === Genders.ALL
                  ? "All Genders"
                  : formData.allowedGenders.charAt(0).toUpperCase() +
                    formData.allowedGenders.slice(1)
                : "Disabled"}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[#6f7780] text-xs">Nationality Verification</p>
            <div className="flex flex-wrap justify-end gap-1">
              {formData.nationalityVerification &&
              formData.allowedNationalities.length > 0 ? (
                formData.allowedNationalities.map((nationality) => (
                  <Badge
                    className="h-6 rounded-full bg-primary/20 px-2 font-semibold text-primary text-xs"
                    key={nationality}
                  >
                    {nationality}
                  </Badge>
                ))
              ) : (
                <p className="text-right font-semibold text-sm text-zinc-950">
                  Disabled
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Schedule */}
      <div className="rounded-2xl border border-[rgba(232,235,237,0.3)] bg-white p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-sm text-zinc-950 tracking-[-0.35px]">
            Schedule
          </h3>
          <button
            className="flex cursor-pointer items-center gap-1 font-medium text-primary text-xs hover:underline"
            onClick={() => handleEdit(2)}
            type="button"
          >
            Edit
            <SquarePen className="size-3" />
          </button>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-[#6f7780] text-xs">Number of Cycles</p>
            <p className="text-right font-semibold text-sm text-zinc-950">
              {formData.numberOfCycles || "—"}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[#6f7780] text-xs">Frequency</p>
            <p className="text-right font-semibold text-sm text-zinc-950">
              {formData.frequency
                ? formData.frequency.charAt(0).toUpperCase() +
                  formData.frequency.slice(1)
                : "—"}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-success/30 bg-linear-to-b from-success/10 to-success/5 p-4">
        <div className="flex gap-2">
          <Info className="mt-0.5 size-5 shrink-0 text-success" />
          <div className="flex flex-col gap-2 pt-0.5">
            <p className="font-bold text-sm text-success tracking-[-0.35px]">
              Ready to Create
            </p>
            <p className="text-[#6f7780] text-xs leading-[19.5px]">
              All participants will be notified and must accept the terms before
              the circle begins. Contributions will start automatically on the
              first payout date.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
