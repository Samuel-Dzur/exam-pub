"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/auth-provider";
import type { UserOrderSummaryResponse } from "@/lib/api/generated/types.gen";
import { getOrdersByUserId } from "@/lib/api/generated/sdk.gen";
import { throwApiError } from "@/lib/api/errors";
import { getUserData } from "@/lib/user";
import styles from "./orders.module.css";

type OrdersState =
  | { status: "loading" }
  | { status: "ready"; orders: UserOrderSummaryResponse[] }
  | { status: "error" };

const currencyFormatter = new Intl.NumberFormat("cs-CZ", {
  style: "currency",
  currency: "CZK",
  minimumFractionDigits: 0,
});

export default function OrdersPage() {
  const { keycloakSubject } = useAuth();
  const [result, setResult] = useState<{
    keycloakSubject: string;
    state: Exclude<OrdersState, { status: "loading" }>;
  } | null>(null);

  useEffect(() => {
    let active = true;

    async function loadOrders() {
      if (keycloakSubject === null) {
        return;
      }
      const subject = keycloakSubject;

      try {
        const user = await getUserData(subject);
        if (typeof user.id !== "number" || !Number.isSafeInteger(user.id)) {
          throw new Error("Backend returned an invalid user ID.");
        }

        const { data: orders, response } = await getOrdersByUserId({
          path: { userId: user.id },
        });
        if (!response?.ok) {
          throwApiError(response, "Objednávky se nepodařilo načíst.");
        }
        if (!orders) {
          throw new Error("Backend returned an invalid orders response.");
        }
        if (active) {
          setResult({
            keycloakSubject: subject,
            state: { status: "ready", orders },
          });
        }
      } catch {
        if (active) {
          setResult({
            keycloakSubject: subject,
            state: { status: "error" },
          });
        }
      }
    }

    void loadOrders();

    return () => {
      active = false;
    };
  }, [keycloakSubject]);

  const state: OrdersState =
    keycloakSubject === null
      ? { status: "error" }
      : result?.keycloakSubject === keycloakSubject
        ? result.state
        : { status: "loading" };

  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="orders-title">
        <p className={styles.eyebrow}>Váš účet</p>
        <h1 id="orders-title">Moje objednávky</h1>

        {state.status === "loading" && (
          <p className={styles.status} role="status">
            Načítáme vaše objednávky…
          </p>
        )}
        {state.status === "error" && (
          <p className={styles.error} role="alert">
            Objednávky se nepodařilo načíst. Zkuste to prosím znovu.
          </p>
        )}
        {state.status === "ready" && state.orders.length === 0 && (
          <p className={styles.status}>Zatím nemáte žádné objednávky.</p>
        )}
        {state.status === "ready" && state.orders.length > 0 && (
          <ul className={styles.orderList}>
            {state.orders.map((order, index) => (
              <li
                className={styles.order}
                key={`${order.productId ?? "product"}-${index}`}
              >
                <div>
                  <h2>{order.productName ?? "Nápoj"}</h2>
                  <p>
                    Počet: {order.amount ?? "Není k dispozici"}
                  </p>
                </div>
                <strong>
                  {typeof order.price === "number" &&
                  Number.isFinite(order.price)
                    ? currencyFormatter.format(order.price)
                    : "Cena není k dispozici"}
                </strong>
              </li>
            ))}
          </ul>
        )}

        <Link className={styles.backLink} href="/bar">
          Zpět k nápojům
        </Link>
      </section>
    </main>
  );
}
