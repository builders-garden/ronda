"use client";

import { Loader2, Search, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
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
import { useAuth } from "@/contexts/auth-context";
import { useFarcaster } from "@/contexts/farcaster-context";
import { useApiQuery } from "@/hooks/use-api-query";
import { countries, getCountryByCode, searchCountries } from "@/lib/countries";
import type { NeynarUser } from "@/types/neynar.type";
import { useCreateRonda } from "./create-ronda-context";

export function Step3Participants() {
  const { user: currentUser } = useAuth();
  const { context: miniAppContext } = useFarcaster();
  const { formData, updateFormData } = useCreateRonda();
  const [showDropdown, setShowDropdown] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [countrySearchQuery, setCountrySearchQuery] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  // Upon component mount, add the current user as a participant if it's not already added
  // biome-ignore lint/correctness/useExhaustiveDependencies: <>
  useEffect(() => {
    if (
      currentUser &&
      miniAppContext?.user?.fid &&
      !formData.participants.some((p) => p.fid === miniAppContext?.user?.fid)
    ) {
      updateFormData("participants", [
        ...formData.participants,
        {
          id: currentUser.id,
          name: currentUser.name,
          username: currentUser.name,
          avatar: currentUser.image ?? undefined,
          isHost: true,
          fid: miniAppContext?.user?.fid,
        },
      ]);
    }
  }, [currentUser, miniAppContext?.user?.fid]);

  // Debounce the search query to prevent unnecessary API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(formData.searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.searchQuery]);

  // Search users using the API with debounced query
  const { data: searchResults, isLoading: isSearching } = useApiQuery<{
    users: NeynarUser[];
  }>({
    url: `/api/users/search?q=${encodeURIComponent(debouncedQuery)}`,
    queryKey: ["search-users", debouncedQuery],
    enabled: debouncedQuery.length > 0,
  });

  // Show dropdown when there are results and query is not empty
  useEffect(() => {
    if (searchResults?.users && searchResults.users.length > 0) {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  }, [searchResults]);

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

  const handleRemoveParticipant = (participantId: string) => {
    // Prevent removing the host (current user)
    const participant = formData.participants.find(
      (p) => p.id === participantId
    );
    if (participant?.isHost) {
      return;
    }

    updateFormData(
      "participants",
      formData.participants.filter((p) => p.id !== participantId)
    );
  };

  // Filter countries based on search query
  const filteredCountries = countrySearchQuery
    ? searchCountries(countrySearchQuery)
    : countries;

  const handleAddCountry = (countryCode: string) => {
    if (!formData.allowedNationalities.includes(countryCode)) {
      updateFormData("allowedNationalities", [
        ...formData.allowedNationalities,
        countryCode,
      ]);
    }
    setCountrySearchQuery("");
    setShowCountryDropdown(false);
  };

  const handleRemoveCountry = (countryCode: string) => {
    updateFormData(
      "allowedNationalities",
      formData.allowedNationalities.filter((code) => code !== countryCode)
    );
  };

  // Close country dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target as Node)
      ) {
        setShowCountryDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Search Bar */}
      <div className="relative flex flex-col gap-2" ref={dropdownRef}>
        <Label className="font-semibold text-muted text-sm tracking-[-0.35px]">
          Add Participants <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Input
            className="h-[50px] rounded-2xl border border-border bg-foreground font-medium text-muted text-sm placeholder:text-muted-foreground/50"
            onChange={(e) => updateFormData("searchQuery", e.target.value)}
            placeholder="Search by username"
            value={formData.searchQuery}
          />
          {isSearching && (
            <div className="-translate-y-1/2 absolute top-1/2 right-4">
              <Loader2 className="size-5 animate-spin text-muted" />
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

        <motion.div className="flex flex-col gap-2" layout>
          <AnimatePresence mode="popLayout">
            {formData.participants.map((participant) => (
              <motion.div
                animate={{ opacity: 1 }}
                className="flex items-center justify-between rounded-2xl border border-border bg-white p-3"
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
                key={participant.id}
                layout
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="size-12">
                    <AvatarImage src={participant.avatar} />
                    <AvatarFallback>
                      {participant.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="font-bold text-muted text-sm tracking-[-0.35px]">
                      {participant.name} {participant.isHost && "(You)"}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {participant.username}
                    </p>
                  </div>
                </div>
                {!participant.isHost && (
                  <motion.button
                    aria-label={`Remove ${participant.name}`}
                    className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10"
                    onClick={() => handleRemoveParticipant(participant.id)}
                    type="button"
                    whileTap={{ scale: 0.98 }}
                  >
                    <X className="size-4 text-destructive" />
                  </motion.button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="rounded-2xl border border-border bg-border/50 p-4">
        <div className="flex gap-2">
          <span className="font-bold text-success">●</span>
          <div className="flex flex-col gap-1 pt-[3px]">
            <p className="font-bold text-sm text-success tracking-[-0.35px]">
              Participant Tips
            </p>
            <p className="text-muted-foreground text-xs leading-[19.5px]">
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
              onCheckedChange={(checked: boolean) =>
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
              onCheckedChange={(checked: boolean) =>
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
              onCheckedChange={(checked: boolean) =>
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
                onValueChange={(value: string) =>
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
              onCheckedChange={(checked: boolean) =>
                updateFormData("nationalityVerification", checked)
              }
            />
          </div>
          {formData.nationalityVerification && (
            <div className="flex flex-col gap-2 pb-3 pl-0">
              <Label className="font-semibold text-[#6f7780] text-xs tracking-[-0.3px]">
                Allowed Nationalities
              </Label>
              <div className="relative" ref={countryDropdownRef}>
                <div className="relative">
                  <Search className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-muted-foreground" />
                  <Input
                    className="h-[46px] rounded-2xl border border-[rgba(232,235,237,0.3)] bg-[#f5f7f9] pl-10 font-medium text-sm text-zinc-950 placeholder:text-zinc-950"
                    onChange={(e) => {
                      setCountrySearchQuery(e.target.value);
                      setShowCountryDropdown(true);
                    }}
                    onFocus={() => setShowCountryDropdown(true)}
                    placeholder="Search countries..."
                    value={countrySearchQuery}
                  />
                </div>

                {/* Country Search Results Dropdown */}
                {showCountryDropdown && filteredCountries.length > 0 && (
                  <div className="absolute top-full right-0 left-0 z-50 mt-2 max-h-64 overflow-y-auto rounded-2xl border border-[rgba(232,235,237,0.3)] bg-white shadow-lg">
                    <div className="flex flex-col">
                      {filteredCountries
                        .filter(
                          (country) =>
                            !formData.allowedNationalities.includes(
                              country.code
                            )
                        )
                        .slice(0, 10)
                        .map((country) => (
                          <button
                            className="flex items-center gap-3 p-3 transition-colors hover:bg-[#f5f7f9]"
                            key={country.code}
                            onClick={() => handleAddCountry(country.code)}
                            type="button"
                          >
                            <span className="text-2xl">{country.flag}</span>
                            <div className="flex flex-1 flex-col items-start">
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-sm text-zinc-950 tracking-[-0.35px]">
                                  {country.name}
                                </p>
                                <Badge className="h-4 rounded px-1.5 font-semibold text-[10px]">
                                  {country.code}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <p className="text-[#6f7780] text-xs">
                                  {country.region}
                                </p>
                                <span className="text-[#6f7780]">•</span>
                                <Badge
                                  className={`h-4 rounded px-1.5 font-semibold text-[10px] ${
                                    country.support === "full"
                                      ? "bg-green-100 text-green-700"
                                      : country.support === "csca"
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  {country.support === "full"
                                    ? "DSC + CSCA"
                                    : country.support === "csca"
                                      ? "CSCA"
                                      : "Special"}
                                </Badge>
                              </div>
                            </div>
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Selected Countries */}
              <div className="flex flex-wrap gap-2 rounded-2xl border border-[rgba(232,235,237,0.3)] bg-[#f5f7f9] p-3">
                {formData.allowedNationalities.map((countryCode) => {
                  const country = getCountryByCode(countryCode);
                  if (!country) {
                    return null;
                  }
                  return (
                    <Badge
                      className="flex h-8 items-center gap-2 rounded-xl bg-primary px-3 font-semibold text-white text-xs leading-4 transition-all duration-300 hover:bg-primary/80"
                      key={countryCode}
                    >
                      <span className="text-base">{country.flag}</span>
                      <span>{country.name}</span>
                      <button
                        aria-label={`Remove ${country.name}`}
                        className="flex size-4 cursor-pointer items-center justify-center hover:opacity-80"
                        onClick={() => handleRemoveCountry(countryCode)}
                        type="button"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
              <p className="text-[#6f7780] text-xs">
                Selected: {formData.allowedNationalities.length}{" "}
                {formData.allowedNationalities.length === 1
                  ? "country"
                  : "countries"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
