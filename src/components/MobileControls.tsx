import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { Direction } from '../types/game';

interface MobileControlsProps {
  onDirectionChange: (dir: Direction | null) => void;
  activeDirection: Direction | null;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onDirectionChange,
  activeDirection,
}) => {
  const handleTouchStart = (dir: Direction, e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    onDirectionChange(dir);
  };

  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    onDirectionChange(null);
  };

  return (
    <div className="md:hidden fixed bottom-4 left-0 right-0 z-30 flex items-center justify-center pointer-events-none px-4">
      {/* 4-Way Virtual D-Pad */}
      <div className="relative w-40 h-40 bg-slate-950/80 p-2 rounded-full border-2 border-orange-500/40 shadow-[0_4px_20px_rgba(0,0,0,0.8)] backdrop-blur-sm pointer-events-auto select-none">
        {/* Center decorative ring */}
        <div className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-slate-900 border border-slate-700 pointer-events-none flex items-center justify-center text-xs">
          🎃
        </div>

        {/* Up */}
        <button
          onTouchStart={(e) => handleTouchStart('up', e)}
          onTouchEnd={handleTouchEnd}
          onMouseDown={(e) => handleTouchStart('up', e)}
          onMouseUp={handleTouchEnd}
          className={`absolute top-1 left-1/2 -translate-x-1/2 w-12 h-12 flex items-center justify-center rounded-t-xl border border-slate-700 ${
            activeDirection === 'up'
              ? 'bg-orange-500 text-slate-950 shadow-[0_0_12px_rgba(249,115,22,0.8)]'
              : 'bg-slate-900/90 text-orange-300 active:bg-orange-600 active:text-slate-950'
          }`}
          aria-label="Move Up"
        >
          <ArrowUp className="w-6 h-6" />
        </button>

        {/* Down */}
        <button
          onTouchStart={(e) => handleTouchStart('down', e)}
          onTouchEnd={handleTouchEnd}
          onMouseDown={(e) => handleTouchStart('down', e)}
          onMouseUp={handleTouchEnd}
          className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-12 h-12 flex items-center justify-center rounded-b-xl border border-slate-700 ${
            activeDirection === 'down'
              ? 'bg-orange-500 text-slate-950 shadow-[0_0_12px_rgba(249,115,22,0.8)]'
              : 'bg-slate-900/90 text-orange-300 active:bg-orange-600 active:text-slate-950'
          }`}
          aria-label="Move Down"
        >
          <ArrowDown className="w-6 h-6" />
        </button>

        {/* Left */}
        <button
          onTouchStart={(e) => handleTouchStart('left', e)}
          onTouchEnd={handleTouchEnd}
          onMouseDown={(e) => handleTouchStart('left', e)}
          onMouseUp={handleTouchEnd}
          className={`absolute left-1 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-l-xl border border-slate-700 ${
            activeDirection === 'left'
              ? 'bg-orange-500 text-slate-950 shadow-[0_0_12px_rgba(249,115,22,0.8)]'
              : 'bg-slate-900/90 text-orange-300 active:bg-orange-600 active:text-slate-950'
          }`}
          aria-label="Move Left"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        {/* Right */}
        <button
          onTouchStart={(e) => handleTouchStart('right', e)}
          onTouchEnd={handleTouchEnd}
          onMouseDown={(e) => handleTouchStart('right', e)}
          onMouseUp={handleTouchEnd}
          className={`absolute right-1 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-r-xl border border-slate-700 ${
            activeDirection === 'right'
              ? 'bg-orange-500 text-slate-950 shadow-[0_0_12px_rgba(249,115,22,0.8)]'
              : 'bg-slate-900/90 text-orange-300 active:bg-orange-600 active:text-slate-950'
          }`}
          aria-label="Move Right"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
