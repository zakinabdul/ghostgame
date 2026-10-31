import React from 'react';
import { Volume2, VolumeX, Music, Monitor, Sparkles } from 'lucide-react';
import { GameSettings } from '../types/game';
import { soundEngine } from '../utils/audio';

interface TitleScreenProps {
  onStartGame: () => void;
  onOpenMapSelect: () => void;
  onOpenHowToPlay: () => void;
  onOpenHighScores: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  highestLevelUnlocked: number;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenMapSelect,
  onOpenHowToPlay,
  onOpenHighScores,
  settings,
  onUpdateSettings,
  highestLevelUnlocked,
}) => {
  const toggleSfx = () => {
    const next = !settings.sfxMuted;
    soundEngine.setSfxMuted(next);
    onUpdateSettings({ sfxMuted: next });
    if (!next) soundEngine.playMenuBeep(520);
  };

  const toggleBgm = () => {
    const next = !settings.bgmMuted;
    soundEngine.setBgmMuted(next);
    onUpdateSettings({ bgmMuted: next });
    if (next) {
      soundEngine.stopBgm();
    } else {
      soundEngine.startBgm();
    }
  };

  const toggleCrt = () => {
    soundEngine.playMenuBeep(440);
    onUpdateSettings({ crtFilter: !settings.crtFilter });
  };

  const toggleLight = () => {
    soundEngine.playMenuBeep(480);
    onUpdateSettings({ ambientLight: !settings.ambientLight });
  };

  return (
    <div className="relative w-full h-full min-h-[580px] flex flex-col items-center justify-between overflow-hidden bg-slate-950 text-white select-none">
      {/* Background Cover Image with atmospheric lighting scrim */}
      <img
        src="/src/assets/images/pumpkin_title_cover_1793454954453.jpg"
        alt="The Haunted Labyrinth with Giant Jack-o'-Lantern"
        className="absolute inset-0 w-full h-full object-cover opacity-60 filter contrast-125"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/40" />

      {/* Top Controls Bar */}
      <div className="relative z-10 w-full max-w-4xl px-4 py-4 flex items-center justify-between text-xs font-pixel text-orange-200">
        <div className="flex items-center gap-2 tracking-wider">
          <span className="text-orange-400">🎃</span>
          <span className="text-orange-400">ARCADE EDITION</span>
        </div>

        {/* Quick Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleBgm}
            className={`px-3 py-1.5 flex items-center gap-1.5 border border-slate-700 bg-slate-900/80 rounded hover:bg-slate-800 transition ${
              settings.bgmMuted ? 'text-slate-500' : 'text-purple-300'
            }`}
            title="Toggle Eerie Music"
          >
            <Music className="w-3.5 h-3.5" />
            <span className="text-[10px]">{settings.bgmMuted ? 'BGM OFF' : 'BGM ON'}</span>
          </button>

          <button
            onClick={toggleSfx}
            className={`px-3 py-1.5 flex items-center gap-1.5 border border-slate-700 bg-slate-900/80 rounded hover:bg-slate-800 transition ${
              settings.sfxMuted ? 'text-slate-500' : 'text-orange-300'
            }`}
            title="Toggle Sound Effects"
          >
            {settings.sfxMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span className="text-[10px]">{settings.sfxMuted ? 'SFX OFF' : 'SFX ON'}</span>
          </button>

          <button
            onClick={toggleCrt}
            className={`px-2.5 py-1.5 flex items-center gap-1 border border-slate-700 bg-slate-900/80 rounded hover:bg-slate-800 transition ${
              settings.crtFilter ? 'text-emerald-400 border-emerald-600/50' : 'text-slate-500'
            }`}
            title="Toggle CRT Scanline Effect"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="text-[10px]">CRT</span>
          </button>
        </div>
      </div>

      {/* Hero Title Section */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 mt-2">
        {/* Animated Spooky Jack-o'-Lantern Emblem */}
        <div className="relative mb-2 animate-pumpkin-glow">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center bg-orange-600/20 border-2 border-orange-500/60 shadow-[0_0_35px_rgba(234,88,12,0.6)]">
            <span className="text-6xl md:text-7xl select-none filter drop-shadow-[0_0_12px_rgba(255,170,0,0.9)]">
              🎃
            </span>
          </div>
        </div>

        {/* Game Title */}
        <h1 className="font-pixel text-3xl sm:text-4xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-b from-orange-300 via-orange-500 to-amber-600 tracking-wider drop-shadow-[0_4px_12px_rgba(234,88,12,0.8)]">
          PUMPKIN
        </h1>
        <div className="font-pixel text-xs sm:text-sm md:text-base text-purple-300 tracking-[0.25em] mt-2 drop-shadow-[0_2px_8px_rgba(168,85,247,0.7)]">
          THE HAUNTED MAZE
        </div>

        {/* Tagline */}
        <p className="font-pixel text-[10px] sm:text-xs text-orange-200/80 max-w-md mt-3 tracking-wide leading-relaxed">
          Enter the maze. Collect the pumpkins. Escape the darkness.
        </p>
      </div>

      {/* Main Arcade Menu Actions */}
      <div className="relative z-10 w-full max-w-xs flex flex-col gap-3.5 px-4 mb-4">
        {/* Start Game Button */}
        <button
          onClick={() => {
            soundEngine.playMenuBeep(600);
            soundEngine.startBgm();
            onStartGame();
          }}
          className="group relative w-full py-3.5 px-6 bg-gradient-to-b from-orange-500 to-amber-700 text-slate-950 font-pixel text-sm tracking-wider rounded border-2 border-orange-300 shadow-[0_4px_0_#7c2d12,0_0_20px_rgba(249,115,22,0.5)] active:translate-y-1 active:shadow-none hover:brightness-110 transition cursor-pointer"
        >
          <div className="flex items-center justify-center gap-2 font-bold">
            <span className="group-hover:animate-pulse">▶</span>
            <span>START GAME</span>
          </div>
        </button>

        {/* Select Map */}
        <button
          onClick={() => {
            soundEngine.playMenuBeep(520);
            onOpenMapSelect();
          }}
          className="w-full py-3 px-6 bg-slate-900/90 text-orange-300 font-pixel text-xs tracking-wider rounded border border-orange-500/40 shadow-[0_3px_0_#0f172a] hover:bg-slate-800 hover:border-orange-400 active:translate-y-1 active:shadow-none transition cursor-pointer"
        >
          <div className="flex items-center justify-center gap-2">
            <span>🗺️</span>
            <span>SELECT MAP ({highestLevelUnlocked}/5)</span>
          </div>
        </button>

        {/* How To Play */}
        <button
          onClick={() => {
            soundEngine.playMenuBeep(480);
            onOpenHowToPlay();
          }}
          className="w-full py-2.5 px-6 bg-slate-900/90 text-purple-300 font-pixel text-xs tracking-wider rounded border border-purple-500/40 shadow-[0_3px_0_#0f172a] hover:bg-slate-800 hover:border-purple-400 active:translate-y-1 active:shadow-none transition cursor-pointer"
        >
          <div className="flex items-center justify-center gap-2">
            <span>📜</span>
            <span>HOW TO PLAY</span>
          </div>
        </button>

        {/* High Scores */}
        <button
          onClick={() => {
            soundEngine.playMenuBeep(440);
            onOpenHighScores();
          }}
          className="w-full py-2.5 px-6 bg-slate-900/90 text-amber-300 font-pixel text-xs tracking-wider rounded border border-amber-500/40 shadow-[0_3px_0_#0f172a] hover:bg-slate-800 hover:border-amber-400 active:translate-y-1 active:shadow-none transition cursor-pointer"
        >
          <div className="flex items-center justify-center gap-2">
            <span>🏆</span>
            <span>HALL OF FAME</span>
          </div>
        </button>
      </div>

      {/* Arcade Footer */}
      <div className="relative z-10 w-full text-center py-3 text-[9px] font-pixel text-slate-500">
        <div>USE ARROW KEYS OR WASD · MOBILE TOUCH COMPATIBLE</div>
        <div className="mt-1 text-slate-600">© RETRO ARCADE 1993 · GOOGLE AI STUDIO</div>
      </div>
    </div>
  );
};
