import type { groups } from "@/lib/database/db.schema";
import { useApiMutation } from "./use-api-mutation";

export type CreateGroupInput = {
  creatorId: string;
  name: string;
  description: string;
  groupAddress: string;
};

export type CreateGroupResponse = {
  group: typeof groups.$inferSelect;
};

export const useCreateGroup = () =>
  useApiMutation<CreateGroupResponse, CreateGroupInput>({
    url: "/api/groups",
    method: "POST",
    body: (variables) => ({
      name: variables.name,
      description: variables.description,
      groupAddress: variables.groupAddress,
    }),
  });
