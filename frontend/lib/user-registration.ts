import {
  completeRegistration,
  getRegistrationStatus,
} from "@/lib/api/generated/sdk.gen";
import type { RegistrationStatusResponse } from "@/lib/api/generated/types.gen";
import { throwApiError } from "@/lib/api/errors";

export async function getUserRegistrationStatus(): Promise<RegistrationStatusResponse> {
  const { data, response } = await getRegistrationStatus();
  if (!response?.ok) {
    throwApiError(
      response,
      "Could not check registration status. Please try again.",
    );
  }
  if (!data) {
    throw new Error("Backend returned an invalid registration status.");
  }
  return data;
}

export async function submitUserRegistration(birthDate: string): Promise<void> {
  const { response } = await completeRegistration({
    body: { birthDate },
  });
  if (!response?.ok) {
    throwApiError(
      response,
      "Could not save your registration. Please try again.",
    );
  }
}
