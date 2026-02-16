/**
 * Générateur de schémas hand-drawn pour le blog Wifirst
 * Usage : npx tsx scripts/generate-diagram.ts <diagram-json-file> <output-png>
 * 
 * Le fichier JSON décrit le diagramme : titre, noeuds, connexions, options.
 * Génère un PNG style "fait main" via Rough.js + node-canvas.
 * 
 * v2 — Fixes: text overflow, cloud sizing, title overlap, arrow labels, sublabels on all shapes
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
  // Computed after auto-sizing
  _w?: number;
  _h?: number;
}

interface DiagramArrow {
  from: string;
  to: string;
  label?: string;
  color?: string;
  dashed?: boolean;
  style?: string; // alias for dashed
}

interface DiagramConfig {
  title: string;
  subtitle?: string;
  width?: number;
  height?: number;
  bgColor?: string;
  background?: string; // alias
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

const DEFAULT_BG = '#FFFFFF';
const FONT = 'sans-serif';
const TITLE_HEIGHT = 55; // space reserved for title
let CURRENT_BG = DEFAULT_BG; // track actual bg for label backgrounds

function resolveColor(c?: string): string {
  if (!c) return PALETTE.blue;
  return PALETTE[c] || c;
}

// --- Text measurement & auto-sizing ---
function stripEmoji(text: string): string {
  // Remove common emoji for accurate width measurement
  return text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{200D}]/gu, '').trim();
}

function measureLabel(ctx: CanvasRenderingContext2D, node: DiagramNode): { labelW: number; sublabelW: number; totalH: number } {
  const labelText = node.emoji ? `${node.emoji} ${node.label}` : node.label;
  ctx.font = `bold 15px ${FONT}`;
  const labelW = ctx.measureText(labelText).width;
  
  let sublabelW = 0;
  if (node.sublabel) {
    ctx.font = `12px ${FONT}`;
    sublabelW = ctx.measureText(node.sublabel).width;
  }
  
  const totalH = node.sublabel ? 36 : 20;
  return { labelW, sublabelW, totalH };
}

/** Ensure node dimensions fit the text with padding */
function autoSizeNode(ctx: CanvasRenderingContext2D, node: DiagramNode): void {
  const { labelW, sublabelW, totalH } = measureLabel(ctx, node);
  const textW = Math.max(labelW, sublabelW);
  const padX = node.shape === 'diamond' ? 60 : node.shape === 'cloud' ? 50 : 36;
  const padY = node.shape === 'diamond' ? 40 : 30;
  
  const minW = textW + padX;
  const minH = totalH + padY;
  
  node._w = Math.max(node.width || 0, minW);
  node._h = Math.max(node.height || 0, minH);
}

// --- Drawing helpers ---

function drawLabel(ctx: CanvasRenderingContext2D, node: DiagramNode, cx: number, cy: number) {
  const color = resolveColor(node.color);
  const labelText = node.emoji ? `${node.emoji} ${node.label}` : node.label;
  
  // Auto-shrink font if text still too wide
  const maxW = (node._w || 200) - 20;
  let fontSize = 15;
  ctx.font = `bold ${fontSize}px ${FONT}`;
  while (ctx.measureText(labelText).width > maxW && fontSize > 10) {
    fontSize--;
    ctx.font = `bold ${fontSize}px ${FONT}`;
  }
  
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(labelText, cx, cy + (node.sublabel ? -8 : 0));

  if (node.sublabel) {
    let subSize = 12;
    ctx.font = `${subSize}px ${FONT}`;
    while (ctx.measureText(node.sublabel).width > maxW && subSize > 9) {
      subSize--;
      ctx.font = `${subSize}px ${FONT}`;
    }
    ctx.fillStyle = PALETTE.gray;
    ctx.fillText(node.sublabel, cx, cy + 10);
  }
}

function drawBox(rc: any, ctx: CanvasRenderingContext2D, node: DiagramNode) {
  const color = resolveColor(node.color);
  const w = node._w || 200;
  const h = node._h || 70;
  const x = node.x - w / 2;
  const y = node.y - h / 2;

  rc.rectangle(x, y, w, h, {
    stroke: color,
    strokeWidth: 2,
    roughness: 1.5,
    fill: color + '15',
    fillStyle: 'solid',
  });

  drawLabel(ctx, node, node.x, node.y);
}

