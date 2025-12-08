import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Mic, MicOff, Volume2, VolumeX, Leaf, Image, ChevronLeft, PhoneCall, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useSpeech } from "@/hooks/useSpeech";
import { AudioWaveform } from "@/components/chat/AudioWaveform";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface FarmerContext {
  farmerName?: string;
  location?: string;
  farm?: {
    name: string;
    total_area: number | null;
    area_unit: string | null;
    soil_type: string | null;
    water_source: string | null;
  };
  crops?: Array<{
    name: string;
    variety: string | null;
    area: number | null;
    area_unit: string | null;
    current_stage: string | null;
    health_status: string | null;
    planting_date: string | null;
  }>;
  recentActivities?: Array<{
    title: string;
    activity_type: string;
    activity_date: string;
    description: string | null;
    quantity?: number | null;
    quantity_unit?: string | null;
    area_covered?: number | null;
    area_covered_unit?: string | null;
  }>;
  soilReport?: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    ph: number;
  };
}

interface WeatherData {
  temperature: number;
  humidity: number;
  condition: string;
  rainfall?: number;
  windSpeed?: number;
  forecast?: string;
}

// Kerala-specific quick questions organized by category
const keralaQuickQuestions = [
  // Pest & Disease (KAU/ICAR)
  { text: "എന്റെ നെൽകൃഷിയിൽ തവിട്ടു ചാഴി ആക്രമണം. എന്തു ചെയ്യണം?", en: "My paddy has Brown Planthopper attack. What should I do?", category: "pest" },
  { text: "Pepper quick wilt symptoms and treatment", en: "Pepper quick wilt symptoms and treatment", category: "pest" },
  { text: "Banana Sigatoka leaf spot management", en: "Banana Sigatoka leaf spot management", category: "pest" },
  
  // Fertilizer (KAU dosage)
  { text: "KAU fertilizer schedule for Nendran banana", en: "KAU fertilizer schedule for Nendran banana", category: "fertilizer" },
  { text: "Coconut palm NPK dosage per palm", en: "Coconut palm NPK dosage per palm", category: "fertilizer" },
  { text: "Organic alternatives for rice fertilizers", en: "Organic alternatives for rice fertilizers", category: "fertilizer" },
  
  // Crop Stage Operations
  { text: "Rice at panicle initiation - what operations?", en: "Rice at panicle initiation - what operations?", category: "stage" },
  { text: "Ginger earthing up and mulching schedule", en: "Ginger earthing up and mulching schedule", category: "stage" },
  
  // Weather-based
  { text: "Should I spray pesticide if rain is expected?", en: "Should I spray pesticide if rain is expected?", category: "weather" },
  { text: "Monsoon precautions for pepper gardens", en: "Monsoon precautions for pepper gardens", category: "weather" },
  
  // District-specific
  { text: "Best crops for Wayanad soil conditions", en: "Best crops for Wayanad soil conditions", category: "soil" },
  { text: "Kuttanad rice varieties and practices", en: "Kuttanad rice varieties and practices", category: "soil" },
];

