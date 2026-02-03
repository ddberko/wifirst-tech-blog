"use client";

import React, { useEffect, useRef } from "react";
import mermaid from "mermaid";

mermaid.initialize({
  startOnLoad: true,
  theme: "default",
  securityLevel: "loose",
  fontFamily: "inherit",
});

export default function Mermaid({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      mermaid.contentLoaded();
      // Ensure mermaid re-renders when the component mounts or chart changes
      const render = async () => {
        try {
          // Generate a unique ID for the diagram
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          const { svg } = await mermaid.render(id, chart);
          if (ref.current) {
            ref.current.innerHTML = svg;
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
    <div className="mermaid flex justify-center my-8 p-6 bg-white rounded-xl shadow-sm border border-gray-100" ref={ref} />
  );
}
