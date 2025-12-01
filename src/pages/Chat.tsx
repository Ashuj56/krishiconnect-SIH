import { useState, useRef, useEffect } from "react";
import { Send, Mic, Leaf, Image, MoreVertical, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const quickQuestions = [
  "When should I irrigate my paddy?",
  "What fertilizer for banana plants?",
  "How to control pests naturally?",
  "Best time to harvest coconuts?",
];

const initialMessages: Message[] = [
  {
    id: "1",
    type: "assistant",
    content: "Hello! I'm your AI farming assistant. I can help you with crop advice, pest management, irrigation schedules, and more. How can I help you today?",
    timestamp: new Date(),
  },
];

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: getAIResponse(input),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const getAIResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes("irrigat") || lowerQuery.includes("water")) {
      return "Based on current weather conditions and your paddy field's soil moisture levels, I recommend irrigating tomorrow morning between 6-7 AM. The soil moisture is at 45%, and with no rain expected for the next 3 days, your crops will need water soon. Would you like me to set a reminder?";
    }
    if (lowerQuery.includes("fertilizer") || lowerQuery.includes("nutrient")) {
      return "For your banana plants at the fruiting stage, I recommend applying Potassium-rich fertilizer (NPK 13:0:45) at 200g per plant. This will help in better fruit development. Apply in a ring around the plant, about 1 foot from the stem. Best time to apply is early morning or late evening.";
    }
    if (lowerQuery.includes("pest") || lowerQuery.includes("insect")) {
      return "I've analyzed recent pest reports in your area. There's a moderate risk of brown planthopper in paddy fields. I recommend: 1) Avoid excessive nitrogen fertilizer, 2) Maintain proper spacing between plants, 3) Use neem-based spray as a preventive measure. Would you like detailed instructions?";
    }
    return "I understand your question. Based on my analysis of your farm data and local conditions, I can provide specific recommendations. Could you tell me more about which crop or specific issue you're facing? This will help me give you more accurate advice.";
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="md:hidden">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold">Farm AI Assistant</h1>
              <p className="text-xs text-success flex items-center gap-1">
                <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                Online
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex animate-slide-up",
              message.type === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-3",
                message.type === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-card border border-border rounded-bl-md"
              )}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
              <p
                className={cn(
                  "text-xs mt-1",
                  message.type === "user"
                    ? "text-primary-foreground/70"
                    : "text-muted-foreground"
                )}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {messages.length === 1 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-muted-foreground mb-2">Quick Questions</p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((q) => (
              <Button
                key={q}
                variant="outline"
                size="sm"
                className="text-xs h-auto py-2 px-3"
                onClick={() => setInput(q)}
              >
                {q}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="sticky bottom-16 md:bottom-0 bg-card border-t border-border p-4 safe-bottom">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="shrink-0">
            <Image className="w-5 h-5" />
          </Button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask about your crops..."
              className="w-full h-11 px-4 pr-12 rounded-full bg-muted border-0 focus:ring-2 focus:ring-primary/20 outline-none text-sm"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2"
            >
              <Mic className="w-5 h-5 text-primary" />
            </Button>
          </div>
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim()}
            className="shrink-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
