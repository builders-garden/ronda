import type { NeynarUser } from "@/types/neynar.type";
import type { User } from "@/types/user.type";
import { useApiQuery } from "./use-api-query";

export type UserByAddressResponse = {
  neynarUser: NeynarUser;
  dbUser: User | null;
};

export type UseUserByAddressOptions = {
  address: string;
  enabled?: boolean;
};

export const useUserByAddress = (options: UseUserByAddressOptions) => {
  const { address, enabled = true } = options;

  return useApiQuery<UserByAddressResponse>({
    url: `/api/users/${address}`,
    method: "GET",
    enabled: enabled && !!address,
    queryKey: ["user", address],
  });
};