const initialMessages: Message[] = [
  {
    id: "1",
    type: "assistant",
    content: "Hello! I'm Krishi Mitra, your AI farming assistant. I can help you with crop advice, pest management, irrigation schedules, government schemes, and more. How can I help you today?",
    timestamp: new Date(),
  },
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

// Language mapping for speech
const SPEECH_LANGUAGES: Record<string, { speech: string; label: string }> = {
  'en': { speech: 'en-IN', label: 'English' },
  'hi': { speech: 'hi-IN', label: 'हिंदी' },
  'ml': { speech: 'ml-IN', label: 'മലയാളം' },
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [currentLang, setCurrentLang] = useState('en');
  const [farmerContext, setFarmerContext] = useState<FarmerContext | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoadingContext, setIsLoadingContext] = useState(true);
  const [conversationMode, setConversationMode] = useState(false);
  const [questionCategory, setQuestionCategory] = useState<string>("all");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const speakRef = useRef<((text: string, lang?: string) => void) | null>(null);
  // Handle sending message - defined before useSpeech so we can use it in onTranscript
  const handleSendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      // Save user message to database
      if (user) {
        await supabase.from('chat_messages').insert({
          user_id: user.id,
          role: 'user',
          content: messageText,
        });
      }

      const chatMessages = messages
        .filter(m => m.id !== "1")
        .map(m => ({
          role: m.type === "user" ? "user" : "assistant",
          content: m.content
        }));
      
      chatMessages.push({ role: "user", content: messageText });

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          messages: chatMessages,
          farmerContext: farmerContext,
          language: currentLang,
          weather: weatherData
        }),
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to get response");
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantContent = "";

      const assistantId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: assistantId,
        type: "assistant",
        content: "",
        timestamp: new Date(),
      }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => prev.map(m => 
                m.id === assistantId 
                  ? { ...m, content: assistantContent }
                  : m
              ));
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => prev.map(m => 
                m.id === assistantId 
                  ? { ...m, content: assistantContent }
                  : m
              ));
            }
          } catch { /* ignore */ }
        }
      }

      // Save assistant response to database
      if (user && assistantContent) {
        await supabase.from('chat_messages').insert({
          user_id: user.id,
          role: 'assistant',
          content: assistantContent,
        });
      }

      // Speak the response if voice is enabled
      if (voiceEnabled && assistantContent && speakRef.current) {
        speakRef.current(assistantContent, SPEECH_LANGUAGES[currentLang]?.speech || 'en-IN');
      }

      return assistantContent;
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get response. Please try again.",
        variant: "destructive",
      });
      setMessages(prev => prev.filter(m => m.content !== ""));
      return null;
    } finally {
      setIsTyping(false);
    }
  }, [messages, isTyping, user, farmerContext, weatherData, voiceEnabled, currentLang, toast]);

  // Speech hook for voice input/output
  const { 
    isListening, 
    isSpeaking, 
    transcript,
    interimTranscript,
    isSupported,
    audioLevel,
    startListening, 
    stopListening, 
    speak, 
    stopSpeaking 
  } = useSpeech({
    language: SPEECH_LANGUAGES[currentLang]?.speech || 'en-IN',
    continuous: conversationMode,
    onTranscript: (text) => {
      // Auto-send when voice input is final
      if (text.trim()) {
        handleSendMessage(text);
      }
    },
  });

  // Store speak function in ref for use in handleSendMessage
  useEffect(() => {
    speakRef.current = speak;
  }, [speak]);

  // Load farmer context (profile, farm, crops, activities)
  useEffect(() => {
    if (!user) {
      setIsLoadingContext(false);
      return;
    }

    const loadFarmerContext = async () => {
      try {
        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, location, language')
          .eq('id', user.id)
          .single();

        // Set language from profile
        if (profile?.language && SPEECH_LANGUAGES[profile.language]) {
          setCurrentLang(profile.language);
        }

        // Fetch farm
        const { data: farms } = await supabase
          .from('farms')
          .select('*')
          .eq('user_id', user.id)
          .limit(1);
        
        const farm = farms?.[0];

        // Fetch crops
        const { data: crops } = await supabase
          .from('crops')
          .select('name, variety, area, area_unit, current_stage, health_status, planting_date')
          .eq('user_id', user.id);

        // Fetch recent activities (last 7 days) with quantity and area
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const { data: activities } = await supabase
          .from('activities')
          .select('title, activity_type, activity_date, description, quantity, quantity_unit, area_covered, area_covered_unit')
          .eq('user_id', user.id)
          .gte('activity_date', sevenDaysAgo.toISOString().split('T')[0])
          .order('activity_date', { ascending: false })
          .limit(10);

        // Fetch latest soil report
        const { data: soilReports } = await supabase
          .from('soil_reports')
          .select('nitrogen, phosphorus, potassium, ph')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        const soilReport = soilReports?.[0];

        // Fetch weather data for farmer's location
        const location = farm?.location || profile?.location;
        if (location) {
          try {
            const { data: weatherResponse } = await supabase.functions.invoke('weather', {
              body: { location }
            });
            if (weatherResponse?.current) {
              setWeatherData({
                temperature: weatherResponse.current.temperature,
                humidity: weatherResponse.current.humidity,
                condition: weatherResponse.current.condition,
                rainfall: weatherResponse.current.rainfall || 0,
                windSpeed: weatherResponse.current.windSpeed,
                forecast: weatherResponse.forecast?.[0]?.condition
              });
            }
          } catch (e) {
            console.error("Weather fetch error:", e);
          }
        }

        setFarmerContext({
          farmerName: profile?.full_name || undefined,
          location: profile?.location || farm?.location || undefined,
          farm: farm ? {
            name: farm.name,
            total_area: farm.total_area,
            area_unit: farm.area_unit,
            soil_type: farm.soil_type,
            water_source: farm.water_source,
          } : undefined,
          crops: crops || undefined,
          recentActivities: activities || undefined,
          soilReport: soilReport ? {
            nitrogen: soilReport.nitrogen,
            phosphorus: soilReport.phosphorus,
            potassium: soilReport.potassium,
            ph: soilReport.ph
          } : undefined,
        });

        // Update initial message with personalized greeting
        if (profile?.full_name) {
          setMessages([{
            id: "1",
            type: "assistant",
            content: `Namaste ${profile.full_name}! I'm Krishi Mitra, your AI farming assistant. I know about your farm and crops, so I can give you personalized advice. How can I help you today?`,
            timestamp: new Date(),
          }]);
        }
      } catch (error) {
        console.error("Error loading farmer context:", error);
      } finally {
        setIsLoadingContext(false);
      }
    };

    loadFarmerContext();
  }, [user]);

  // Load chat history on mount
  useEffect(() => {
    if (!user || isLoadingContext) return;
    
    const loadHistory = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(50);

      if (data && data.length > 0) {
        const loadedMessages: Message[] = data.map(msg => ({
          id: msg.id,
          type: msg.role as "user" | "assistant",
          content: msg.content,
          timestamp: new Date(msg.created_at!),
        }));
        setMessages(prev => [prev[0], ...loadedMessages]);
      }
    };

    loadHistory();
  }, [user, isLoadingContext]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    handleSendMessage(input);
  };

  // Handle voice input toggle
  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
      setConversationMode(false);
    } else {
      startListening();
    }
  };

  // Toggle conversation mode (hands-free)
  const toggleConversationMode = () => {
    if (conversationMode) {
      setConversationMode(false);
      stopListening();
    } else {
      setConversationMode(true);
      setVoiceEnabled(true);
      startListening();
      toast({
        title: "Conversation Mode",
        description: "Speak naturally. I'll listen and respond automatically.",
      });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background kerala-pattern">
      {/* Header */}
      <header className="sticky top-0 z-40 gradient-kerala text-primary-foreground safe-top">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="md:hidden text-primary-foreground hover:bg-primary-foreground/10">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="w-11 h-11 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-lg">Krishi Connect</h1>
              <p className="text-xs text-primary-foreground/80 flex items-center gap-1">
                <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
                {farmerContext?.farmerName ? `Hi, ${farmerContext.farmerName.split(' ')[0]}` : 'Online'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <select
              value={currentLang}
              onChange={(e) => setCurrentLang(e.target.value)}
              className="h-8 px-2 text-xs rounded-lg bg-primary-foreground/20 border-0 text-primary-foreground focus:ring-2 focus:ring-primary-foreground/20"
            >
              {Object.entries(SPEECH_LANGUAGES).map(([key, { label }]) => (
                <option key={key} value={key} className="text-foreground bg-card">{label}</option>
              ))}
            </select>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => {
                setVoiceEnabled(!voiceEnabled);
                if (isSpeaking) stopSpeaking();
              }}
              className={cn("text-primary-foreground hover:bg-primary-foreground/10", !voiceEnabled && "opacity-60")}
              title={voiceEnabled ? "Disable voice responses" : "Enable voice responses"}
            >
              {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </Button>
          </div>
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
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
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

        {isTyping && messages[messages.length - 1]?.content === "" && (
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

      {/* Kerala Quick Questions */}
      {messages.length === 1 && (
        <div className="px-4 pb-2">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground">Kerala Farming Questions (KAU/ICAR)</p>
            <select
              value={questionCategory}
              onChange={(e) => setQuestionCategory(e.target.value)}
              className="text-xs h-6 px-2 rounded bg-muted border-0"
            >
              <option value="all">All</option>
              <option value="pest">Pest & Disease</option>
              <option value="fertilizer">Fertilizer</option>
              <option value="stage">Crop Stage</option>
              <option value="weather">Weather</option>
              <option value="soil">Soil & District</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {keralaQuickQuestions
              .filter(q => questionCategory === "all" || q.category === questionCategory)
              .slice(0, 6)
              .map((q) => (
                <Button
                  key={q.en}
                  variant="outline"
                  size="sm"
                  className="text-xs h-auto py-2 px-3 text-left"
                  onClick={() => setInput(currentLang === 'ml' ? q.text : q.en)}
                >
                  {currentLang === 'ml' && q.text.match(/[\u0D00-\u0D7F]/) ? q.text : q.en}
                </Button>
              ))}
          </div>
          {weatherData && (
            <div className="mt-2 p-2 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">
                Current: {weatherData.temperature}°C, {weatherData.condition}, Humidity: {weatherData.humidity}%
                {weatherData.rainfall && weatherData.rainfall > 0 && ` | Rain: ${weatherData.rainfall}mm`}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Listening Indicator with Waveform */}
      {isListening && (
        <div className="px-4 pb-2">
          <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-xl">
            <AudioWaveform 
              isActive={true} 
              audioLevel={audioLevel} 
              variant="listening"
              className="w-12"
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-primary">
                {conversationMode ? "Conversation Mode" : "Listening..."}
              </span>
              {(transcript || interimTranscript) && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  "{interimTranscript || transcript}"
                </p>
              )}
            </div>
            {conversationMode && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleConversationMode}
                className="h-7 text-xs text-destructive hover:text-destructive"
              >
                End
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Speaking Indicator with Waveform */}
      {isSpeaking && (
        <div className="px-4 pb-2">
          <div className="flex items-center gap-3 p-3 bg-secondary/20 rounded-xl">
            <AudioWaveform 
              isActive={true} 
              audioLevel={0.6} 
              variant="speaking"
              className="w-12"
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-secondary-foreground">Speaking...</span>
              {conversationMode && (
                <p className="text-xs text-muted-foreground mt-0.5">Will listen after speaking</p>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={stopSpeaking}
              className="h-7 text-xs"
            >
              Stop
            </Button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="sticky bottom-16 md:bottom-0 bg-card border-t border-border p-4 safe-bottom">
        <div className="flex items-center gap-2">
          {/* Conversation Mode Toggle */}
          <Button 
            variant={conversationMode ? "default" : "outline"}
            size="icon" 
            className={cn(
              "shrink-0 transition-all",
              conversationMode && "bg-primary ring-2 ring-primary/30"
            )}
            onClick={toggleConversationMode}
            disabled={!isSupported}
            title={conversationMode ? "End conversation mode" : "Start hands-free conversation"}
          >
            {conversationMode ? <PhoneOff className="w-5 h-5" /> : <PhoneCall className="w-5 h-5" />}
          </Button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder={isListening ? "Listening..." : conversationMode ? "Say something..." : "Ask about your crops..."}
              className="w-full h-11 px-4 pr-12 rounded-full bg-muted border-0 focus:ring-2 focus:ring-primary/20 outline-none text-sm"
              disabled={isTyping || isListening}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleVoiceInput}
              disabled={!isSupported || conversationMode}
              className={cn(
                "absolute right-1 top-1/2 -translate-y-1/2",
                isListening && "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
              title={isListening ? "Stop listening" : "Start voice input"}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-primary" />}
            </Button>
          </div>
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="shrink-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Conversation Mode Hint */}
        {!conversationMode && messages.length > 1 && !isListening && !isSpeaking && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            Tap <PhoneCall className="w-3 h-3 inline" /> for hands-free speech-to-speech conversation
          </p>
        )}
      </div>
    </div>
  );
}
