import React from 'react';
import { Pause, Volume2, VolumeX, Shield, Zap, Key } from 'lucide-react';
import { PlayerState, LevelConfig, GameSettings } from '../types/game';
import { soundEngine } from '../utils/audio';

interface HUDProps {
  player: PlayerState;
  level: LevelConfig;
  settings: GameSettings;
  onPause: () => void;
  onToggleSound: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  player,
  level,
  settings,
  onPause,
  onToggleSound,
}) => {
  // Format score to 6-digit arcade number
  const formattedScore = player.score.toString().padStart(6, '0');

  // Pumpkin progress percentage
  const pumpkinPercent = Math.min(
    100,
    Math.round((player.pumpkinsCollected / (player.totalPumpkinsInLevel || 1)) * 100)
  );

  const isPortalReady = player.pumpkinsCollected >= player.totalPumpkinsInLevel;

  return (
    <div className="w-full bg-slate-950/95 border-b-2 border-orange-500/50 px-3 py-2 text-white font-pixel select-none shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
      {/* Top Row: Level Title, Score, Actions */}
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Level Name */}
        <div className="flex items-center gap-2">
          <span className="text-orange-400 bg-orange-950/80 px-2 py-0.5 border border-orange-600/40 rounded text-[10px]">
            LVL {level.id}
          </span>
          <span className="text-purple-200 tracking-wider hidden sm:inline text-[11px]">
            {level.name}
          </span>
        </div>

        {/* Arcade Score */}
        <div className="flex items-center gap-2 bg-slate-900 px-2.5 py-1 rounded border border-slate-700">
          <span className="text-[9px] text-slate-400">SCORE</span>
          <span className="text-amber-400 font-bold tracking-widest text-xs sm:text-sm">
            {formattedScore}
          </span>
        </div>

        {/* Lives & HP */}
        <div className="flex items-center gap-3">
          {/* Remaining Lives */}
          <div className="flex items-center gap-1" title="Remaining Lives">
            <span className="text-[10px] text-slate-400 mr-1">LIVES</span>
            {Array.from({ length: 3 }).map((_, idx) => (
              <span
                key={idx}
                className={`text-sm ${idx < player.lives ? 'text-red-500 animate-pulse' : 'text-slate-700'}`}
              >
                ❤️
              </span>
            ))}
          </div>

          {/* Health Gauge */}
          <div className="flex items-center gap-1.5" title={`Health: ${player.hp}/${player.maxHp}`}>
            <span className="text-[10px] text-slate-400">HP</span>
            <div className="flex gap-0.5 bg-slate-900 p-0.5 border border-slate-700 rounded">
              {Array.from({ length: player.maxHp }).map((_, idx) => (
                <div
                  key={idx}
                  className={`w-3.5 h-3 rounded-sm ${
                    idx < player.hp
                      ? 'bg-gradient-to-t from-red-600 to-rose-400 shadow-[0_0_6px_rgba(239,68,68,0.8)]'
                      : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Quick Audio & Pause Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                soundEngine.playMenuBeep(440);
                onToggleSound();
              }}
              className="p-1.5 bg-slate-900 border border-slate-700 rounded text-slate-300 hover:text-orange-400 hover:border-orange-500 transition cursor-pointer"
              title="Toggle Sound"
            >
              {settings.sfxMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => {
                soundEngine.playMenuBeep(520);
                onPause();
              }}
              className="px-2 py-1 bg-orange-600 hover:bg-orange-500 text-slate-950 font-bold border border-orange-300 rounded flex items-center gap-1 transition cursor-pointer"
              title="Pause Game (ESC / P)"
            >
              <Pause className="w-3 h-3" />
              <span className="text-[10px] hidden md:inline">PAUSE</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Sub-Row: Pumpkins Meter, Keys, Active Buffs */}
      <div className="max-w-5xl mx-auto mt-2 pt-1.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-[10px]">
        {/* Pumpkin Objective Progress */}
        <div className="flex items-center gap-2">
          <span className="text-orange-400 text-sm">🎃</span>
          <span className="text-slate-300">
            {player.pumpkinsCollected} / {player.totalPumpkinsInLevel}
          </span>
          <div className="w-20 sm:w-28 h-2 bg-slate-900 border border-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isPortalReady
                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                  : 'bg-gradient-to-r from-orange-500 to-amber-400'
              }`}
              style={{ width: `${pumpkinPercent}%` }}
            />
          </div>
          {isPortalReady ? (
            <span className="text-emerald-400 text-[9px] animate-pulse font-bold">
              PORTAL OPEN! 🌀
            </span>
          ) : (
            <span className="text-slate-500 text-[9px]">GATHER ALL</span>
          )}
        </div>

        {/* Keys Inventory */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded border ${
              player.keys.silver > 0
                ? 'bg-slate-800 text-slate-100 border-slate-400'
                : 'bg-slate-950 text-slate-600 border-slate-800'
            }`}
          >
            <Key className="w-3 h-3" />
            <span>SILVER: {player.keys.silver}</span>
          </div>

          <div
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded border ${
              player.keys.gold > 0
                ? 'bg-amber-950 text-amber-300 border-amber-500'
                : 'bg-slate-950 text-slate-600 border-slate-800'
            }`}
          >
            <Key className="w-3 h-3 text-amber-400" />
            <span>GOLD: {player.keys.gold}</span>
          </div>
        </div>

        {/* Active Buffs (Speed / Holy Shield) */}
        <div className="flex items-center gap-2">
          {player.buffs.speedTimer > 0 && (
            <div className="flex items-center gap-1 px-2 py-0.5 bg-purple-950/80 border border-purple-500/60 rounded text-purple-300 animate-pulse">
              <Zap className="w-3 h-3" />
              <span>SPEED {Math.ceil(player.buffs.speedTimer / 1000)}s</span>
            </div>
          )}

          {player.buffs.holyTimer > 0 && (
            <div className="flex items-center gap-1 px-2 py-0.5 bg-sky-950/80 border border-sky-400/60 rounded text-sky-200 animate-pulse">
              <Shield className="w-3 h-3" />
              <span>HOLY {Math.ceil(player.buffs.holyTimer / 1000)}s</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
