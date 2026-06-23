import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Trophy, 
  Settings, 
  MessageCircle, 
  Sparkles, 
  Share2, 
  Coins,
  Frown,
  RotateCcw,
  Compass,
  Zap,
  HelpCircle
} from "lucide-react";

import { SpinWheel } from "./components/SpinWheel";
import { ConfigDrawer } from "./components/ConfigDrawer";
import { Sector, AppSettings } from "./types";

// Dynamic odds segments as requested, including Bad Luck & Try Again
const WHEEL_SECTORS: Sector[] = [
  { id: 1, label: "2+ ODDS", color: "#1e293b", textColor: "#10b981", odds: "2+ Odds" },
  { id: 2, label: "5+ ODDS", color: "#0f172a", textColor: "#a855f7", odds: "5+ Odds" },
  { id: 3, label: "VIP COMBO", color: "#e11d48", textColor: "#ffffff", odds: "VIP Combo", badge: "HOT" },
  { id: 4, label: "BAD LUCK 😭", color: "#334155", textColor: "#f87171", odds: "Bad Luck", badge: "TRY" },
  { id: 5, label: "10+ ODDS", color: "#0f172a", textColor: "#f97316", odds: "10+ Odds", badge: "SUPER" },
  { id: 6, label: "VIP COMBO", color: "#e11d48", textColor: "#ffffff", odds: "VIP Combo", badge: "HOT" },
  { id: 7, label: "4+ ODDS", color: "#1e293b", textColor: "#14b8a6", odds: "4+ Odds" },
  { id: 8, label: "TRY AGAIN", color: "#334155", textColor: "#f87171", odds: "Try Again", badge: "TRY" },
];

const DEFAULT_SETTINGS: AppSettings = {
  whatsappNumber: "255718009830", // Swahili Betting Admin WhatsApp
  customHostName: "Amina",
  customMessageTemplate: "Hello Amina! I was spinning Amina's Wheel of Fortune and won FREE ODDS ({ODDS}). Please send me my free betting code now!",
  vipComboTemplate: "Hello Amina! I saw your VIP Combo on the lucky app. Can I please get the daily high-odds premium slip details?",
  enableSoundEffects: true,
};

