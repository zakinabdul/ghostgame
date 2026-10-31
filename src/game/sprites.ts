/**
 * Procedural 16-bit Pixel-Art Sprites & Tile Rendering Engine for HTML5 Canvas
 */

import { Direction, Enemy, PlayerState, TileType } from '../types/game';

// Draw retro castle stone brick wall
export function drawWallTile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  row: number,
  col: number
) {
  // Base dark blue-black mortar
  ctx.fillStyle = '#090d16';
  ctx.fillRect(x, y, size, size);

  // Pseudo-random deterministic seed based on coordinate
  const seed = (row * 37 + col * 17) % 7;

  // Brick colors (dark blue and black gothic castle stone)
  const brickDark = '#101726';
  const brickMid = '#172033';
  const brickLight = '#23304c';
  const brickHighlight = '#3b4c73';

  // 3 horizontal brick courses
  const h3 = Math.floor(size / 3);
  const offset = (row % 2) * Math.floor(size / 2);

  for (let r = 0; r < 3; r++) {
    const by = y + r * h3;
    const bh = r === 2 ? size - 2 * h3 : h3;
    
    // Draw 2-3 bricks per row
    const brickW = Math.floor(size / 2);
    for (let c = -1; c < 3; c++) {
      const bx = x + c * brickW + (r % 2 === 0 ? 0 : offset);
      if (bx + brickW < x || bx > x + size) continue;

      const drawBx = Math.max(x + 1, bx + 1);
      const drawBw = Math.min(x + size - 1, bx + brickW - 1) - drawBx;
      const drawBy = by + 1;
      const drawBh = bh - 2;

      if (drawBw > 0 && drawBh > 0) {
        // Brick fill
        ctx.fillStyle = (seed + r + c) % 3 === 0 ? brickDark : brickMid;
        ctx.fillRect(drawBx, drawBy, drawBw, drawBh);

        // Top highlight
        ctx.fillStyle = brickHighlight;
        ctx.fillRect(drawBx, drawBy, drawBw, 1);

        // Left highlight
        ctx.fillRect(drawBx, drawBy, 1, drawBh);

        // Bottom shadow
        ctx.fillStyle = '#060910';
        ctx.fillRect(drawBx, drawBy + drawBh - 1, drawBw, 1);
      }
    }
  }

  // Occasional moss tuft on old bricks
  if (seed === 1 || seed === 4) {
    ctx.fillStyle = '#166534';
    ctx.fillRect(x + 3, y + size - 4, 4, 3);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(x + 4, y + size - 3, 2, 2);
  } else if (seed === 2) {
    ctx.fillStyle = '#14532d';
    ctx.fillRect(x + size - 6, y + 2, 4, 3);
  }
}

// Draw mossy cobblestone dungeon floor
export function drawFloorTile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  row: number,
  col: number
) {
  // Deep dark dungeon stone ground
  ctx.fillStyle = '#060911';
  ctx.fillRect(x, y, size, size);

  const seed = (row * 31 + col * 43) % 11;
  const stoneColor = seed % 3 === 0 ? '#0d131f' : seed % 3 === 1 ? '#0a0f19' : '#111724';

  ctx.fillStyle = stoneColor;
  ctx.fillRect(x + 1, y + 1, size - 2, size - 2);

  // Subtle stone flagstone lines
  ctx.fillStyle = '#05070d';
  ctx.fillRect(x, y + Math.floor(size / 2), size, 1);
  ctx.fillRect(x + Math.floor(size / 2), y, 1, Math.floor(size / 2));
  ctx.fillRect(x + Math.floor(size * 0.75), y + Math.floor(size / 2), 1, Math.floor(size / 2));

  // Moss / dampness spots
  if (seed === 3 || seed === 8) {
    ctx.fillStyle = '#0f381e';
    ctx.fillRect(x + 4, y + 5, 5, 4);
    ctx.fillStyle = '#166534';
    ctx.fillRect(x + 5, y + 6, 2, 2);
  }
  // Ancient crack
  if (seed === 5) {
    ctx.fillStyle = '#04060a';
    ctx.fillRect(x + 8, y + 4, 1, 3);
    ctx.fillRect(x + 9, y + 7, 2, 1);
    ctx.fillRect(x + 11, y + 8, 1, 4);
  }
}

