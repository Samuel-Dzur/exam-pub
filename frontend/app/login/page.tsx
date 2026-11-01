"use client";

import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/app/auth-provider";
import ErrorMessage from "@/components/error-message";
import PrimaryButton from "@/components/primary-button";
import DrinkMenu from "@/components/drink-menu";
import styles from "./login.module.css";

export default function LoginPage() {
  const { error: configurationError, login, register, status } = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginPromptActive, setLoginPromptActive] = useState(false);
  const loginPromptTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isReady = status === "unauthenticated";

  useEffect(
    () => () => {
      if (loginPromptTimeout.current !== null) {
        clearTimeout(loginPromptTimeout.current);
      }
    },
    [],
  );

  function handleDrinkClick() {
    setLoginPromptActive(true);
    if (loginPromptTimeout.current !== null) {
      clearTimeout(loginPromptTimeout.current);
    }
    loginPromptTimeout.current = setTimeout(() => {
      setLoginPromptActive(false);
      loginPromptTimeout.current = null;
    }, 900);
  }

  async function startAuthentication(
    action: (returnTo: string | null) => Promise<void>,
  ) {
    setLoginError(null);
    try {
      const returnTo = new URLSearchParams(window.location.search).get("returnTo");
      await action(returnTo);
    } catch (error) {
      setLoginError(
        error instanceof Error
          ? error.message
          : "Nepodařilo se zahájit přihlášení ani registraci. Zkuste to prosím znovu.",
      );
    }
  }

  function handleLogin() {
    return startAuthentication(login);
  }

  function handleRegister() {
    return startAuthentication(register);
  }

  return (
    <main className={styles.page}>
      <div className={styles.hero}>
        <section className={styles.story} aria-label="O aplikaci Hospoda Díra">
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
              width={104}
              height={104}
              priority
            />
            <span className={styles.brandName}>
              <span className={styles.brandTitle}>Hospoda Díra</span>
              <ExternalLink className={styles.brandExternalIcon} aria-hidden="true" />
            </span>
          </a>

          <div className={styles.storyCopy}>
            <p className={styles.eyebrow}>Dobrý večer, vítejte</p>
            <h1>Dobré pití. Ještě lepší společnost.</h1>
            <p>Každá návštěva má svůj příběh</p>
          </div>

          <p className={styles.storyFooter}>Otevřeno 24/7</p>
        </section>

        <section className={styles.panel}>
          <div className={styles.card}>
            <h2>Vítejte zpět</h2>
            <p className={styles.intro}>
              Přihlaste se a objednejte si něco k pití
            </p>

            {(configurationError || loginError) && (
              <ErrorMessage>
                {configurationError ?? loginError}
              </ErrorMessage>
            )}

            <div className={styles.separator}>BEZPEČNÉ PŘIHLÁŠENÍ</div>
            <PrimaryButton
              className={
                loginPromptActive ? styles.loginButtonPrompt : undefined
              }
              type="button"
              onClick={handleLogin}
              disabled={!isReady}
            >
              {status === "loading"
                ? "Připojujeme..."
                : status === "error"
                  ? "Přihlášení není dostupné"
                  : "Pokračovat na přihlášení"}
            </PrimaryButton>
            <p className={styles.registerPrompt}>
              Nemáte ještě účet?{" "}
              <button
                className={styles.registerLink}
                type="button"
                onClick={handleRegister}
                disabled={!isReady}
              >
                Vytvořte si nový účet
              </button>
            </p>
          </div>
        </section>
      </div>
      <section className={styles.menuSection} aria-label="Nabídka nápojů">
        <DrinkMenu onDrinkClick={handleDrinkClick} showOrderButtons={false} />
      </section>
    </main>
  );
}
