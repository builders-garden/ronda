"use client";

import { Info } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
          <Button
            className="h-4 gap-1 p-0 text-[#7b8ff5] hover:text-[#7b8ff5]/80"
            onClick={() => handleEdit(1)}
            size="sm"
            variant="ghost"
          >
            <Info className="size-4" />
            <span className="font-medium text-xs">Edit</span>
          </Button>
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
          <Button
            className="h-4 gap-1 p-0 text-[#7b8ff5] hover:text-[#7b8ff5]/80"
            onClick={() => handleEdit(2)}
            size="sm"
            variant="ghost"
          >
            <Info className="size-4" />
            <span className="font-medium text-xs">Edit</span>
          </Button>
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
            <p className="text-right font-semibold text-[#7b8ff5] text-sm">
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
          <Button
            className="h-4 gap-1 p-0 text-[#7b8ff5] hover:text-[#7b8ff5]/80"
            onClick={() => handleEdit(3)}
            size="sm"
            variant="ghost"
          >
            <Info className="size-4" />
            <span className="font-medium text-xs">Edit</span>
          </Button>
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
                  <Badge className="h-6 rounded-full bg-[rgba(107,155,122,0.2)] px-2 font-semibold text-[#6b9b7a] text-xs">
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
          <Button
            className="h-4 gap-1 p-0 text-[#7b8ff5] hover:text-[#7b8ff5]/80"
            onClick={() => handleEdit(3)}
            size="sm"
            variant="ghost"
          >
            <Info className="size-4" />
            <span className="font-medium text-xs">Edit</span>
          </Button>
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
                ? formData.allowedGenders === "all"
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
                    className="h-6 rounded-full bg-[rgba(123,143,245,0.2)] px-2 font-semibold text-[#7b8ff5] text-xs"
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
          <Button
            className="h-4 gap-1 p-0 text-[#7b8ff5] hover:text-[#7b8ff5]/80"
            onClick={() => handleEdit(2)}
            size="sm"
            variant="ghost"
          >
            <Info className="size-4" />
            <span className="font-medium text-xs">Edit</span>
          </Button>
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

      <div className="rounded-2xl border border-[rgba(107,155,122,0.3)] bg-linear-to-b from-[rgba(107,155,122,0.1)] to-[rgba(107,155,122,0.05)] p-4">
        <div className="flex gap-2">
          <Info className="mt-0.5 size-5 shrink-0 text-[#6b9b7a]" />
          <div className="flex flex-col gap-2">
            <p className="font-bold text-[#6b9b7a] text-sm tracking-[-0.35px]">
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