// Draw wall torch with flickering 16-bit flame
export function drawWallTorch(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number
) {
  const cx = x + size / 2;
  const cy = y + size / 2;

  // Wrought-iron mount
  ctx.fillStyle = '#334155';
  ctx.fillRect(cx - 3, cy - 2, 6, 3);
  ctx.fillRect(cx - 1, cy - 8, 2, 12);
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(cx - 4, cy - 4, 2, 4);
  ctx.fillRect(cx + 2, cy - 4, 2, 4);

  // Torch wood stick
  ctx.fillStyle = '#78350f';
  ctx.fillRect(cx - 2, cy - 10, 4, 7);
  ctx.fillStyle = '#451a03';
  ctx.fillRect(cx - 1, cy - 10, 2, 7);

  // Animated flickering flame (3 frames based on time)
  const flameStep = Math.floor(time * 8) % 4;
  const fOffX = flameStep === 1 ? -1 : flameStep === 2 ? 1 : 0;
  const fHeight = 6 + (flameStep % 3);

  // Outer red-orange flame
  ctx.fillStyle = '#ea580c';
  ctx.fillRect(cx - 3 + fOffX, cy - 11 - fHeight, 6, fHeight);

  // Mid amber flame
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(cx - 2 + fOffX, cy - 10 - fHeight + 2, 4, fHeight - 2);

  // Inner bright yellow flame core
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(cx - 1 + fOffX, cy - 9 - fHeight + 4, 2, fHeight - 4);
}

// Draw collectible carved Jack-o'-lantern Pumpkin
export function drawPumpkin(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  isSuper: boolean = false
) {
  const cx = x + size / 2;
  const cy = y + size / 2;

  // Gentle floating hover & pulse
  const hoverY = Math.sin(time * 3 + (x + y)) * 2;
  const pulseScale = 1.0 + Math.sin(time * 4) * 0.05;

  ctx.save();
  ctx.translate(cx, cy + hoverY);
  ctx.scale(pulseScale, pulseScale);

  // Outer glow aura
  const glowGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, size * 0.75);
  if (isSuper) {
    glowGrad.addColorStop(0, 'rgba(250, 204, 21, 0.45)');
    glowGrad.addColorStop(0.5, 'rgba(192, 132, 252, 0.25)');
    glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  } else {
    glowGrad.addColorStop(0, 'rgba(249, 115, 22, 0.4)');
    glowGrad.addColorStop(0.6, 'rgba(234, 88, 12, 0.15)');
    glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  }
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.75, 0, Math.PI * 2);
  ctx.fill();

  // Stem (green curved stalk or gold for super)
  ctx.fillStyle = isSuper ? '#facc15' : '#15803d';
  ctx.fillRect(-2, -11, 4, 4);
  ctx.fillStyle = isSuper ? '#fef08a' : '#22c55e';
  ctx.fillRect(-1, -12, 3, 2);

  // Pumpkin Body (Pixel 16-bit rounded pumpkin)
  const baseOrange = isSuper ? '#eab308' : '#ea580c';
  const shadowOrange = isSuper ? '#a16207' : '#9a3412';
  const highlightOrange = isSuper ? '#fef08a' : '#fdba74';

  // Body silhouette
  ctx.fillStyle = shadowOrange;
  ctx.fillRect(-8, -6, 16, 13);
  ctx.fillRect(-10, -4, 20, 9);
  ctx.fillRect(-6, -7, 12, 15);

  // Mid tones
  ctx.fillStyle = baseOrange;
  ctx.fillRect(-7, -5, 14, 11);
  ctx.fillRect(-9, -3, 18, 7);

  // Pumpkin lobes / ribs vertical ridges
  ctx.fillStyle = shadowOrange;
  ctx.fillRect(-4, -6, 1, 13);
  ctx.fillRect(3, -6, 1, 13);

  // Top highlight
  ctx.fillStyle = highlightOrange;
  ctx.fillRect(-6, -6, 3, 2);
  ctx.fillRect(1, -6, 3, 2);

  // Glowing Carved Face! (Eyes and Jagged Smile)
  const eyeColor = isSuper ? '#ffffff' : '#fef08a';
  const innerFlame = isSuper ? '#c084fc' : '#f97316';

  // Triangular Carved Eyes
  ctx.fillStyle = '#431407'; // Carved depth
  ctx.fillRect(-6, -3, 3, 3);
  ctx.fillRect(3, -3, 3, 3);

  ctx.fillStyle = eyeColor;
  ctx.fillRect(-5, -3, 2, 2);
  ctx.fillRect(4, -3, 2, 2);

  // Nose
  ctx.fillStyle = '#431407';
  ctx.fillRect(-1, -1, 2, 2);
  ctx.fillStyle = eyeColor;
  ctx.fillRect(0, -1, 1, 1);

  // Jagged Carved Smile
  ctx.fillStyle = '#431407';
  ctx.fillRect(-6, 2, 12, 4);
  
  // Teeth cutouts
  ctx.fillStyle = baseOrange;
  ctx.fillRect(-4, 2, 2, 2);
  ctx.fillRect(2, 2, 2, 2);
  ctx.fillRect(-1, 4, 2, 2);

  // Inner Glow through mouth
  ctx.fillStyle = eyeColor;
  ctx.fillRect(-5, 3, 2, 2);
  ctx.fillRect(0, 2, 2, 2);
  ctx.fillRect(3, 3, 2, 2);

  ctx.restore();
}

