import type { UseQueryOptions } from "@tanstack/react-query";
import { useApiQuery } from "./use-api-query";

export type MockPayoutResponse = {
  success?: boolean;
  addresses?: string[];
  totalEligible?: number;
  message?: string;
  error?: string;
};

interface UseMockPayoutOptions
  extends Omit<UseQueryOptions<MockPayoutResponse>, "queryKey" | "queryFn"> {
  address: string;
}

export const useMockPayout = (options: UseMockPayoutOptions) => {
  const { address, ...queryOptions } = options;

  return useApiQuery<MockPayoutResponse>({
    url: `/api/groups/mock-payout/${address}`,
    method: "GET",
    queryKey: ["mock-payout", address],
    enabled: !!address && address.trim().length > 0,
    ...queryOptions,
  });
};
