"use client";

import { useEffect, useState } from "react";
import { useLocale } from "./LocaleProvider";
import { INTL_LOCALE } from "@/lib/i18n";

export default function ClientDate({ date, format = "short" }: { date: Date | string, format?: "short" | "long" }) {
  const { locale } = useLocale();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <span className="opacity-0">...</span>;

  return (
    <span>
      {/* La date suit la langue choisie : « 26 septembre 2026 » ou « September 26, 2026 ». */}
      {new Date(date).toLocaleDateString(INTL_LOCALE[locale], {
        year: "numeric",
        month: format === "long" ? "long" : "short",
        day: "numeric",
      })}
    </span>
  );
}
