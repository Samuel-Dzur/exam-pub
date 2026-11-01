"use client";

import Image from "next/image";
import { ImageOff, LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getDrinkImage, getDrinkMenu } from "@/lib/api/generated/sdk.gen";
import type { DrinkResponse } from "@/lib/api/generated/types.gen";
import { throwApiError } from "@/lib/api/errors";
import PrimaryButton from "@/components/primary-button";
import styles from "./drink-menu.module.css";

type DrinkImage =
  | { status: "ready"; src: string }
  | { status: "unavailable" }
  | { status: "error" };

type MenuStatus = "loading" | "ready" | "error";

interface DrinkMenuProps {
  onDrinkClick?: () => void;
  showOrderButtons?: boolean;
}

const currencyFormatter = new Intl.NumberFormat("cs-CZ", {
  style: "currency",
  currency: "CZK",
  minimumFractionDigits: 0,
});

export default function DrinkMenu({
  onDrinkClick,
  showOrderButtons = true,
}: DrinkMenuProps) {
  const [drinks, setDrinks] = useState<DrinkResponse[]>([]);
  const [images, setImages] = useState<Map<number, DrinkImage>>(() => new Map());
  const [status, setStatus] = useState<MenuStatus>("loading");
  const gridRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || status !== "ready") {
      return;
    }

    let frame = 0;
    const alignTitlesByRow = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const titles = Array.from(
          grid.querySelectorAll<HTMLElement>("h2"),
        );
        titles.forEach((title) => {
          title.style.minHeight = "";
        });

        const rows = new Map<number, HTMLElement[]>();
        titles.forEach((title) => {
          const rowTop = Math.round(title.parentElement?.getBoundingClientRect().top ?? 0);
          const row = rows.get(rowTop) ?? [];
          row.push(title);
          rows.set(rowTop, row);
        });

        rows.forEach((row) => {
          const rowHeight = Math.max(...row.map((title) => title.offsetHeight));
          row.forEach((title) => {
            title.style.minHeight = `${rowHeight}px`;
          });
        });
      });
    };

    let lastGridWidth = grid.clientWidth;
    const observer = new ResizeObserver(() => {
      if (grid.clientWidth === lastGridWidth) {
        return;
      }
      lastGridWidth = grid.clientWidth;
      alignTitlesByRow();
    });
    observer.observe(grid);
    alignTitlesByRow();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [drinks, status]);

  useEffect(() => {
    let active = true;
    const imageUrls: string[] = [];

    async function loadMenu() {
      try {
        const { data, response } = await getDrinkMenu();
        if (!response?.ok) {
          throwApiError(response, "Nabídku se nepodařilo načíst.");
        }
        if (!data) {
          throw new Error("Server vrátil neplatnou nabídku nápojů.");
        }
        if (!active) {
          return;
        }

        setDrinks(data);
        const imageEntries = await Promise.all(
          data.map(async (drink): Promise<[number, DrinkImage] | null> => {
            if (typeof drink.id !== "number") {
              return null;
            }

            try {
              const { data: image, response: imageResponse } = await getDrinkImage({
                path: { id: drink.id },
                parseAs: "blob",
              });
              if (!imageResponse?.ok || !image) {
                return [
                  drink.id,
                  {
                    status: imageResponse?.status === 404 ? "unavailable" : "error",
                  },
                ];
              }
              if (!active) {
                return null;
              }

              const src = URL.createObjectURL(image);
              imageUrls.push(src);
              return [drink.id, { status: "ready", src }];
            } catch {
              return [drink.id, { status: "error" }];
            }
          }),
        );

        if (active) {
          setImages(
            new Map(
              imageEntries.filter(
                (entry): entry is [number, DrinkImage] => entry !== null,
              ),
            ),
          );
          setStatus("ready");
        }
      } catch {
        if (active) {
          setStatus("error");
        }
      }
    }

    void loadMenu();

    return () => {
      active = false;
      imageUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  return (
    <section className={styles.menu} aria-labelledby="drink-menu-title">
      <header className={styles.header}>
        <p className={styles.eyebrow}>Aktuální nabídka</p>
        <h1 id="drink-menu-title">Nápojový lístek</h1>
        <p className={styles.intro}>
          Vyberte si z naší nabídky. Na zdraví!
        </p>
      </header>

      {status === "loading" && (
        <p
          className={`${styles.message} ${styles.loadingMessage}`}
          role="status"
        >
          <LoaderCircle className={styles.loadingIcon} aria-hidden="true" />
          Načítáme nabídku…
        </p>
      )}
      {status === "error" && (
        <p className={styles.message} role="alert">
          Nabídku se nepodařilo načíst. Zkuste to prosím znovu později.
        </p>
      )}
      {status === "ready" && drinks.length === 0 && (
        <p className={styles.message}>V nabídce zatím nejsou žádné nápoje.</p>
      )}
      {status === "ready" && drinks.length > 0 && (
        <ul
          className={`${styles.grid} ${
            showOrderButtons ? styles.gridWithOrderButtons : ""
          }`}
          ref={gridRef}
        >
          {drinks.map((drink, index) => {
            const name = drink.productName ?? "Nápoj";
            const image =
              typeof drink.id === "number" ? images.get(drink.id) : undefined;

            return (
              <li
                className={styles.card}
                key={drink.id ?? `${name}-${index}`}
                onClick={onDrinkClick}
                onKeyDown={(event) => {
                  if (
                    onDrinkClick &&
                    (event.key === "Enter" || event.key === " ")
                  ) {
                    event.preventDefault();
                    onDrinkClick();
                  }
                }}
                role={onDrinkClick ? "button" : undefined}
                tabIndex={onDrinkClick ? 0 : undefined}
              >
                <div className={styles.imageFrame}>
                  {image?.status === "ready" ? (
                    <Image
                      alt={name}
                      className={styles.image}
                      height={240}
                      src={image.src}
                      unoptimized
                      width={360}
                    />
                  ) : (
                    <div className={styles.imagePlaceholder}>
                      <ImageOff size={28} aria-hidden="true" />
                      <span>
                        {image?.status === "error"
                          ? "Obrázek se nepodařilo načíst"
                          : "Obrázek není k dispozici"}
                      </span>
                    </div>
                  )}
                </div>
                <div
                  className={`${styles.details} ${
                    showOrderButtons ? "" : styles.detailsWithoutOrderButton
                  }`}
                >
                  <div className={styles.nameRow}>
                    <h2>{name}</h2>
                    {drink.isForAdult && (
                      <span className={styles.adultLabel}>18+</span>
                    )}
                  </div>
                  <p className={styles.price}>
                    {typeof drink.price === "number" &&
                    Number.isFinite(drink.price)
                      ? currencyFormatter.format(drink.price)
                      : "Cena není dostupná"}
                  </p>
                  {showOrderButtons && (
                    <PrimaryButton
                      className={styles.orderButton}
                      compact
                      type="button"
                    >
                      Objednat
                    </PrimaryButton>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
