import type { Metadata } from "next";
import { headers } from "next/headers";
import { AuthProvider } from "./auth-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hospoda Díra",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  await headers();

  return (
    <html lang="cs">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
