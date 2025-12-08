import { useState, useEffect } from "react";
import { Bell, Globe, Moon, Shield, Download, Trash2, ChevronRight, HelpCircle, Check, Loader2, Sun } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useLanguage, Language, translations } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Settings translations
const settingsTranslations = {
  settings: { en: "Settings", ml: "ക്രമീകരണങ്ങൾ", hi: "सेटिंग्स" },
  managePreferences: { en: "Manage your preferences", ml: "നിങ്ങളുടെ മുൻഗണനകൾ നിയന്ത്രിക്കുക", hi: "अपनी प्राथमिकताएं प्रबंधित करें" },
  notifications: { en: "Notifications", ml: "അറിയിപ്പുകൾ", hi: "सूचनाएं" },
  pushNotifications: { en: "Push Notifications", ml: "പുഷ് അറിയിപ്പുകൾ", hi: "पुश सूचनाएं" },
  receiveAlerts: { en: "Receive alerts on your device", ml: "നിങ്ങളുടെ ഉപകരണത്തിൽ അലേർട്ടുകൾ ലഭിക്കുക", hi: "अपने डिवाइस पर अलर्ट प्राप्त करें" },
  weatherAlerts: { en: "Weather Alerts", ml: "കാലാവസ്ഥ അലേർട്ടുകൾ", hi: "मौसम अलर्ट" },
  severeWeather: { en: "Severe weather warnings", ml: "കടുത്ത കാലാവസ്ഥ മുന്നറിയിപ്പുകൾ", hi: "गंभीर मौसम चेतावनी" },
  taskReminders: { en: "Task Reminders", ml: "ടാസ്ക് ഓർമ്മപ്പെടുത്തലുകൾ", hi: "कार्य अनुस्मारक" },
  dailyTasks: { en: "Daily farming tasks", ml: "ദൈനംദിന കൃഷി ജോലികൾ", hi: "दैनिक खेती कार्य" },
  marketUpdates: { en: "Market Price Updates", ml: "വിപണി വില അപ്ഡേറ്റുകൾ", hi: "बाजार मूल्य अपडेट" },
  dailyPrices: { en: "Daily price notifications", ml: "ദൈനംദിന വില അറിയിപ്പുകൾ", hi: "दैनिक मूल्य सूचनाएं" },
  languageRegion: { en: "Language & Region", ml: "ഭാഷയും പ്രദേശവും", hi: "भाषा और क्षेत्र" },
  appLanguage: { en: "App Language", ml: "ആപ്പ് ഭാഷ", hi: "ऐप भाषा" },
  voiceLanguage: { en: "Voice Input Language", ml: "വോയ്സ് ഇൻപുട്ട് ഭാഷ", hi: "वॉइस इनपुट भाषा" },
  units: { en: "Units", ml: "യൂണിറ്റുകൾ", hi: "इकाइयां" },
  metric: { en: "Metric (kg, hectares)", ml: "മെട്രിക് (കിലോ, ഹെക്ടർ)", hi: "मीट्रिक (किग्रा, हेक्टेयर)" },
  imperial: { en: "Imperial (lb, acres)", ml: "ഇംപീരിയൽ (പൗണ്ട്, ഏക്കർ)", hi: "इंपीरियल (पाउंड, एकड़)" },
  appearance: { en: "Appearance", ml: "രൂപം", hi: "दिखावट" },
  darkMode: { en: "Dark Mode", ml: "ഡാർക്ക് മോഡ്", hi: "डार्क मोड" },
  useDarkTheme: { en: "Use dark theme", ml: "ഡാർക്ക് തീം ഉപയോഗിക്കുക", hi: "डार्क थीम उपयोग करें" },
  privacySecurity: { en: "Privacy & Security", ml: "സ്വകാര്യതയും സുരക്ഷയും", hi: "गोपनीयता और सुरक्षा" },
  changePassword: { en: "Change Password", ml: "പാസ്‌വേഡ് മാറ്റുക", hi: "पासवर्ड बदलें" },
  privacyPolicy: { en: "Privacy Policy", ml: "സ്വകാര്യതാ നയം", hi: "गोपनीयता नीति" },
  termsOfService: { en: "Terms of Service", ml: "സേവന നിബന്ധനകൾ", hi: "सेवा की शर्तें" },
  dataManagement: { en: "Data Management", ml: "ഡാറ്റ മാനേജ്മെന്റ്", hi: "डेटा प्रबंधन" },
  exportData: { en: "Export My Data", ml: "എന്റെ ഡാറ്റ എക്സ്പോർട്ട് ചെയ്യുക", hi: "मेरा डेटा निर्यात करें" },
  deleteAccount: { en: "Delete Account", ml: "അക്കൗണ്ട് ഇല്ലാതാക്കുക", hi: "खाता हटाएं" },
  helpSupport: { en: "Help & Support", ml: "സഹായവും പിന്തുണയും", hi: "मदद और समर्थन" },
  faqContact: { en: "FAQs, Contact Us", ml: "FAQ-കൾ, ഞങ്ങളെ ബന്ധപ്പെടുക", hi: "सामान्य प्रश्न, संपर्क करें" },
  english: { en: "English", ml: "ഇംഗ്ലീഷ്", hi: "अंग्रेज़ी" },
  malayalam: { en: "Malayalam", ml: "മലയാളം", hi: "मलयालम" },
  hindi: { en: "Hindi", ml: "ഹിന്ദി", hi: "हिंदी" },
  selectLanguageTitle: { en: "Select Language", ml: "ഭാഷ തിരഞ്ഞെടുക്കുക", hi: "भाषा चुनें" },
  selectUnits: { en: "Select Units", ml: "യൂണിറ്റുകൾ തിരഞ്ഞെടുക്കുക", hi: "इकाइयां चुनें" },
  confirmDelete: { en: "Are you sure?", ml: "നിങ്ങൾക്ക് ഉറപ്പാണോ?", hi: "क्या आप सुनिश्चित हैं?" },
  deleteWarning: { en: "This action cannot be undone. This will permanently delete your account and remove all your data.", ml: "ഈ പ്രവർത്തനം പഴയപടിയാക്കാൻ കഴിയില്ല. ഇത് നിങ്ങളുടെ അക്കൗണ്ട് ശാശ്വതമായി ഇല്ലാതാക്കും.", hi: "इस क्रिया को पूर्ववत नहीं किया जा सकता। यह आपके खाते को स्थायी रूप से हटा देगा।" },
  cancel: { en: "Cancel", ml: "റദ്ദാക്കുക", hi: "रद्द करें" },
  confirm: { en: "Confirm", ml: "സ്ഥിരീകരിക്കുക", hi: "पुष्टि करें" },
  exporting: { en: "Exporting...", ml: "എക്സ്പോർട്ട് ചെയ്യുന്നു...", hi: "निर्यात हो रहा है..." },
  saved: { en: "Saved", ml: "സേവ് ചെയ്തു", hi: "सहेजा गया" },
};