// Simulated real-time ticker events
const MOCK_TICKERS = [
  { name: "John S.", region: "Dar es Salaam", prize: "10+ Odds", time: "Just now" },
  { name: "Hamis M.", region: "Mwanza", prize: "VIP Combo", time: "45 seconds ago" },
  { name: "Grace K.", region: "Arusha", prize: "Bad Luck 😭", time: "2 minutes ago" },
  { name: "Ali B.", region: "Zanzibar", prize: "VIP Combo", time: "3 minutes ago" },
  { name: "Neema J.", region: "Dodoma", prize: "5+ Odds", time: "5 minutes ago" },
  { name: "Bakari Y.", region: "Tanga", prize: "Try Again", time: "8 minutes ago" },
];

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [gameState, setGameState] = useState<"idle" | "spinning" | "won">("idle");
  const [wonSector, setWonSector] = useState<Sector | null>(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [liveLogIndex, setLiveLogIndex] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [secretClickCount, setSecretClickCount] = useState(0);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);

  // Load interactive share tracker from local storage (or default to 0)
  const [shareCount, setShareCount] = useState<number>(() => {
    const lastSpin = localStorage.getItem("bahatispin_last_spin");
    if (lastSpin) {
      const lastSpinTime = parseInt(lastSpin) || 0;
      const diff = Date.now() - lastSpinTime;
      const cooldownMs = 5 * 60 * 60 * 1000; // 5 hours in milliseconds
      
      if (diff >= cooldownMs) {
        localStorage.removeItem("bahatispin_last_spin");
        localStorage.setItem("bahatispin_shares", "0");
        return 0;
      }
    }
    const saved = localStorage.getItem("bahatispin_shares");
    return saved ? Math.min(5, parseInt(saved) || 0) : 0;
  });

  // Load configuration settings from local storage
  useEffect(() => {
    const saved = localStorage.getItem("bahatispin_settings");
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (err) {
        console.error("Failed to parse settings", err);
      }
    }
  }, []);

  // Sync share rate tracker to localStorage
  useEffect(() => {
    localStorage.setItem("bahatispin_shares", shareCount.toString());
  }, [shareCount]);

  // Rotate winner logs interval
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveLogIndex((prev) => (prev + 1) % MOCK_TICKERS.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const handlePillClick = () => {
    setSecretClickCount((prev) => {
      const next = prev + 1;
      if (next >= 5) {
        setIsConfigOpen(true);
        return 0;
      }
      return next;
    });
  };

  // Track the 5-hour cooldown countdown timer
  useEffect(() => {
    const checkCooldown = () => {
      const lastSpin = localStorage.getItem("bahatispin_last_spin");
      if (lastSpin) {
        const lastSpinTime = parseInt(lastSpin) || 0;
        const diff = Date.now() - lastSpinTime;
        const cooldownMs = 5 * 60 * 60 * 1000; // 5 hours in milliseconds
        
        if (diff < cooldownMs) {
          setCooldownRemaining(cooldownMs - diff);
        } else {
          // Cooldown finished! Reset share count to 0 so they must share again to spin
          setCooldownRemaining(0);
          localStorage.removeItem("bahatispin_last_spin");
          setShareCount(0);
          localStorage.setItem("bahatispin_shares", "0");
        }
      } else {
        setCooldownRemaining(0);
      }
    };

    checkCooldown();
    const interval = setInterval(checkCooldown, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return [
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      seconds.toString().padStart(2, "0")
    ].join(":");
  };

  // Confetti setup for actual winners
  useEffect(() => {
    if (!showWinnerModal || !canvasRef.current || !wonSector) return;
    if (wonSector.odds === "Bad Luck" || wonSector.odds === "Try Again") return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    interface Particle {
      x: number;
      y: number;
      size: number;
      color: string;
      speedX: number;
      speedY: number;
      rotation: number;
      rotationSpeed: number;
    }

    const particles: Particle[] = [];
    const colors = ["#facc15", "#10b981", "#3b82f6", "#ef4444", "#a855f7", "#ec4899"];

    for (let i = 0; i < 110; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: Math.random() * 4 - 2,
        speedY: Math.random() * 4 + 3,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 4 - 2,
      });
    }

    let animationFrameId: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();

        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotationSpeed;

        if (p.y > canvas.height) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }
      });
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [showWinnerModal, wonSector]);

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem("bahatispin_settings", JSON.stringify(newSettings));
  };

  const handleSpinStart = () => {
    setGameState("spinning");
    setWonSector(null);
  };

  const handleSpinComplete = (winning: Sector) => {
    setWonSector(winning);
    setGameState("won");

    // Initialize 5-hour cooldown immediately on completion of spin
    const now = Date.now();
    localStorage.setItem("bahatispin_last_spin", now.toString());
    setCooldownRemaining(5 * 60 * 60 * 1000);

    setTimeout(() => {
      setShowWinnerModal(true);
    }, 600);
  };

  const handleShareClick = () => {
    // Increment sharing counter up to 5
    const nextCount = Math.min(5, shareCount + 1);
    setShareCount(nextCount);

    // Dynamic Whatsapp share landing
    const appLink = "https://www.appcreator24.com/app4084811-v3nbws";
    const shareMessage = `Hey! Check out this free lucky spin game from beautiful Hostess Amina! I just won free high-odds matches code. Spin yours now for free here: ${appLink}`;
    
    // Open Whatsapp share trigger
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`, "_blank");
  };

  const getWhatsAppLink = (prizeOdds: string) => {
    const rawTemplate = settings.customMessageTemplate;
    const replaced = rawTemplate
      .replace("{ODDS}", prizeOdds)
      .replace("{odds}", prizeOdds);
    
    return `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(replaced)}`;
  };

  return (
    <div className="min-h-screen text-slate-100 bg-slate-950 font-sans pb-8 overflow-x-hidden selection:bg-amber-500 selection:text-slate-900 flex flex-col justify-between">
      
      {/* Background ambient auroras */}
      <div className="absolute top-0 left-1/4 w-[450px] h-[450px] bg-emerald-500/5 rounded-full blur-[130px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[110px] pointer-events-none"></div>

      <div>
        {/* HEADER BAR */}
        <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-900 px-4 py-3 sm:px-6">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-lg shadow-[0_0_12px_rgba(245,158,11,0.25)] flex items-center justify-center">
                <Trophy className="w-5 h-5 text-slate-950 stroke-[2.5]" />
              </div>
              <div>
                <h1 className="font-sans font-black text-md sm:text-lg tracking-tight text-white uppercase">
                  BAHATI <span className="text-amber-400">SPIN</span>
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div 
                onClick={handlePillClick}
                className="hidden xs:flex items-center gap-1.5 bg-slate-900/80 border border-slate-800/60 px-3 py-1 rounded-full text-[10.5px] text-slate-400 font-mono cursor-pointer transition-transform active:scale-95 select-none"
                title="Admin panel backdoor tap"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>HOST: AMINA</span>
              </div>
            </div>

          </div>
        </header>

        {/* WINNER TICKER */}
        <div className="bg-slate-900/60 border-b border-slate-800/50 py-1.5 select-none font-sans">
          <div className="max-w-4xl mx-auto px-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1 text-[11px] text-slate-400 uppercase tracking-wider font-black shrink-0">
              <Coins className="w-3.5 h-3.5 text-amber-500" /> LIVE STATS:
            </div>
            
            <div className="flex-1 overflow-hidden relative h-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={liveLogIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 flex items-center gap-1.5 text-[11.5px]"
                >
                  <span className="font-bold text-amber-400">{MOCK_TICKERS[liveLogIndex].name}</span>
                  <span className="text-slate-500">[{MOCK_TICKERS[liveLogIndex].region}]</span>
                  <span className="font-semibold text-emerald-400 bg-emerald-950/20 px-1.5 py-0.2 rounded text-[9.5px]">
                    won {MOCK_TICKERS[liveLogIndex].prize}
                  </span>
                  <span className="text-slate-600 text-[9px] font-mono ml-auto">
                    {MOCK_TICKERS[liveLogIndex].time}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
          
          {/* COMPACT INTRO TITLE WITH NO BOTTOM WASTED SPACE */}
          <section className="text-center max-w-xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full text-[10px] font-extrabold text-amber-400 uppercase tracking-wider">
              <Sparkles className="w-3.5. h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '3s' }} /> FREE DAILY ODDS GENERATOR
            </div>
            <h2 className="text-2xl sm:text-3.5xl font-black text-white tracking-tight uppercase">
              Amina's Lucky Wheel of Fortune!
            </h2>
          </section>

          {/* MAIN COLUMN CONTAINER */}
          <div className="flex flex-col items-center justify-center max-w-md mx-auto space-y-6">
            
            {/* SPIN WHEEL WHEEL FRAME */}
            <div className="bg-slate-900/40 border-2 border-slate-800 rounded-[30px] p-3 shadow-2xl w-full relative overflow-hidden backdrop-blur-sm">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600"></div>
              
              <div className="relative">
                <SpinWheel
                  sectors={WHEEL_SECTORS}
                  onSpinStart={handleSpinStart}
                  onSpinComplete={handleSpinComplete}
                  isSpinning={gameState === "spinning"}
                  setIsSpinning={(st) => {
                    if (!st && gameState === "spinning") {
                      setGameState("won");
                    }
                  }}
                />

                {cooldownRemaining > 0 ? (
                  <div className="absolute inset-0 bg-slate-950/98 backdrop-blur-md rounded-[25px] flex flex-col items-center justify-center p-6 text-center select-none z-30 transition-all border border-slate-800/80">
                    <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-3">
                      <RotateCcw className="w-7 h-7 text-amber-500 animate-spin" style={{ animationDuration: '4s' }} />
                    </div>
                    <span className="text-xs font-black text-white uppercase tracking-widest block">⏳ COOLDOWN ACTIVE</span>
                    <p className="text-[11.5px] text-slate-300 mt-1.5 max-w-[240px] leading-relaxed mx-auto font-sans">
                      Spinned once! Next lucky spin option is locked for safety. It unlocks automatically in:
                    </p>

                    {/* Countdown indicator */}
                    <div className="mt-4 bg-slate-900 border border-slate-800 py-2.5 px-6 rounded-2xl text-xl font-mono font-black text-amber-400 shadow-inner tracking-wider">
                      {formatTime(cooldownRemaining)}
                    </div>

                    <p className="text-[10px] text-slate-500 mt-3 leading-tight font-sans">
                      * Once this period expires, you must share again 5 times on WhatsApp groups to spin the lucky wheel.
                    </p>
                  </div>
                ) : shareCount < 5 ? (
                  <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xs rounded-[25px] flex flex-col items-center justify-center p-6 text-center select-none z-30 transition-all border border-slate-800/80">
                    <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-3">
                      <Share2 className="w-7 h-7 text-amber-500 animate-pulse" />
                    </div>
                    <span className="text-xs font-black text-white uppercase tracking-widest block">⚠️ WHEEL LOCKED</span>
                    <p className="text-[11.5px] text-slate-400 mt-1 max-w-[240px] leading-relaxed mx-auto font-sans">
                      Dada Amina's wheel requires you to share to <span className="text-amber-400 font-extrabold text-xs">5 WhatsApp betting groups</span> to unlock.
                    </p>

                    {/* Progress tracking */}
                    <div className="mt-4 bg-slate-900 border border-slate-800 py-1 px-3.5 rounded-full text-[11px] font-mono flex items-center gap-1.5">
                      <span>Shared status:</span>
                      <span className="text-yellow-400 font-extrabold">{shareCount} / 5 Groups</span>
                    </div>

                    <div className="mt-2.5 w-full max-w-[180px] bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800/50">
                      <div 
                        className="bg-amber-500 h-full transition-all duration-500" 
                        style={{ width: `${(shareCount / 5) * 100}%` }}
                      ></div>
                    </div>

                    <button
                      onClick={handleShareClick}
                      className="mt-5 w-full max-w-[250px] py-3.5 px-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer border border-green-400/20 animate-bounce"
                    >
                      <Share2 className="w-4 h-4 shrink-0" /> Share to Group {shareCount + 1} Now
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            {/* VERY BRIEF SUMMARY / HOW TO SPIN DIRECTIVE BOX */}
            <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-wider">
                <Compass className="w-4 h-4 animate-spin" style={{ animationDuration: '10s' }} />
                <span>How to Play & Win:</span>
              </div>
              
              <div className="space-y-2.5 text-xs text-slate-300 font-sans">
                <div className="flex gap-2 items-start">
                  <span className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 font-bold flex items-center justify-center shrink-0">1</span>
                  <p className="leading-normal">
                    Click the <strong className="text-white font-extrabold">"Share"</strong> button above to invite betting groups on WhatsApp. You must complete sharing <span className="text-yellow-400 font-bold">5 times</span> to unlock the wheel.
                  </p>
                </div>
                
                <div className="flex gap-2 items-start">
                  <span className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 font-bold flex items-center justify-center shrink-0">2</span>
                  <p className="leading-normal">
                    Once unlocked, click on <strong className="text-white font-extrabold">Amina's Face (TAP SPIN)</strong> directly inside the center hum of the lucky wheel.
                  </p>
                </div>

                <div className="flex gap-2 items-start">
                  <span className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 font-bold flex items-center justify-center shrink-0">3</span>
                  <p className="leading-normal">
                    Players are allowed to spin only once every <strong className="text-amber-400 font-extrabold">5 hours</strong>. After that, you must share 5 times again to spin again!
                  </p>
                </div>
              </div>
            </div>

          </div>

        </main>
      </div>

      {/* COMPACT MINI FOOTER */}
      <footer className="mt-12 border-t border-slate-900 pt-6 max-w-4xl mx-auto px-4 text-center space-y-1 select-none shrink-0">
        <p className="text-[10px] text-slate-600 font-sans tracking-wide">
          © {new Date().getFullYear()} Bahati Spin. Strictly 18+. Responsible gaming is advised.
        </p>
      </footer>

      {/* CONTROL CONFIG DRAWER */}
      <ConfigDrawer
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />

      {/* MINIMAL WINNER MODAL DRAWER - SIMPLIFIED COMPOSURES */}
      <AnimatePresence>
        {showWinnerModal && wonSector && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
            />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWinnerModal(false)}
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.9, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 15, opacity: 0 }}
              className="relative bg-slate-900 border-2 border-slate-800 rounded-[30px] max-w-sm w-full p-5 text-center shadow-2xl z-20 overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600"></div>
              
              {/* Bad Luck slices */}
              {(wonSector.odds === "Bad Luck" || wonSector.odds === "Try Again") ? (
                <>
                  <div className="mx-auto w-14 h-14 rounded-full bg-slate-950 border border-red-500/30 flex items-center justify-center mt-1">
                    <Frown className="w-7 h-7 text-red-400" />
                  </div>

                  <div className="space-y-1 mt-3">
                    <span className="text-[10px] font-extrabold uppercase text-red-400 tracking-wider block">
                      BETTER LUCK NEXT SPIN
                    </span>
                    <h3 className="text-lg font-black text-white uppercase font-sans">
                      No Luck This Time!
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed px-1">
                      You landed on the <span className="text-red-450 font-bold">{wonSector.odds}</span> wedge.
                    </p>
                  </div>

                  <div className="my-3.5 bg-slate-950 rounded-xl py-2.5 px-3 text-xs text-slate-300">
                    🗣️ Amina Says: <br />
                    <span className="text-slate-100 font-semibold block mt-1 leading-relaxed">
                      "Sorry! Lady Luck wasn't on your side today. You can try again in 5 hours!"
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setShowWinnerModal(false);
                      setGameState("idle");
                    }}
                    className="w-full bg-gradient-to-r from-slate-700 to-slate-800 text-slate-100 font-bold text-xs tracking-widest uppercase py-3 px-4 rounded-xl shadow-lg hover:scale-[1.02] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Got It (OK)
                  </button>
                </>
              ) : (
                <>
                  <div className="mx-auto w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 shadow-xl flex items-center justify-center mt-1">
                    <Trophy className="w-7 h-7 text-slate-950 stroke-[2.5]" />
                  </div>

                  <div className="space-y-1 mt-3">
                    <span className="text-[10px] font-extrabold uppercase text-amber-400 tracking-wider block">
                      WIN CONFIRMED!
                    </span>
                    <h3 className="text-lg font-black text-white uppercase font-sans">
                      CONGRATULATIONS! 🎉
                    </h3>
                  </div>

                  <div className="my-3 bg-slate-950 border border-slate-800/80 rounded-xl py-2.5 px-4">
                    <div className="text-xl font-sans font-black text-yellow-300 uppercase">
                      {wonSector.odds}
                    </div>
                  </div>

                  <div className="bg-slate-850 border border-slate-850 rounded-lg p-2.5 text-[11.5px] text-slate-300 mb-4 text-left font-sans">
                    🗣️ Hostess Amina: <br />
                    "Hooray! Click the button below to reach out to me via WhatsApp and get your daily voucher code now!"
                  </div>

                  <a
                    href={getWhatsAppLink(wonSector.odds)}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => {
                      setShowWinnerModal(false);
                      setShareCount(0); // reset shares for replayability
                      setGameState("idle");
                    }}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-extrabold text-[11px] tracking-widest uppercase py-3 px-3 rounded-xl shadow-lg flex items-center justify-center gap-1.5 cursor-pointer border border-green-400/20"
                  >
                    <MessageCircle className="w-4 h-4 fill-current text-white animate-bounce" />
                    Claim Odds On WhatsApp Now
                  </a>
                </>
              )}

              <button
                onClick={() => {
                  setShowWinnerModal(false);
                  setGameState("idle");
                }}
                className="mt-3 text-[10px] font-bold text-slate-500 hover:text-slate-300 uppercase tracking-widest cursor-pointer block mx-auto py-1"
              >
                [ Close Window ]
              </button>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
