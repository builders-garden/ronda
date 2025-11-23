import type { participants } from "@/lib/database/db.schema";
import { useApiMutation } from "./use-api-mutation";

export type CreateParticipantInput = {
  groupId: string;
  userAddress: string;
  accepted?: boolean;
  paid?: boolean;
  contributed?: boolean;
};

export type CreateParticipantResponse = {
  participant: typeof participants.$inferSelect;
};

export const useCreateParticipant = () =>
  useApiMutation<CreateParticipantResponse, CreateParticipantInput>({
    url: (variables) => `/api/groups/${variables.groupId}/participants`,
    method: "POST",
    body: (variables) => {
      const { groupId: _groupId, ...participantData } = variables;
      return participantData;
    },
  });
