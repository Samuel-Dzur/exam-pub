"use client";

import { CalendarDays } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { useAuth } from "@/app/auth-provider";
import ErrorMessage from "@/components/error-message";
import PrimaryButton from "@/components/primary-button";
import styles from "./register.module.css";

function parseCzechDate(value: string): string | null {
  const match = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(value.trim());
  if (!match) {
    return null;
  }

  const [, dayText, monthText, yearText] = match;
  const day = Number(dayText);
  const month = Number(monthText);
  const year = Number(yearText);
  const date = new Date(Date.UTC(0, month - 1, day));
  date.setUTCFullYear(year);

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return [
    String(year).padStart(4, "0"),
    String(month).padStart(2, "0"),
    String(day).padStart(2, "0"),
  ].join("-");
}

function formatCzechDate(value: string): string {
  const [year, month, day] = value.split("-");
  return `${day}.${month}.${year}`;
}

function getTodayIsoDate(): string {
  const today = new Date();
  return [
    String(today.getFullYear()).padStart(4, "0"),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");
}

function formatBirthDateInput(value: string, previousValue: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  const previousDigits = previousValue.replace(/\D/g, "");
  const deletingDigits = digits.length < previousDigits.length;
  const currentYear = String(new Date().getFullYear());
  let acceptedDigits = "";

  for (const digit of digits) {
    const candidate = acceptedDigits + digit;
    const length = candidate.length;
    let isValidPrefix = true;

    if (length === 1) {
      isValidPrefix = Number(candidate) <= 3;
    } else if (length === 2) {
      const day = Number(candidate);
      isValidPrefix = day >= 1 && day <= 31;
    } else if (length === 3) {
      isValidPrefix = Number(candidate[2]) <= 1;
    } else if (length === 4) {
      const month = Number(candidate.slice(2));
      isValidPrefix = month >= 1 && month <= 12;
    } else if (length > 4) {
      const yearPrefix = candidate.slice(4);
      isValidPrefix =
        yearPrefix <= currentYear.slice(0, yearPrefix.length);
    }

    if (!isValidPrefix && !deletingDigits) {
      return previousValue;
    }
    acceptedDigits = candidate;
  }

  const day = acceptedDigits.slice(0, 2);
  const month = acceptedDigits.slice(2, 4);
  const year = acceptedDigits.slice(4);
  let formattedDate = day;
  if (acceptedDigits.length >= 2) {
    formattedDate += ".";
  }
  formattedDate += month;
  if (acceptedDigits.length >= 4) {
    formattedDate += ".";
  }
  formattedDate += year;

  if (acceptedDigits.length === 8) {
    const isoDate = parseCzechDate(formattedDate);
    if (!isoDate || isoDate > getTodayIsoDate()) {
      return previousValue;
    }
  }

  return formattedDate;
}

function getCaretPosition(value: string, digitCount: number): number {
  if (digitCount === 0) {
    return 0;
  }

  let seenDigits = 0;
  for (let index = 0; index < value.length; index += 1) {
    if (/\d/.test(value[index])) {
      seenDigits += 1;
      if (seenDigits === digitCount) {
        return value[index + 1] === "." ? index + 2 : index + 1;
      }
    }
  }

  return value.length;
}

export default function RegisterPage() {
  const { completeRegistration } = useAuth();
  const router = useRouter();
  const datePickerRef = useRef<HTMLInputElement>(null);
  const [birthDate, setBirthDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const parsedBirthDate = parseCzechDate(birthDate);
  const canContinue =
    parsedBirthDate !== null && parsedBirthDate <= getTodayIsoDate();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const isoBirthDate = parseCzechDate(birthDate);
    if (!isoBirthDate) {
      setError("Zadejte platné datum ve formátu DD.MM.RRRR.");
      return;
    }
    if (isoBirthDate > getTodayIsoDate()) {
      setError("Datum narození musí být dnešní nebo dřívější.");
      return;
    }

    setSubmitting(true);
    try {
      await completeRegistration(isoBirthDate);
      router.replace("/bar");
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Registraci se nepodařilo uložit. Zkuste to prosím znovu.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <p className={styles.eyebrow}>Dokončete registraci</p>
        <p className={styles.intro}>
          Ještě potřebujeme vaše datum narození, než vstoupíte do hospody.
        </p>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <form className={styles.form} onSubmit={handleSubmit}>
          <label htmlFor="birth-date">Datum narození</label>
          <div className={styles.dateInputGroup}>
            <input
              autoComplete="bday"
              id="birth-date"
              inputMode="numeric"
              onKeyDown={(event) => {
                const input = event.currentTarget;
                const caret = input.selectionStart;
                if (
                  event.key !== "Backspace" ||
                  caret === null ||
                  caret !== input.selectionEnd ||
                  input.value[caret - 1] !== "."
                ) {
                  return;
                }

                const digitIndex = caret - 2;
                if (digitIndex < 0 || !/\d/.test(input.value[digitIndex])) {
                  return;
                }

                event.preventDefault();
                const updatedValue =
                  input.value.slice(0, digitIndex) + input.value.slice(digitIndex + 1);
                const formattedValue = formatBirthDateInput(updatedValue, birthDate);
                const digitsBeforeRemovedDigit = input.value
                  .slice(0, digitIndex)
                  .replace(/\D/g, "").length;
                setBirthDate(formattedValue);
                window.requestAnimationFrame(() => {
                  const caret = getCaretPosition(
                    formattedValue,
                    digitsBeforeRemovedDigit,
                  );
                  input.setSelectionRange(caret, caret);
                });
              }}
              onChange={(event) => {
                const input = event.currentTarget;
                const digitCountBeforeCaret = input.value
                  .slice(0, input.selectionStart ?? input.value.length)
                  .replace(/\D/g, "").length;
                const formattedDate = formatBirthDateInput(input.value, birthDate);
                setBirthDate(formattedDate);
                window.requestAnimationFrame(() => {
                  input.setSelectionRange(
                    getCaretPosition(formattedDate, digitCountBeforeCaret),
                    getCaretPosition(formattedDate, digitCountBeforeCaret),
                  );
                });
              }}
              pattern="\d{2}\.\d{2}\.\d{4}"
              placeholder="DD.MM.RRRR"
              required
              title="Zadejte datum ve formátu DD.MM.RRRR."
              type="text"
              value={birthDate}
            />
            <button
              aria-label="Vybrat datum narození z kalendáře"
              className={styles.calendarButton}
              onClick={() => {
                const picker = datePickerRef.current;
                if (!picker) {
                  return;
                }
                if (typeof picker.showPicker === "function") {
                  picker.showPicker();
                } else {
                  picker.focus();
                  picker.click();
                }
              }}
              type="button"
            >
              <CalendarDays aria-hidden="true" size={20} />
            </button>
            <input
              aria-hidden="true"
              className={styles.nativeDatePicker}
              max={getTodayIsoDate()}
              onChange={(event) => {
                if (event.target.value) {
                  setBirthDate(formatCzechDate(event.target.value));
                }
              }}
              ref={datePickerRef}
              tabIndex={-1}
              type="date"
            />
          </div>
          <PrimaryButton disabled={submitting || !canContinue} type="submit">
            {submitting ? "Ukládáme..." : "Pokračovat"}
          </PrimaryButton>
        </form>
      </section>
    </main>
  );
}
