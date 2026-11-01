"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/app/auth-provider";
import styles from "./layout.module.css";

export default function SummaryLayout({ children }: { children: ReactNode }) {
  const { isBartender } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isBartender) {
      router.replace("/bar");
    }
  }, [isBartender, router]);

  if (!isBartender) {
    return null;
  }

  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="summary-title">
        <p className={styles.eyebrow}>Pro obsluhu</p>
        <h1 className={styles.title} id="summary-title">
          Přehled
        </h1>
        <nav className={styles.switch} aria-label="Zobrazení přehledu">
          <Link
            className={styles.switchLink}
            href="/summary/orders"
            aria-current={pathname === "/summary/orders" ? "page" : undefined}
          >
            Objednávky
          </Link>
          <Link
            className={styles.switchLink}
            href="/summary/users"
            aria-current={pathname === "/summary/users" ? "page" : undefined}
          >
            Uživatelé
          </Link>
        </nav>
        {children}
        <Link className={styles.backLink} href="/bar">
          Zpět na nápojový lístek
        </Link>
      </section>
    </main>
  );
}