// Draw Ornate Skull Keys
export function drawKey(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  isGold: boolean,
  time: number
) {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const bob = Math.sin(time * 3 + x) * 2.5;

  ctx.save();
  ctx.translate(cx, cy + bob);

  const keyLight = isGold ? '#fef08a' : '#f1f5f9';
  const keyBase = isGold ? '#eab308' : '#94a3b8';
  const keyDark = isGold ? '#854d0e' : '#475569';
  const keyAura = isGold ? 'rgba(234, 179, 8, 0.4)' : 'rgba(148, 163, 184, 0.4)';

  // Aura
  ctx.fillStyle = keyAura;
  ctx.beginPath();
  ctx.arc(0, 0, 10, 0, Math.PI * 2);
  ctx.fill();

  // Skull-shaped key bow (head)
  ctx.fillStyle = keyDark;
  ctx.fillRect(-5, -9, 10, 8);
  ctx.fillStyle = keyBase;
  ctx.fillRect(-4, -8, 8, 6);
  ctx.fillStyle = keyLight;
  ctx.fillRect(-3, -8, 6, 2);

  // Skull eye holes in key handle
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-3, -6, 2, 2);
  ctx.fillRect(1, -6, 2, 2);

  // Key shaft
  ctx.fillStyle = keyBase;
  ctx.fillRect(-1, -1, 3, 11);
  ctx.fillStyle = keyLight;
  ctx.fillRect(0, -1, 1, 11);

  // Key teeth (bittings)
  ctx.fillStyle = keyBase;
  ctx.fillRect(2, 5, 3, 2);
  ctx.fillRect(2, 8, 4, 2);

  ctx.restore();
}

// Draw locked iron/skull gates
export function drawGate(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  isGold: boolean
) {
  // Underlying stone floor
  ctx.fillStyle = '#060911';
  ctx.fillRect(x, y, size, size);

  const barColor = isGold ? '#a16207' : '#334155';
  const highlight = isGold ? '#fef08a' : '#94a3b8';
  const accent = isGold ? '#eab308' : '#64748b';

  // 4 vertical iron bars
  const spacing = Math.floor(size / 5);
  for (let i = 1; i <= 4; i++) {
    const bx = x + i * spacing;
    ctx.fillStyle = barColor;
    ctx.fillRect(bx - 2, y, 4, size);
    ctx.fillStyle = highlight;
    ctx.fillRect(bx - 1, y, 1, size);

    // Top spike tips
    ctx.fillStyle = highlight;
    ctx.fillRect(bx - 1, y - 2, 2, 2);
  }

  // Horizontal brace bars
  ctx.fillStyle = barColor;
  ctx.fillRect(x, y + 6, size, 4);
  ctx.fillRect(x, y + size - 10, size, 4);
  ctx.fillStyle = highlight;
  ctx.fillRect(x, y + 6, size, 1);
  ctx.fillRect(x, y + size - 10, size, 1);

  // Central ornate skull padlock
  const cx = x + size / 2;
  const cy = y + size / 2;

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(cx - 6, cy - 6, 12, 12);
  ctx.fillStyle = accent;
  ctx.fillRect(cx - 5, cy - 5, 10, 10);
  ctx.fillStyle = highlight;
  ctx.fillRect(cx - 4, cy - 4, 8, 3);

  // Keyhole
  ctx.fillStyle = '#000000';
  ctx.fillRect(cx - 1, cy - 1, 2, 3);
  ctx.fillRect(cx - 1, cy + 2, 2, 2);
}

