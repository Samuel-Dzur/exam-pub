"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/auth-provider";
import ErrorMessage from "@/components/error-message";
import PrimaryButton from "@/components/primary-button";
import styles from "./logout-dialog.module.css";

interface LogoutDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function LogoutDialog({ open, onClose }: LogoutDialogProps) {
  const { logout } = useAuth();
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isLoggingOut) {
        event.stopPropagation();
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isLoggingOut, onClose, open]);

  async function handleLogout() {
    setLogoutError(null);
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      setLogoutError(
        error instanceof Error
          ? error.message
          : "Odhlášení se nepodařilo. Zkuste to prosím znovu.",
      );
    } finally {
      setIsLoggingOut(false);
    }
  }

  if (!open) {
    return null;
  }

  return (
    <div
      className={styles.dialogBackdrop}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isLoggingOut) {
          onClose();
        }
      }}
    >
      <section
        className={styles.logoutDialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-dialog-title"
      >
        <h2 id="logout-dialog-title">Odhlásit se?</h2>
        {logoutError && (
          <ErrorMessage>
            {logoutError}
          </ErrorMessage>
        )}
        <div className={styles.dialogActions}>
          <button
            className={styles.cancelButton}
            type="button"
            onClick={onClose}
            disabled={isLoggingOut}
            autoFocus
          >
            Zůstat přihlášen
          </button>
          <PrimaryButton
            compact
            className={styles.logoutButton}
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? "Odhlašování..." : "Odhlásit se"}
          </PrimaryButton>
        </div>
      </section>
    </div>
  );
}
