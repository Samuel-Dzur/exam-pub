"use client";

import Link from "next/link";
import {
  CircleCheckBig,
  CircleX,
  LoaderCircle,
} from "lucide-react";
import type { PurchaseState } from "./use-checkout";
import styles from "./checkout-submission-status.module.css";

interface CheckoutSubmissionStatusProps {
  purchase: Exclude<PurchaseState, { status: "idle" }>;
}

export default function CheckoutSubmissionStatus({
  purchase,
}: CheckoutSubmissionStatusProps) {
  return (
    <main className={styles.page}>
      <section className={styles.card} aria-live="polite">
        {purchase.status === "submitting" && (
          <>
            <LoaderCircle className={styles.loadingIcon} aria-hidden="true" />
            <h1>Odesíláme objednávku</h1>
            <p>Chvilku strpení, objednávku právě zpracováváme.</p>
          </>
        )}
        {purchase.status === "success" && (
          <>
            <h1>Objednávka dokončena</h1>
            <p className={styles.descriptionRow}>
              <CircleCheckBig
                className={styles.successIcon}
                aria-hidden="true"
              />
              Objednávka byla úspěšně vytvořena.
            </p>
          </>
        )}
        {purchase.status === "error" && (
          <>
            <h1>Objednávku se nepodařilo dokončit</h1>
            <p className={`${styles.descriptionRow} ${styles.error}`}>
              <CircleX className={styles.errorIcon} aria-hidden="true" />
              {purchase.message}
            </p>
          </>
        )}
        {purchase.status !== "submitting" && (
          <Link className={styles.backLink} href="/bar">
            Zpět k nápojům
          </Link>
        )}
      </section>
    </main>
  );
}
