import Keycloak from "keycloak-js";

const keycloakUrl = process.env.NEXT_PUBLIC_KEYCLOAK_URL;
const keycloakRealm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM;
const keycloakClientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID;

const requiredSettings = [
  ["NEXT_PUBLIC_KEYCLOAK_URL", keycloakUrl],
  ["NEXT_PUBLIC_KEYCLOAK_REALM", keycloakRealm],
  ["NEXT_PUBLIC_KEYCLOAK_CLIENT_ID", keycloakClientId],
] as const;

const missingSettings = requiredSettings
  .filter(([, value]) => !value)
  .map(([name]) => name);

const keycloak =
  keycloakUrl && keycloakRealm && keycloakClientId
    ? new Keycloak({
        url: keycloakUrl,
        realm: keycloakRealm,
        clientId: keycloakClientId,
      })
    : null;

let initialization: Promise<boolean> | null = null;

function requireKeycloak(): Keycloak {
  if (!keycloak) {
    throw new Error(
      `Missing Keycloak configuration: ${missingSettings.join(", ")}. Set it in frontend/.env.local and restart the app.`,
    );
  }

  return keycloak;
}

export function initializeKeycloak(): Promise<boolean> {
  const client = requireKeycloak();

  initialization ??= client.init({
    onLoad: "check-sso",
    pkceMethod: "S256",
    checkLoginIframe: false,
  });

  return initialization;
}

export function getKeycloakUsername(): string | null {
  const username = requireKeycloak().tokenParsed?.preferred_username;
  return typeof username === "string" && username.length > 0 ? username : null;
}

export function getKeycloakSubject(): string | null {
  const subject = requireKeycloak().tokenParsed?.sub;
  return typeof subject === "string" && subject.length > 0 ? subject : null;
}

export async function getKeycloakAccessToken(): Promise<string> {
  const client = requireKeycloak();
  await client.updateToken(30);
  if (!client.token) {
    throw new Error("Your session has expired. Please sign in again.");
  }
  return client.token;
}

export async function loginWithKeycloak(redirectUri: string): Promise<void> {
  await requireKeycloak().login({ redirectUri });
}

export async function registerWithKeycloak(redirectUri: string): Promise<void> {
  await requireKeycloak().register({ redirectUri });
}

export async function logoutFromKeycloak(redirectUri: string): Promise<void> {
  await requireKeycloak().logout({ redirectUri });
}
