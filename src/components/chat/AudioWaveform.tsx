import { cn } from "@/lib/utils";

interface AudioWaveformProps {
  isActive: boolean;
  audioLevel: number;
  variant?: "listening" | "speaking";
  className?: string;
}

export function AudioWaveform({ 
  isActive, 
  audioLevel, 
  variant = "listening",
  className 
}: AudioWaveformProps) {
  const bars = 5;
  const baseColor = variant === "listening" ? "bg-primary" : "bg-secondary";
  
  return (
    <div className={cn("flex items-center justify-center gap-1 h-8", className)}>
      {Array.from({ length: bars }).map((_, i) => {
        // Create wave effect with offset animation
        const delay = i * 0.1;
        const baseHeight = isActive ? 0.3 + (audioLevel * 0.7) : 0.2;
        const variation = Math.sin(Date.now() / 200 + i) * 0.3;
        const height = Math.max(0.2, Math.min(1, baseHeight + (isActive ? variation : 0)));
        
        return (
          <div
            key={i}
            className={cn(
              "w-1 rounded-full transition-all duration-75",
              baseColor,
              isActive ? "opacity-100" : "opacity-40"
            )}
            style={{
              height: `${height * 100}%`,
              animationDelay: `${delay}s`,
            }}
          />
        );
      })}
    </div>
  );
}
