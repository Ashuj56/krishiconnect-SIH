import { useState, useEffect } from "react";
import { Leaf, Mail, Lock, User, ArrowRight, Eye, EyeOff, Phone, MapPin, Mountain, Droplets, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { Language, translations } from "@/contexts/LanguageContext";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");
const phoneSchema = z.string().min(10, "Please enter a valid phone number");

type AuthMode = "signin" | "signup";
type SignupStep = 0 | 1 | 2; // 0 = language selection, 1 = personal, 2 = farm

const soilTypes = ["Alluvial", "Black/Clay", "Red", "Laterite", "Sandy", "Loamy"];
const waterSources = ["Well", "Canal", "Borewell", "River", "Rainwater", "Mixed"];

const languageOptions: { code: Language; name: string; nativeName: string }[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "hi", name: "Hindi", nativeName: "हिंदी" },
];

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [signupStep, setSignupStep] = useState<SignupStep>(0);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("en");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [landArea, setLandArea] = useState("");
  const [soilType, setSoilType] = useState("");
  const [waterSource, setWaterSource] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const navigate = useNavigate();
  const locationHook = useLocation();
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();

  const from = (locationHook.state as any)?.from?.pathname || "/";

  // Helper function for translations
  const t = (key: string): string => {
    if (translations[key]) {
      return translations[key][selectedLanguage];
    }
    return key;
  };

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  // Load language preference from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("krishi-sakhi-language");
    if (stored && ["en", "ml", "hi"].includes(stored)) {
      setSelectedLanguage(stored as Language);
    }
  }, []);

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Please enter your name";
    }

    try {
      emailSchema.parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.email = e.errors[0].message;
      }
    }

    try {
      passwordSchema.parse(password);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.password = e.errors[0].message;
      }
    }

    try {
      phoneSchema.parse(phone);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.phone = e.errors[0].message;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!location.trim()) {
      newErrors.location = "Please enter your location";
    }

    if (!landArea.trim() || isNaN(parseFloat(landArea))) {
      newErrors.landArea = "Please enter valid land area";
    }

    if (!soilType) {
      newErrors.soilType = "Please select soil type";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignIn = (): boolean => {
    const newErrors: Record<string, string> = {};

    try {
      emailSchema.parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.email = e.errors[0].message;
      }
    }

    try {
      passwordSchema.parse(password);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.password = e.errors[0].message;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLanguageSelect = () => {
    localStorage.setItem("krishi-sakhi-language", selectedLanguage);
    if (mode === "signup") {
      setSignupStep(1);
    }
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setSignupStep(2);
    }
  };

  const handleSignUp = async () => {
    if (!validateStep2()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const { error } = await signUp(email, password, fullName);
      
      if (error) {
        if (error.message.includes("already registered")) {
          toast({
            title: "Account Exists",
            description: "This email is already registered. Please sign in instead.",
            variant: "destructive",
          });
          setMode("signin");
          setSignupStep(0);
        } else {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        }
        return;
      }

      // Wait for auth to complete and get user
      const { data: { user: newUser } } = await supabase.auth.getUser();
      
      if (newUser) {
        // Update profile with phone, location, and language
        await supabase.from("profiles").update({
          phone,
          location,
          language: selectedLanguage,
        }).eq("id", newUser.id);

        // Create farm record
        await supabase.from("farms").insert({
          user_id: newUser.id,
          name: `${fullName}'s Farm`,
          location,
          total_area: parseFloat(landArea),
          area_unit: "acres",
          soil_type: soilType,
          water_source: waterSource || null,
        });

        toast({
          title: "Welcome to Krishi Sakhi!",
          description: "Your account and farm profile have been created.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!validateSignIn()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const { error } = await signIn(email, password);
      
      if (!error) {
        // Update language preference after successful login
        localStorage.setItem("krishi-sakhi-language", selectedLanguage);
        
        // Get user and update profile language
        const { data: { user: loggedInUser } } = await supabase.auth.getUser();
        if (loggedInUser) {
          await supabase.from("profiles").update({
            language: selectedLanguage,
          }).eq("id", loggedInUser.id);
        }
      }
      
      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast({
            title: "Login Failed",
            description: "Invalid email or password. Please try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (mode === "signin") {
      await handleSignIn();
    } else if (signupStep === 0) {
      handleLanguageSelect();
    } else if (signupStep === 1) {
      handleNextStep();
    } else {
      await handleSignUp();
    }
  };

  const resetForm = () => {
    setSignupStep(0);
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-background flex flex-col kerala-pattern">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gradient-kerala">
        <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6 animate-float shadow-2xl border border-white/30">
          <svg viewBox="0 0 60 60" className="w-14 h-14">
            <g fill="none" stroke="#FFD54F" strokeWidth="2.5" strokeLinecap="round">
              <ellipse cx="22" cy="20" rx="4" ry="8" fill="#FFD54F" stroke="none" />
              <ellipse cx="38" cy="20" rx="4" ry="8" fill="#FFD54F" stroke="none" />
              <ellipse cx="30" cy="15" rx="4" ry="9" fill="#FFD54F" stroke="none" />
              <path d="M30 55 L30 25" />
              <path d="M30 45 Q15 40 10 50" stroke="#81C784" strokeWidth="3" />
              <path d="M30 45 Q45 40 50 50" stroke="#81C784" strokeWidth="3" />
            </g>
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-1 text-primary-foreground">Krishi Sakhi</h1>
        <h2 className="text-xl font-semibold text-primary-foreground/90 font-malayalam mb-2">കൃഷി സഖി</h2>
        <p className="text-primary-foreground/80 text-sm">Your AI-Powered Farming Companion</p>
      </div>

      {/* Auth Card */}
      <Card className="rounded-t-3xl rounded-b-none border-b-0 safe-bottom">
        <CardHeader className="text-center pb-2">
          <CardTitle>
            {mode === "signin" 
              ? t("welcomeBack") 
              : signupStep === 0
                ? t("selectLanguage")
                : signupStep === 1 
                  ? t("createAccount")
                  : t("farmDetails")}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "signin" 
              ? "Sign in to access your farm data" 
              : signupStep === 0
                ? "Choose your preferred language"
                : signupStep === 1
                  ? "Enter your personal details"
                  : "Tell us about your farm"}
          </p>
        </CardHeader>
        <CardContent className="pb-8 space-y-4">
          {/* Mode Toggle */}
          <div className="flex rounded-xl bg-muted p-1 mb-6">
            <button
              onClick={() => { setMode("signin"); resetForm(); }}
              className={cn(
                "flex-1 py-2.5 rounded-lg text-sm font-medium transition-all",
                mode === "signin" 
                  ? "bg-card shadow-sm text-foreground" 
                  : "text-muted-foreground"
              )}
            >
              {t("signIn")}
            </button>
            <button
              onClick={() => { setMode("signup"); resetForm(); }}
              className={cn(
                "flex-1 py-2.5 rounded-lg text-sm font-medium transition-all",
                mode === "signup" 
                  ? "bg-card shadow-sm text-foreground" 
                  : "text-muted-foreground"
              )}
            >
              {t("signUp")}
            </button>
          </div>

          {/* Language Selection for Sign In */}
          {mode === "signin" && (
            <>
              <div className="space-y-3 mb-4">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  {t("selectLanguage")}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {languageOptions.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setSelectedLanguage(lang.code);
                        localStorage.setItem("krishi-sakhi-language", lang.code);
                      }}
                      className={cn(
                        "p-3 rounded-xl border-2 transition-all text-center",
                        selectedLanguage === lang.code
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <span className="block text-lg font-semibold">{lang.nativeName}</span>
                      <span className="text-xs text-muted-foreground">{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("email")}
                    className={cn(
                      "w-full h-14 pl-12 pr-4 rounded-xl bg-muted border-2 border-transparent focus:ring-0 focus:border-primary/50 outline-none",
                      errors.email && "border-destructive"
                    )}
                  />
                </div>
                {errors.email && <p className="text-xs text-destructive pl-1">{errors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("password")}
                    onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
                    className={cn(
                      "w-full h-14 pl-12 pr-12 rounded-xl bg-muted border-2 border-transparent focus:ring-0 focus:border-primary/50 outline-none",
                      errors.password && "border-destructive"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive pl-1">{errors.password}</p>}
              </div>
            </>
          )}

          {/* Sign Up Step 0 - Language Selection */}
          {mode === "signup" && signupStep === 0 && (
            <div className="space-y-4">
              <div className="grid gap-3">
                {languageOptions.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setSelectedLanguage(lang.code)}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all flex items-center gap-4",
                      selectedLanguage === lang.code
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Globe className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-left flex-1">
                      <span className="block text-lg font-semibold">{lang.nativeName}</span>
                      <span className="text-sm text-muted-foreground">{lang.name}</span>
                    </div>
                    {selectedLanguage === lang.code && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sign Up Step 1 - Personal Details */}
          {mode === "signup" && signupStep === 1 && (
            <>
              <div className="space-y-1.5">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t("fullName")}
                    className={cn(
                      "w-full h-14 pl-12 pr-4 rounded-xl bg-muted border-2 border-transparent focus:ring-0 focus:border-primary/50 outline-none",
                      errors.fullName && "border-destructive"
                    )}
                  />
                </div>
                {errors.fullName && <p className="text-xs text-destructive pl-1">{errors.fullName}</p>}
              </div>

              <div className="space-y-1.5">
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t("phone")}
                    className={cn(
                      "w-full h-14 pl-12 pr-4 rounded-xl bg-muted border-2 border-transparent focus:ring-0 focus:border-primary/50 outline-none",
                      errors.phone && "border-destructive"
                    )}
                  />
                </div>
                {errors.phone && <p className="text-xs text-destructive pl-1">{errors.phone}</p>}
              </div>

              <div className="space-y-1.5">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("email")}
                    className={cn(
                      "w-full h-14 pl-12 pr-4 rounded-xl bg-muted border-2 border-transparent focus:ring-0 focus:border-primary/50 outline-none",
                      errors.email && "border-destructive"
                    )}
                  />
                </div>
                {errors.email && <p className="text-xs text-destructive pl-1">{errors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("password")}
                    className={cn(
                      "w-full h-14 pl-12 pr-12 rounded-xl bg-muted border-2 border-transparent focus:ring-0 focus:border-primary/50 outline-none",
                      errors.password && "border-destructive"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive pl-1">{errors.password}</p>}
              </div>

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setSignupStep(0)}
              >
                ← {t("back")}
              </Button>
            </>
          )}

          {/* Sign Up Step 2 - Farm Details */}
          {mode === "signup" && signupStep === 2 && (
            <>
              <div className="space-y-1.5">
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={t("farmLocation")}
                    className={cn(
                      "w-full h-14 pl-12 pr-4 rounded-xl bg-muted border-2 border-transparent focus:ring-0 focus:border-primary/50 outline-none",
                      errors.location && "border-destructive"
                    )}
                  />
                </div>
                {errors.location && <p className="text-xs text-destructive pl-1">{errors.location}</p>}
              </div>

              <div className="space-y-1.5">
                <div className="relative">
                  <Leaf className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="number"
                    value={landArea}
                    onChange={(e) => setLandArea(e.target.value)}
                    placeholder={t("landArea")}
                    className={cn(
                      "w-full h-14 pl-12 pr-4 rounded-xl bg-muted border-2 border-transparent focus:ring-0 focus:border-primary/50 outline-none",
                      errors.landArea && "border-destructive"
                    )}
                  />
                </div>
                {errors.landArea && <p className="text-xs text-destructive pl-1">{errors.landArea}</p>}
              </div>

              <div className="space-y-1.5">
                <div className="relative">
                  <Mountain className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <select
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                    className={cn(
                      "w-full h-14 pl-12 pr-4 rounded-xl bg-muted border-2 border-transparent focus:ring-0 focus:border-primary/50 outline-none appearance-none",
                      errors.soilType && "border-destructive",
                      !soilType && "text-muted-foreground"
                    )}
                  >
                    <option value="">{t("soilType")}</option>
                    {soilTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                {errors.soilType && <p className="text-xs text-destructive pl-1">{errors.soilType}</p>}
              </div>

              <div className="space-y-1.5">
                <div className="relative">
                  <Droplets className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <select
                    value={waterSource}
                    onChange={(e) => setWaterSource(e.target.value)}
                    className={cn(
                      "w-full h-14 pl-12 pr-4 rounded-xl bg-muted border-2 border-transparent focus:ring-0 focus:border-primary/50 outline-none appearance-none",
                      !waterSource && "text-muted-foreground"
                    )}
                  >
                    <option value="">{t("waterSource")} (optional)</option>
                    {waterSources.map((source) => (
                      <option key={source} value={source}>{source}</option>
                    ))}
                  </select>
                </div>
              </div>

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setSignupStep(1)}
              >
                ← {t("back")}
              </Button>
            </>
          )}

          <Button
            size="lg"
            className="w-full h-14 text-base"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {mode === "signin" 
                  ? t("signIn")
                  : signupStep === 0
                    ? t("continueBtn")
                    : signupStep === 1 
                      ? t("next")
                      : t("createAccount")}
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground pt-2">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
