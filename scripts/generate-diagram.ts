/**
 * Générateur de schémas hand-drawn pour le blog Wifirst
 * Usage : npx tsx scripts/generate-diagram.ts <diagram-json-file> <output-png>
 * 
 * Le fichier JSON décrit le diagramme : titre, noeuds, connexions, options.
 * Génère un PNG style "fait main" via Rough.js + node-canvas.
 */

import { createCanvas, registerFont } from 'canvas';
import rough from 'roughjs';
import * as fs from 'fs';
import * as path from 'path';

// --- Types ---
interface DiagramNode {
  id: string;
  label: string;
  sublabel?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  color?: string;
  shape?: 'box' | 'cloud' | 'ellipse' | 'cylinder' | 'diamond';
  emoji?: string;
}

interface DiagramArrow {
  from: string;
  to: string;
  label?: string;
  color?: string;
  dashed?: boolean;
}

interface DiagramConfig {
  title: string;
  subtitle?: string;
  width?: number;
  height?: number;
  bgColor?: string;
  legend?: string;
  nodes: DiagramNode[];
  arrows: DiagramArrow[];
}

// --- Color palette ---
const PALETTE: Record<string, string> = {
  blue: '#1971c2',
  green: '#2f9e44',
  red: '#e03131',
  orange: '#f08c00',
  purple: '#7048e8',
  teal: '#0c8599',
  pink: '#c2255c',
  dark: '#343a40',
  gray: '#868e96',
  indigo: '#4263eb',
  cyan: '#1098ad',
  lime: '#66a80f',
};

const DEFAULT_BG = '#FFFDF6';
const FONT = 'sans-serif';

function resolveColor(c?: string): string {
  if (!c) return PALETTE.blue;
  return PALETTE[c] || c; // allow hex directly
}

// --- Drawing helpers ---
function drawBox(rc: any, ctx: any, node: DiagramNode) {
  const color = resolveColor(node.color);
  const w = node.width || 200;
  const h = node.height || 70;
  const x = node.x - w / 2;
  const y = node.y - h / 2;

  rc.rectangle(x, y, w, h, {
    stroke: color,
    strokeWidth: 2,
    roughness: 1.5,
    fill: color + '15',
    fillStyle: 'solid',
  });

  ctx.fillStyle = color;
  ctx.font = `bold 15px ${FONT}`;
  ctx.textAlign = 'center';
  const labelText = node.emoji ? `${node.emoji} ${node.label}` : node.label;
  ctx.fillText(labelText, node.x, node.y + (node.sublabel ? -4 : 5));

  if (node.sublabel) {
    ctx.font = `12px ${FONT}`;
    ctx.fillStyle = PALETTE.gray;
    ctx.fillText(node.sublabel, node.x, node.y + 14);
  }
}

function drawCloud(rc: any, ctx: any, node: DiagramNode) {
  const color = resolveColor(node.color);
  const cx = node.x;
  const cy = node.y;
  const ellipses = [
    [cx, cy, 130, 65],
    [cx - 40, cy - 12, 85, 55],
    [cx + 40, cy - 12, 85, 55],
    [cx - 22, cy + 12, 95, 55],
    [cx + 22, cy + 12, 95, 55],
  ];
  for (const [ex, ey, ew, eh] of ellipses) {
    rc.ellipse(ex, ey, ew, eh, {
      stroke: color,
      strokeWidth: 1.5,
      roughness: 1.5,
      fill: color + '10',
      fillStyle: 'solid',
    });
  }
  ctx.fillStyle = color;
  ctx.font = `bold 15px ${FONT}`;
  ctx.textAlign = 'center';
  const labelText = node.emoji ? `${node.emoji} ${node.label}` : node.label;
  ctx.fillText(labelText, cx, cy + 5);
}

