import type { participants } from "@/lib/database/db.schema";
import { useApiMutation } from "./use-api-mutation";

export type BatchCreateParticipantItem = {
  userAddress: string;
  accepted?: boolean;
  paid?: boolean;
  contributed?: boolean;
};

export type BatchCreateParticipantsInput = {
  groupId: string;
  adminAddress: string;
  participants: BatchCreateParticipantItem[];
};

export type BatchCreateParticipantsResponse = {
  participants: (typeof participants.$inferSelect)[];
  created: number;
  skipped: number;
};

export const useBatchCreateParticipants = () =>
  useApiMutation<BatchCreateParticipantsResponse, BatchCreateParticipantsInput>(
    {
      url: (variables) => `/api/groups/${variables.groupId}/participants/batch`,
      method: "POST",
      body: (variables) => {
        const { groupId: _groupId, ...body } = variables;
        return body;
      },
    }
  );
