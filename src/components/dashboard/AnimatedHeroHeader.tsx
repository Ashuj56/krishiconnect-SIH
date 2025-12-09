import { useState, useEffect } from "react";
import { Sprout } from "lucide-react";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";

interface AnimatedHeroHeaderProps {
  greeting: { en: string; ml: string };
  userName: string;
  farmInfo: { name: string; area: number | null; areaUnit: string | null } | null;
}

const farmImages = [
  "/images/kerala-farm-hd-1.jpg",
  "/images/kerala-farm-hd-2.jpg",
  "/images/kerala-farm-hd-3.jpg",
  "/images/kerala-farm-hd-4.jpg",
];

export function AnimatedHeroHeader({ greeting, userName, farmInfo }: AnimatedHeroHeaderProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZooming, setIsZooming] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsZooming(false);
      setTimeout(() => {
        setCurrentImageIndex((prev) => (prev + 1) % farmImages.length);
        setIsZooming(true);
      }, 500);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="relative overflow-hidden rounded-b-3xl">
      {/* Animated Background with Ken Burns Effect */}
      <div className="absolute inset-0 overflow-hidden">
        {farmImages.map((img, index) => (
          <div
            key={img}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <div
              className={`absolute inset-0 bg-cover bg-center transition-transform duration-[6000ms] ease-out ${
                index === currentImageIndex && isZooming
                  ? "scale-110"
                  : "scale-100"
              }`}
              style={{ backgroundImage: `url(${img})` }}
            />
          </div>
        ))}
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/60 to-primary/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 pt-4 pb-8 safe-top">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs text-white/80 font-malayalam tracking-wide">
              {greeting.ml}
            </p>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              Hello, {userName}!
              <span className="animate-wave inline-block">👋</span>
            </h1>
            {farmInfo && (
              <div className="flex items-center gap-2 mt-2 text-sm text-white/90">
                <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Sprout className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-medium">
                  {farmInfo.name} • {farmInfo.area} {farmInfo.areaUnit}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <NotificationCenter />
          </div>
        </div>

        {/* Feature Pills */}
        <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-hide pb-1">
          {["Smart Alerts", "AI Advisory", "Market Prices", "Weather"].map((feature, i) => (
            <div
              key={feature}
              className="px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-xs text-white font-medium whitespace-nowrap animate-fade-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {feature}
            </div>
          ))}
        </div>
      </div>

      {/* Decorative Wave */}
      <div className="absolute bottom-0 left-0 right-0 h-6">
        <svg
          viewBox="0 0 1440 100"
          className="absolute bottom-0 w-full h-full"
          preserveAspectRatio="none"
        >
          <path
            fill="hsl(var(--background))"
            d="M0,60 C240,90 480,30 720,60 C960,90 1200,30 1440,60 L1440,100 L0,100 Z"
          />
        </svg>
      </div>
    </header>
  );
}