function drawCloud(rc: any, ctx: CanvasRenderingContext2D, node: DiagramNode) {
  const color = resolveColor(node.color);
  const cx = node.x;
  const cy = node.y;
  const w = node._w || 160;
  const h = node._h || 80;
  
  // Scale cloud ellipses proportionally to node dimensions
  const sx = w / 160; // scale factor X
  const sy = h / 80;  // scale factor Y
  
  const ellipses: [number, number, number, number][] = [
    [cx, cy,            130 * sx, 60 * sy],
    [cx - 35 * sx, cy - 10 * sy, 80 * sx, 50 * sy],
    [cx + 35 * sx, cy - 10 * sy, 80 * sx, 50 * sy],
    [cx - 20 * sx, cy + 10 * sy, 90 * sx, 50 * sy],
    [cx + 20 * sx, cy + 10 * sy, 90 * sx, 50 * sy],
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
  
  drawLabel(ctx, node, cx, cy);
}

function drawEllipse(rc: any, ctx: CanvasRenderingContext2D, node: DiagramNode) {
  const color = resolveColor(node.color);
  const w = node._w || 180;
  const h = node._h || 70;
  
  rc.ellipse(node.x, node.y, w, h, {
    stroke: color,
    strokeWidth: 2,
    roughness: 1.5,
    fill: color + '15',
    fillStyle: 'solid',
  });

  drawLabel(ctx, node, node.x, node.y);
}

function drawDiamond(rc: any, ctx: CanvasRenderingContext2D, node: DiagramNode) {
  const color = resolveColor(node.color);
  const w = (node._w || 140) / 2;
  const h = (node._h || 80) / 2;
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

  drawLabel(ctx, node, cx, cy);
}

function drawCylinder(rc: any, ctx: CanvasRenderingContext2D, node: DiagramNode) {
  const color = resolveColor(node.color);
  const w = node._w || 140;
  const h = node._h || 80;
  const x = node.x - w / 2;
  const y = node.y - h / 2;
  const ry = 12;

  // Body
  rc.line(x, y + ry, x, y + h - ry, { stroke: color, strokeWidth: 2, roughness: 1.2 });
  rc.line(x + w, y + ry, x + w, y + h - ry, { stroke: color, strokeWidth: 2, roughness: 1.2 });
  
  // Top ellipse
  rc.ellipse(node.x, y + ry, w, ry * 2, {
    stroke: color, strokeWidth: 2, roughness: 1.2,
    fill: color + '15', fillStyle: 'solid',
  });
  
  // Bottom arc
  rc.arc(node.x, y + h - ry, w, ry * 2, 0, Math.PI, false, {
    stroke: color, strokeWidth: 2, roughness: 1.2,
  });

  drawLabel(ctx, node, node.x, node.y);
}

function drawArrow(rc: any, ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string, label?: string, dashed?: boolean) {
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
    const my = (y1 + y2) / 2;
    
    // Offset label perpendicular to arrow direction
    const perpAngle = angle + Math.PI / 2;
    const offsetDist = 14;
    const lx = mx + Math.cos(perpAngle) * offsetDist;
    const ly = my + Math.sin(perpAngle) * offsetDist;
    
    // Background for readability
    ctx.font = `11px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const metrics = ctx.measureText(label);
    const pad = 4;
    // Use actual background color for label bg
    ctx.fillStyle = CURRENT_BG === '#FFFFFF' ? 'rgba(255, 255, 255, 0.92)' : 'rgba(255, 253, 246, 0.92)';
    ctx.fillRect(lx - metrics.width / 2 - pad, ly - 8, metrics.width + pad * 2, 16);
    
    ctx.fillStyle = PALETTE.gray;
    ctx.fillText(label, lx, ly);
  }
}

// --- Edge point calculation ---
function getEdgePoint(from: DiagramNode, to: DiagramNode): { x: number; y: number } {
  const shape = from.shape || 'box';
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const angle = Math.atan2(dy, dx);

  if (shape === 'ellipse' || shape === 'cloud') {
    // Ellipse intersection
    const a = (from._w || 180) / 2;
    const b = (from._h || 70) / 2;
    const r = (a * b) / Math.sqrt((b * Math.cos(angle)) ** 2 + (a * Math.sin(angle)) ** 2);
    return { x: from.x + r * Math.cos(angle), y: from.y + r * Math.sin(angle) };
  }

  if (shape === 'diamond') {
    const hw = (from._w || 140) / 2;
    const hh = (from._h || 80) / 2;
    // Diamond edge: parameterize by angle
    const absC = Math.abs(Math.cos(angle));
    const absS = Math.abs(Math.sin(angle));
    const t = 1 / (absC / hw + absS / hh);
    return { x: from.x + t * Math.cos(angle), y: from.y + t * Math.sin(angle) };
  }

  // Rectangle (box, cylinder)
  const w = (from._w || 200) / 2;
  const h = (from._h || 70) / 2;
  const tanAngle = Math.abs(Math.tan(angle));
  let ex: number, ey: number;

  if (tanAngle <= h / w) {
    ex = dx > 0 ? w : -w;
    ey = ex * Math.tan(angle);
  } else {
    ey = dy > 0 ? h : -h;
    ex = ey / Math.tan(angle);
  }

  return { x: from.x + ex, y: from.y + ey };
}

// --- Main render ---
function renderDiagram(config: DiagramConfig): Buffer {
  const WIDTH = config.width || 1200;
  const HEIGHT = config.height || 700;
  const BG = config.bgColor || config.background || DEFAULT_BG;
  CURRENT_BG = BG;
  const hasTitle = !!config.title;

  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d') as any as CanvasRenderingContext2D;

  // Background
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const rc = rough.canvas(canvas as any);

  // Auto-offset nodes down if title exists to avoid overlap
  const titleOffset = hasTitle ? TITLE_HEIGHT : 0;
  for (const node of config.nodes) {
    node.y += titleOffset;
  }

  // Auto-size all nodes based on text content
  for (const node of config.nodes) {
    autoSizeNode(ctx, node);
  }

  // Title (drawn BEFORE nodes, at top)
  if (config.title) {
    ctx.fillStyle = PALETTE.dark;
    ctx.font = `bold 22px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(config.title, WIDTH / 2, 26);
  }

  if (config.subtitle) {
    ctx.font = `14px ${FONT}`;
    ctx.fillStyle = PALETTE.gray;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(config.subtitle, WIDTH / 2, 48);
  }

  // Build node map
  const nodeMap = new Map<string, DiagramNode>();
  for (const node of config.nodes) {
    nodeMap.set(node.id, node);
  }

  // Draw arrows FIRST (behind nodes)
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
    const isDashed = arrow.dashed || arrow.style === 'dashed';
    drawArrow(rc, ctx, start.x, start.y, end.x, end.y, color, arrow.label, isDashed);
  }

  // Draw nodes ON TOP of arrows
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

  // Legend
  if (config.legend) {
    ctx.font = `12px ${FONT}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
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

export { renderDiagram };
export type { DiagramConfig, DiagramNode, DiagramArrow };