// Draw spike traps
export function drawSpikes(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  state: 'retracted' | 'warning' | 'extended'
) {
  // Base floor slot
  ctx.fillStyle = '#070b12';
  ctx.fillRect(x, y, size, size);

  // Stone frame
  ctx.fillStyle = '#1e293b';
  ctx.strokeRect(x + 2, y + 2, size - 4, size - 4);

  // 4 pit holes
  const p1 = Math.floor(size * 0.3);
  const p2 = Math.floor(size * 0.7);

  const holes = [
    [x + p1, y + p1],
    [x + p2, y + p1],
    [x + p1, y + p2],
    [x + p2, y + p2]
  ];

  holes.forEach(([hx, hy]) => {
    ctx.fillStyle = '#020617';
    ctx.fillRect(hx - 2, hy - 2, 5, 5);

    if (state === 'warning') {
      // Shimmering iron tip visible
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(hx - 1, hy - 1, 3, 3);
    } else if (state === 'extended') {
      // Extended deadly steel spike
      ctx.fillStyle = '#64748b';
      ctx.fillRect(hx - 2, hy - 6, 5, 8);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(hx - 1, hy - 8, 3, 3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(hx, hy - 9, 1, 2);
      // Blood rust on tip
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(hx - 1, hy - 6, 3, 2);
    }
  });
}

// Draw magical potion bottles
export function drawPotion(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  type: 'speed' | 'holy' | 'health',
  time: number
) {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const bob = Math.sin(time * 3 + y) * 2;

  ctx.save();
  ctx.translate(cx, cy + bob);

  let liquidColor = '#a855f7';
  let bubbleColor = '#e9d5ff';
  let auraColor = 'rgba(168, 85, 247, 0.4)';

  if (type === 'holy') {
    liquidColor = '#38bdf8';
    bubbleColor = '#bae6fd';
    auraColor = 'rgba(56, 189, 248, 0.4)';
  } else if (type === 'health') {
    liquidColor = '#ef4444';
    bubbleColor = '#fecaca';
    auraColor = 'rgba(239, 68, 68, 0.4)';
  }

  // Aura
  ctx.fillStyle = auraColor;
  ctx.beginPath();
  ctx.arc(0, 0, 9, 0, Math.PI * 2);
  ctx.fill();

  // Cork stopper
  ctx.fillStyle = '#92400e';
  ctx.fillRect(-2, -8, 4, 2);

  // Glass bottle neck
  ctx.fillStyle = '#64748b';
  ctx.fillRect(-1, -6, 2, 2);

  // Round flask body
  ctx.fillStyle = '#334155';
  ctx.fillRect(-5, -4, 10, 10);
  ctx.fillRect(-6, -2, 12, 6);

  // Liquid fill inside glass
  ctx.fillStyle = liquidColor;
  ctx.fillRect(-4, -2, 8, 7);
  ctx.fillRect(-5, -1, 10, 5);

  // Rising bubbles
  const bOff = Math.floor(time * 6) % 4;
  ctx.fillStyle = bubbleColor;
  ctx.fillRect(-2, 2 - bOff, 2, 2);
  ctx.fillRect(1, 0 + (bOff % 2), 1, 1);

  // Glass highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillRect(-4, -2, 2, 4);

  ctx.restore();
}

// Draw Exit Portal with mystical swirling vortex
export function drawPortal(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  isOpen: boolean,
  time: number
) {
  const cx = x + size / 2;
  const cy = y + size / 2;

  // Ancient stone altar dais
  ctx.fillStyle = '#1e1b4b';
  ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
  ctx.fillStyle = '#312e81';
  ctx.strokeRect(x + 3, y + 3, size - 6, size - 6);

  if (!isOpen) {
    // Dormant dormant runes
    ctx.fillStyle = '#475569';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🔒', cx, cy);

    ctx.fillStyle = '#64748b';
    ctx.fillRect(cx - 6, cy + 6, 12, 2);
    return;
  }

  // Active mystical portal!
  ctx.save();
  ctx.translate(cx, cy);

  // Pulsing outer aura
  const radius = size * 0.48;
  const pulseR = radius + Math.sin(time * 5) * 3;
  const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, pulseR);
  grad.addColorStop(0, '#c084fc');
  grad.addColorStop(0.5, '#4f46e5');
  grad.addColorStop(0.8, '#10b981');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, pulseR, 0, Math.PI * 2);
  ctx.fill();

  // Rotating spiral vortex arms
  const angle = time * 3;
  for (let i = 0; i < 4; i++) {
    const a = angle + (i * Math.PI) / 2;
    ctx.strokeStyle = i % 2 === 0 ? '#34d399' : '#e879f9';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.65, a, a + Math.PI * 0.7);
    ctx.stroke();
  }

  // Swirling core
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, 0, 4 + Math.sin(time * 8) * 1.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// Draw Player (Brave Pumpkin Hunter Hero)
export function drawPlayer(
  ctx: CanvasRenderingContext2D,
  player: PlayerState,
  time: number
) {
  const cx = player.x + player.width / 2;
  const cy = player.y + player.height / 2;

  // Hurt flicker (flash invulnerability)
  if (player.invulnerableTimer > 0 && Math.floor(time * 20) % 2 === 0) {
    return;
  }

  ctx.save();
  ctx.translate(cx, cy);

  // Active holy water protective shield aura
  if (player.buffs.holyTimer > 0) {
    const shieldPulse = 18 + Math.sin(time * 8) * 3;
    const shieldGrad = ctx.createRadialGradient(0, 0, 8, 0, 0, shieldPulse);
    shieldGrad.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
    shieldGrad.addColorStop(0.7, 'rgba(125, 211, 252, 0.6)');
    shieldGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = shieldGrad;
    ctx.beginPath();
    ctx.arc(0, 0, shieldPulse, 0, Math.PI * 2);
    ctx.fill();
  }

  // Active speed boost purple trail
  if (player.buffs.speedTimer > 0 && player.isMoving) {
    ctx.fillStyle = 'rgba(192, 132, 252, 0.4)';
    const trailOffset = player.facing === 'left' ? 6 : player.facing === 'right' ? -6 : 0;
    const trailOffsetY = player.facing === 'up' ? 6 : player.facing === 'down' ? -6 : 0;
    ctx.fillRect(-7 + trailOffset, -10 + trailOffsetY, 14, 20);
  }

  // Walking bob
  const walkBob = player.isMoving ? Math.sin(player.frame * Math.PI) * 2 : 0;
  const legOffset = player.isMoving ? Math.sin(player.frame * Math.PI) * 3 : 0;

  // --- Cape (dark violet hooded cloak) ---
  ctx.fillStyle = '#3b0764';
  ctx.fillRect(-7, -4 + walkBob, 14, 13);
  ctx.fillStyle = '#581c87';
  ctx.fillRect(-6, -3 + walkBob, 12, 11);

  // --- Boots / Legs ---
  ctx.fillStyle = '#451a03';
  ctx.fillRect(-5, 9 + legOffset, 4, 5);
  ctx.fillRect(1, 9 - legOffset, 4, 5);
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(-6, 12 + legOffset, 5, 2);
  ctx.fillRect(1, 12 - legOffset, 5, 2);

  // --- Torso & Armor ---
  ctx.fillStyle = '#334155'; // Chestplate
  ctx.fillRect(-5, 0 + walkBob, 10, 8);
  ctx.fillStyle = '#64748b';
  ctx.fillRect(-4, 1 + walkBob, 8, 5);
  // Gold belt buckle
  ctx.fillStyle = '#ca8a04';
  ctx.fillRect(-2, 6 + walkBob, 4, 3);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(-1, 7 + walkBob, 2, 1);

  // --- Head / Face / Hair ---
  // Hood background
  ctx.fillStyle = '#2e1065';
  ctx.fillRect(-7, -13 + walkBob, 14, 12);
  ctx.fillRect(-8, -11 + walkBob, 16, 8);

  // Orange hair tuft
  ctx.fillStyle = '#ea580c';
  ctx.fillRect(-6, -11 + walkBob, 12, 4);
  ctx.fillStyle = '#f97316';
  ctx.fillRect(-5, -12 + walkBob, 8, 3);

  // Face skin
  ctx.fillStyle = '#fed7aa';
  ctx.fillRect(-5, -8 + walkBob, 10, 6);

  // Eyes based on facing direction
  ctx.fillStyle = '#0f172a';
  if (player.facing === 'left') {
    ctx.fillRect(-4, -7 + walkBob, 2, 3);
  } else if (player.facing === 'right') {
    ctx.fillRect(2, -7 + walkBob, 2, 3);
  } else if (player.facing === 'down') {
    ctx.fillRect(-4, -7 + walkBob, 2, 3);
    ctx.fillRect(2, -7 + walkBob, 2, 3);
    // Cheerful blush
    ctx.fillStyle = '#fb7185';
    ctx.fillRect(-5, -4 + walkBob, 2, 1);
    ctx.fillRect(3, -4 + walkBob, 2, 1);
  } else {
    // Facing up - show hood back
    ctx.fillStyle = '#3b0764';
    ctx.fillRect(-5, -9 + walkBob, 10, 7);
  }

  // --- Handheld Glowing Pumpkin Lantern ---
  const lanternX = player.facing === 'left' ? -9 : 9;
  const lanternY = 2 + walkBob;

  // Arm
  ctx.fillStyle = '#581c87';
  ctx.fillRect(player.facing === 'left' ? -7 : 5, 2 + walkBob, 4, 4);

  // Lantern chain
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(lanternX - 1, lanternY - 3, 2, 3);

  // Mini Pumpkin Lantern
  ctx.fillStyle = '#ea580c';
  ctx.fillRect(lanternX - 4, lanternY, 8, 7);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(lanternX - 2, lanternY + 2, 4, 3);
  ctx.fillStyle = '#15803d'; // Stem
  ctx.fillRect(lanternX - 1, lanternY - 1, 2, 2);

  ctx.restore();
}

