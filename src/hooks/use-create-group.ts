import type { groups } from "@/lib/database/db.schema";
import { useApiMutation } from "./use-api-mutation";

export type CreateGroupInput = {
  name: string;
  description: string;
  groupOnchainId: string;
};

export type CreateGroupResponse = {
  group: typeof groups.$inferSelect;
};

export const useCreateGroup = () =>
  useApiMutation<CreateGroupResponse, CreateGroupInput>({
    url: "/api/groups",
    method: "POST",
  });
