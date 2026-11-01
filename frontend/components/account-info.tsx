"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/auth-provider";
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
  const { keycloakSubject } = useAuth();
  const [result, setResult] = useState<UserDataResult | null>(null);

  useEffect(() => {
    let active = true;
    if (keycloakSubject === null) {
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
  }, [keycloakSubject]);

  const currentResult =
    result?.keycloakSubject === keycloakSubject ? result : null;

  return (
    <div className={styles.accountInfo}>
      <WalletBalance
        pocket={currentResult?.user?.pocket}
        isLoading={keycloakSubject !== null && currentResult === null}
        hasError={keycloakSubject === null || currentResult?.hasError === true}
      />
      <Profile />
    </div>
  );
}
