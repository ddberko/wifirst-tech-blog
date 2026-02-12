/**
 * Test : Génération de schéma style "hand-drawn" avec Rough.js + node-canvas
 * Exemple : architecture réseau Zero Trust simplifiée
 */

import { createCanvas } from 'canvas';
import rough from 'roughjs';
import * as fs from 'fs';
import * as path from 'path';

// --- Config ---
const WIDTH = 1200;
const HEIGHT = 700;
const BG_COLOR = '#FFFDF6'; // warm white like Excalidraw
const FONT_FAMILY = 'Comic Sans MS, cursive, sans-serif';

// Colors palette (Excalidraw-like)
const COLORS = {
  blue: '#1971c2',
  green: '#2f9e44',
  red: '#e03131',
  orange: '#f08c00',
  purple: '#7048e8',
  dark: '#343a40',
  gray: '#868e96',
};

// --- Canvas setup ---
const canvas = createCanvas(WIDTH, HEIGHT);
const ctx = canvas.getContext('2d');

// Background
ctx.fillStyle = BG_COLOR;
ctx.fillRect(0, 0, WIDTH, HEIGHT);

// Rough.js instance
const rc = rough.canvas(canvas as any);

// --- Helper functions ---
function drawBox(x: number, y: number, w: number, h: number, color: string, label: string, sublabel?: string) {
  rc.rectangle(x, y, w, h, {
    stroke: color,
    strokeWidth: 2,
    roughness: 1.5,
    fill: color + '15', // very light fill
    fillStyle: 'solid',
  });
  
  ctx.fillStyle = color;
  ctx.font = `bold 16px ${FONT_FAMILY}`;
  ctx.textAlign = 'center';
  ctx.fillText(label, x + w / 2, y + h / 2 + (sublabel ? -5 : 5));
  
  if (sublabel) {
    ctx.font = `13px ${FONT_FAMILY}`;
    ctx.fillStyle = COLORS.gray;
    ctx.fillText(sublabel, x + w / 2, y + h / 2 + 15);
  }
}

function drawArrow(x1: number, y1: number, x2: number, y2: number, color: string, label?: string) {
  rc.line(x1, y1, x2, y2, {
    stroke: color,
    strokeWidth: 2,
    roughness: 1,
  });
  
  // Arrowhead
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const headLen = 12;
  rc.line(x2, y2, x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6), {
    stroke: color, strokeWidth: 2, roughness: 0.8,
  });
  rc.line(x2, y2, x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6), {
    stroke: color, strokeWidth: 2, roughness: 0.8,
  });
  
  // Label on arrow
  if (label) {
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2 - 10;
    ctx.font = `12px ${FONT_FAMILY}`;
    ctx.fillStyle = COLORS.gray;
    ctx.textAlign = 'center';
    ctx.fillText(label, mx, my);
  }
}

function drawCloud(cx: number, cy: number, label: string) {
  // Approximate cloud with overlapping ellipses
  const ellipses = [
    [cx, cy, 120, 60],
    [cx - 40, cy - 10, 80, 50],
    [cx + 40, cy - 10, 80, 50],
    [cx - 20, cy + 10, 90, 50],
    [cx + 20, cy + 10, 90, 50],
  ];
  for (const [ex, ey, ew, eh] of ellipses) {
    rc.ellipse(ex, ey, ew, eh, {
      stroke: COLORS.blue,
      strokeWidth: 1.5,
      roughness: 1.5,
      fill: COLORS.blue + '10',
      fillStyle: 'solid',
    });
  }
  ctx.fillStyle = COLORS.blue;
  ctx.font = `bold 15px ${FONT_FAMILY}`;
  ctx.textAlign = 'center';
  ctx.fillText(label, cx, cy + 5);
}

// --- Draw the diagram: DNS Security Architecture ---

// Title
ctx.fillStyle = COLORS.dark;
ctx.font = `bold 22px ${FONT_FAMILY}`;
ctx.textAlign = 'center';
ctx.fillText('Architecture DNS Sécurisé — Réseau Enterprise', WIDTH / 2, 40);

// Subtitle
ctx.font = `14px ${FONT_FAMILY}`;
ctx.fillStyle = COLORS.gray;
ctx.fillText('DoH / DoT / DNSSEC — Protection bout en bout', WIDTH / 2, 62);

// Cloud - Internet
drawCloud(600, 140, 'Internet');

// DNS Resolver sécurisé
drawBox(470, 220, 260, 70, COLORS.green, 'DNS Resolver Sécurisé', 'DoH/DoT + DNSSEC validation');

// Firewall / SASE
drawBox(100, 300, 200, 70, COLORS.red, 'Firewall / SASE', 'DNS filtering + logs');
drawBox(700, 300, 200, 70, COLORS.purple, 'Identity Provider', 'RADIUS / 802.1X');

// Network switch/controller
drawBox(400, 420, 300, 70, COLORS.blue, 'Contrôleur Réseau', 'VLAN segmentation + ACL');

// Endpoints
drawBox(80, 550, 160, 70, COLORS.orange, '💻 Postes corp.', 'DoH enforced');
drawBox(310, 550, 160, 70, COLORS.orange, '📱 BYOD / IoT', 'DNS filtré');
drawBox(540, 550, 160, 70, COLORS.orange, '🖥️ Serveurs', 'DNSSEC strict');
drawBox(810, 550, 160, 70, COLORS.orange, '👤 Guests', 'Captive portal');

// --- Arrows ---
// Cloud to resolver
drawArrow(600, 175, 600, 220, COLORS.green, 'DoH/DoT (TLS 1.3)');

// Resolver to firewall
drawArrow(470, 260, 300, 310, COLORS.red, 'policy check');

// Resolver to IdP
drawArrow(730, 260, 780, 300, COLORS.purple, 'auth context');

// Resolver to controller
drawArrow(600, 290, 550, 420, COLORS.blue);

// Firewall to controller
drawArrow(200, 370, 430, 420, COLORS.red, 'block rules');

// IdP to controller
drawArrow(800, 370, 670, 420, COLORS.purple, 'user roles');

// Controller to endpoints
drawArrow(450, 490, 160, 550, COLORS.orange);
drawArrow(500, 490, 390, 550, COLORS.orange);
drawArrow(600, 490, 620, 550, COLORS.orange);
drawArrow(650, 490, 890, 550, COLORS.orange);

// --- Legend ---
const legendY = 650;
ctx.font = `12px ${FONT_FAMILY}`;
ctx.textAlign = 'left';
ctx.fillStyle = COLORS.gray;
ctx.fillText('🔒 Toutes les requêtes DNS chiffrées (DoH/DoT) — Validation DNSSEC sur le resolver — Filtrage par politique sur le firewall', 100, legendY);

// --- Export ---
const outDir = path.join(__dirname, '..', 'content');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'test-handdrawn-diagram.png');
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync(outPath, buffer);
console.log(`✅ Schéma généré : ${outPath}`);
console.log(`   Taille : ${(buffer.length / 1024).toFixed(1)} KB`);
