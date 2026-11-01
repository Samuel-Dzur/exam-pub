import type { CreateClientConfig } from "./generated/client.gen";
import { getKeycloakAccessToken } from "@/lib/keycloak";

const apiOrigin = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8081")
  .replace(/\/$/, "");

export const createClientConfig: CreateClientConfig = (config) => ({
  ...config,
  auth: getKeycloakAccessToken,
  baseUrl: `${apiOrigin}/api`,
});
