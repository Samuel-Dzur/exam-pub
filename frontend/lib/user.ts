import { getUserByKeycloakId } from "@/lib/api/generated/sdk.gen";
import type { UserWithOrdersResponse } from "@/lib/api/generated/types.gen";
import { throwApiError } from "@/lib/api/errors";

export async function getUserData(
  keycloakSubject: string,
): Promise<UserWithOrdersResponse> {
  const { data, response } = await getUserByKeycloakId({
    path: { keycloakId: keycloakSubject },
  });
  if (!response?.ok) {
    throwApiError(response, "Could not load your account. Please try again.");
  }
  if (!data) {
    throw new Error("Backend returned an invalid user response.");
  }
  return data;
}
