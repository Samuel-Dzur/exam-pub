"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/auth-provider";
import { getUsers } from "@/lib/api/generated/sdk.gen";
import type { UserResponse } from "@/lib/api/generated/types.gen";
import { throwApiError } from "@/lib/api/errors";
import styles from "../data.module.css";
import pageStyles from "./users.module.css";

type UsersState =
  | { status: "loading" }
  | { status: "ready"; users: UserResponse[] }
  | { status: "error" };

const currencyFormatter = new Intl.NumberFormat("cs-CZ", {
  style: "currency",
  currency: "CZK",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

function displayBoolean(value: boolean | undefined): string {
  if (value === undefined) {
    return "—";
  }
  return value ? "Ano" : "Ne";
}

export default function UsersSummaryPage() {
  const { isBartender } = useAuth();
  const [state, setState] = useState<UsersState>({ status: "loading" });

  useEffect(() => {
    if (!isBartender) {
      return;
    }

    let active = true;
    async function loadUsers() {
      try {
        const { data, response } = await getUsers();
        if (!response?.ok) {
          throwApiError(response, "Seznam uživatelů se nepodařilo načíst.");
        }
        if (!data) {
          throw new Error("Backend returned an invalid users response.");
        }
        if (active) {
          setState({ status: "ready", users: data });
        }
      } catch {
        if (active) {
          setState({ status: "error" });
        }
      }
    }

    void loadUsers();
    return () => {
      active = false;
    };
  }, [isBartender]);

  return (
    <section aria-labelledby="users-title">
      <h2 className={pageStyles.viewTitle} id="users-title">
        Uživatelé
      </h2>
      {state.status === "loading" && (
        <p className={styles.message} role="status">
          Načítáme uživatele…
        </p>
      )}
      {state.status === "error" && (
        <p className={styles.error} role="alert">
          Seznam uživatelů se nepodařilo načíst. Zkuste to prosím znovu.
        </p>
      )}
      {state.status === "ready" && state.users.length === 0 && (
        <p className={styles.message}>V aplikaci zatím nejsou uživatelé.</p>
      )}
      {state.status === "ready" && state.users.length > 0 && (
        <div className={styles.tableScroll}>
          <table className={`${styles.table} ${pageStyles.table}`}>
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Uživatelské jméno</th>
                <th scope="col">Aktivní</th>
                <th scope="col">Dospělý</th>
                <th scope="col">Zůstatek</th>
              </tr>
            </thead>
            <tbody>
              {state.users.map((user, index) => (
                <tr key={user.id ?? `${user.name ?? "user"}-${index}`}>
                  <td>{user.id ?? "—"}</td>
                  <th scope="row">{user.name ?? "—"}</th>
                  <td>{displayBoolean(user.isActive)}</td>
                  <td>{displayBoolean(user.isAdult)}</td>
                  <td>
                    {typeof user.pocket === "number" &&
                    Number.isFinite(user.pocket)
                      ? currencyFormatter.format(user.pocket)
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