type UnitSystem = "metric" | "imperial";

interface NotificationPreferences {
  push: boolean;
  weather: boolean;
  tasks: boolean;
  market: boolean;
}

export default function Settings() {
  const { language, setLanguage, t } = useLanguage();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  // Settings state
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    push: true,
    weather: true,
    tasks: true,
    market: false,
  });
  const [units, setUnits] = useState<UnitSystem>("metric");
  const [voiceLanguage, setVoiceLanguage] = useState<Language>(language);

  // Dialog states
  const [languageDialogOpen, setLanguageDialogOpen] = useState(false);
  const [voiceLanguageDialogOpen, setVoiceLanguageDialogOpen] = useState(false);
  const [unitsDialogOpen, setUnitsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false);
  const [termsDialogOpen, setTermsDialogOpen] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  // Loading states
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Translation helper for settings
  const ts = (key: string): string => {
    if (settingsTranslations[key as keyof typeof settingsTranslations]) {
      return settingsTranslations[key as keyof typeof settingsTranslations][language];
    }
    return key;
  };

  // Load settings from localStorage
  useEffect(() => {
    const savedNotifications = localStorage.getItem("krishi-notifications");
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }

    const savedUnits = localStorage.getItem("krishi-units");
    if (savedUnits) {
      setUnits(savedUnits as UnitSystem);
    }

    const savedVoiceLang = localStorage.getItem("krishi-voice-language");
    if (savedVoiceLang) {
      setVoiceLanguage(savedVoiceLang as Language);
    }
  }, []);

  // Save notification preferences
  const updateNotification = (key: keyof NotificationPreferences, value: boolean) => {
    const updated = { ...notifications, [key]: value };
    setNotifications(updated);
    localStorage.setItem("krishi-notifications", JSON.stringify(updated));
    toast({
      title: ts("saved"),
      description: `${key} notifications ${value ? "enabled" : "disabled"}`,
    });
  };

  // Handle language change
  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    setLanguageDialogOpen(false);
    toast({
      title: ts("saved"),
      description: `Language changed to ${newLang === "en" ? "English" : newLang === "ml" ? "Malayalam" : "Hindi"}`,
    });
  };

  // Handle voice language change
  const handleVoiceLanguageChange = (newLang: Language) => {
    setVoiceLanguage(newLang);
    localStorage.setItem("krishi-voice-language", newLang);
    setVoiceLanguageDialogOpen(false);
    toast({
      title: ts("saved"),
      description: `Voice language changed`,
    });
  };

  // Handle units change
  const handleUnitsChange = (newUnits: UnitSystem) => {
    setUnits(newUnits);
    localStorage.setItem("krishi-units", newUnits);
    setUnitsDialogOpen(false);
    toast({
      title: ts("saved"),
      description: `Units changed to ${newUnits}`,
    });
  };

  // Export user data
  const handleExportData = async () => {
    if (!user) return;
    setExporting(true);

    try {
      // Fetch all user data
      const [profileRes, farmsRes, cropsRes, activitiesRes, tasksRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id),
        supabase.from("farms").select("*").eq("user_id", user.id),
        supabase.from("crops").select("*").eq("user_id", user.id),
        supabase.from("activities").select("*").eq("user_id", user.id),
        supabase.from("tasks").select("*").eq("user_id", user.id),
      ]);

      const exportData = {
        exportedAt: new Date().toISOString(),
        profile: profileRes.data?.[0] || null,
        farms: farmsRes.data || [],
        crops: cropsRes.data || [],
        activities: activitiesRes.data || [],
        tasks: tasksRes.data || [],
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `krishi-sakhi-data-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: "Your data has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeleting(true);

    try {
      // Delete user data from all tables
      await Promise.all([
        supabase.from("activities").delete().eq("user_id", user.id),
        supabase.from("tasks").delete().eq("user_id", user.id),
        supabase.from("crops").delete().eq("user_id", user.id),
        supabase.from("farms").delete().eq("user_id", user.id),
        supabase.from("chat_messages").delete().eq("user_id", user.id),
        supabase.from("notifications").delete().eq("user_id", user.id),
        supabase.from("scan_results").delete().eq("user_id", user.id),
        supabase.from("farmer_documents").delete().eq("user_id", user.id),
      ]);

      // Sign out the user
      await signOut();

      toast({
        title: "Account Deleted",
        description: "Your account has been deleted successfully.",
      });

      navigate("/auth");
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  // Handle password reset
  const handlePasswordReset = async () => {
    if (!user?.email) return;

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) throw error;

      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for a password reset link.",
      });
      setPasswordDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send password reset email.",
        variant: "destructive",
      });
    }
  };

  const getLanguageLabel = (lang: Language) => {
    switch (lang) {
      case "en": return "English";
      case "ml": return "മലയാളം";
      case "hi": return "हिन्दी";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border safe-top">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold">{ts("settings")}</h1>
          <p className="text-xs text-muted-foreground">{ts("managePreferences")}</p>
        </div>
      </header>

      <div className="p-4 space-y-4 animate-fade-in">
        {/* Notifications */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              {ts("notifications")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{ts("pushNotifications")}</p>
                <p className="text-sm text-muted-foreground">{ts("receiveAlerts")}</p>
              </div>
              <Switch 
                checked={notifications.push} 
                onCheckedChange={(checked) => updateNotification("push", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{ts("weatherAlerts")}</p>
                <p className="text-sm text-muted-foreground">{ts("severeWeather")}</p>
              </div>
              <Switch 
                checked={notifications.weather}
                onCheckedChange={(checked) => updateNotification("weather", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{ts("taskReminders")}</p>
                <p className="text-sm text-muted-foreground">{ts("dailyTasks")}</p>
              </div>
              <Switch 
                checked={notifications.tasks}
                onCheckedChange={(checked) => updateNotification("tasks", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{ts("marketUpdates")}</p>
                <p className="text-sm text-muted-foreground">{ts("dailyPrices")}</p>
              </div>
              <Switch 
                checked={notifications.market}
                onCheckedChange={(checked) => updateNotification("market", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Language */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              {ts("languageRegion")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button 
              onClick={() => setLanguageDialogOpen(true)}
              className="w-full flex items-center justify-between p-3 rounded-xl border hover:bg-muted/50 transition-colors"
            >
              <div>
                <p className="font-medium">{ts("appLanguage")}</p>
                <p className="text-sm text-muted-foreground">{getLanguageLabel(language)}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
            <button 
              onClick={() => setVoiceLanguageDialogOpen(true)}
              className="w-full flex items-center justify-between p-3 rounded-xl border hover:bg-muted/50 transition-colors"
            >
              <div>
                <p className="font-medium">{ts("voiceLanguage")}</p>
                <p className="text-sm text-muted-foreground">{getLanguageLabel(voiceLanguage)}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
            <button 
              onClick={() => setUnitsDialogOpen(true)}
              className="w-full flex items-center justify-between p-3 rounded-xl border hover:bg-muted/50 transition-colors"
            >
              <div>
                <p className="font-medium">{ts("units")}</p>
                <p className="text-sm text-muted-foreground">
                  {units === "metric" ? ts("metric") : ts("imperial")}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              {theme === "dark" ? (
                <Moon className="w-5 h-5 text-primary" />
              ) : (
                <Sun className="w-5 h-5 text-primary" />
              )}
              {ts("appearance")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{ts("darkMode")}</p>
                <p className="text-sm text-muted-foreground">{ts("useDarkTheme")}</p>
              </div>
              <Switch 
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              {ts("privacySecurity")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button 
              onClick={() => setPasswordDialogOpen(true)}
              className="w-full flex items-center justify-between p-3 rounded-xl border hover:bg-muted/50 transition-colors"
            >
              <p className="font-medium">{ts("changePassword")}</p>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
            <button 
              onClick={() => setPrivacyDialogOpen(true)}
              className="w-full flex items-center justify-between p-3 rounded-xl border hover:bg-muted/50 transition-colors"
            >
              <p className="font-medium">{ts("privacyPolicy")}</p>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
            <button 
              onClick={() => setTermsDialogOpen(true)}
              className="w-full flex items-center justify-between p-3 rounded-xl border hover:bg-muted/50 transition-colors"
            >
              <p className="font-medium">{ts("termsOfService")}</p>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-primary" />
              {ts("dataManagement")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={handleExportData}
              disabled={exporting}
            >
              {exporting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              {exporting ? ts("exporting") : ts("exportData")}
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {ts("deleteAccount")}
            </Button>
          </CardContent>
        </Card>

        {/* Help & Support */}
        <Card>
          <CardContent className="p-4">
            <button 
              onClick={() => setHelpDialogOpen(true)}
              className="w-full flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium">{ts("helpSupport")}</p>
                <p className="text-sm text-muted-foreground">{ts("faqContact")}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto" />
            </button>
          </CardContent>
        </Card>

        {/* App Version */}
        <p className="text-center text-sm text-muted-foreground pt-4">
          Krishi Connect v1.0.0
        </p>
      </div>

      {/* Language Selection Dialog */}
      <Dialog open={languageDialogOpen} onOpenChange={setLanguageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{ts("selectLanguageTitle")}</DialogTitle>
            <DialogDescription>
              Choose your preferred app language
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {(["en", "ml", "hi"] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-colors ${
                  language === lang ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                }`}
              >
                <span className="font-medium">{getLanguageLabel(lang)}</span>
                {language === lang && <Check className="w-5 h-5 text-primary" />}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Voice Language Dialog */}
      <Dialog open={voiceLanguageDialogOpen} onOpenChange={setVoiceLanguageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{ts("voiceLanguage")}</DialogTitle>
            <DialogDescription>
              Choose your voice input language
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {(["en", "ml", "hi"] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => handleVoiceLanguageChange(lang)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-colors ${
                  voiceLanguage === lang ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                }`}
              >
                <span className="font-medium">{getLanguageLabel(lang)}</span>
                {voiceLanguage === lang && <Check className="w-5 h-5 text-primary" />}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Units Dialog */}
      <Dialog open={unitsDialogOpen} onOpenChange={setUnitsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{ts("selectUnits")}</DialogTitle>
            <DialogDescription>
              Choose your preferred measurement system
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <button
              onClick={() => handleUnitsChange("metric")}
              className={`w-full flex items-center justify-between p-4 rounded-xl border transition-colors ${
                units === "metric" ? "border-primary bg-primary/5" : "hover:bg-muted/50"
              }`}
            >
              <div className="text-left">
                <p className="font-medium">{ts("metric")}</p>
                <p className="text-sm text-muted-foreground">Kilograms, Hectares, Celsius</p>
              </div>
              {units === "metric" && <Check className="w-5 h-5 text-primary" />}
            </button>
            <button
              onClick={() => handleUnitsChange("imperial")}
              className={`w-full flex items-center justify-between p-4 rounded-xl border transition-colors ${
                units === "imperial" ? "border-primary bg-primary/5" : "hover:bg-muted/50"
              }`}
            >
              <div className="text-left">
                <p className="font-medium">{ts("imperial")}</p>
                <p className="text-sm text-muted-foreground">Pounds, Acres, Fahrenheit</p>
              </div>
              {units === "imperial" && <Check className="w-5 h-5 text-primary" />}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{ts("confirmDelete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {ts("deleteWarning")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{ts("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {ts("deleteAccount")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Password Reset Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{ts("changePassword")}</DialogTitle>
            <DialogDescription>
              We'll send you an email with a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
              {ts("cancel")}
            </Button>
            <Button onClick={handlePasswordReset}>
              Send Reset Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Privacy Policy Dialog */}
      <Dialog open={privacyDialogOpen} onOpenChange={setPrivacyDialogOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{ts("privacyPolicy")}</DialogTitle>
          </DialogHeader>
          <div className="prose prose-sm dark:prose-invert">
            <h3>Data Collection</h3>
            <p>We collect information you provide directly, including your name, email, phone number, and farm details to provide personalized farming assistance.</p>
            
            <h3>Data Usage</h3>
            <p>Your data is used to:</p>
            <ul>
              <li>Provide personalized farming recommendations</li>
              <li>Send weather alerts and market updates</li>
              <li>Improve our AI assistant</li>
            </ul>
            
            <h3>Data Protection</h3>
            <p>We implement industry-standard security measures to protect your data. Your information is encrypted and stored securely.</p>
            
            <h3>Your Rights</h3>
            <p>You can export or delete your data at any time through the Settings page.</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Terms of Service Dialog */}
      <Dialog open={termsDialogOpen} onOpenChange={setTermsDialogOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{ts("termsOfService")}</DialogTitle>
          </DialogHeader>
          <div className="prose prose-sm dark:prose-invert">
            <h3>Acceptance of Terms</h3>
            <p>By using Krishi Connect, you agree to these terms of service.</p>
            
            <h3>Use of Service</h3>
            <p>The service is provided for informational purposes. Farming advice should be verified with local agricultural experts.</p>
            
            <h3>User Responsibilities</h3>
            <ul>
              <li>Provide accurate farm information</li>
              <li>Keep your account secure</li>
              <li>Use the service responsibly</li>
            </ul>
            
            <h3>Disclaimer</h3>
            <p>While we strive for accuracy, we cannot guarantee the outcomes of farming decisions made based on our recommendations.</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Help & Support Dialog */}
      <Dialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{ts("helpSupport")}</DialogTitle>
            <DialogDescription>
              How can we help you?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 rounded-xl border">
              <h4 className="font-medium mb-2">Frequently Asked Questions</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong>Q:</strong> How do I add a new crop?</p>
                <p><strong>A:</strong> Go to My Farm page and tap "Add Crop".</p>
                <p className="mt-2"><strong>Q:</strong> How accurate is the weather data?</p>
                <p><strong>A:</strong> We use OpenWeatherMap API for real-time weather updates.</p>
              </div>
            </div>
            
            <div className="p-4 rounded-xl border">
              <h4 className="font-medium mb-2">Contact Us</h4>
              <p className="text-sm text-muted-foreground">
                Email: support@krishisakhi.app
              </p>
              <p className="text-sm text-muted-foreground">
                Phone: +91 1800-XXX-XXXX
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
