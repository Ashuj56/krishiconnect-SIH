import { Mic, MicOff, PhoneCall, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AudioWaveform } from "./AudioWaveform";

interface ConversationModeButtonProps {
  isActive: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  audioLevel: number;
  onToggle: () => void;
  disabled?: boolean;
  className?: string;
}

export function ConversationModeButton({
  isActive,
  isListening,
  isSpeaking,
  audioLevel,
  onToggle,
  disabled,
  className,
}: ConversationModeButtonProps) {
  return (
    <Button
      variant={isActive ? "default" : "outline"}
      size="lg"
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        "relative h-16 w-16 rounded-full transition-all duration-300",
        isActive && "ring-4 ring-primary/30 animate-pulse-subtle",
        isListening && "bg-primary hover:bg-primary/90",
        isSpeaking && "bg-secondary hover:bg-secondary/90",
        className
      )}
    >
      {isActive ? (
        <div className="flex flex-col items-center">
          {isListening && (
            <AudioWaveform 
              isActive={true} 
              audioLevel={audioLevel} 
              variant="listening"
              className="absolute inset-0 p-2"
            />
          )}
          {isSpeaking && (
            <AudioWaveform 
              isActive={true} 
              audioLevel={0.5} 
              variant="speaking"
              className="absolute inset-0 p-2"
            />
          )}
          <PhoneOff className="w-6 h-6 z-10" />
        </div>
      ) : (
        <PhoneCall className="w-6 h-6" />
      )}
    </Button>
  );
}
