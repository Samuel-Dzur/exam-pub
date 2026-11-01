"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/auth-provider";
import type { UserWithOrdersResponse } from "@/lib/api/generated/types.gen";
import { getUserData } from "@/lib/user";
import styles from "./profile.module.css";

type ProfileState =
  | { status: "loading" }
  | { status: "ready"; user: UserWithOrdersResponse }
  | { status: "error" };

function displayBoolean(value: boolean | undefined): string {
  if (value === undefined) {
    return "Není k dispozici";
  }
  return value ? "Ano" : "Ne";
}

export default function ProfilePage() {
  const { keycloakSubject, username } = useAuth();
  const [profile, setProfile] = useState<ProfileState>({ status: "loading" });

  useEffect(() => {
    let active = true;
    if (keycloakSubject === null) {
      return;
    }

    void getUserData(keycloakSubject)
      .then((user) => {
        if (active) {
          setProfile({ status: "ready", user });
        }
      })
      .catch(() => {
        if (active) {
          setProfile({ status: "error" });
        }
      });

    return () => {
      active = false;
    };
  }, [keycloakSubject]);

  const currentProfile =
    keycloakSubject === null
      ? null
      : profile.status === "ready"
        ? profile.user
        : null;

  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="profile-title">
        <p className={styles.eyebrow}>Váš účet</p>
        <h1 id="profile-title">Profil</h1>

        {profile.status === "loading" && keycloakSubject !== null && (
          <p className={styles.status} role="status">
            Načítáme profil…
          </p>
        )}
        {(profile.status === "error" || keycloakSubject === null) && (
          <p className={styles.error} role="alert">
            Profil se nepodařilo načíst. Zkuste to prosím znovu.
          </p>
        )}
        {currentProfile && (
          <dl className={styles.details}>
            <div className={styles.detail}>
              <dt>ID</dt>
              <dd>{currentProfile.id ?? "Není k dispozici"}</dd>
            </div>
            <div className={styles.detail}>
              <dt>Keycloak ID</dt>
              <dd>{keycloakSubject}</dd>
            </div>
            <div className={styles.detail}>
              <dt>Uživatelské jméno</dt>
              <dd>{username ?? "Není k dispozici"}</dd>
            </div>
            <div className={styles.detail}>
              <dt>Aktivní účet</dt>
              <dd>{displayBoolean(currentProfile.isActive)}</dd>
            </div>
            <div className={styles.detail}>
              <dt>Dospělý</dt>
              <dd>{displayBoolean(currentProfile.isAdult)}</dd>
            </div>
          </dl>
        )}

        <Link className={styles.backLink} href="/bar">
          Zpět k nápojům
        </Link>
      </section>
    </main>
  );
}
