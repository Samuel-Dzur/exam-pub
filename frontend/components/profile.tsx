"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CircleUserRound, LogOut, UserRound } from "lucide-react";
import { useAuth } from "@/app/auth-provider";
import LogoutDialog from "@/components/logout-dialog";
import styles from "./account-info.module.css";

export default function Profile() {
  const { username } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isDialogOpen) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDialogOpen, isMenuOpen]);

  if (!username) {
    return null;
  }

  return (
    <>
      <div className={styles.profile} ref={profileRef}>
        <button
          className={styles.profileTrigger}
          type="button"
          aria-haspopup="menu"
          aria-expanded={isMenuOpen}
          aria-controls="profile-menu"
          onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
        >
          <CircleUserRound size={20} aria-hidden="true" />
          <span>{username}</span>
        </button>
        {isMenuOpen && (
          <div className={styles.profileMenu} id="profile-menu" role="menu">
            <Link
              className={styles.profileMenuItem}
              href="/profile"
              role="menuitem"
              onClick={() => setIsMenuOpen(false)}
            >
              <UserRound size={18} aria-hidden="true" />
              <span>Profil</span>
            </Link>
            <button
              className={styles.profileMenuItem}
              type="button"
              role="menuitem"
              onClick={() => {
                setIsMenuOpen(false);
                setIsDialogOpen(true);
              }}
            >
              <LogOut size={18} aria-hidden="true" />
              <span>Odhlásit se</span>
            </button>
          </div>
        )}
      </div>
      <LogoutDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </>
  );
}
