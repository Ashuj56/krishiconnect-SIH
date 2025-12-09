import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type Language = "en" | "ml" | "hi";

interface Translations {
  [key: string]: {
    en: string;
    ml: string;
    hi: string;
  };
}

// App-wide translations
export const translations: Translations = {
  // Navigation
  home: { en: "Home", ml: "ഹോം", hi: "होम" },
  chat: { en: "Chat", ml: "ചാറ്റ്", hi: "चैट" },
  scan: { en: "Scan", ml: "സ്കാൻ", hi: "स्कैन" },
  activities: { en: "Activity", ml: "ലോഗ്", hi: "गतिविधि" },
  profile: { en: "Profile", ml: "പ്രൊഫൈൽ", hi: "प्रोफ़ाइल" },
  menu: { en: "Menu", ml: "മെനു", hi: "मेनू" },
  
  // Menu items
  advisory: { en: "Advisory", ml: "ഉപദേശം", hi: "सलाह" },
  marketPrices: { en: "Market Prices", ml: "വിപണി വില", hi: "बाजार मूल्य" },
  schemes: { en: "Schemes", ml: "പദ്ധതികൾ", hi: "योजनाएं" },
  knowledge: { en: "Knowledge Base", ml: "അറിവ്", hi: "ज्ञान" },
  settings: { en: "Settings", ml: "ക്രമീകരണങ്ങൾ", hi: "सेटिंग्स" },
  farm: { en: "My Farm", ml: "എന്റെ കൃഷിയിടം", hi: "मेरा खेत" },
  smartSale: { en: "Smart Sale", ml: "സ്മാർട്ട് സെയിൽ", hi: "स्मार्ट सेल" },
  
  // Auth
  welcomeBack: { en: "Welcome Back", ml: "സ്വാഗതം", hi: "वापसी पर स्वागत" },
  createAccount: { en: "Create Account", ml: "അക്കൗണ്ട് സൃഷ്ടിക്കുക", hi: "खाता बनाएं" },
  signIn: { en: "Sign In", ml: "സൈൻ ഇൻ", hi: "साइन इन करें" },
  signUp: { en: "Sign Up", ml: "സൈൻ അപ്പ്", hi: "साइन अप करें" },
  email: { en: "Email address", ml: "ഇമെയിൽ വിലാസം", hi: "ईमेल पता" },
  password: { en: "Password", ml: "പാസ്‌വേഡ്", hi: "पासवर्ड" },
  fullName: { en: "Full name", ml: "മുഴുവൻ പേര്", hi: "पूरा नाम" },
  phone: { en: "Mobile number", ml: "മൊബൈൽ നമ്പർ", hi: "मोबाइल नंबर" },
  farmDetails: { en: "Farm Details", ml: "കൃഷിയിട വിവരങ്ങൾ", hi: "खेत का विवरण" },
  farmLocation: { en: "Farm location", ml: "കൃഷിയിട സ്ഥലം", hi: "खेत का स्थान" },
  landArea: { en: "Total land area (in acres)", ml: "ആകെ ഭൂമി (ഏക്കർ)", hi: "कुल भूमि (एकड़)" },
  soilType: { en: "Soil Type", ml: "മണ്ണിന്റെ തരം", hi: "मिट्टी का प्रकार" },
  waterSource: { en: "Water Source", ml: "ജലസ്രോതസ്സ്", hi: "जल स्रोत" },
  selectLanguage: { en: "Select Language", ml: "ഭാഷ തിരഞ്ഞെടുക്കുക", hi: "भाषा चुनें" },
  continueBtn: { en: "Continue", ml: "തുടരുക", hi: "जारी रखें" },
  next: { en: "Next", ml: "അടുത്തത്", hi: "अगला" },
  back: { en: "Back", ml: "മടങ്ങുക", hi: "वापस" },
  
  // Dashboard
  goodMorning: { en: "Good Morning", ml: "സുപ്രഭാതം", hi: "सुप्रभात" },
  goodAfternoon: { en: "Good Afternoon", ml: "ശുഭ ഉച്ച", hi: "शुभ दोपहर" },
  goodEvening: { en: "Good Evening", ml: "ശുഭ സായാഹ്നം", hi: "शुभ संध्या" },
  weather: { en: "Weather", ml: "കാലാവസ്ഥ", hi: "मौसम" },
  alerts: { en: "Alerts", ml: "അറിയിപ്പുകൾ", hi: "अलर्ट" },
  tasks: { en: "Tasks", ml: "ജോലികൾ", hi: "कार्य" },
  crops: { en: "Crops", ml: "വിളകൾ", hi: "फसलें" },
  
  // Chat
  aiAssistant: { en: "AI Assistant", ml: "AI സഹായി", hi: "AI सहायक" },
  typeMessage: { en: "Type your message...", ml: "സന്ദേശം ടൈപ്പ് ചെയ്യുക...", hi: "अपना संदेश लिखें..." },
  voiceInput: { en: "Voice Input", ml: "ശബ്ദ ഇൻപുട്ട്", hi: "वॉइस इनपुट" },
  
  // Common
  loading: { en: "Loading...", ml: "ലോഡ് ചെയ്യുന്നു...", hi: "लोड हो रहा है..." },
  save: { en: "Save", ml: "സേവ് ചെയ്യുക", hi: "सहेजें" },
  cancel: { en: "Cancel", ml: "റദ്ദാക്കുക", hi: "रद्द करें" },
  close: { en: "Close", ml: "അടയ്ക്കുക", hi: "बंद करें" },
  resources: { en: "Resources", ml: "വിഭവങ്ങൾ", hi: "संसाधन" },
  logout: { en: "Logout", ml: "ലോഗ്ഔട്ട്", hi: "लॉगआउट" },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const { user } = useAuth();

  // Load language from profile on mount
  useEffect(() => {
    const loadLanguage = async () => {
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("language")
          .eq("id", user.id)
          .single();
        
        if (profile?.language && ["en", "ml", "hi"].includes(profile.language)) {
          setLanguageState(profile.language as Language);
        }
      } else {
        // Check localStorage for non-authenticated users
        const stored = localStorage.getItem("krishi-sakhi-language");
        if (stored && ["en", "ml", "hi"].includes(stored)) {
          setLanguageState(stored as Language);
        }
      }
    };

    loadLanguage();
  }, [user]);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("krishi-sakhi-language", lang);
    
    // Update profile if user is logged in
    if (user) {
      await supabase
        .from("profiles")
        .update({ language: lang })
        .eq("id", user.id);
    }
  };

  const t = (key: string): string => {
    if (translations[key]) {
      return translations[key][language];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
