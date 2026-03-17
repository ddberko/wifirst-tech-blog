"use client";

import { useState, useCallback } from "react";

interface ExportPdfButtonProps {
  contentRef: React.RefObject<HTMLElement | null>;
  title: string;
  author: string;
  date: Date;
  coverImage?: string;
}

export default function ExportPdfButton({
  contentRef,
  title,
  author,
  date,
  coverImage,
}: ExportPdfButtonProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = useCallback(async () => {
    if (!contentRef.current || exporting) return;
    setExporting(true);

    try {
      const html2pdf = (await import("html2pdf.js")).default;

      // Build a self-contained wrapper with header for the PDF
      const wrapper = document.createElement("div");
      wrapper.style.cssText =
        "font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #1a1a1a; line-height: 1.7; max-width: 100%;";

      // --- Header ---
      const header = document.createElement("div");
      header.style.cssText =
        "border-bottom: 3px solid #0066CC; padding-bottom: 24px; margin-bottom: 32px;";
      header.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
          <div style="width: 36px; height: 36px; background: #0066CC; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
            <span style="color: white; font-weight: 700; font-size: 16px;">W</span>
          </div>
          <span style="font-size: 14px; font-weight: 600; color: #0066CC; letter-spacing: 0.5px;">WIFIRST TECH BLOG</span>
        </div>
        ${coverImage ? `<img src="${coverImage}" style="width: 100%; max-height: 280px; object-fit: cover; border-radius: 12px; margin-bottom: 20px;" />` : ""}
        <h1 style="font-size: 28px; font-weight: 800; color: #111; margin: 0 0 12px 0; line-height: 1.2; letter-spacing: -0.02em;">${escapeHtml(title)}</h1>
        <div style="font-size: 13px; color: #666;">
          <span style="font-weight: 600; color: #333;">${escapeHtml(author)}</span>
          <span style="margin: 0 8px; color: #ccc;">·</span>
          <span>${formatDate(date)}</span>
        </div>
      `;
      wrapper.appendChild(header);

      // --- Cloned content ---
      const content = contentRef.current.cloneNode(true) as HTMLElement;

      // Clean up Tailwind classes for print – apply inline styles for key elements
      content.querySelectorAll("h2").forEach((el) => {
        el.style.cssText =
          "font-size: 22px; font-weight: 700; color: #111; margin-top: 32px; margin-bottom: 12px; page-break-after: avoid;";
      });
      content.querySelectorAll("h3").forEach((el) => {
        el.style.cssText =
          "font-size: 18px; font-weight: 700; color: #222; margin-top: 24px; margin-bottom: 8px; page-break-after: avoid;";
      });
      content.querySelectorAll("p").forEach((el) => {
        el.style.cssText =
          "font-size: 14px; color: #444; line-height: 1.8; margin-bottom: 12px;";
      });
      content.querySelectorAll("a").forEach((el) => {
        (el as HTMLAnchorElement).style.cssText =
          "color: #0066CC; text-decoration: underline;";
      });
      content.querySelectorAll("pre").forEach((el) => {
        el.style.cssText =
          "background: #1e1e2e; color: #e0e0e0; padding: 16px; border-radius: 8px; font-size: 12px; overflow: hidden; page-break-inside: avoid; margin: 16px 0; white-space: pre-wrap; word-break: break-word;";
      });
      content.querySelectorAll("code").forEach((el) => {
        if (el.parentElement?.tagName !== "PRE") {
          el.style.cssText =
            "background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 13px; color: #d63384;";
        }
      });
      content.querySelectorAll("blockquote").forEach((el) => {
        el.style.cssText =
          "border-left: 4px solid #0066CC; background: #f0f7ff; padding: 12px 16px; margin: 16px 0; border-radius: 0 8px 8px 0; page-break-inside: avoid;";
      });
      content.querySelectorAll("img").forEach((el) => {
        el.style.cssText =
          "max-width: 100%; border-radius: 8px; margin: 16px 0; page-break-inside: avoid;";
      });
      content.querySelectorAll("table").forEach((el) => {
        el.style.cssText =
          "width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; page-break-inside: avoid;";
      });
      content.querySelectorAll("th").forEach((el) => {
        el.style.cssText =
          "background: #f8f9fa; padding: 8px 12px; border: 1px solid #e5e7eb; font-weight: 600; text-align: left;";
      });
      content.querySelectorAll("td").forEach((el) => {
        el.style.cssText =
          "padding: 8px 12px; border: 1px solid #e5e7eb;";
      });
      content.querySelectorAll<HTMLElement>("ul, ol").forEach((el) => {
        el.style.cssText = "padding-left: 24px; margin-bottom: 12px;";
      });
      content.querySelectorAll<HTMLLIElement>("li").forEach((el) => {
        el.style.cssText =
          "font-size: 14px; color: #444; line-height: 1.8; margin-bottom: 4px;";
      });
      content.querySelectorAll<HTMLHRElement>("hr").forEach((el) => {
        el.style.cssText =
          "border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;";
      });

      wrapper.appendChild(content);

      // --- Footer ---
      const footer = document.createElement("div");
      footer.style.cssText =
        "border-top: 2px solid #e5e7eb; margin-top: 40px; padding-top: 16px; text-align: center; font-size: 11px; color: #999;";
      footer.innerHTML = `
        <p style="margin: 0;">Exported from <strong style="color: #0066CC;">Wifirst Tech Blog</strong> · ${formatDate(new Date())}</p>
        <p style="margin: 4px 0 0 0;">${window.location.href}</p>
      `;
      wrapper.appendChild(footer);

      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 60);

      await html2pdf()
        .set({
          margin: [12, 14, 14, 14], // top, left, bottom, right (mm)
          filename: `wifirst-${slug}.pdf`,
          image: { type: "jpeg", quality: 0.95 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false,
            letterRendering: true,
          },
          jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "portrait",
          },
          pagebreak: { mode: ["avoid-all", "css", "legacy"] },
        })
        .from(wrapper)
        .save();
    } catch (err) {
      console.error("[ExportPdf] Error generating PDF:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setExporting(false);
    }
  }, [contentRef, title, author, date, coverImage, exporting]);

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#0066CC] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      title="Export article as PDF"
    >
      {exporting ? (
        <>
          <svg
            className="animate-spin w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Exporting…
        </>
      ) : (
        <>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Export PDF
        </>
      )}
    </button>
  );
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDate(date: Date): string {
  try {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}
