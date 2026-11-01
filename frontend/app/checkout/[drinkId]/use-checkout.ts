"use client";

import { useCallback, useEffect, useState } from "react";
import { buy, getDrinkImage, getDrinkMenu } from "@/lib/api/generated/sdk.gen";
import type { DrinkResponse } from "@/lib/api/generated/types.gen";
import { throwApiError } from "@/lib/api/errors";
import { getUserData } from "@/lib/user";

export type BalanceState =
  | { status: "loading" }
  | { status: "ready"; pocket: number }
  | { status: "error" };

type DrinkState =
  | { status: "loading" }
  | { status: "ready"; drink: DrinkResponse; imageUrl: string | null }
  | { status: "not-found" }
  | { status: "error" };

type LoadedBalance = {
  keycloakSubject: string;
  balance: Exclude<BalanceState, { status: "loading" }>;
};

export type PurchaseState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success" }
  | { status: "error"; message: string };

export function useCheckout(drinkId: number, keycloakSubject: string | null) {
  const [drinkState, setDrinkState] = useState<DrinkState>({
    status: "loading",
  });
  const [loadedBalance, setLoadedBalance] = useState<LoadedBalance | null>(null);
  const [purchase, setPurchase] = useState<PurchaseState>({ status: "idle" });

  useEffect(() => {
    let active = true;
    let imageUrl: string | null = null;

    async function loadDrink() {
      if (!Number.isSafeInteger(drinkId) || drinkId <= 0) {
        setDrinkState({ status: "not-found" });
        return;
      }

      try {
        const { data: drinks, response } = await getDrinkMenu();
        if (!response?.ok) {
          throwApiError(response, "Nabídku se nepodařilo načíst.");
        }
        if (!drinks) {
          throw new Error("Server vrátil neplatnou nabídku nápojů.");
        }

        const drink = drinks.find((item) => item.id === drinkId);
        if (!drink) {
          if (active) {
            setDrinkState({ status: "not-found" });
          }
          return;
        }

        try {
          const { data: image, response: imageResponse } = await getDrinkImage({
            path: { id: drinkId },
            parseAs: "blob",
          });
          if (imageResponse?.ok && image) {
            imageUrl = URL.createObjectURL(image);
            if (!active) {
              URL.revokeObjectURL(imageUrl);
              imageUrl = null;
              return;
            }
          }
        } catch {
          imageUrl = null;
        }

        if (active) {
          setDrinkState({ status: "ready", drink, imageUrl });
        }
      } catch {
        if (active) {
          setDrinkState({ status: "error" });
        }
      }
    }

    void loadDrink();

    return () => {
      active = false;
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [drinkId]);

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
          setLoadedBalance({
            keycloakSubject,
            balance: { status: "ready", pocket: user.pocket },
          });
        }
      })
      .catch(() => {
        if (active) {
          setLoadedBalance({
            keycloakSubject,
            balance: { status: "error" },
          });
        }
      });

    return () => {
      active = false;
    };
  }, [keycloakSubject]);

  const balance: BalanceState =
    keycloakSubject === null
      ? { status: "error" }
      : loadedBalance?.keycloakSubject === keycloakSubject
        ? loadedBalance.balance
        : { status: "loading" };

  const submitPurchase = useCallback(
    async (count: number) => {
      if (drinkState.status !== "ready") {
        setPurchase({
          status: "error",
          message: "Vybraný nápoj není dostupný.",
        });
        return;
      }
      if (!Number.isSafeInteger(count) || count <= 0) {
        setPurchase({ status: "error", message: "Zadejte kladný počet." });
        return;
      }

      setPurchase({ status: "submitting" });
      try {
        const { data, response } = await buy({
          body: { productId: drinkId, count },
        });
        if (!response?.ok) {
          if (response?.status === 409) {
            throw new Error("Na účtu není dostatek peněz.");
          }
          if (response?.status === 403) {
            throw new Error("Tento nápoj je dostupný pouze dospělým.");
          }
          throwApiError(response, "Objednávku se nepodařilo odeslat.");
        }

        if (
          typeof data?.remainingBalance !== "number" ||
          !Number.isFinite(data.remainingBalance)
        ) {
          throw new Error("Server vrátil neplatný stav objednávky.");
        }
        if (keycloakSubject !== null) {
          setLoadedBalance({
            keycloakSubject,
            balance: { status: "ready", pocket: data.remainingBalance },
          });
        }
        setPurchase({ status: "success" });
      } catch (error) {
        setPurchase({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Objednávku se nepodařilo odeslat.",
        });
      }
    },
    [drinkId, drinkState, keycloakSubject],
  );

  const clearPurchaseStatus = useCallback(() => {
    setPurchase({ status: "idle" });
  }, []);

  return {
    balance,
    clearPurchaseStatus,
    drinkState,
    purchase,
    submitPurchase,
  };
}