function drawEllipse(rc: any, ctx: any, node: DiagramNode) {
  const color = resolveColor(node.color);
  const w = node.width || 180;
  const h = node.height || 70;
  
  rc.ellipse(node.x, node.y, w, h, {
    stroke: color,
    strokeWidth: 2,
    roughness: 1.5,
    fill: color + '15',
    fillStyle: 'solid',
  });

  ctx.fillStyle = color;
  ctx.font = `bold 15px ${FONT}`;
  ctx.textAlign = 'center';
  const labelText = node.emoji ? `${node.emoji} ${node.label}` : node.label;
  ctx.fillText(labelText, node.x, node.y + (node.sublabel ? -4 : 5));

  if (node.sublabel) {
    ctx.font = `12px ${FONT}`;
    ctx.fillStyle = PALETTE.gray;
    ctx.fillText(node.sublabel, node.x, node.y + 14);
  }
}

function drawDiamond(rc: any, ctx: any, node: DiagramNode) {
  const color = resolveColor(node.color);
  const w = (node.width || 140) / 2;
  const h = (node.height || 80) / 2;
  const cx = node.x;
  const cy = node.y;

  rc.polygon([
    [cx, cy - h],
    [cx + w, cy],
    [cx, cy + h],
    [cx - w, cy],
  ], {
    stroke: color,
    strokeWidth: 2,
    roughness: 1.5,
    fill: color + '15',
    fillStyle: 'solid',
  });

  ctx.fillStyle = color;
  ctx.font = `bold 14px ${FONT}`;
  ctx.textAlign = 'center';
  const labelText = node.emoji ? `${node.emoji} ${node.label}` : node.label;
  ctx.fillText(labelText, cx, cy + 5);
}

function drawCylinder(rc: any, ctx: any, node: DiagramNode) {
  const color = resolveColor(node.color);
  const w = node.width || 140;
  const h = node.height || 80;
  const x = node.x - w / 2;
  const y = node.y - h / 2;
  const ry = 12; // ellipse radius for top/bottom

  // Body
  rc.line(x, y + ry, x, y + h - ry, { stroke: color, strokeWidth: 2, roughness: 1.2 });
  rc.line(x + w, y + ry, x + w, y + h - ry, { stroke: color, strokeWidth: 2, roughness: 1.2 });
  
  // Top ellipse
  rc.ellipse(node.x, y + ry, w, ry * 2, {
    stroke: color, strokeWidth: 2, roughness: 1.2,
    fill: color + '15', fillStyle: 'solid',
  });
  
  // Bottom arc (half ellipse)
  rc.arc(node.x, y + h - ry, w, ry * 2, 0, Math.PI, false, {
    stroke: color, strokeWidth: 2, roughness: 1.2,
  });

  ctx.fillStyle = color;
  ctx.font = `bold 14px ${FONT}`;
  ctx.textAlign = 'center';
  const labelText = node.emoji ? `${node.emoji} ${node.label}` : node.label;
  ctx.fillText(labelText, node.x, node.y + (node.sublabel ? -2 : 5));

  if (node.sublabel) {
    ctx.font = `12px ${FONT}`;
    ctx.fillStyle = PALETTE.gray;
    ctx.fillText(node.sublabel, node.x, node.y + 14);
  }
}

function drawArrow(rc: any, ctx: any, x1: number, y1: number, x2: number, y2: number, color: string, label?: string, dashed?: boolean) {
  const opts: any = {
    stroke: color,
    strokeWidth: 2,
    roughness: 1,
  };
  if (dashed) {
    opts.strokeLineDash = [8, 4];
  }

  rc.line(x1, y1, x2, y2, opts);

  // Arrowhead
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const headLen = 12;
  rc.line(x2, y2, x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6), {
    stroke: color, strokeWidth: 2, roughness: 0.8,
  });
  rc.line(x2, y2, x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6), {
    stroke: color, strokeWidth: 2, roughness: 0.8,
  });

  if (label) {
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2 - 10;
    
    // Background for readability
    ctx.font = `12px ${FONT}`;
    const metrics = ctx.measureText(label);
    const pad = 4;
    ctx.fillStyle = 'rgba(255, 253, 246, 0.85)';
    ctx.fillRect(mx - metrics.width / 2 - pad, my - 10, metrics.width + pad * 2, 16);
    
    ctx.fillStyle = PALETTE.gray;
    ctx.textAlign = 'center';
    ctx.fillText(label, mx, my);
  }
}

