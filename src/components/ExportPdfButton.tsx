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

      // Real Wifirst logo as inline SVG data URI (matches Header.tsx WifirstLogo)
      const wifirstLogoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1500 435"><g><path fill="#0066CC" d="M707.793,335.091h-19.634l-29.096-78.545l-21.816-69.815l-22.541,70.181l-29.085,78.18h-19.644l-63.995-179.632h19.634l54.185,158.912l54.901-158.912h12.721l54.55,158.912l53.809-158.912h19.65L707.793,335.091z"/><path fill="#0066CC" d="M824.139,96.916c0,18.91-28.725,18.91-28.725,0C795.414,78.01,824.139,78.01,824.139,96.916z M800.508,154.735v180.356h17.82V154.735H800.508z"/><path fill="#0066CC" d="M887.768,335.091V172.552h-36.734v-15.631h36.734v-16.002c0-35.64,14.178-61.457,53.809-61.457c13.461,0,25.463,4.737,35.646,12.368l-8.73,13.096c-9.818-5.831-16.725-9.1-27.645-9.1c-22.541,0-35.627,13.82-35.627,45.092v16.002h59.268v15.631h-59.268v162.539H887.768z"/><path fill="#0066CC" d="M1026.307,96.916c0,18.91-28.73,18.91-28.73,0C997.576,78.01,1026.307,78.01,1026.307,96.916z M1002.676,154.735v180.356h17.818V154.735H1002.676z"/><path fill="#0066CC" d="M1088.115,155.459l0.729,31.999c11.268-24.354,36.729-33.816,59.631-33.816c13.455-0.366,26.549,3.279,38.541,10.544l-7.986,14.541c-9.459-5.81-20.006-8.351-30.555-8.351c-33.447,0.358-59.277,27.268-59.277,59.991v104.724h-17.799V155.459H1088.115z"/><path fill="#0066CC" d="M1330.195,188.189c-18.182-15.999-36-18.913-55.992-18.913c-28.002-0.365-54.914,10.189-54.178,33.099c0.719,23.993,31.996,28.71,54.537,32.713c31.996,5.465,75.998,10.913,74.176,52.735c-1.086,39.634-42.18,50.178-73.816,50.178c-31.631,0-62.902-11.999-78.537-36.002l13.098-11.641c14.895,21.464,41.801,30.554,65.814,30.554c21.809,0,54.898-5.824,55.988-34.178c0.734-25.823-29.09-30.903-58.537-35.648c-34.916-5.82-69.459-12.358-69.82-48.354c-0.363-35.268,34.904-50.54,71.275-50.185c26.182,0,49.086,7.283,66.904,24.006L1330.195,188.189z"/><path fill="#0066CC" d="M1422.467,101.278v54.181h61.09v14.917h-61.09v109.448c0,24.364,5.086,41.45,33.098,41.45c8.721,0,18.533-2.917,27.631-7.275l6.176,14.551c-11.275,5.448-22.537,9.082-33.807,9.082c-38.188,0-50.553-22.544-50.553-57.808V170.376h-38.178v-14.917h38.178v-52.36L1422.467,101.278z"/><path fill="#0066CC" d="M333.085,267.029c12.474-89.32-49.813-171.829-139.118-184.329c-87.29-12.189-168.076,47.027-183.338,133.095c0.265-4.619,0.718-9.251,1.367-13.901c13.275-95.022,101.09-161.297,196.119-148.018c95.063,13.268,161.338,101.073,148.042,196.119c-8.565,61.274-48.094,110.564-100.589,134.316C296.277,359.794,325.992,317.785,333.085,267.029z"/><path fill="#0066CC" d="M383.029,238.915C396.89,132.137,326.92,33.822,224.151,10.148c6.717,0.216,13.509,0.751,20.304,1.634c113.61,14.764,193.713,118.805,178.955,232.385c-14.777,113.59-118.805,193.709-232.398,178.928c-6.809-0.903-13.481-2.102-20.063-3.598C276.366,422.868,369.142,345.68,383.029,238.915z"/><path fill="#0066CC" d="M264.597,139.96c2.176,1.807,4.247,3.675,6.261,5.577c-60.018-44.686-145.214-35.289-193.936,22.781c-49.649,59.179-42.888,146.878,14.48,197.864c-3.428-2.412-6.825-4.987-10.091-7.739c-60.347-50.624-68.234-140.546-17.594-200.91C114.328,97.221,204.261,89.33,264.597,139.96z"/></g></svg>`;
      const logoDataUri = `data:image/svg+xml;base64,${btoa(wifirstLogoSvg)}`;

      header.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
          <img src="${logoDataUri}" style="height: 28px; width: auto;" alt="Wifirst" />
          <span style="height: 20px; width: 1px; background: #cbd5e1;"></span>
          <span style="font-size: 13px; font-weight: 500; color: #64748b; letter-spacing: 0.3px;">Tech Blog</span>
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

      // --- Mermaid diagrams: scale to fit A4 page width ---
      content.querySelectorAll<HTMLElement>(".mermaid").forEach((el) => {
        el.style.cssText =
          "max-width: 100%; overflow: visible; break-inside: avoid; page-break-inside: avoid; margin: 16px 0; padding: 8px 0;";
        el.querySelectorAll("svg").forEach((svg) => {
          svg.style.maxWidth = "100%";
          svg.style.height = "auto";
          svg.style.display = "block";
          svg.style.margin = "0 auto";
          svg.removeAttribute("width");
        });
      });

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
        // Disable lazy loading so images load when attached to DOM
        el.removeAttribute("loading");
        el.setAttribute("loading", "eager");
        // Use raw src for Next.js optimized images (/_next/image?url=...)
        const src = el.getAttribute("src") || "";
        if (src.startsWith("/_next/image")) {
          try {
            const url = new URL(src, window.location.origin);
            const originalUrl = url.searchParams.get("url");
            if (originalUrl) el.setAttribute("src", originalUrl);
          } catch { /* keep original src */ }
        }
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

      // Temporarily attach wrapper off-screen so images and SVGs render
      Object.assign(wrapper.style, {
        position: "fixed",
        left: "-9999px",
        top: "0",
        width: "794px", // A4 width at 96dpi minus margins
        zIndex: "-1",
        overflow: "hidden",
      });
      document.body.appendChild(wrapper);

      // Wait for all images to be fully loaded
      const images = Array.from(wrapper.querySelectorAll("img"));
      await Promise.all(
        images.map(
          (img) =>
            new Promise<void>((resolve) => {
              if (img.complete && img.naturalWidth > 0) {
                resolve();
              } else {
                img.onload = () => resolve();
                img.onerror = () => resolve(); // don't block PDF on broken images
              }
            })
        )
      );

      // Small delay to let the browser paint SVGs and images
      await new Promise((resolve) => setTimeout(resolve, 300));

      try {
        await html2pdf()
          .set({
            margin: [12, 14, 14, 14], // top, left, bottom, right (mm)
            filename: `wifirst-${slug}.pdf`,
            image: { type: "jpeg", quality: 0.95 },
            html2canvas: {
              scale: 2,
              useCORS: true,
              allowTaint: true,
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
      } finally {
        document.body.removeChild(wrapper);
      }
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
