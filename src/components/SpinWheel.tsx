import React, { useState } from "react";
import { motion, useAnimation } from "motion/react";
import { Disc, Play, Sparkles } from "lucide-react";
import { Sector } from "../types";

interface SpinWheelProps {
  sectors: Sector[];
  onSpinStart: () => void;
  onSpinComplete: (winningSector: Sector) => void;
  isSpinning: boolean;
  setIsSpinning: (state: boolean) => void;
}

export const SpinWheel: React.FC<SpinWheelProps> = ({
  sectors,
  onSpinStart,
  onSpinComplete,
  isSpinning,
  setIsSpinning,
}) => {
  const [rotation, setRotation] = useState(0);
  const controls = useAnimation();

  // Play synthetic ticker beep sound for real casino-like feedback
  const playTickSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(580, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    } catch (e) {
      // Audio block is fine
    }
  };

  const handleSpin = async () => {
    if (isSpinning) return;

    onSpinStart();
    setIsSpinning(true);

    // Weighted biased random selection: 88% chance to land under losses (Bad Luck or Try Again)
    const roll = Math.random();
    let randomIndex: number;
    if (roll < 0.88) {
      // Find sectors that are Bad Luck (index 3) or Try Again (index 7)
      // Indexes 3 and 7 in our WHEEL_SECTORS list correspond to "Bad Luck" and "Try Again"
      randomIndex = Math.random() < 0.5 ? 3 : 7;
    } else {
      // Remaining 12% probability is distributed among the luxury winning indices
      const winningIndices = [0, 1, 2, 4, 5, 6];
      randomIndex = winningIndices[Math.floor(Math.random() * winningIndices.length)];
    }
    const selectedSector = sectors[randomIndex];

    // Each sector spans 360 / sectors.length degrees
    const sectorAngle = 360 / sectors.length;
    
    // Formula to center the selected slice under the top indicator pointer (270 degrees)
    const sliceCenterAngle = (randomIndex * sectorAngle) + (sectorAngle / 2);
    const targetBaseAngle = (270 - sliceCenterAngle) % 360;

    // Fast cinematic spinning decelerating smoothly
    const minSpins = 6;
    const maxSpins = 8;
    const fullSpins = minSpins + Math.random() * (maxSpins - minSpins);
    const finalRotation = rotation + (fullSpins * 360) + (targetBaseAngle - (rotation % 360)) + 360;

    let ticks = 0;
    const tickInterval = setInterval(() => {
      if (ticks < 18) {
        playTickSound();
        ticks++;
      } else {
        clearInterval(tickInterval);
      }
    }, 180);

    // Execute beautiful rotation transition
    await controls.start({
      rotate: finalRotation,
      transition: {
        duration: 4.8,
        ease: [0.2, 0.08, 0.2, 1], // Perfect luxury deceleration curve
      },
    });

    clearInterval(tickInterval);
    setRotation(finalRotation);
    setIsSpinning(false);
    onSpinComplete(selectedSector);
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-3">
      
      {/* Outer Glow Ring with Neon Marquee */}
      <div className="relative w-80 h-80 sm:w-92 sm:h-92 bg-slate-950 rounded-full flex items-center justify-center border-4 border-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.5)] p-2.5">
        
        {/* Animated Marquee Neon outline */}
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-yellow-400 opacity-90 animate-pulse pointer-events-none" style={{ animationDuration: '1s' }}></div>
        
        {/* Top Winner Pointer Arrow */}
        <div className="absolute top-[-12px] left-1/2 -translate-x-1/2 z-30 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
          <div className="w-6 h-8 bg-gradient-to-b from-amber-400 to-amber-600 rounded-b-full relative flex items-center justify-center">
            <div className="absolute w-1.5 h-3 bg-white opacity-75 rounded-full left-1.5 top-1"></div>
          </div>
          <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[14px] border-t-amber-600"></div>
        </div>

        {/* The Animated Spinning Wheel Base */}
        <motion.div
          animate={controls}
          initial={{ rotate: 0 }}
          className="w-full h-full rounded-full overflow-hidden relative shadow-[inset_0_0_25px_rgba(0,0,0,0.9)] border border-slate-700 select-none"
        >
          {/* SVG Wheel Pie wedges */}
          <svg viewBox="0 0 100 100" className="w-full h-full rotate-[-90deg]">
            <g>
              {sectors.map((sector, index) => {
                const totalSectors = sectors.length;
                const angle = 360 / totalSectors;
                const startAngle = index * angle;
                const endAngle = (index + 1) * angle;

                const radius = 50;
                const cx = 50;
                const cy = 50;

                const startRad = (startAngle * Math.PI) / 180;
                const endRad = (endAngle * Math.PI) / 180;

                const x1 = cx + radius * Math.cos(startRad);
                const y1 = cy + radius * Math.sin(startRad);
                const x2 = cx + radius * Math.cos(endRad);
                const y2 = cy + radius * Math.sin(endRad);

                const d = `
                  M ${cx} ${cy}
                  L ${x1} ${y1}
                  A ${radius} ${radius} 0 0 1 ${x2} ${y2}
                  Z
                `;

                // Calculate center text label alignment
                const textAngleRad = ((startAngle + angle / 2) * Math.PI) / 180;
                const textDistanceMultiplier = 0.65;
                const tx = cx + radius * textDistanceMultiplier * Math.cos(textAngleRad);
                const ty = cy + radius * textDistanceMultiplier * Math.sin(textAngleRad);

                const textRotation = startAngle + angle / 2;

                return (
                  <g key={sector.id} className="cursor-pointer group">
                    <path
                      d={d}
                      fill={sector.color}
                      className="transition-opacity duration-300 group-hover:opacity-95 stroke-slate-900/15 stroke-1"
                    />
                    
                    <path
                      d={d}
                      fill="none"
                      className="stroke-amber-400/20 stroke-[0.35] pointer-events-none"
                    />

                    {/* Prize Labels */}
                    <text
                      x={tx}
                      y={ty}
                      fill={sector.textColor}
                      fontSize="5"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${textRotation}, ${tx}, ${ty})`}
                      className="font-sans select-none tracking-tight filter drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.95)] uppercase text-[4px]"
                    >
                      {sector.label}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Slices Divider Lines */}
          <div className="absolute inset-0 rounded-full border border-yellow-500/20 pointer-events-none"></div>
        </motion.div>

        {/* 
          DADA AMINA DIRECTLY INSIDE THE WHEEL CENTER HUB! 
          This replaces the generic peg with her live avatar acting as the spin trigger button.
        */}
        <div className="absolute z-25 w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 flex items-center justify-center p-0.5 shadow-[0_0_25px_rgba(245,158,11,0.7)] border-2 border-slate-950">
          <button
            id="spin-button-cta"
            disabled={isSpinning}
            onClick={handleSpin}
            className={`w-full h-full rounded-full overflow-hidden relative bg-slate-950 flex flex-col items-center justify-center transition-all ${
              isSpinning
                ? "cursor-not-allowed pointer-events-none scale-95"
                : "hover:scale-105 active:scale-95 text-yellow-400 hover:text-white"
            }`}
          >
            {/* Hostesses Face Background */}
            <img 
              src="/src/assets/images/host_amina_1782134855321.jpg" 
              alt="Amina" 
              className={`absolute inset-0 w-full h-full object-cover transition-all ${
                isSpinning ? "opacity-35 blur-xs scale-110" : "opacity-85"
              }`}
            />

            {/* Glowing overlay filter overlay */}
            <div className="absolute inset-0 bg-slate-950/45 mix-blend-multiply rounded-full"></div>

            {/* Interactive instructions overlaid in center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-1 text-center font-sans">
              {isSpinning ? (
                <>
                  <Disc className="w-7 h-7 text-yellow-400 animate-spin" />
                  <span className="text-[8px] font-black tracking-widest text-white uppercase mt-1 animate-pulse">
                    SPINNING...
                  </span>
                </>
              ) : (
                <>
                  <div className="bg-amber-500/90 text-slate-950 rounded-full p-1.5 mb-0.5 animate-bounce shadow-md">
                    <Play className="w-3.5 h-3.5 fill-current text-slate-950" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-white bg-slate-950/80 px-1.5 py-0.5 rounded-full shadow border border-slate-800">
                    TAP SPIN
                  </span>
                </>
              )}
            </div>

            {/* Active online breathing marker pulsing */}
            <span className="absolute top-1 right-3 flex h-2 w-2 z-20">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </button>
        </div>

        {/* Small gold gem markers decorating outer ring */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-yellow-400 border border-slate-950 shadow-[0_0_6px_#facc15]"
            style={{
              top: `${50 + 46 * Math.sin(((i * 30) * Math.PI) / 180)}%`,
              left: `${50 + 46 * Math.cos(((i * 30) * Math.PI) / 180)}%`,
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}

      </div>

      {/* Under-wheel Status Info */}
      <div className="mt-4 text-center">
        <p className="text-[11px] text-yellow-400 font-extrabold uppercase tracking-widest flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-yellow-400 animate-pulse" /> Amina's Lucky Wheel is Live
        </p>
      </div>

    </div>
  );
};
