"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useApiQuery } from "@/hooks/use-api-query";
import type { NeynarUser } from "@/types/neynar.type";
import { useCreateRonda } from "./create-ronda-context";

export function Step3Participants() {
  const { formData, updateFormData } = useCreateRonda();
  const [showDropdown, setShowDropdown] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(formData.searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [formData.searchQuery]);

  // Search users using the API
  const { data: searchResults, isLoading: isSearching } = useApiQuery<{
    users: NeynarUser[];
  }>({
    url: `/api/users/search?q=${encodeURIComponent(debouncedQuery)}`,
    queryKey: ["search-users", debouncedQuery],
    enabled: debouncedQuery.length > 0,
  });

  // Show dropdown when there are results and query is not empty
  useEffect(() => {
    if (
      formData.searchQuery.length > 0 &&
      searchResults?.users &&
      searchResults.users.length > 0
    ) {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  }, [searchResults, formData.searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddParticipant = (user: NeynarUser) => {
    // Check if user is already added
    const isAlreadyAdded = formData.participants.some(
      (p) => p.fid === user.fid
    );

    if (!isAlreadyAdded) {
      const newParticipant = {
        id: user.fid.toString(),
        name: user.display_name || user.username,
        username: `@${user.username}`,
        avatar: user.pfp_url,
        status: "pending" as const,
        fid: user.fid,
      };

      updateFormData("participants", [
        ...formData.participants,
        newParticipant,
      ]);
    }

    // Clear search and close dropdown
    updateFormData("searchQuery", "");
    setShowDropdown(false);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Search Bar */}
      <div className="relative flex flex-col gap-2" ref={dropdownRef}>
        <Label className="font-semibold text-sm text-zinc-950 tracking-[-0.35px]">
          Add Participants *
        </Label>
        <div className="relative">
          <Input
            className="h-[50px] rounded-2xl border border-[rgba(232,235,237,0.3)] bg-[#f5f7f9] font-medium text-sm text-zinc-950 placeholder:text-zinc-950"
            onChange={(e) => updateFormData("searchQuery", e.target.value)}
            placeholder="Search by username"
            value={formData.searchQuery}
          />
          {isSearching && (
            <div className="-translate-y-1/2 absolute top-1/2 right-4">
              <Loader2 className="size-5 animate-spin text-zinc-950" />
            </div>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showDropdown &&
          searchResults?.users &&
          searchResults.users.length > 0 && (
            <div className="absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-2xl border border-[rgba(232,235,237,0.3)] bg-white shadow-lg">
              <div className="flex flex-col">
                {searchResults.users.slice(0, 3).map((user) => {
                  const isAlreadyAdded = formData.participants.some(
                    (p) => p.fid === user.fid
                  );

                  return (
                    <button
                      className="flex items-center gap-3 p-3 transition-colors hover:bg-[#f5f7f9] disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={isAlreadyAdded}
                      key={user.fid}
                      onClick={() => handleAddParticipant(user)}
                      type="button"
                    >
                      <Avatar className="size-10">
                        <AvatarImage src={user.pfp_url} />
                        <AvatarFallback>
                          {(user.display_name || user.username)
                            .charAt(0)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-1 flex-col items-start">
                        <p className="font-bold text-sm text-zinc-950 tracking-[-0.35px]">
                          {user.display_name || user.username}
                        </p>
                        <p className="text-[#6f7780] text-xs">
                          @{user.username}
                        </p>
                      </div>
                      {isAlreadyAdded && (
                        <Badge className="h-6 rounded-full bg-zinc-100 px-2 font-semibold text-xs text-zinc-950">
                          Added
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
      </div>

      {/* Current Participants */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Label className="font-semibold text-sm text-zinc-950 tracking-[-0.35px]">
            Current Participants
          </Label>
          <Badge className="h-6 rounded-full bg-zinc-100 px-2 font-semibold text-xs text-zinc-950">
            {formData.participants.length} of 3 minimum
          </Badge>
        </div>

        <div className="flex flex-col gap-3">
          {formData.participants.map((participant) => (
            <div
              className="flex items-center justify-between rounded-2xl border border-[rgba(232,235,237,0.3)] bg-white p-3"
              key={participant.id}
            >
              <div className="flex items-center gap-3">
                <Avatar className="size-12">
                  <AvatarImage src={participant.avatar} />
                  <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="font-bold text-sm text-zinc-950 tracking-[-0.35px]">
                    {participant.name} {participant.isHost && "(You)"}
                  </p>
                  <p className="text-[#6f7780] text-xs">
                    {participant.username}
                  </p>
                </div>
              </div>
              <Badge
                className={
                  participant.status === "joined"
                    ? "h-7 rounded-full bg-[rgba(107,155,122,0.2)] px-3 font-semibold text-[#6b9b7a] text-xs"
                    : "h-7 rounded-full bg-zinc-100 px-3 font-semibold text-[#6f7780] text-xs"
                }
              >
                {participant.status === "joined" ? "Joined" : "Pending"}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-[rgba(107,155,122,0.3)] bg-linear-to-b from-[rgba(107,155,122,0.1)] to-[rgba(107,155,122,0.05)] p-4">
        <div className="flex gap-2">
          <div className="flex size-2 shrink-0 items-center justify-center pt-1">
            <span className="font-bold text-[#6b9b7a] text-sm">■</span>
          </div>
          <div className="flex flex-col gap-2">
            <p className="font-bold text-[#6b9b7a] text-sm tracking-[-0.35px]">
              Participant Tips
            </p>
            <p className="text-[#6f7780] text-xs leading-[19.5px]">
              Invite trusted friends and family. All participants must
              contribute equally and receive payouts in turn. At least 3
              participants required to start a circle.
            </p>
          </div>
        </div>
      </div>

      {/* Verification Requirements */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Label className="font-semibold text-sm text-zinc-950 tracking-[-0.35px]">
            Verification Requirements
          </Label>
          <p className="text-[#6f7780] text-xs">
            Choose which verifications members must complete before joining
          </p>
        </div>

        {/* Proof of Human */}
        <div className="flex flex-col border-[rgba(232,235,237,0.3)] border-b">
          <div className="flex items-center justify-between py-3">
            <div className="flex flex-col gap-1">
              <p className="font-semibold text-sm text-zinc-950 tracking-[-0.35px]">
                Proof of Human
              </p>
              <p className="text-[#6f7780] text-xs">
                Verify members are real people
              </p>
            </div>
            <Switch
              checked={formData.proofOfHuman}
              onCheckedChange={(checked) =>
                updateFormData("proofOfHuman", checked)
              }
            />
          </div>
        </div>

        {/* Age Verification */}
        <div className="flex flex-col border-[rgba(232,235,237,0.3)] border-b">
          <div className="flex items-center justify-between py-3">
            <div className="flex flex-col gap-1">
              <p className="font-semibold text-sm text-zinc-950 tracking-[-0.35px]">
                Age Verification
              </p>
              <p className="text-[#6f7780] text-xs">Verify member age</p>
            </div>
            <Switch
              checked={formData.ageVerification}
              onCheckedChange={(checked) =>
                updateFormData("ageVerification", checked)
              }
            />
          </div>
          {formData.ageVerification && (
            <div className="flex flex-col gap-4 pb-3 pl-0">
              <div className="flex flex-col gap-2">
                <Label className="font-semibold text-[#6f7780] text-xs tracking-[-0.3px]">
                  Minimum Age
                </Label>
                <Input
                  className="h-[46px] rounded-2xl border border-[rgba(232,235,237,0.3)] bg-[#f5f7f9] font-medium text-sm text-zinc-950"
                  onChange={(e) => updateFormData("minAge", e.target.value)}
                  value={formData.minAge}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="font-semibold text-[#6f7780] text-xs tracking-[-0.3px]">
                  Maximum Age (Optional)
                </Label>
                <Input
                  className="h-[46px] rounded-2xl border border-[rgba(232,235,237,0.3)] bg-[#f5f7f9] font-medium text-sm text-zinc-950"
                  onChange={(e) => updateFormData("maxAge", e.target.value)}
                  value={formData.maxAge}
                />
              </div>
            </div>
          )}
        </div>

        {/* Gender Verification */}
        <div className="flex flex-col border-[rgba(232,235,237,0.3)] border-b">
          <div className="flex items-center justify-between py-3">
            <div className="flex flex-col gap-1">
              <p className="font-semibold text-sm text-zinc-950 tracking-[-0.35px]">
                Gender Verification
              </p>
              <p className="text-[#6f7780] text-xs">Verify member gender</p>
            </div>
            <Switch
              checked={formData.genderVerification}
              onCheckedChange={(checked) =>
                updateFormData("genderVerification", checked)
              }
            />
          </div>
          {formData.genderVerification && (
            <div className="flex flex-col gap-2 pb-3 pl-0">
              <Label className="font-semibold text-[#6f7780] text-xs tracking-[-0.3px]">
                Allowed Gender(s)
              </Label>
              <Select
                onValueChange={(value) =>
                  updateFormData("allowedGenders", value)
                }
                value={formData.allowedGenders}
              >
                <SelectTrigger className="h-[46px] rounded-2xl border border-[rgba(232,235,237,0.3)] bg-[#f5f7f9] font-medium text-sm text-zinc-950">
                  <SelectValue placeholder="All Genders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="non-binary">Non-binary</SelectItem>
                  <SelectItem value="prefer-not-to-say">
                    Prefer not to say
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Nationality Verification */}
        <div className="flex flex-col border-[rgba(232,235,237,0.3)] border-b">
          <div className="flex items-center justify-between py-3">
            <div className="flex flex-col gap-1">
              <p className="font-semibold text-sm text-zinc-950 tracking-[-0.35px]">
                Nationality Verification
              </p>
              <p className="text-[#6f7780] text-xs">
                Verify member nationality
              </p>
            </div>
            <Switch
              checked={formData.nationalityVerification}
              onCheckedChange={(checked) =>
                updateFormData("nationalityVerification", checked)
              }
            />
          </div>
          {formData.nationalityVerification && (
            <div className="flex flex-col gap-2 pb-3 pl-0">
              <Label className="font-semibold text-[#6f7780] text-xs tracking-[-0.3px]">
                Allowed Nationalities
              </Label>
              <div className="flex min-h-[78px] flex-wrap gap-2 rounded-2xl border border-[rgba(232,235,237,0.3)] bg-[#f5f7f9] p-3">
                {formData.allowedNationalities.map((nationality) => (
                  <Badge
                    className="flex h-6 items-center gap-2 rounded-xl bg-[#7b8ff5] px-[9px] font-semibold text-white text-xs leading-4 hover:bg-[#7b8ff5]/90"
                    key={nationality}
                  >
                    {nationality}
                    <button
                      aria-label={`Remove ${nationality}`}
                      className="flex size-4 items-center justify-center hover:opacity-70"
                      onClick={() =>
                        updateFormData(
                          "allowedNationalities",
                          formData.allowedNationalities.filter(
                            (n) => n !== nationality
                          )
                        )
                      }
                      type="button"
                    >
                      <svg
                        aria-label="Remove nationality"
                        fill="none"
                        height="14"
                        role="img"
                        viewBox="0 0 14 14"
                        width="14"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <title>Remove nationality</title>
                        <path
                          d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5"
                          stroke="white"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                        />
                      </svg>
                    </button>
                  </Badge>
                ))}
                <Input
                  className="h-6 flex-1 border-0 bg-transparent font-medium text-sm text-zinc-950 placeholder:text-zinc-950"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.currentTarget.value) {
                      updateFormData("allowedNationalities", [
                        ...formData.allowedNationalities,
                        e.currentTarget.value,
                      ]);
                      e.currentTarget.value = "";
                    }
                  }}
                  placeholder="Type to search countries..."
                />
              </div>
              <p className="text-[#6f7780] text-xs">
                Selected: {formData.allowedNationalities.length} countries
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