// Draw Floating Ghost Enemy
export function drawGhost(
  ctx: CanvasRenderingContext2D,
  ghost: Enemy,
  time: number,
  isScared: boolean = false
) {
  const cx = ghost.x + ghost.width / 2;
  const cy = ghost.y + ghost.height / 2;

  // Floating hover and waving tail
  const floatY = Math.sin(time * 4 + ghost.wobbleOffset) * 3;
  const tailWave = Math.sin(time * 6 + ghost.wobbleOffset) * 2;

  ctx.save();
  ctx.translate(cx, cy + floatY);

  // Cyan / Indigo Glow Aura
  const auraColor = isScared ? 'rgba(59, 130, 246, 0.35)' : 'rgba(56, 189, 248, 0.4)';
  ctx.fillStyle = auraColor;
  ctx.beginPath();
  ctx.arc(0, -2, 16, 0, Math.PI * 2);
  ctx.fill();

  // Ghost Body (Ethereal gradient)
  const bodyColor = isScared ? '#1e3a8a' : '#e0f2fe';
  const shadowColor = isScared ? '#172554' : '#7dd3fc';

  ctx.fillStyle = shadowColor;
  ctx.beginPath();
  ctx.arc(0, -3, 10, Math.PI, 0, false);
  ctx.lineTo(10, 6);
  ctx.lineTo(6 + tailWave, 12);
  ctx.lineTo(1, 7);
  ctx.lineTo(-4 - tailWave, 12);
  ctx.lineTo(-10, 6);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.arc(0, -3, 8, Math.PI, 0, false);
  ctx.lineTo(8, 5);
  ctx.lineTo(5 + tailWave, 10);
  ctx.lineTo(0, 6);
  ctx.lineTo(-3 - tailWave, 10);
  ctx.lineTo(-8, 5);
  ctx.closePath();
  ctx.fill();

  // Ghost Eyes
  if (isScared) {
    // Scared / Fleeing eyes
    ctx.fillStyle = '#93c5fd';
    ctx.fillRect(-5, -5, 3, 3);
    ctx.fillRect(2, -5, 3, 3);
    // Wavy mouth
    ctx.fillStyle = '#60a5fa';
    ctx.fillRect(-3, 0, 6, 2);
  } else {
    // Spooky glowing eyes (look toward moving direction)
    const eyeOffsetX = ghost.vx > 0 ? 1 : ghost.vx < 0 ? -1 : 0;
    ctx.fillStyle = '#ef4444'; // Glowing red eyes
    ctx.fillRect(-5 + eyeOffsetX, -5, 3, 4);
    ctx.fillRect(2 + eyeOffsetX, -5, 3, 4);

    ctx.fillStyle = '#fef08a'; // Yellow pupil glint
    ctx.fillRect(-4 + eyeOffsetX, -4, 1, 2);
    ctx.fillRect(3 + eyeOffsetX, -4, 1, 2);

    // Spooky O mouth
    ctx.fillStyle = '#0369a1';
    ctx.fillRect(-1 + eyeOffsetX, -1, 3, 3);
  }

  ctx.restore();
}

