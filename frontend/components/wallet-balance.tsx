"use client";

import { Wallet } from "lucide-react";
import styles from "./account-info.module.css";

const currencyFormatter = new Intl.NumberFormat("cs-CZ", {
  style: "currency",
  currency: "CZK",
  minimumFractionDigits: 0,
});

interface WalletBalanceProps {
  pocket?: number;
  isLoading: boolean;
  hasError: boolean;
}

export default function WalletBalance({
  pocket,
  isLoading,
  hasError,
}: WalletBalanceProps) {
  const balance =
    hasError || isLoading || typeof pocket !== "number"
      ? "-"
      : currencyFormatter.format(pocket);

  return (
    <p className={styles.accountItem}>
      <Wallet size={20} aria-hidden="true" />
      <span>{balance}</span>
    </p>
  );
}
