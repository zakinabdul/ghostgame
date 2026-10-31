/**
 * Game types and data contracts for PUMPKIN – The Haunted Maze
 */

export type GameScreen = 
  | 'TITLE_MENU'
  | 'PLAYING'
  | 'PAUSED'
  | 'MAP_SELECT'
  | 'HOW_TO_PLAY'
  | 'HIGH_SCORES'
  | 'LEVEL_CLEAR'
  | 'GAME_OVER'
  | 'VICTORY';

export type TileType = 
  | 'WALL'
  | 'FLOOR'
  | 'PUMPKIN'
  | 'SUPER_PUMPKIN'
  | 'KEY_SILVER'
  | 'KEY_GOLD'
  | 'GATE_SILVER'
  | 'GATE_GOLD'
  | 'POTION_SPEED'
  | 'POTION_HOLY'
  | 'POTION_HEALTH'
  | 'TRAP_SPIKE'
  | 'TORCH_WALL'
  | 'PORTAL';

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface PlayerState {
  x: number; // pixel coords
  y: number;
  width: number;
  height: number;
  speed: number;
  baseSpeed: number;
  facing: Direction;
  isMoving: boolean;
  frame: number;
  animTimer: number;
  hp: number;
  maxHp: number;
  lives: number;
  score: number;
  keys: {
    silver: number;
    gold: number;
  };
  buffs: {
    speedTimer: number; // ms remaining
    holyTimer: number; // ms remaining (invulnerable & scares ghosts)
    lanternTimer: number; // ms remaining
  };
  invulnerableTimer: number; // after taking hit
  pumpkinsCollected: number;
  totalPumpkinsInLevel: number;
}

export type EnemyType = 'ghost' | 'skeleton' | 'bat';

export interface Enemy {
  id: string;
  type: EnemyType;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  vx: number;
  vy: number;
  facing: Direction;
  frame: number;
  animTimer: number;
  patrolAxis: 'horizontal' | 'vertical';
  patrolMin: number;
  patrolMax: number;
  state: 'patrol' | 'chase' | 'flee';
  glowColor: string;
  wobbleOffset: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  size: number;
  text?: string;
}

export interface LevelConfig {
  id: number;
  name: string;
  subtitle: string;
  description: string;
  gridWidth: number;
  gridHeight: number;
  mapData: string[];
  ambientColor: string;
  lightFlickerBase: number;
  requiredPumpkins: number;
  parTimeSeconds: number;
}

export interface HighScoreEntry {
  id: string;
  name: string;
  score: number;
  levelReached: number;
  date: string;
}

export interface GameSettings {
  sfxMuted: boolean;
  bgmMuted: boolean;
  sfxVolume: number;
  bgmVolume: number;
  crtFilter: boolean;
  ambientLight: boolean;
}
