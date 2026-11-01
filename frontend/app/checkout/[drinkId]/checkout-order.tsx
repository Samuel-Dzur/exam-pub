"use client";

import { useState } from "react";
import PrimaryButton from "@/components/primary-button";
import type { DrinkResponse } from "@/lib/api/generated/types.gen";
import type { BalanceState, PurchaseState } from "./use-checkout";
import styles from "./checkout-order.module.css";

const MAX_ORDER_COUNT = 2_147_483_647;
const currencyFormatter = new Intl.NumberFormat("cs-CZ", {
  style: "currency",
  currency: "CZK",
  minimumFractionDigits: 0,
});

interface CheckoutOrderProps {
  balance: BalanceState;
  drink: DrinkResponse;
  purchase: PurchaseState;
  onPurchaseStatusChange: () => void;
  onSubmit: (count: number) => void;
}

export default function CheckoutOrder({
  balance,
  drink,
  purchase,
  onPurchaseStatusChange,
  onSubmit,
}: CheckoutOrderProps) {
  const [quantityInput, setQuantityInput] = useState("1");
  const quantity = Number(quantityInput);
  const isValidQuantity =
    /^[1-9]\d*$/.test(quantityInput) &&
    Number.isSafeInteger(quantity) &&
    quantity <= MAX_ORDER_COUNT;
  const drinkPrice =
    typeof drink.price === "number" && Number.isFinite(drink.price)
      ? drink.price
      : null;
  const total =
    drinkPrice === null ? null : Math.round(drinkPrice * quantity * 100) / 100;
  const remainingBalance =
    balance.status === "ready" && total !== null
      ? Math.round((balance.pocket - total) * 100) / 100
      : null;

  function updateQuantity(value: string) {
    setQuantityInput(value);
    onPurchaseStatusChange();
  }

  return (
    <div className={styles.orderAction}>
      <span className={styles.quantityLabel} id="quantity-label">
        Počet kusů
      </span>
      <div className={styles.quantityControl}>
        <button
          aria-label="Odebrat jeden kus"
          className={styles.quantityButton}
          disabled={quantity <= 1}
          onClick={() =>
            updateQuantity(
              String(Math.max(1, (isValidQuantity ? quantity : 1) - 1)),
            )
          }
          type="button"
        >
          −
        </button>
        <input
          aria-describedby={isValidQuantity ? undefined : "quantity-error"}
          aria-invalid={!isValidQuantity}
          aria-label="Počet kusů"
          className={styles.quantityInput}
          inputMode="numeric"
          onChange={(event) =>
            updateQuantity(event.target.value.replace(/\D/g, ""))
          }
          pattern="[0-9]*"
          type="text"
          value={quantityInput}
        />
        <button
          aria-label="Přidat jeden kus"
          className={styles.quantityButton}
          disabled={isValidQuantity && quantity === MAX_ORDER_COUNT}
          onClick={() =>
            updateQuantity(String((isValidQuantity ? quantity : 1) + 1))
          }
          type="button"
        >
          +
        </button>
      </div>
      {!isValidQuantity && (
        <p className={styles.quantityError} id="quantity-error">
          Zadejte počet
        </p>
      )}
      {isValidQuantity && (
        <>
          <p className={styles.orderSummary}>
            {quantity} ×{" "}
            {drinkPrice !== null
              ? currencyFormatter.format(drinkPrice)
              : "Cena není dostupná"}{" "}
            ({drink.productName ?? "Nápoj"})
          </p>
          <p className={styles.total}>
            Celkem{" "}
            {total !== null
              ? currencyFormatter.format(total)
              : "Cena není dostupná"}
          </p>
          {balance.status === "loading" && (
            <p className={styles.balanceStatus} role="status">
              Načítáme zůstatek…
            </p>
          )}
          {balance.status === "error" && (
            <p className={styles.balanceError} role="alert">
              Zůstatek se nepodařilo načíst.
            </p>
          )}
          {balance.status === "ready" &&
            total !== null &&
            remainingBalance !== null && (
              <div className={styles.balanceCard}>
                <p className={styles.balanceLabel}>Nový zůstatek</p>
                <p className={styles.balanceCalculation}>
                  <span>{currencyFormatter.format(balance.pocket)}</span>
                  <span className={styles.balanceOperator}>−</span>
                  <span>{currencyFormatter.format(total)}</span>
                  <span className={styles.balanceOperator}>=</span>
                  <strong
                    className={
                      remainingBalance < 0 ? styles.negativeBalance : undefined
                    }
                  >
                    {currencyFormatter.format(remainingBalance)}
                  </strong>
                </p>
              </div>
            )}
        </>
      )}
      <PrimaryButton
        className={styles.orderButton}
        compact
        disabled={
          quantityInput.length === 0 ||
          purchase.status === "submitting" ||
          (remainingBalance !== null && remainingBalance < 0)
        }
        onClick={() => onSubmit(quantity)}
        type="button"
      >
        {purchase.status === "submitting" ? "Odesíláme…" : "Objednat"}
      </PrimaryButton>
      {purchase.status === "success" && (
        <p className={styles.purchaseSuccess} role="status">
          Objednávka byla úspěšně vytvořena.
        </p>
      )}
      {purchase.status === "error" && (
        <p className={styles.purchaseError} role="alert">
          {purchase.message}
        </p>
      )}
    </div>
  );
}
