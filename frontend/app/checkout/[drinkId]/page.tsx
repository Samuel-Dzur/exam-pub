"use client";

import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { useParams } from "next/navigation";
import { useAuth } from "@/app/auth-provider";
import CheckoutDrink from "./checkout-drink";
import CheckoutOrder from "./checkout-order";
import CheckoutSubmissionStatus from "./checkout-submission-status";
import styles from "./checkout.module.css";
import { useCheckout } from "./use-checkout";

export default function CheckoutPage() {
  const { keycloakSubject } = useAuth();
  const { drinkId: rawDrinkId } = useParams<{ drinkId: string }>();
  const drinkId = Number(rawDrinkId);
  const {
    balance,
    clearPurchaseStatus,
    drinkState,
    purchase,
    submitPurchase,
  } = useCheckout(drinkId, keycloakSubject);

  if (purchase.status !== "idle") {
    return <CheckoutSubmissionStatus purchase={purchase} />;
  }

  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="checkout-title">
        <p className={styles.eyebrow}>Vaše objednávka</p>
        <h1 id="checkout-title">Zkontrolujte objednávku</h1>

        {drinkState.status === "loading" && (
          <p className={styles.status} role="status">
            <LoaderCircle className={styles.loadingIcon} aria-hidden="true" />
            Načítáme vybraný nápoj…
          </p>
        )}
        {drinkState.status === "error" && (
          <p className={styles.status} role="alert">
            Vybraný nápoj se nepodařilo načíst. Zkuste to prosím znovu.
          </p>
        )}
        {drinkState.status === "not-found" && (
          <p className={styles.status} role="alert">
            Tento nápoj jsme v nabídce nenašli.
          </p>
        )}
        {drinkState.status === "ready" && (
          <div className={styles.checkoutItem}>
            <CheckoutDrink
              drink={drinkState.drink}
              imageUrl={drinkState.imageUrl}
            />
            <CheckoutOrder
              balance={balance}
              drink={drinkState.drink}
              onPurchaseStatusChange={clearPurchaseStatus}
              onSubmit={submitPurchase}
              purchase={purchase}
            />
          </div>
        )}

        <Link className={styles.backLink} href="/bar">
          Zpět k nápojům
        </Link>
      </section>
    </main>
  );
}
