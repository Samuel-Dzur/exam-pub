import { getKeycloakAccessToken } from "@/lib/keycloak";

const apiOrigin = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8081").replace(/\/$/, "");
const registrationUrl = `${apiOrigin}/api/users/registration`;

async function registrationRequest(
  failureMessage: string,
  init?: RequestInit,
): Promise<Response> {
  const token = await getKeycloakAccessToken();
  const headers = new Headers(init?.headers);
  headers.set("Authorization", "Bearer " + token);
  if (init?.body) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(registrationUrl, {
    ...init,
    headers,
  });

  if (!response.ok) {
    throw new Error(
      response.status === 401 || response.status === 403
        ? "Your session has expired. Please sign in again."
        : failureMessage,
    );
  }
  return response;
}

export async function isUserRegistrationComplete(): Promise<boolean> {
  const response = await registrationRequest(
    "Nepodařilo se ověřit stav registrace. Zkuste to prosím znovu.",
  );
  const result: unknown = await response.json();
  if (
    typeof result !== "object" ||
    result === null ||
    !("completed" in result) ||
    typeof result.completed !== "boolean"
  ) {
    throw new Error("Backend returned an invalid registration status.");
  }
  return result.completed;
}

export async function submitUserRegistration(birthDate: string): Promise<void> {
  await registrationRequest(
    "Registraci se nepodařilo uložit. Zkuste to prosím znovu.",
    {
      method: "POST",
      body: JSON.stringify({ birthDate }),
    },
  );
}
