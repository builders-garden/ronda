"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";

export type Participant = {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  isHost?: boolean;
  fid?: number;
};

type CreateRondaFormData = {
  // Step 1: Basic Details
  roscaName: string;
  description: string;

  // Step 2: Contribution Setup
  contributionAmount: string;
  frequency: string;
  numberOfCycles: string;

  // Step 3: Participants
  participants: Participant[];
  searchQuery: string;

  // Verification Requirements
  proofOfHuman: boolean;
  ageVerification: boolean;
  minAge: string;
  genderVerification: boolean;
  allowedGenders: string;
  nationalityVerification: boolean;
  allowedNationalities: string[]; // Country codes
};

type CreateRondaContextType = {
  formData: CreateRondaFormData;
  updateFormData: <K extends keyof CreateRondaFormData>(
    key: K,
    value: CreateRondaFormData[K]
  ) => void;
  resetFormData: () => void;
  totalPot: string;
  canProceedFromStep: (step: number) => boolean;
};

const initialFormData: CreateRondaFormData = {
  roscaName: "",
  description: "",
  contributionAmount: "",
  frequency: "weekly",
  numberOfCycles: "",
  participants: [],
  searchQuery: "",
  proofOfHuman: true,
  ageVerification: true,
  minAge: "18",
  genderVerification: true,
  allowedGenders: "all",
  nationalityVerification: true,
  allowedNationalities: ["US"],
};

const CreateRondaContext = createContext<CreateRondaContextType | undefined>(
  undefined
);

export function CreateRondaProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] =
    useState<CreateRondaFormData>(initialFormData);

  const updateFormData = <K extends keyof CreateRondaFormData>(
    key: K,
    value: CreateRondaFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const resetFormData = () => {
    setFormData(initialFormData);
  };

  const totalPot = useMemo(() => {
    if (!(formData.contributionAmount && formData.numberOfCycles)) {
      return "0.00";
    }
    const contributionAmount = Number.parseFloat(formData.contributionAmount);
    if (Number.isNaN(contributionAmount) || contributionAmount <= 0) {
      return "0.00";
    }
    const numberOfCycles = Number.parseFloat(formData.numberOfCycles);
    if (Number.isNaN(numberOfCycles) || numberOfCycles <= 0) {
      return "0.00";
    }
    // If participants haven't been added yet, show contribution per participant
    // Otherwise, show total pot (contribution * number of participants)
    const participantCount = formData.participants.length || 1;
    return (contributionAmount * numberOfCycles * participantCount).toFixed(2);
  }, [
    formData.contributionAmount,
    formData.numberOfCycles,
    formData.participants.length,
  ]);

  const canProceedFromStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return formData.roscaName.trim().length > 0;
      case 2: {
        const contributionAmount = Number.parseFloat(
          formData.contributionAmount.trim()
        );
        const numberOfCycles = Number.parseInt(
          formData.numberOfCycles.trim(),
          10
        );
        return (
          formData.frequency.length > 0 &&
          formData.contributionAmount.trim().length > 0 &&
          !Number.isNaN(contributionAmount) &&
          contributionAmount > 0 &&
          formData.numberOfCycles.trim().length > 0 &&
          !Number.isNaN(numberOfCycles) &&
          numberOfCycles > 1 &&
          numberOfCycles < 12
        );
      }
      case 3:
        return formData.participants.length >= 3;
      default:
        return true;
    }
  };

  return (
    <CreateRondaContext.Provider
      value={{
        formData,
        updateFormData,
        resetFormData,
        totalPot,
        canProceedFromStep,
      }}
    >
      {children}
    </CreateRondaContext.Provider>
  );
}

export function useCreateRonda() {
  const context = useContext(CreateRondaContext);
  if (context === undefined) {
    throw new Error("useCreateRonda must be used within a CreateRondaProvider");
  }
  return context;
}
