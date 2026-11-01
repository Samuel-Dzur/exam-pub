import Image from "next/image";
import styles from "./bar.module.css";
import AccountInfo from "@/components/account-info";

export default function BarPage() {
  return (
    <main className={styles.page}>
      <div className={styles.brand}>
        <Image
          className={styles.brandLogo}
          src="/images/logo.webp"
          alt=""
          width={48}
          height={48}
          priority
        />
        <span>Hospoda Díra</span>
      </div>
      <AccountInfo />
      <section className={styles.card}>
        <h1>Vítejte v hospodě</h1>
        <p className={styles.intro}>Tady brzy najdete naši nabídku.</p>
      </section>
    </main>
  );
}
