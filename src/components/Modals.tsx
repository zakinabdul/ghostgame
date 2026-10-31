import React, { useState } from 'react';
import { X, Play, RotateCcw, Home, Volume2, VolumeX, Music, Award, ArrowRight, Shield, Zap, Sparkles } from 'lucide-react';
import { LevelConfig, HighScoreEntry, GameSettings } from '../types/game';
import { LEVELS } from '../game/levels';
import { soundEngine } from '../utils/audio';

// --- MAP SELECT MODAL ---
interface MapSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLevel: (lvl: LevelConfig) => void;
  highestLevelUnlocked: number;
}

export const MapSelectModal: React.FC<MapSelectModalProps> = ({
  isOpen,
  onClose,
  onSelectLevel,
  highestLevelUnlocked,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-slate-950 border-2 border-orange-500 rounded-lg p-5 font-pixel text-white shadow-[0_0_30px_rgba(249,115,22,0.4)] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-orange-500/40 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🗺️</span>
            <h2 className="text-sm sm:text-base text-orange-400">CHOOSE HAUNTED LABYRINTH</h2>
          </div>
          <button
            onClick={() => {
              soundEngine.playMenuBeep(440);
              onClose();
            }}
            className="p-1 hover:text-orange-400 text-slate-400 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Level Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {LEVELS.map((lvl) => {
            const isUnlocked = lvl.id <= highestLevelUnlocked;

            return (
              <div
                key={lvl.id}
                className={`p-3.5 rounded border transition flex flex-col justify-between ${
                  isUnlocked
                    ? 'bg-slate-900 border-orange-500/60 hover:border-orange-400 hover:bg-slate-800/80 cursor-pointer'
                    : 'bg-slate-950/60 border-slate-800 opacity-60 cursor-not-allowed'
                }`}
                onClick={() => {
                  if (isUnlocked) {
                    soundEngine.playMenuBeep(600);
                    onSelectLevel(lvl);
                  }
                }}
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-orange-400 font-bold">LEVEL {lvl.id}</span>
                    <span className="text-[10px] text-slate-400">
                      {isUnlocked ? `🎃 ${lvl.requiredPumpkins} PUMPKINS` : '🔒 LOCKED'}
                    </span>
                  </div>

                  <h3 className="text-xs text-purple-200 mb-1">{lvl.name}</h3>
                  <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
                    {lvl.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[10px]">
                  <span className="text-amber-300">PAR: {lvl.parTimeSeconds}s</span>
                  {isUnlocked && (
                    <span className="text-emerald-400 flex items-center gap-1 font-bold">
                      PLAY <ArrowRight className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// --- HOW TO PLAY MODAL ---
interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-slate-950 border-2 border-purple-500 rounded-lg p-5 font-pixel text-white shadow-[0_0_30px_rgba(168,85,247,0.4)] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-500/40 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">📜</span>
            <h2 className="text-sm sm:text-base text-purple-300">HUNTER'S SURVIVAL GUIDE</h2>
          </div>
          <button
            onClick={() => {
              soundEngine.playMenuBeep(440);
              onClose();
            }}
            className="p-1 hover:text-purple-400 text-slate-400 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          {/* Controls */}
          <div className="bg-slate-900 p-3 rounded border border-slate-800">
            <h3 className="text-orange-400 text-xs mb-2">🕹️ CONTROLS</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
              <div>
                <span className="text-purple-300 font-bold">DESKTOP:</span> Arrow Keys or WASD to move
              </div>
              <div>
                <span className="text-purple-300 font-bold">PAUSE:</span> Press P or ESC
              </div>
              <div className="sm:col-span-2">
                <span className="text-purple-300 font-bold">MOBILE:</span> On-screen Virtual 4-Way D-Pad
              </div>
            </div>
          </div>

          {/* Collectibles */}
          <div className="bg-slate-900 p-3 rounded border border-slate-800">
            <h3 className="text-orange-400 text-xs mb-2">🎃 MAGICAL OBJECTIVES</h3>
            <div className="space-y-2 text-[10px]">
              <div className="flex items-start gap-2">
                <span className="text-base">🎃</span>
                <div>
                  <span className="text-orange-300 font-bold">Jack-o'-lanterns (+100 PTS):</span> Collect every pumpkin in the maze to break the seal and awaken the Exit Portal!
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-base">🌟</span>
                <div>
                  <span className="text-amber-300 font-bold">Golden Super Pumpkin (+500 PTS):</span> Ancient relics with intense mystical light.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-base">🗝️</span>
                <div>
                  <span className="text-slate-100 font-bold">Skull Keys & Gates:</span> Find Silver & Gold keys to unlock matching locked iron castle barriers.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-base">🌀</span>
                <div>
                  <span className="text-emerald-400 font-bold">Exit Portal:</span> Step into the glowing vortex once all pumpkins are secured to complete the level.
                </div>
              </div>
            </div>
          </div>

          {/* Potions & Traps */}
          <div className="bg-slate-900 p-3 rounded border border-slate-800">
            <h3 className="text-purple-300 text-xs mb-2">🧪 POTIONS & ENCOUNTERS</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
              <div>
                <span className="text-purple-400 font-bold">SPEED ELIXIR:</span> 50% speed boost with purple phantom trail.
              </div>
              <div>
                <span className="text-sky-300 font-bold">HOLY WATER:</span> Shield of light! Scares & banishes ghosts for +200 PTS.
              </div>
              <div>
                <span className="text-rose-400 font-bold">HEALTH POTION:</span> Restores 1 lost health point.
              </div>
              <div>
                <span className="text-red-500 font-bold">FLOOR SPIKES:</span> Watch the rhythm! Iron spikes deal 1 damage when extended.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- HIGH SCORES MODAL ---
interface HighScoresModalProps {
  isOpen: boolean;
  onClose: () => void;
  scores: HighScoreEntry[];
  onResetScores: () => void;
}

export const HighScoresModal: React.FC<HighScoresModalProps> = ({
  isOpen,
  onClose,
  scores,
  onResetScores,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-slate-950 border-2 border-amber-500 rounded-lg p-5 font-pixel text-white shadow-[0_0_30px_rgba(245,158,11,0.4)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-500/40 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏆</span>
            <h2 className="text-sm sm:text-base text-amber-400">HALL OF FAME</h2>
          </div>
          <button
            onClick={() => {
              soundEngine.playMenuBeep(440);
              onClose();
            }}
            className="p-1 hover:text-amber-400 text-slate-400 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scores Table */}
        <div className="space-y-2 mb-4">
          {scores.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs">
              NO HIGH SCORES RECORDED YET. BE THE FIRST!
            </div>
          ) : (
            scores.slice(0, 5).map((entry, index) => (
              <div
                key={entry.id || index}
                className={`flex items-center justify-between px-3 py-2 rounded border text-xs ${
                  index === 0
                    ? 'bg-amber-950/40 border-amber-500 text-amber-200'
                    : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-amber-400 w-4">#{index + 1}</span>
                  <span>{entry.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] text-slate-400">LVL {entry.levelReached}</span>
                  <span className="font-bold text-orange-400">{entry.score} PTS</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {scores.length > 0 && (
          <div className="pt-2 border-t border-slate-800 flex justify-end">
            <button
              onClick={onResetScores}
              className="text-[9px] text-slate-500 hover:text-red-400 transition"
            >
              RESET LEADERBOARD
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- PAUSE MODAL ---
interface PauseModalProps {
  isOpen: boolean;
  onResume: () => void;
  onRestartLevel: () => void;
  onReturnToTitle: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  onResume,
  onRestartLevel,
  onReturnToTitle,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-sm bg-slate-950 border-2 border-orange-500 rounded-lg p-5 font-pixel text-white text-center shadow-[0_0_30px_rgba(249,115,22,0.4)]">
        <h2 className="text-xl text-orange-400 mb-1">GAME PAUSED</h2>
        <p className="text-[10px] text-slate-400 mb-5">THE GHOSTS ARE FROZEN IN TIME</p>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => {
              soundEngine.playMenuBeep(600);
              onResume();
            }}
            className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-500 text-slate-950 font-bold rounded border border-orange-300 flex items-center justify-center gap-2 transition cursor-pointer text-xs"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>RESUME PLAY</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playMenuBeep(480);
              onRestartLevel();
            }}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-orange-300 rounded border border-slate-700 flex items-center justify-center gap-2 transition cursor-pointer text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESTART LEVEL</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playMenuBeep(440);
              onReturnToTitle();
            }}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-700 flex items-center justify-center gap-2 transition cursor-pointer text-xs"
          >
            <Home className="w-3.5 h-3.5" />
            <span>RETURN TO MENU</span>
          </button>
        </div>

        {/* Quick Toggles */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-center gap-4 text-xs">
          <button
            onClick={() => {
              const next = !settings.sfxMuted;
              soundEngine.setSfxMuted(next);
              onUpdateSettings({ sfxMuted: next });
            }}
            className="flex items-center gap-1 text-slate-400 hover:text-orange-300 text-[10px]"
          >
            {settings.sfxMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>SFX</span>
          </button>

          <button
            onClick={() => {
              const next = !settings.bgmMuted;
              soundEngine.setBgmMuted(next);
              onUpdateSettings({ bgmMuted: next });
              if (next) soundEngine.stopBgm();
              else soundEngine.startBgm();
            }}
            className="flex items-center gap-1 text-slate-400 hover:text-purple-300 text-[10px]"
          >
            <Music className="w-3.5 h-3.5" />
            <span>BGM</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// --- LEVEL CLEAR MODAL ---
interface LevelClearModalProps {
  isOpen: boolean;
  level: LevelConfig;
  stats: { time: number; score: number; pumpkins: number };
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onRestartLevel: () => void;
  onReturnToTitle: () => void;
}

export const LevelClearModal: React.FC<LevelClearModalProps> = ({
  isOpen,
  level,
  stats,
  hasNextLevel,
  onNextLevel,
  onRestartLevel,
  onReturnToTitle,
}) => {
  if (!isOpen) return null;

  const timeBonus = Math.max(0, (level.parTimeSeconds - stats.time) * 20);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="relative w-full max-w-sm bg-slate-950 border-2 border-emerald-500 rounded-lg p-6 font-pixel text-white text-center shadow-[0_0_35px_rgba(16,185,129,0.5)]">
        {/* Animated Celebration Icon */}
        <div className="text-5xl mb-2 animate-bounce">🎃</div>

        <h2 className="text-lg text-emerald-400 mb-1">LEVEL COMPLETED!</h2>
        <p className="text-[10px] text-purple-300 mb-4">{level.name}</p>

        {/* Stats Card */}
        <div className="bg-slate-900 border border-slate-800 rounded p-3 text-xs space-y-2 mb-5">
          <div className="flex justify-between text-slate-300">
            <span>PUMPKINS:</span>
            <span className="text-orange-400">100% SECURED</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>TIME TAKEN:</span>
            <span className="text-amber-300">{stats.time}s (PAR: {level.parTimeSeconds}s)</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>TIME BONUS:</span>
            <span className="text-emerald-300">+{timeBonus} PTS</span>
          </div>
          <div className="pt-1.5 border-t border-slate-800 flex justify-between font-bold text-sm">
            <span>TOTAL SCORE:</span>
            <span className="text-amber-400">{stats.score}</span>
          </div>
        </div>

        {/* Next Level / Actions */}
        <div className="space-y-2.5">
          {hasNextLevel ? (
            <button
              onClick={() => {
                soundEngine.playMenuBeep(600);
                onNextLevel();
              }}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded border border-emerald-300 flex items-center justify-center gap-2 transition cursor-pointer text-xs"
            >
              <span>NEXT LABYRINTH</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                soundEngine.playMenuBeep(600);
                onReturnToTitle();
              }}
              className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded border border-amber-300 flex items-center justify-center gap-2 transition cursor-pointer text-xs"
            >
              <span>GRAND VICTORY!</span>
              <Award className="w-4 h-4" />
            </button>
          )}

          <div className="flex gap-2">
            <button
              onClick={onRestartLevel}
              className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-700 text-[10px]"
            >
              REPLAY LEVEL
            </button>
            <button
              onClick={onReturnToTitle}
              className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-700 text-[10px]"
            >
              TITLE MENU
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- GAME OVER MODAL ---
interface GameOverModalProps {
  isOpen: boolean;
  score: number;
  level: LevelConfig;
  onTryAgain: () => void;
  onReturnToTitle: () => void;
  onSaveScore: (name: string) => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  score,
  level,
  onTryAgain,
  onReturnToTitle,
  onSaveScore,
}) => {
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && !saved) {
      onSaveScore(name.trim().toUpperCase());
      setSaved(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-sm bg-slate-950 border-2 border-red-600 rounded-lg p-6 font-pixel text-white text-center shadow-[0_0_40px_rgba(220,38,38,0.5)]">
        <div className="text-5xl mb-2">💀</div>
        <h2 className="text-xl text-red-500 mb-1 tracking-wider">GAME OVER</h2>
        <p className="text-[10px] text-slate-400 mb-4">THE LABYRINTH CONSUMED YOU</p>

        {/* Score Card */}
        <div className="bg-slate-900 border border-slate-800 rounded p-3 mb-4 text-xs">
          <div className="text-slate-400 text-[10px]">FINAL SCORE</div>
          <div className="text-xl text-amber-400 font-bold mt-1">{score}</div>
          <div className="text-[9px] text-purple-300 mt-1">REACHED LEVEL {level.id}</div>
        </div>

        {/* Save to Leaderboard */}
        {!saved ? (
          <form onSubmit={handleSave} className="mb-4">
            <div className="text-[9px] text-slate-400 mb-1">ENTER INITIALS (3 LETTERS)</div>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={4}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="HERO"
                className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-center font-pixel text-xs text-orange-300 uppercase focus:outline-none focus:border-orange-500"
              />
              <button
                type="submit"
                disabled={!name.trim()}
                className="px-3 py-1 bg-orange-600 hover:bg-orange-500 text-slate-950 font-bold rounded text-[10px] disabled:opacity-50"
              >
                SAVE
              </button>
            </div>
          </form>
        ) : (
          <div className="text-[10px] text-emerald-400 mb-4 font-bold">
            ✓ RECORD SAVED TO HALL OF FAME!
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={() => {
              soundEngine.playMenuBeep(600);
              onTryAgain();
            }}
            className="w-full py-3 px-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded border border-red-400 flex items-center justify-center gap-2 transition cursor-pointer text-xs"
          >
            <RotateCcw className="w-4 h-4" />
            <span>TRY AGAIN</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playMenuBeep(440);
              onReturnToTitle();
            }}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-700 flex items-center justify-center gap-2 transition cursor-pointer text-xs"
          >
            <Home className="w-3.5 h-3.5" />
            <span>TITLE MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
