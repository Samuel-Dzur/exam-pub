import Image from "next/image";
import { ExternalLink } from "lucide-react";
import styles from "./bar.module.css";
import AccountInfo from "@/components/account-info";
import DrinkMenu from "@/components/drink-menu";

export default function BarPage() {
  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <a
          className={styles.brand}
          href="https://www.deepsilver.com/cs/games/kingdom-come-deliverance-ii"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Hospoda Díra – otevřít web Kingdom Come: Deliverance II v nové záložce"
        >
          <Image
            className={styles.brandLogo}
            src="/images/logo.webp"
            alt=""
            width={96}
            height={96}
            priority
          />
          <span>Hospoda Díra</span>
          <ExternalLink className={styles.brandExternalIcon} aria-hidden="true" />
        </a>
        <AccountInfo />
        <DrinkMenu />
      </div>
    </main>
  );
}