// Draw Clacking Skeleton Enemy
export function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  skel: Enemy,
  time: number
) {
  const cx = skel.x + skel.width / 2;
  const cy = skel.y + skel.height / 2;

  const stepBob = Math.sin(time * 8 + skel.wobbleOffset) * 2;
  const legSwing = Math.sin(time * 8 + skel.wobbleOffset) * 4;

  ctx.save();
  ctx.translate(cx, cy);

  // Skull
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(-6, -12 + stepBob, 12, 10);
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(-5, -11 + stepBob, 10, 8);

  // Jaw
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(-4, -3 + stepBob, 8, 3);

  // Eye Sockets
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-4, -8 + stepBob, 3, 4);
  ctx.fillRect(1, -8 + stepBob, 3, 4);

  // Glowing yellow dot in sockets
  ctx.fillStyle = '#facc15';
  ctx.fillRect(-3, -7 + stepBob, 1, 2);
  ctx.fillRect(2, -7 + stepBob, 1, 2);

  // Spine & Ribcage
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(-1, 0 + stepBob, 2, 7);

  // 3 pairs of ribs
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(-5, 1 + stepBob, 10, 1.5);
  ctx.fillRect(-6, 3 + stepBob, 12, 1.5);
  ctx.fillRect(-4, 5 + stepBob, 8, 1.5);

  // Pelvis
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(-4, 7 + stepBob, 8, 2);

  // Legs
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(-4, 9 + legSwing, 2, 6);
  ctx.fillRect(2, 9 - legSwing, 2, 6);
  // Feet
  ctx.fillRect(-5, 14 + legSwing, 3, 2);
  ctx.fillRect(2, 14 - legSwing, 3, 2);

  // Arms
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(-7, 1 - legSwing, 2, 6);
  ctx.fillRect(5, 1 + legSwing, 2, 6);

  ctx.restore();
}

