"use client";

import Image from "next/image";
import { ImageOff } from "lucide-react";
import type { DrinkResponse } from "@/lib/api/generated/types.gen";
import styles from "./checkout-drink.module.css";

const currencyFormatter = new Intl.NumberFormat("cs-CZ", {
  style: "currency",
  currency: "CZK",
  minimumFractionDigits: 0,
});

interface CheckoutDrinkProps {
  drink: DrinkResponse;
  imageUrl: string | null;
}

export default function CheckoutDrink({
  drink,
  imageUrl,
}: CheckoutDrinkProps) {
  return (
    <div className={styles.drink}>
      {imageUrl ? (
        <Image
          alt={drink.productName ?? "Vybraný nápoj"}
          className={styles.image}
          height={648}
          src={imageUrl}
          unoptimized
          width={432}
        />
      ) : (
        <div className={styles.imagePlaceholder}>
          <ImageOff size={28} aria-hidden="true" />
          <span>Obrázek není k dispozici</span>
        </div>
      )}
      <div className={styles.drinkDetails}>
        <div className={styles.nameRow}>
          <h2>{drink.productName ?? "Nápoj"}</h2>
          {drink.isForAdult && (
            <span className={styles.adultLabel}>18+</span>
          )}
        </div>
        <p className={styles.price}>
          {typeof drink.price === "number" && Number.isFinite(drink.price)
            ? currencyFormatter.format(drink.price)
            : "Cena není dostupná"}
        </p>
      </div>
    </div>
  );
}