// --- Edge point calculation (connect to edge of node, not center) ---
function getEdgePoint(from: DiagramNode, to: DiagramNode): { x: number; y: number } {
  const w = (from.width || 200) / 2;
  const h = (from.height || 70) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const angle = Math.atan2(dy, dx);

  // Find intersection with rectangle edge
  const tanAngle = Math.abs(Math.tan(angle));
  let ex: number, ey: number;

  if (tanAngle <= h / w) {
    // Intersects left or right edge
    ex = dx > 0 ? w : -w;
    ey = ex * Math.tan(angle);
  } else {
    // Intersects top or bottom edge
    ey = dy > 0 ? h : -h;
    ex = ey / Math.tan(angle);
  }

  return { x: from.x + ex, y: from.y + ey };
}

// --- Main render ---
function renderDiagram(config: DiagramConfig): Buffer {
  const WIDTH = config.width || 1200;
  const HEIGHT = config.height || 700;
  const BG = config.bgColor || DEFAULT_BG;

  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const rc = rough.canvas(canvas as any);

  // Title
  if (config.title) {
    ctx.fillStyle = PALETTE.dark;
    ctx.font = `bold 22px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(config.title, WIDTH / 2, 38);
  }

  if (config.subtitle) {
    ctx.font = `14px ${FONT}`;
    ctx.fillStyle = PALETTE.gray;
    ctx.textAlign = 'center';
    ctx.fillText(config.subtitle, WIDTH / 2, 58);
  }

  // Build node map
  const nodeMap = new Map<string, DiagramNode>();
  for (const node of config.nodes) {
    nodeMap.set(node.id, node);
  }

  // Draw nodes
  for (const node of config.nodes) {
    const shape = node.shape || 'box';
    switch (shape) {
      case 'cloud': drawCloud(rc, ctx, node); break;
      case 'ellipse': drawEllipse(rc, ctx, node); break;
      case 'diamond': drawDiamond(rc, ctx, node); break;
      case 'cylinder': drawCylinder(rc, ctx, node); break;
      default: drawBox(rc, ctx, node); break;
    }
  }

  // Draw arrows
  for (const arrow of config.arrows) {
    const fromNode = nodeMap.get(arrow.from);
    const toNode = nodeMap.get(arrow.to);
    if (!fromNode || !toNode) {
      console.warn(`⚠️ Arrow ref not found: ${arrow.from} → ${arrow.to}`);
      continue;
    }

    const start = getEdgePoint(fromNode, toNode);
    const end = getEdgePoint(toNode, fromNode);
    const color = resolveColor(arrow.color);
    drawArrow(rc, ctx, start.x, start.y, end.x, end.y, color, arrow.label, arrow.dashed);
  }

  // Legend
  if (config.legend) {
    ctx.font = `12px ${FONT}`;
    ctx.textAlign = 'left';
    ctx.fillStyle = PALETTE.gray;
    ctx.fillText(config.legend, 40, HEIGHT - 25);
  }

  return canvas.toBuffer('image/png');
}

// --- CLI entry point ---
if (process.argv.length < 4) {
  console.log('Usage: npx tsx scripts/generate-diagram.ts <diagram.json> <output.png>');
  console.log('');
  console.log('Diagram JSON format:');
  console.log(JSON.stringify({
    title: 'Mon schéma',
    subtitle: 'Sous-titre optionnel',
    width: 1200,
    height: 700,
    nodes: [
      { id: 'a', label: 'Noeud A', x: 300, y: 200, color: 'blue', shape: 'box' },
      { id: 'b', label: 'Noeud B', x: 600, y: 200, color: 'green', shape: 'ellipse' },
    ],
    arrows: [
      { from: 'a', to: 'b', label: 'connexion', color: 'gray' },
    ],
    legend: 'Légende en bas du schéma',
  }, null, 2));
  process.exit(1);
}

const jsonPath = path.resolve(process.argv[2]);
const outPath = path.resolve(process.argv[3]);

const config: DiagramConfig = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
const buffer = renderDiagram(config);

const outDir = path.dirname(outPath);
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(outPath, buffer);
console.log(`✅ Schéma généré : ${outPath} (${(buffer.length / 1024).toFixed(1)} KB)`);

// Also export for programmatic use
export { renderDiagram };
export type { DiagramConfig, DiagramNode, DiagramArrow };
