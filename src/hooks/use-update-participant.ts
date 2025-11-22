import type { participants } from "@/lib/database/db.schema";
import { useApiMutation } from "./use-api-mutation";

export type UpdateParticipantInput = {
  groupId: string;
  participantId: string;
  accepted?: boolean;
  paid?: boolean;
  contributed?: boolean;
  acceptedAt?: string;
  paidAt?: string;
};

export type UpdateParticipantResponse = {
  participant: typeof participants.$inferSelect;
};

export const useUpdateParticipant = () =>
  useApiMutation<UpdateParticipantResponse, UpdateParticipantInput>({
    url: (variables) => `/api/groups/${variables.groupId}/participants`,
    method: "PATCH",
    body: (variables) => {
      const { groupId: _groupId, ...updateData } = variables;
      return updateData;
    },
  });
