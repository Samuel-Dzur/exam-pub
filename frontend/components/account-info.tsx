"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/auth-provider";
import Link from "next/link";
import { ClipboardList } from "lucide-react";
import type { UserWithOrdersResponse } from "@/lib/api/generated/types.gen";
import { getUserData } from "@/lib/user";
import Profile from "./profile";
import WalletBalance from "./wallet-balance";
import styles from "./account-info.module.css";

interface UserDataResult {
  keycloakSubject: string;
  user?: UserWithOrdersResponse;
  hasError?: boolean;
}

export default function AccountInfo() {
  const { isBartender, keycloakSubject } = useAuth();
  const [result, setResult] = useState<UserDataResult | null>(null);

  useEffect(() => {
    let active = true;
    if (isBartender || keycloakSubject === null) {
      return;
    }

    void getUserData(keycloakSubject)
      .then((user) => {
        if (typeof user.pocket !== "number" || !Number.isFinite(user.pocket)) {
          throw new Error("Backend returned an invalid user balance.");
        }
        if (active) {
          setResult({ keycloakSubject, user });
        }
      })
      .catch(() => {
        if (active) {
          setResult({ keycloakSubject, hasError: true });
        }
      });

    return () => {
      active = false;
    };
  }, [isBartender, keycloakSubject]);

  const currentResult =
    result?.keycloakSubject === keycloakSubject ? result : null;

  return (
    <div className={styles.accountInfo}>
      {!isBartender && (
        <WalletBalance
          pocket={currentResult?.user?.pocket}
          isLoading={keycloakSubject !== null && currentResult === null}
          hasError={keycloakSubject === null || currentResult?.hasError === true}
        />
      )}
      {isBartender && (
        <Link className={styles.summaryLink} href="/summary">
          <ClipboardList size={18} aria-hidden="true" />
          <span>Přehled</span>
        </Link>
      )}
      <Profile />
    </div>
  );
}
