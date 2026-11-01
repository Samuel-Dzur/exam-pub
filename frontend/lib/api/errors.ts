export function throwApiError(
  response: Response | undefined,
  failureMessage: string,
): never {
  if (response?.status === 401) {
    throw new Error("Your session has expired. Please sign in again.");
  }
  if (response?.status === 403) {
    throw new Error("You do not have access to this account.");
  }
  throw new Error(failureMessage);
}
