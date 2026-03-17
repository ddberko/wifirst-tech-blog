"use client";

import React, { useEffect, useRef } from "react";
import mermaid from "mermaid";

mermaid.initialize({
  startOnLoad: false,
  theme: "default",
  securityLevel: "loose",
});

export default function Mermaid({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const render = async () => {
        try {
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          const { svg } = await mermaid.render(id, chart);
          if (ref.current) {
            ref.current.innerHTML = svg;
            const svgEl = ref.current.querySelector("svg");
            if (svgEl && svgEl.getAttribute("viewBox")) {
              // Scale proportionally using the viewBox — no clipping, fits container width
              svgEl.style.width = "100%";
              svgEl.style.height = "auto";
              svgEl.style.display = "block";
              svgEl.style.margin = "0 auto";
            }
          }
        } catch (error) {
          console.error("Mermaid error:", error);
          if (ref.current) {
            ref.current.innerHTML = `<pre class="text-red-500 p-4 bg-red-50 rounded-lg">Error rendering Mermaid diagram: ${error}</pre>`;
          }
        }
      };
      render();
    }
  }, [chart]);

  return (
    <div
      className="mermaid my-8 p-4 bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto"
      ref={ref}
    />
  );
}
