"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/auth-provider";
import {
  getDrinkMenu,
  getOrdersByProductId,
} from "@/lib/api/generated/sdk.gen";
import type {
  DrinkResponse,
  ProductOrderSummaryResponse,
} from "@/lib/api/generated/types.gen";
import { throwApiError } from "@/lib/api/errors";
import styles from "../data.module.css";
import pageStyles from "./orders.module.css";

interface ProductSummary {
  id: number;
  name: string;
  amount: number;
  unitPrice: number;
  summaryPrice: number;
}

type SummaryState =
  | { status: "loading" }
  | { status: "ready"; products: ProductSummary[] }
  | { status: "error" };

const currencyFormatter = new Intl.NumberFormat("cs-CZ", {
  style: "currency",
  currency: "CZK",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

async function loadProductSummary(
  drink: DrinkResponse,
): Promise<ProductSummary | null> {
  if (typeof drink.id !== "number" || !Number.isFinite(drink.id)) {
    throw new Error("Backend returned a drink without a valid ID.");
  }

  const { data: orders, response } = await getOrdersByProductId({
    path: { productId: drink.id },
  });
  if (!response?.ok) {
    throwApiError(response, "Přehled objednávek se nepodařilo načíst.");
  }
  if (!orders) {
    throw new Error("Backend returned an invalid product orders response.");
  }

  const totals = orders.reduce<{ amount: number; price: number }>(
    (aggregate, order: ProductOrderSummaryResponse) => {
      if (
        typeof order.amount === "number" &&
        Number.isFinite(order.amount) &&
        typeof order.price === "number" &&
        Number.isFinite(order.price)
      ) {
        aggregate.amount += order.amount;
        aggregate.price += order.price;
      }
      return aggregate;
    },
    { amount: 0, price: 0 },
  );

  if (totals.amount === 0) {
    return null;
  }

  return {
    id: drink.id,
    name: drink.productName ?? "Nápoj",
    amount: totals.amount,
    unitPrice: totals.price / totals.amount,
    summaryPrice: totals.price,
  };
}

export default function OrdersSummaryPage() {
  const { isBartender } = useAuth();
  const [summary, setSummary] = useState<SummaryState>({ status: "loading" });

  useEffect(() => {
    if (!isBartender) {
      return;
    }

    let active = true;
    async function loadSummary() {
      try {
        const { data, response } = await getDrinkMenu();
        if (!response?.ok) {
          throwApiError(response, "Nabídku nápojů se nepodařilo načíst.");
        }
        if (!data) {
          throw new Error("Backend returned an invalid drink menu response.");
        }

        const products = (
          await Promise.all(data.map(loadProductSummary))
        ).filter((product): product is ProductSummary => product !== null);
        if (active) {
          setSummary({ status: "ready", products });
        }
      } catch {
        if (active) {
          setSummary({ status: "error" });
        }
      }
    }

    void loadSummary();
    return () => {
      active = false;
    };
  }, [isBartender]);

  const products = summary.status === "ready" ? summary.products : [];
  const totalAmount = products.reduce((total, product) => total + product.amount, 0);
  const totalPrice = products.reduce(
    (total, product) => total + product.summaryPrice,
    0,
  );

  return (
    <section aria-labelledby="orders-title">
      <h2 className={pageStyles.viewTitle} id="orders-title">
        Objednávky
      </h2>
      {summary.status === "loading" && (
        <p className={styles.message} role="status">
          Načítáme přehled objednávek…
        </p>
      )}
      {summary.status === "error" && (
        <p className={styles.error} role="alert">
          Přehled objednávek se nepodařilo načíst. Zkuste to prosím znovu.
        </p>
      )}
      {summary.status === "ready" && products.length === 0 && (
        <p className={styles.message}>Zatím nejsou žádné objednávky.</p>
      )}
      {summary.status === "ready" && products.length > 0 && (
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Nápoj</th>
                <th scope="col">Průměrná cena za kus</th>
                <th scope="col">Počet kusů</th>
                <th scope="col">Celkem</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <th scope="row">{product.name}</th>
                  <td>{currencyFormatter.format(product.unitPrice)}</td>
                  <td>{product.amount}</td>
                  <td>{currencyFormatter.format(product.summaryPrice)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">Celkový součet</th>
                <td />
                <td>{totalAmount}</td>
                <td>{currencyFormatter.format(totalPrice)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </section>
  );
}
