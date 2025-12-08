import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
      setTimeout(onComplete, 500);
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex flex-col items-center justify-center gradient-splash transition-opacity duration-500",
        !isAnimating && "opacity-0 pointer-events-none"
      )}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice">
          {/* Coconut Trees */}
          <g className="animate-wave" style={{ transformOrigin: "100px 300px" }}>
            <ellipse cx="100" cy="280" rx="35" ry="15" fill="white" opacity="0.3" />
            <path d="M100 280 Q90 320 85 380 Q95 375 100 380 Q105 375 115 380 Q110 320 100 280" fill="white" opacity="0.2" />
            <path d="M100 280 Q60 250 30 260" stroke="white" strokeWidth="3" fill="none" opacity="0.3" />
            <path d="M100 280 Q140 250 170 260" stroke="white" strokeWidth="3" fill="none" opacity="0.3" />
            <path d="M100 280 Q100 240 90 220" stroke="white" strokeWidth="3" fill="none" opacity="0.3" />
          </g>
          
          <g className="animate-wave" style={{ transformOrigin: "320px 350px", animationDelay: "0.5s" }}>
            <ellipse cx="320" cy="330" rx="30" ry="12" fill="white" opacity="0.25" />
            <path d="M320 330 Q310 370 305 420 Q315 415 320 420 Q325 415 335 420 Q330 370 320 330" fill="white" opacity="0.15" />
            <path d="M320 330 Q280 300 250 310" stroke="white" strokeWidth="2.5" fill="none" opacity="0.25" />
            <path d="M320 330 Q360 300 390 310" stroke="white" strokeWidth="2.5" fill="none" opacity="0.25" />
          </g>

          {/* Paddy Fields */}
          <path d="M0 600 Q100 580 200 600 Q300 620 400 600 L400 800 L0 800 Z" fill="white" opacity="0.08" />
          <path d="M0 650 Q100 630 200 650 Q300 670 400 650 L400 800 L0 800 Z" fill="white" opacity="0.05" />
        </svg>
      </div>

      {/* Logo */}
      <div className="relative animate-scale-in">
        <div className="w-28 h-28 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-8 shadow-2xl border border-white/30">
          <svg viewBox="0 0 60 60" className="w-16 h-16">
            {/* Paddy/Rice Plant Icon */}
            <g fill="none" stroke="#FFD54F" strokeWidth="2.5" strokeLinecap="round">
              {/* Center stem */}
              <path d="M30 55 L30 25" />
              {/* Left grains */}
              <ellipse cx="22" cy="20" rx="4" ry="8" fill="#FFD54F" stroke="none" />
              <ellipse cx="18" cy="28" rx="4" ry="7" fill="#FFD54F" stroke="none" />
              <ellipse cx="20" cy="38" rx="3" ry="6" fill="#FFD54F" stroke="none" />
              {/* Right grains */}
              <ellipse cx="38" cy="20" rx="4" ry="8" fill="#FFD54F" stroke="none" />
              <ellipse cx="42" cy="28" rx="4" ry="7" fill="#FFD54F" stroke="none" />
              <ellipse cx="40" cy="38" rx="3" ry="6" fill="#FFD54F" stroke="none" />
              {/* Center grain */}
              <ellipse cx="30" cy="15" rx="4" ry="9" fill="#FFD54F" stroke="none" />
              {/* Leaves */}
              <path d="M30 45 Q15 40 10 50" stroke="#81C784" strokeWidth="3" />
              <path d="M30 45 Q45 40 50 50" stroke="#81C784" strokeWidth="3" />
            </g>
          </svg>
        </div>
      </div>

      {/* App Name */}
      <div className="text-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
        <h1 className="text-4xl font-bold text-white mb-2 tracking-wide">
          Krishi Connect
        </h1>
        <h2 className="text-2xl font-semibold text-white/90 font-malayalam mb-4">
          കൃഷി കണക്ട്
        </h2>
        <p className="text-white/80 text-sm">
          Your Personal Farming Assistant
        </p>
        <p className="text-white/60 text-xs font-malayalam mt-1">
          നിങ്ങളുടെ വ്യക്തിഗത കൃഷി സഹായി
        </p>
      </div>

      {/* Loading Indicator */}
      <div className="absolute bottom-20 flex gap-2">
        <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}
