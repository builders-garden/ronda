"use client";

import { createContext, type ReactNode, useContext, useState } from "react";

export type Participant = {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  status: "joined" | "pending";
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
  startDate: string;

  // Step 3: Participants
  participants: Participant[];
  searchQuery: string;

  // Verification Requirements
  proofOfHuman: boolean;
  ageVerification: boolean;
  minAge: string;
  maxAge: string;
  genderVerification: boolean;
  allowedGenders: string;
  nationalityVerification: boolean;
  allowedNationalities: string[];
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
  frequency: "",
  startDate: "",
  participants: [
    {
      id: "1",
      name: "John Doe",
      username: "@limone.eth",
      status: "joined",
      isHost: true,
    },
  ],
  searchQuery: "",
  proofOfHuman: true,
  ageVerification: true,
  minAge: "18",
  maxAge: "65",
  genderVerification: true,
  allowedGenders: "all",
  nationalityVerification: true,
  allowedNationalities: ["United States", "Canada"],
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

  const totalPot =
    formData.participants.length > 0 && formData.contributionAmount
      ? (
          Number.parseFloat(formData.contributionAmount) *
          formData.participants.length
        ).toFixed(2)
      : "0.00";

  const canProceedFromStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return formData.roscaName.trim().length > 0;
      case 2:
        return (
          formData.contributionAmount.trim().length > 0 &&
          formData.frequency.length > 0 &&
          formData.startDate.length > 0
        );
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
