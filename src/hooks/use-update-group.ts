import type { groups } from "@/lib/database/db.schema";
import { useApiMutation } from "./use-api-mutation";

export type UpdateGroupInput = {
  groupId: string;
  name?: string;
  description?: string;
  groupOnchainId?: string;
};

export type UpdateGroupResponse = {
  group: typeof groups.$inferSelect;
};

export const useUpdateGroup = () =>
  useApiMutation<UpdateGroupResponse, UpdateGroupInput>({
    url: (variables) => `/api/groups/${variables.groupId}`,
    method: "PATCH",
    body: (variables) => {
      const { groupId: _groupId, ...updateData } = variables;
      return updateData;
    },
  });
