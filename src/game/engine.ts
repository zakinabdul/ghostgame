/**
 * Core Canvas Game Engine for PUMPKIN – The Haunted Maze
 */

import { Direction, Enemy, GameSettings, LevelConfig, Particle, PlayerState } from '../types/game';
import { soundEngine } from '../utils/audio';
import { getLevelEnemies } from './levels';
import {
  drawFloorTile,
  drawGate,
  drawGhost,
  drawKey,
  drawPlayer,
  drawPortal,
  drawPotion,
  drawPumpkin,
  drawSkeleton,
  drawBat,
  drawSpikes,
  drawWallTile,
  drawWallTorch
} from './sprites';

export const TILE_SIZE = 36;

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animId: number | null = null;
  private lastTime: number = 0;

  public level: LevelConfig;
  public grid: string[][];
  public player: PlayerState;
  public enemies: Enemy[] = [];
  public particles: Particle[] = [];

  // Spikes trap cycle timer (ms)
  private spikeTimer: number = 0;
  private spikeState: 'retracted' | 'warning' | 'extended' = 'retracted';

  // Camera viewport
  public cameraX: number = 0;
  public cameraY: number = 0;
  public screenShake: number = 0;

  // Level stats
  public levelTimeElapsed: number = 0;
  public isLevelCompleted: boolean = false;
  public isGameOver: boolean = false;

  // Callbacks to UI
  public onStateUpdate?: () => void;
  public onLevelClear?: (stats: { time: number; score: number; pumpkins: number }) => void;
  public onGameOver?: (score: number) => void;

  // Input states
  private keysDown: Set<string> = new Set();
  public virtualDir: Direction | null = null;

  // Settings
  public settings: GameSettings;

  constructor(canvas: HTMLCanvasElement, level: LevelConfig, settings: GameSettings, savedPlayerStats?: { score: number; lives: number }) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D canvas context');
    this.ctx = ctx;
    this.level = level;
    this.settings = settings;

    // Build mutable grid and find player start
    this.grid = level.mapData.map(row => row.split(''));
    let startX = 1 * TILE_SIZE;
    let startY = 1 * TILE_SIZE;
    let pumpkinCount = 0;

    for (let r = 0; r < this.grid.length; r++) {
      for (let c = 0; c < this.grid[r].length; c++) {
        const char = this.grid[r][c];
        if (char === '@') {
          startX = c * TILE_SIZE;
          startY = r * TILE_SIZE;
          this.grid[r][c] = '.'; // Empty floor under player
        } else if (char === 'P' || char === 'S') {
          pumpkinCount++;
        }
      }
    }

    // Initialize player state
    this.player = {
      x: startX + 4,
      y: startY + 4,
      width: 24,
      height: 26,
      speed: 2.3,
      baseSpeed: 2.3,
      facing: 'down',
      isMoving: false,
      frame: 0,
      animTimer: 0,
      hp: 3,
      maxHp: 3,
      lives: savedPlayerStats ? savedPlayerStats.lives : 3,
      score: savedPlayerStats ? savedPlayerStats.score : 0,
      keys: { silver: 0, gold: 0 },
      buffs: { speedTimer: 0, holyTimer: 0, lanternTimer: 0 },
      invulnerableTimer: 0,
      pumpkinsCollected: 0,
      totalPumpkinsInLevel: pumpkinCount,
    };

    // Load enemies for this level
    this.enemies = getLevelEnemies(level.id, TILE_SIZE);

    this.bindInputs();
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    // Prevent default scroll keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space'].includes(e.code)) {
      e.preventDefault();
    }
    this.keysDown.add(e.code);
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keysDown.delete(e.code);
  };

  private bindInputs() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  public unbindInputs() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  public setVirtualDirection(dir: Direction | null) {
    this.virtualDir = dir;
  }

  public start() {
    this.lastTime = performance.now();
    const loop = (time: number) => {
      const dt = Math.min((time - this.lastTime) / 1000, 0.1);
      this.lastTime = time;

      this.update(dt);
      this.render();

      if (!this.isGameOver && !this.isLevelCompleted) {
        this.animId = requestAnimationFrame(loop);
      }
    };
    this.animId = requestAnimationFrame(loop);
  }

  public stop() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  // --- Collision & Physics ---

  private isTileBlocked(tileX: number, tileY: number): boolean {
    if (tileY < 0 || tileY >= this.grid.length || tileX < 0 || tileX >= this.grid[0].length) {
      return true;
    }
    const tile = this.grid[tileY][tileX];
    if (tile === '#' || tile === 'T') return true;
    if (tile === 'g' || tile === 'G') return true; // Closed gates block movement
    return false;
  }

  private checkWallCollision(px: number, py: number, w: number, h: number): boolean {
    // 4 corners of bounding box with 2px inset
    const inset = 3;
    const corners = [
      { x: px + inset, y: py + inset },
      { x: px + w - inset, y: py + inset },
      { x: px + inset, y: py + h - inset },
      { x: px + w - inset, y: py + h - inset }
    ];

    for (const c of corners) {
      const tx = Math.floor(c.x / TILE_SIZE);
      const ty = Math.floor(c.y / TILE_SIZE);
      if (this.isTileBlocked(tx, ty)) {
        return true;
      }
    }
    return false;
  }

  // --- Main Update Loop ---

  private update(dt: number) {
    if (this.isGameOver || this.isLevelCompleted) return;

    this.levelTimeElapsed += dt;

    // Update Timers
    if (this.player.buffs.speedTimer > 0) {
      this.player.buffs.speedTimer -= dt * 1000;
      this.player.speed = this.player.baseSpeed * 1.5;
    } else {
      this.player.speed = this.player.baseSpeed;
    }

    if (this.player.buffs.holyTimer > 0) {
      this.player.buffs.holyTimer -= dt * 1000;
    }

    if (this.player.buffs.lanternTimer > 0) {
      this.player.buffs.lanternTimer -= dt * 1000;
    }

    if (this.player.invulnerableTimer > 0) {
      this.player.invulnerableTimer -= dt * 1000;
    }

    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 25);
    }

    // Update Spike Traps Cycle (2.4s total: 1.2s retracted, 0.4s warning, 0.8s extended)
    this.spikeTimer = (this.spikeTimer + dt) % 2.4;
    if (this.spikeTimer < 1.2) {
      this.spikeState = 'retracted';
    } else if (this.spikeTimer < 1.6) {
      this.spikeState = 'warning';
    } else {
      this.spikeState = 'extended';
    }

    // Process Player Movement
    let dx = 0;
    let dy = 0;

    if (this.keysDown.has('ArrowUp') || this.keysDown.has('KeyW') || this.virtualDir === 'up') {
      dy -= 1;
      this.player.facing = 'up';
    }
    if (this.keysDown.has('ArrowDown') || this.keysDown.has('KeyS') || this.virtualDir === 'down') {
      dy += 1;
      this.player.facing = 'down';
    }
    if (this.keysDown.has('ArrowLeft') || this.keysDown.has('KeyA') || this.virtualDir === 'left') {
      dx -= 1;
      this.player.facing = 'left';
    }
    if (this.keysDown.has('ArrowRight') || this.keysDown.has('KeyD') || this.virtualDir === 'right') {
      dx += 1;
      this.player.facing = 'right';
    }

    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
      dx *= 0.7071;
      dy *= 0.7071;
    }

    this.player.isMoving = dx !== 0 || dy !== 0;

    if (this.player.isMoving) {
      this.player.animTimer += dt * 8;
      this.player.frame = Math.floor(this.player.animTimer);

      const moveStepX = dx * this.player.speed * 60 * dt;
      const moveStepY = dy * this.player.speed * 60 * dt;

      // Smooth axis-separated movement & corner sliding
      let nextX = this.player.x + moveStepX;
      let nextY = this.player.y + moveStepY;

      // X movement check
      if (!this.checkWallCollision(nextX, this.player.y, this.player.width, this.player.height)) {
        this.player.x = nextX;
      } else {
        // Corner sliding assist along Y if moving against wall corner
        if (dy === 0) {
          const centerY = this.player.y + this.player.height / 2;
          const currentTileY = Math.floor(centerY / TILE_SIZE);
          const tileCenterY = currentTileY * TILE_SIZE + TILE_SIZE / 2;
          const diff = tileCenterY - centerY;
          if (Math.abs(diff) > 2) {
            const slideY = Math.sign(diff) * 1.5;
            if (!this.checkWallCollision(this.player.x, this.player.y + slideY, this.player.width, this.player.height)) {
              this.player.y += slideY;
            }
          }
        }
      }

      // Y movement check
      if (!this.checkWallCollision(this.player.x, nextY, this.player.width, this.player.height)) {
        this.player.y = nextY;
      } else {
        // Corner sliding assist along X
        if (dx === 0) {
          const centerX = this.player.x + this.player.width / 2;
          const currentTileX = Math.floor(centerX / TILE_SIZE);
          const tileCenterX = currentTileX * TILE_SIZE + TILE_SIZE / 2;
          const diff = tileCenterX - centerX;
          if (Math.abs(diff) > 2) {
            const slideX = Math.sign(diff) * 1.5;
            if (!this.checkWallCollision(this.player.x + slideX, this.player.y, this.player.width, this.player.height)) {
              this.player.x += slideX;
            }
          }
        }
      }
    }

    // Check Tile Under Player Center
    const centerTileX = Math.floor((this.player.x + this.player.width / 2) / TILE_SIZE);
    const centerTileY = Math.floor((this.player.y + this.player.height / 2) / TILE_SIZE);

    if (centerTileY >= 0 && centerTileY < this.grid.length && centerTileX >= 0 && centerTileX < this.grid[0].length) {
      const tile = this.grid[centerTileY][centerTileX];

      // Collect Pumpkin
      if (tile === 'P') {
        this.grid[centerTileY][centerTileX] = '.';
        this.player.pumpkinsCollected++;
        this.player.score += 100;
        soundEngine.playPumpkinCollect();
        this.spawnTextParticle(centerTileX * TILE_SIZE + 18, centerTileY * TILE_SIZE, '+100', '#f97316');
        this.spawnBurstParticles(centerTileX * TILE_SIZE + 18, centerTileY * TILE_SIZE + 18, '#fb923c', 8);
      }
      // Collect Super Pumpkin
      else if (tile === 'S') {
        this.grid[centerTileY][centerTileX] = '.';
        this.player.pumpkinsCollected++;
        this.player.score += 500;
        soundEngine.playSuperPumpkinCollect();
        this.spawnTextParticle(centerTileX * TILE_SIZE + 18, centerTileY * TILE_SIZE, 'SUPER PUMPKIN! +500', '#facc15');
        this.spawnBurstParticles(centerTileX * TILE_SIZE + 18, centerTileY * TILE_SIZE + 18, '#fde047', 16);
      }
      // Collect Silver Key
      else if (tile === 'k') {
        this.grid[centerTileY][centerTileX] = '.';
        this.player.keys.silver++;
        this.player.score += 250;
        soundEngine.playKeyPickup();
        this.spawnTextParticle(centerTileX * TILE_SIZE + 18, centerTileY * TILE_SIZE, 'SILVER KEY!', '#e2e8f0');
        this.spawnBurstParticles(centerTileX * TILE_SIZE + 18, centerTileY * TILE_SIZE + 18, '#e2e8f0', 10);
      }
      // Collect Gold Key
      else if (tile === 'K') {
        this.grid[centerTileY][centerTileX] = '.';
        this.player.keys.gold++;
        this.player.score += 350;
        soundEngine.playKeyPickup();
        this.spawnTextParticle(centerTileX * TILE_SIZE + 18, centerTileY * TILE_SIZE, 'GOLD KEY!', '#fbbf24');
        this.spawnBurstParticles(centerTileX * TILE_SIZE + 18, centerTileY * TILE_SIZE + 18, '#fbbf24', 12);
      }
      // Speed Potion
      else if (tile === 's') {
        this.grid[centerTileY][centerTileX] = '.';
        this.player.buffs.speedTimer = 10000; // 10s
        this.player.score += 150;
        soundEngine.playPowerup();
        this.spawnTextParticle(centerTileX * TILE_SIZE + 18, centerTileY * TILE_SIZE, 'SPEED BOOST!', '#c084fc');
        this.spawnBurstParticles(centerTileX * TILE_SIZE + 18, centerTileY * TILE_SIZE + 18, '#c084fc', 12);
      }
      // Holy Water
      else if (tile === 'h') {
        this.grid[centerTileY][centerTileX] = '.';
        this.player.buffs.holyTimer = 12000; // 12s
        this.player.score += 200;
        soundEngine.playPowerup();
        this.spawnTextParticle(centerTileX * TILE_SIZE + 18, centerTileY * TILE_SIZE, 'HOLY SHIELD!', '#38bdf8');
        this.spawnBurstParticles(centerTileX * TILE_SIZE + 18, centerTileY * TILE_SIZE + 18, '#38bdf8', 14);
      }
      // Health Potion
      else if (tile === '+') {
        this.grid[centerTileY][centerTileX] = '.';
        if (this.player.hp < this.player.maxHp) {
          this.player.hp++;
        } else {
          this.player.score += 300;
        }
        soundEngine.playPowerup();
        this.spawnTextParticle(centerTileX * TILE_SIZE + 18, centerTileY * TILE_SIZE, '+1 HEALTH!', '#ef4444');
        this.spawnBurstParticles(centerTileX * TILE_SIZE + 18, centerTileY * TILE_SIZE + 18, '#ef4444', 10);
      }
      // Spikes Damage Check
      else if (tile === '^' && this.spikeState === 'extended') {
        if (this.player.invulnerableTimer <= 0 && this.player.buffs.holyTimer <= 0) {
          this.damagePlayer(1);
          soundEngine.playSpikeTrap();
          this.spawnTextParticle(this.player.x + 12, this.player.y, 'SPIKES! -1 HP', '#dc2626');
        }
      }
      // Exit Portal Check
      else if (tile === 'E') {
        const canExit = this.player.pumpkinsCollected >= this.player.totalPumpkinsInLevel;
        if (canExit && !this.isLevelCompleted) {
          this.completeLevel();
        }
      }
    }

    // Check Proximity to Gates for Auto-Unlock
    this.checkGateUnlocking();

    // Update Enemies
    this.updateEnemies(dt);

    // Update Particles
    this.updateParticles(dt);

    // Update Camera
    this.updateCamera();

    if (this.onStateUpdate) {
      this.onStateUpdate();
    }
  }

  // --- Gate Unlocking Logic ---

  private checkGateUnlocking() {
    const pTileX = Math.floor((this.player.x + this.player.width / 2) / TILE_SIZE);
    const pTileY = Math.floor((this.player.y + this.player.height / 2) / TILE_SIZE);

    // Look at adjacent tiles
    const adjacent = [
      { x: pTileX + 1, y: pTileY },
      { x: pTileX - 1, y: pTileY },
      { x: pTileX, y: pTileY + 1 },
      { x: pTileX, y: pTileY - 1 }
    ];

    for (const pos of adjacent) {
      if (pos.y >= 0 && pos.y < this.grid.length && pos.x >= 0 && pos.x < this.grid[0].length) {
        const t = this.grid[pos.y][pos.x];
        if (t === 'g' && this.player.keys.silver > 0) {
          this.player.keys.silver--;
          this.grid[pos.y][pos.x] = '.';
          this.player.score += 200;
          soundEngine.playGateOpen();
          this.spawnTextParticle(pos.x * TILE_SIZE + 18, pos.y * TILE_SIZE, 'GATE OPENED!', '#e2e8f0');
          this.spawnBurstParticles(pos.x * TILE_SIZE + 18, pos.y * TILE_SIZE + 18, '#94a3b8', 16);
          this.screenShake = 6;
        } else if (t === 'G' && this.player.keys.gold > 0) {
          this.player.keys.gold--;
          this.grid[pos.y][pos.x] = '.';
          this.player.score += 300;
          soundEngine.playGateOpen();
          this.spawnTextParticle(pos.x * TILE_SIZE + 18, pos.y * TILE_SIZE, 'ROYAL GATE OPENED!', '#fbbf24');
          this.spawnBurstParticles(pos.x * TILE_SIZE + 18, pos.y * TILE_SIZE + 18, '#fbbf24', 20);
          this.screenShake = 8;
        }
      }
    }
  }

  // --- Enemies AI ---

  private updateEnemies(dt: number) {
    const isHoly = this.player.buffs.holyTimer > 0;

    for (const enemy of this.enemies) {
      enemy.animTimer += dt * 4;
      enemy.frame = Math.floor(enemy.animTimer);

      if (enemy.type === 'bat') {
        // Bats flutter fast along patrol axis with sinusoidal wave
        if (enemy.patrolAxis === 'horizontal') {
          enemy.x += enemy.vx * 60 * dt;
          if (enemy.x <= enemy.patrolMin || enemy.x >= enemy.patrolMax) {
            enemy.vx = -enemy.vx;
          }
        } else {
          enemy.y += enemy.vy * 60 * dt;
          if (enemy.y <= enemy.patrolMin || enemy.y >= enemy.patrolMax) {
            enemy.vy = -enemy.vy;
          }
        }
      } else if (enemy.type === 'skeleton') {
        // Skeletons patrol steadily and reverse on hitting walls/boundaries
        if (enemy.patrolAxis === 'horizontal') {
          const nextX = enemy.x + enemy.vx * 60 * dt;
          if (nextX <= enemy.patrolMin || nextX >= enemy.patrolMax || this.checkWallCollision(nextX, enemy.y, enemy.width, enemy.height)) {
            enemy.vx = -enemy.vx;
          } else {
            enemy.x = nextX;
          }
        } else {
          const nextY = enemy.y + enemy.vy * 60 * dt;
          if (nextY <= enemy.patrolMin || nextY >= enemy.patrolMax || this.checkWallCollision(enemy.x, nextY, enemy.width, enemy.height)) {
            enemy.vy = -enemy.vy;
          } else {
            enemy.y = nextY;
          }
        }
      } else if (enemy.type === 'ghost') {
        // Ghost AI: If player is within lantern glow (distance < 140px), ghost tracks or flees
        const distX = (this.player.x + 12) - (enemy.x + 12);
        const distY = (this.player.y + 12) - (enemy.y + 12);
        const dist = Math.hypot(distX, distY);

        if (dist < 130) {
          enemy.state = isHoly ? 'flee' : 'chase';
          const angle = Math.atan2(distY, distX);
          const mult = isHoly ? -1 : 1;
          const chaseSpeed = enemy.speed * 0.95;

          const gNextX = enemy.x + Math.cos(angle) * chaseSpeed * mult * 60 * dt;
          const gNextY = enemy.y + Math.sin(angle) * chaseSpeed * mult * 60 * dt;

          // Ghosts can phase slightly through thin corridors, but stay in maze bounds
          if (!this.checkWallCollision(gNextX, enemy.y, enemy.width, enemy.height)) {
            enemy.x = gNextX;
          }
          if (!this.checkWallCollision(enemy.x, gNextY, enemy.width, enemy.height)) {
            enemy.y = gNextY;
          }
        } else {
          // Standard patrol
          enemy.state = 'patrol';
          if (enemy.patrolAxis === 'horizontal') {
            const nextX = enemy.x + enemy.vx * 60 * dt;
            if (nextX <= enemy.patrolMin || nextX >= enemy.patrolMax || this.checkWallCollision(nextX, enemy.y, enemy.width, enemy.height)) {
              enemy.vx = -enemy.vx;
            } else {
              enemy.x = nextX;
            }
          } else {
            const nextY = enemy.y + enemy.vy * 60 * dt;
            if (nextY <= enemy.patrolMin || nextY >= enemy.patrolMax || this.checkWallCollision(enemy.x, nextY, enemy.width, enemy.height)) {
              enemy.vy = -enemy.vy;
            } else {
              enemy.y = nextY;
            }
          }
        }
      }

      // Check collision with player
      const overlapX = Math.abs((enemy.x + enemy.width / 2) - (this.player.x + this.player.width / 2)) < (enemy.width + this.player.width) / 2 - 4;
      const overlapY = Math.abs((enemy.y + enemy.height / 2) - (this.player.y + this.player.height / 2)) < (enemy.height + this.player.height) / 2 - 4;

      if (overlapX && overlapY) {
        if (isHoly) {
          // Player banishes enemy with holy aura!
          this.player.score += 200;
          soundEngine.playPowerup();
          this.spawnTextParticle(enemy.x, enemy.y, 'BANISHED! +200', '#38bdf8');
          this.spawnBurstParticles(enemy.x + 12, enemy.y + 12, '#38bdf8', 15);
          // Teleport enemy back to patrol min
          if (enemy.patrolAxis === 'horizontal') {
            enemy.x = enemy.patrolMin;
          } else {
            enemy.y = enemy.patrolMin;
          }
        } else if (this.player.invulnerableTimer <= 0) {
          this.damagePlayer(1);
          this.spawnTextParticle(this.player.x, this.player.y, '-1 HP!', '#ef4444');
        }
      }
    }
  }

  // --- Damage & Death ---

  private damagePlayer(amount: number) {
    this.player.hp -= amount;
    this.player.invulnerableTimer = 1600; // 1.6s invulnerability flash
    this.screenShake = 12;
    soundEngine.playPlayerHurt();

    if (this.player.hp <= 0) {
      this.player.lives--;
      if (this.player.lives > 0) {
        // Respawn at level start
        this.player.hp = this.player.maxHp;
        this.resetPlayerToStart();
        this.spawnTextParticle(this.player.x, this.player.y, 'RESPAWNED!', '#facc15');
      } else {
        // Game Over!
        this.isGameOver = true;
        soundEngine.playGameOver();
        if (this.onGameOver) {
          this.onGameOver(this.player.score);
        }
      }
    }
  }

  private resetPlayerToStart() {
    for (let r = 0; r < this.level.mapData.length; r++) {
      for (let c = 0; c < this.level.mapData[r].length; c++) {
        if (this.level.mapData[r][c] === '@') {
          this.player.x = c * TILE_SIZE + 4;
          this.player.y = r * TILE_SIZE + 4;
          return;
        }
      }
    }
  }

  private completeLevel() {
    this.isLevelCompleted = true;
    soundEngine.playLevelComplete();

    // Time bonus
    const parTime = this.level.parTimeSeconds;
    const timeTaken = Math.floor(this.levelTimeElapsed);
    const timeBonus = Math.max(0, (parTime - timeTaken) * 20);
    this.player.score += 500 + timeBonus;

    this.spawnBurstParticles(this.player.x + 12, this.player.y + 12, '#34d399', 30);

    if (this.onLevelClear) {
      this.onLevelClear({
        time: timeTaken,
        score: this.player.score,
        pumpkins: this.player.pumpkinsCollected,
      });
    }
  }

  // --- Camera & Viewport ---

  private updateCamera() {
    const mapPixelWidth = this.grid[0].length * TILE_SIZE;
    const mapPixelHeight = this.grid.length * TILE_SIZE;

    const targetX = this.player.x + this.player.width / 2 - this.canvas.width / 2;
    const targetY = this.player.y + this.player.height / 2 - this.canvas.height / 2;

    // Smooth camera lerp
    this.cameraX += (targetX - this.cameraX) * 0.1;
    this.cameraY += (targetY - this.cameraY) * 0.1;

    // Bounds clamping
    const maxCamX = Math.max(0, mapPixelWidth - this.canvas.width);
    const maxCamY = Math.max(0, mapPixelHeight - this.canvas.height);

    this.cameraX = Math.max(0, Math.min(this.cameraX, maxCamX));
    this.cameraY = Math.max(0, Math.min(this.cameraY, maxCamY));
  }

  // --- Particles ---

  private spawnTextParticle(x: number, y: number, text: string, color: string) {
    this.particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 1,
      vy: -1.2,
      color,
      alpha: 1,
      life: 0,
      maxLife: 1.2,
      size: 11,
      text,
    });
  }

  private spawnBurstParticles(x: number, y: number, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 2.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        alpha: 1,
        life: 0,
        maxLife: 0.6 + Math.random() * 0.5,
        size: 2 + Math.random() * 3,
      });
    }
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      p.x += p.vx * 60 * dt;
      p.y += p.vy * 60 * dt;
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }
  }

  // --- Rendering Pass ---

  public render() {
    const time = performance.now() / 1000;
    const ctx = this.ctx;

    // Apply screen shake
    ctx.save();
    if (this.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * this.screenShake;
      const shakeY = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(shakeX, shakeY);
    }

    // Clear background
    ctx.fillStyle = this.level.ambientColor;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.save();
    ctx.translate(-Math.floor(this.cameraX), -Math.floor(this.cameraY));

    // Visible tile range
    const startCol = Math.max(0, Math.floor(this.cameraX / TILE_SIZE));
    const endCol = Math.min(this.grid[0].length, Math.ceil((this.cameraX + this.canvas.width) / TILE_SIZE) + 1);
    const startRow = Math.max(0, Math.floor(this.cameraY / TILE_SIZE));
    const endRow = Math.min(this.grid.length, Math.ceil((this.cameraY + this.canvas.height) / TILE_SIZE) + 1);

    // 1. Draw Floor Tiles
    for (let r = startRow; r < endRow; r++) {
      for (let c = startCol; c < endCol; c++) {
        const x = c * TILE_SIZE;
        const y = r * TILE_SIZE;
        drawFloorTile(ctx, x, y, TILE_SIZE, r, c);
      }
    }

    // 2. Draw Floor Traps / Portal / Items
    const isPortalOpen = this.player.pumpkinsCollected >= this.player.totalPumpkinsInLevel;

    for (let r = startRow; r < endRow; r++) {
      for (let c = startCol; c < endCol; c++) {
        const x = c * TILE_SIZE;
        const y = r * TILE_SIZE;
        const tile = this.grid[r][c];

        if (tile === '^') {
          drawSpikes(ctx, x, y, TILE_SIZE, this.spikeState);
        } else if (tile === 'E') {
          drawPortal(ctx, x, y, TILE_SIZE, isPortalOpen, time);
        } else if (tile === 'P') {
          drawPumpkin(ctx, x, y, TILE_SIZE, time, false);
        } else if (tile === 'S') {
          drawPumpkin(ctx, x, y, TILE_SIZE, time, true);
        } else if (tile === 'k') {
          drawKey(ctx, x, y, TILE_SIZE, false, time);
        } else if (tile === 'K') {
          drawKey(ctx, x, y, TILE_SIZE, true, time);
        } else if (tile === 's') {
          drawPotion(ctx, x, y, TILE_SIZE, 'speed', time);
        } else if (tile === 'h') {
          drawPotion(ctx, x, y, TILE_SIZE, 'holy', time);
        } else if (tile === '+') {
          drawPotion(ctx, x, y, TILE_SIZE, 'health', time);
        }
      }
    }

    // 3. Draw Enemies
    for (const enemy of this.enemies) {
      if (enemy.type === 'ghost') {
        const isFleeing = this.player.buffs.holyTimer > 0;
        drawGhost(ctx, enemy, time, isFleeing);
      } else if (enemy.type === 'skeleton') {
        drawSkeleton(ctx, enemy, time);
      } else if (enemy.type === 'bat') {
        drawBat(ctx, enemy, time);
      }
    }

    // 4. Draw Player
    drawPlayer(ctx, this.player, time);

    // 5. Draw Walls, Wall Torches, and Gates (layered over entities for depth)
    for (let r = startRow; r < endRow; r++) {
      for (let c = startCol; c < endCol; c++) {
        const x = c * TILE_SIZE;
        const y = r * TILE_SIZE;
        const tile = this.grid[r][c];

        if (tile === '#') {
          drawWallTile(ctx, x, y, TILE_SIZE, r, c);
        } else if (tile === 'T') {
          drawWallTile(ctx, x, y, TILE_SIZE, r, c);
          drawWallTorch(ctx, x, y, TILE_SIZE, time);
        } else if (tile === 'g') {
          drawGate(ctx, x, y, TILE_SIZE, false);
        } else if (tile === 'G') {
          drawGate(ctx, x, y, TILE_SIZE, true);
        }
      }
    }

    // 6. Atmospheric Lighting & Lantern Fog Layer
    if (this.settings.ambientLight) {
      this.renderLightingLayer(ctx, time, startRow, endRow, startCol, endCol);
    }

    // 7. Draw Floating Particles & Score Texts
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      if (p.text) {
        ctx.font = 'bold 10px "Press Start 2P", monospace';
        ctx.fillStyle = '#000000';
        ctx.fillText(p.text, p.x + 1, p.y + 1);
        ctx.fillStyle = p.color;
        ctx.fillText(p.text, p.x, p.y);
      } else {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
      ctx.restore();
    }

    ctx.restore(); // Restore camera translation
    ctx.restore(); // Restore screen shake
  }

  // --- Dynamic Lighting Pass ---

  private renderLightingLayer(
    ctx: CanvasRenderingContext2D,
    time: number,
    startRow: number,
    endRow: number,
    startCol: number,
    endCol: number
  ) {
    // Create dark shroud overlay
    const flicker = Math.sin(time * 12) * 4 + Math.cos(time * 23) * 3;

    // Player lantern radius
    const baseRadius = this.player.buffs.holyTimer > 0 ? 170 : 125;
    const playerRadius = baseRadius + flicker;
    const playerCenterX = this.player.x + this.player.width / 2;
    const playerCenterY = this.player.y + this.player.height / 2;

    // Radial gradient for player light
    const playerLight = ctx.createRadialGradient(
      playerCenterX,
      playerCenterY,
      10,
      playerCenterX,
      playerCenterY,
      playerRadius
    );
    if (this.player.buffs.holyTimer > 0) {
      playerLight.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
      playerLight.addColorStop(0.6, 'rgba(125, 211, 252, 0.2)');
      playerLight.addColorStop(1, 'rgba(0, 0, 0, 0)');
    } else {
      playerLight.addColorStop(0, 'rgba(255, 170, 40, 0.45)');
      playerLight.addColorStop(0.5, 'rgba(234, 88, 12, 0.22)');
      playerLight.addColorStop(1, 'rgba(0, 0, 0, 0)');
    }

    ctx.save();
    ctx.fillStyle = playerLight;
    ctx.beginPath();
    ctx.arc(playerCenterX, playerCenterY, playerRadius, 0, Math.PI * 2);
    ctx.fill();

    // Torches & Pumpkins Ambient Light
    for (let r = startRow; r < endRow; r++) {
      for (let c = startCol; c < endCol; c++) {
        const tile = this.grid[r][c];
        if (tile === 'T') {
          const tx = c * TILE_SIZE + TILE_SIZE / 2;
          const ty = r * TILE_SIZE + TILE_SIZE / 2;
          const tRadius = 75 + Math.sin(time * 10 + (r + c)) * 6;
          const tGrad = ctx.createRadialGradient(tx, ty, 6, tx, ty, tRadius);
          tGrad.addColorStop(0, 'rgba(249, 115, 22, 0.35)');
          tGrad.addColorStop(0.7, 'rgba(180, 83, 9, 0.12)');
          tGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = tGrad;
          ctx.beginPath();
          ctx.arc(tx, ty, tRadius, 0, Math.PI * 2);
          ctx.fill();
        } else if (tile === 'P' || tile === 'S') {
          const px = c * TILE_SIZE + TILE_SIZE / 2;
          const py = r * TILE_SIZE + TILE_SIZE / 2;
          const pRadius = tile === 'S' ? 65 : 45;
          const pGrad = ctx.createRadialGradient(px, py, 4, px, py, pRadius);
          pGrad.addColorStop(0, tile === 'S' ? 'rgba(250, 204, 21, 0.35)' : 'rgba(249, 115, 22, 0.28)');
          pGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = pGrad;
          ctx.beginPath();
          ctx.arc(px, py, pRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    ctx.restore();
  }
}
