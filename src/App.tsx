import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameScreen, LevelConfig, GameSettings, HighScoreEntry, Direction } from './types/game';
import { LEVELS } from './game/levels';
import { GameEngine } from './game/engine';
import { soundEngine } from './utils/audio';
import { TitleScreen } from './components/TitleScreen';
import { HUD } from './components/HUD';
import { MobileControls } from './components/MobileControls';
import {
  MapSelectModal,
  HowToPlayModal,
  HighScoresModal,
  PauseModal,
  LevelClearModal,
  GameOverModal,
} from './components/Modals';

const DEFAULT_SETTINGS: GameSettings = {
  sfxMuted: false,
  bgmMuted: false,
  sfxVolume: 0.6,
  bgmVolume: 0.35,
  crtFilter: true,
  ambientLight: true,
};

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('TITLE_MENU');
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(0);
  const [highestLevelUnlocked, setHighestLevelUnlocked] = useState<number>(1);
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [highScores, setHighScores] = useState<HighScoreEntry[]>([]);
  const [virtualDir, setVirtualDir] = useState<Direction | null>(null);

  // Active level clear stats
  const [clearStats, setClearStats] = useState<{ time: number; score: number; pumpkins: number }>({
    time: 0,
    score: 0,
    pumpkins: 0,
  });

  // Active game over score
  const [gameOverScore, setGameOverScore] = useState<number>(0);

  // State trigger for HUD rerender
  const [, setHudTick] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const currentLevel = LEVELS[currentLevelIndex] || LEVELS[0];

  // Load persistent data from localStorage
  useEffect(() => {
    try {
      const savedScores = localStorage.getItem('pumpkin_high_scores');
      if (savedScores) {
        setHighScores(JSON.parse(savedScores));
      } else {
        // Initial retro high scores
        const sampleScores: HighScoreEntry[] = [
          { id: '1', name: 'JACK', score: 3800, levelReached: 5, date: '10/31' },
          { id: '2', name: 'SPOOK', score: 2600, levelReached: 4, date: '10/30' },
          { id: '3', name: 'GHOST', score: 1950, levelReached: 3, date: '10/29' },
          { id: '4', name: 'BAT', score: 1200, levelReached: 2, date: '10/28' },
        ];
        setHighScores(sampleScores);
        localStorage.setItem('pumpkin_high_scores', JSON.stringify(sampleScores));
      }

      const savedUnlocked = localStorage.getItem('pumpkin_highest_unlocked');
      if (savedUnlocked) {
        setHighestLevelUnlocked(Math.max(1, parseInt(savedUnlocked, 10)));
      }

      const savedSettings = localStorage.getItem('pumpkin_settings');
      if (savedSettings) {
        setSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }));
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const updateSettings = useCallback((newPartial: Partial<GameSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...newPartial };
      try {
        localStorage.setItem('pumpkin_settings', JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

  // Update canvas size to match container
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.parentElement) return;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = Math.floor(rect.width);
    canvas.height = Math.floor(rect.height);
  }, []);

  // Start or transition level
  const startLevel = useCallback((lvlIndex: number, carryOverStats?: { score: number; lives: number }) => {
    setCurrentLevelIndex(lvlIndex);
    setScreen('PLAYING');

    // Ensure audio starts on user action
    soundEngine.startBgm();

    // Allow DOM to render canvas first
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      resizeCanvas();

      if (engineRef.current) {
        engineRef.current.stop();
        engineRef.current.unbindInputs();
      }

      const level = LEVELS[lvlIndex];
      const engine = new GameEngine(canvas, level, settings, carryOverStats);

      engine.onStateUpdate = () => {
        setHudTick(t => (t + 1) % 1000);
      };

      engine.onLevelClear = (stats) => {
        setClearStats(stats);
        setScreen('LEVEL_CLEAR');

        // Unlock next level
        const nextLvlNum = level.id + 1;
        setHighestLevelUnlocked(prev => {
          const updated = Math.max(prev, nextLvlNum);
          try {
            localStorage.setItem('pumpkin_highest_unlocked', updated.toString());
          } catch {
            // Ignore
          }
          return updated;
        });

        // Record high score if applicable
        saveHighScore('HERO', stats.score, level.id);
      };

      engine.onGameOver = (score) => {
        setGameOverScore(score);
        setScreen('GAME_OVER');
      };

      engineRef.current = engine;
      engine.start();
    }, 50);
  }, [resizeCanvas, settings]);

  // Window resize observer
  useEffect(() => {
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  // Global keyboard shortcuts (Pause, Mute)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (screen === 'PLAYING') {
        if (e.code === 'KeyP' || e.code === 'Escape') {
          e.preventDefault();
          soundEngine.playMenuBeep(480);
          engineRef.current?.stop();
          setScreen('PAUSED');
        } else if (e.code === 'KeyM') {
          e.preventDefault();
          const next = !settings.sfxMuted;
          soundEngine.setSfxMuted(next);
          soundEngine.setBgmMuted(next);
          updateSettings({ sfxMuted: next, bgmMuted: next });
          if (next) soundEngine.stopBgm();
          else soundEngine.startBgm();
        }
      } else if (screen === 'PAUSED' && (e.code === 'KeyP' || e.code === 'Escape')) {
        e.preventDefault();
        soundEngine.playMenuBeep(600);
        engineRef.current?.start();
        setScreen('PLAYING');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, settings, updateSettings]);

  // Save High Score helper
  const saveHighScore = (name: string, score: number, levelReached: number) => {
    try {
      const newEntry: HighScoreEntry = {
        id: Date.now().toString(),
        name: name.slice(0, 4),
        score,
        levelReached,
        date: new Date().toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' }),
      };

      setHighScores(prev => {
        const updated = [...prev, newEntry].sort((a, b) => b.score - a.score).slice(0, 10);
        localStorage.setItem('pumpkin_high_scores', JSON.stringify(updated));
        return updated;
      });
    } catch {
      // Ignore
    }
  };

  const handleResetScores = () => {
    try {
      localStorage.removeItem('pumpkin_high_scores');
      setHighScores([]);
    } catch {
      // Ignore
    }
  };

  // Virtual directional touch controller updates
  const handleVirtualDirectionChange = (dir: Direction | null) => {
    setVirtualDir(dir);
    if (engineRef.current) {
      engineRef.current.setVirtualDirection(dir);
    }
  };

  return (
    <div className={`relative w-screen h-screen overflow-hidden bg-slate-950 flex flex-col ${settings.crtFilter ? 'crt-overlay crt-vignette' : ''}`}>
      {/* 1. TITLE MENU */}
      {screen === 'TITLE_MENU' && (
        <TitleScreen
          onStartGame={() => startLevel(0)}
          onOpenMapSelect={() => setScreen('MAP_SELECT')}
          onOpenHowToPlay={() => setScreen('HOW_TO_PLAY')}
          onOpenHighScores={() => setScreen('HIGH_SCORES')}
          settings={settings}
          onUpdateSettings={updateSettings}
          highestLevelUnlocked={highestLevelUnlocked}
        />
      )}

      {/* 2. ACTIVE GAME VIEW (Canvas + HUD) */}
      {(screen === 'PLAYING' || screen === 'PAUSED' || screen === 'LEVEL_CLEAR' || screen === 'GAME_OVER') && (
        <div className="relative w-full h-full flex flex-col overflow-hidden bg-slate-950">
          {/* Top Arcade HUD */}
          {engineRef.current && (
            <HUD
              player={engineRef.current.player}
              level={currentLevel}
              settings={settings}
              onPause={() => {
                engineRef.current?.stop();
                setScreen('PAUSED');
              }}
              onToggleSound={() => {
                const next = !settings.sfxMuted;
                soundEngine.setSfxMuted(next);
                soundEngine.setBgmMuted(next);
                updateSettings({ sfxMuted: next, bgmMuted: next });
                if (next) soundEngine.stopBgm();
                else soundEngine.startBgm();
              }}
            />
          )}

          {/* Interactive Game Canvas Container */}
          <div className="relative flex-1 w-full h-full overflow-hidden bg-slate-950">
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full block cursor-crosshair"
            />

            {/* Mobile Touch 4-Way D-Pad */}
            {screen === 'PLAYING' && (
              <MobileControls
                onDirectionChange={handleVirtualDirectionChange}
                activeDirection={virtualDir}
              />
            )}
          </div>
        </div>
      )}

      {/* --- MODALS & OVERLAYS --- */}

      {/* Map Selection Modal */}
      <MapSelectModal
        isOpen={screen === 'MAP_SELECT'}
        onClose={() => setScreen('TITLE_MENU')}
        highestLevelUnlocked={highestLevelUnlocked}
        onSelectLevel={(lvl) => {
          const idx = LEVELS.findIndex(l => l.id === lvl.id);
          startLevel(idx !== -1 ? idx : 0);
        }}
      />

      {/* How To Play Survival Guide */}
      <HowToPlayModal
        isOpen={screen === 'HOW_TO_PLAY'}
        onClose={() => setScreen('TITLE_MENU')}
      />

      {/* Hall of Fame High Scores Modal */}
      <HighScoresModal
        isOpen={screen === 'HIGH_SCORES'}
        onClose={() => setScreen('TITLE_MENU')}
        scores={highScores}
        onResetScores={handleResetScores}
      />

      {/* Pause Menu Modal */}
      <PauseModal
        isOpen={screen === 'PAUSED'}
        onResume={() => {
          engineRef.current?.start();
          setScreen('PLAYING');
        }}
        onRestartLevel={() => {
          const stats = engineRef.current ? { score: engineRef.current.player.score, lives: 3 } : undefined;
          startLevel(currentLevelIndex, stats);
        }}
        onReturnToTitle={() => {
          engineRef.current?.stop();
          soundEngine.stopBgm();
          setScreen('TITLE_MENU');
        }}
        settings={settings}
        onUpdateSettings={updateSettings}
      />

      {/* Level Clear Celebration Modal */}
      <LevelClearModal
        isOpen={screen === 'LEVEL_CLEAR'}
        level={currentLevel}
        stats={clearStats}
        hasNextLevel={currentLevelIndex + 1 < LEVELS.length}
        onNextLevel={() => {
          const carryOver = engineRef.current ? {
            score: engineRef.current.player.score,
            lives: engineRef.current.player.lives,
          } : undefined;
          startLevel(currentLevelIndex + 1, carryOver);
        }}
        onRestartLevel={() => {
          startLevel(currentLevelIndex);
        }}
        onReturnToTitle={() => {
          soundEngine.stopBgm();
          setScreen('TITLE_MENU');
        }}
      />

      {/* Game Over Modal */}
      <GameOverModal
        isOpen={screen === 'GAME_OVER'}
        score={gameOverScore}
        level={currentLevel}
        onTryAgain={() => {
          startLevel(currentLevelIndex);
        }}
        onReturnToTitle={() => {
          soundEngine.stopBgm();
          setScreen('TITLE_MENU');
        }}
        onSaveScore={(name) => {
          saveHighScore(name, gameOverScore, currentLevel.id);
        }}
      />
    </div>
  );
}
