"use client";

import { useEffect, useState } from "react";

export default function ClientDate({ date, format = "short" }: { date: Date | string, format?: "short" | "long" }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <span className="opacity-0">...</span>;

  return (
    <span>
      {new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: format === "long" ? "long" : "short",
        day: "numeric",
      })}
    </span>
  );
}
