import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "../backend/src/main/java/samuel/dzur/hospoda/backend/api/openapi.json",
  output: "./lib/api/generated",
  plugins: [
    "@hey-api/sdk",
    {
      name: "@hey-api/client-fetch",
      runtimeConfigPath: "./lib/api/runtime-config",
    },
  ],
});
