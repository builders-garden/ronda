import type { participants } from "@/lib/database/db.schema";
import { useApiQuery } from "./use-api-query";

export type GroupParticipantsResponse = {
  participants: (typeof participants.$inferSelect)[];
};

export type UseGroupParticipantsOptions = {
  groupId: string;
  enabled?: boolean;
};

export const useGroupParticipants = (options: UseGroupParticipantsOptions) => {
  const { groupId, enabled = true } = options;

  return useApiQuery<GroupParticipantsResponse>({
    url: `/api/groups/${groupId}/participants`,
    method: "GET",
    enabled: enabled && !!groupId,
    queryKey: ["group-participants", groupId],
  });
};