// Draw Flying Bat Enemy
export function drawBat(
  ctx: CanvasRenderingContext2D,
  bat: Enemy,
  time: number
) {
  const cx = bat.x + bat.width / 2;
  const cy = bat.y + bat.height / 2;

  // High speed wing flap
  const flapFrame = Math.floor(time * 14) % 3;
  const bobY = Math.sin(time * 8) * 3;

  ctx.save();
  ctx.translate(cx, cy + bobY);

  // Shadow on floor
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.beginPath();
  ctx.ellipse(0, 12 - bobY, 6, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Bat Body
  ctx.fillStyle = '#2e1065';
  ctx.fillRect(-3, -4, 6, 8);
  ctx.fillStyle = '#4c1d95';
  ctx.fillRect(-2, -3, 4, 6);

  // Ears
  ctx.fillStyle = '#1e1b4b';
  ctx.fillRect(-3, -7, 2, 3);
  ctx.fillRect(1, -7, 2, 3);

  // Glowing Red Eyes
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(-2, -3, 1, 2);
  ctx.fillRect(1, -3, 1, 2);

  // Wings based on flap frame
  ctx.fillStyle = '#581c87';
  if (flapFrame === 0) {
    // Wings up
    ctx.fillRect(-9, -7, 6, 5);
    ctx.fillRect(3, -7, 6, 5);
    ctx.fillRect(-11, -5, 3, 4);
    ctx.fillRect(8, -5, 3, 4);
  } else if (flapFrame === 1) {
    // Wings flat
    ctx.fillRect(-11, -3, 8, 4);
    ctx.fillRect(3, -3, 8, 4);
    ctx.fillRect(-12, -2, 3, 3);
    ctx.fillRect(9, -2, 3, 3);
  } else {
    // Wings down
    ctx.fillRect(-9, -1, 6, 6);
    ctx.fillRect(3, -1, 6, 6);
    ctx.fillRect(-10, 1, 3, 4);
    ctx.fillRect(7, 1, 3, 4);
  }

  ctx.restore();
}
