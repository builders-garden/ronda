import type { groups } from "@/lib/database/db.schema";
import { useApiQuery } from "./use-api-query";

export type UserGroupsResponse = {
  groups: (typeof groups.$inferSelect)[];
};

export type UseUserGroupsOptions = {
  address: string;
  enabled?: boolean;
};

export const useUserGroups = (options: UseUserGroupsOptions) => {
  const { address, enabled = true } = options;

  return useApiQuery<UserGroupsResponse>({
    url: `/api/users/${address}/groups`,
    method: "GET",
    enabled: enabled && !!address,
    queryKey: ["user-groups", address],
  });
};
