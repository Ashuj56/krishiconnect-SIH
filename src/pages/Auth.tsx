import { useState, useEffect, useRef } from "react";
import { Leaf, User, Phone, MapPin, Mountain, Droplets, Globe, Navigation, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { Language, translations } from "@/contexts/LanguageContext";
import { keralaDistricts, getSoilTypesForDistrict, getPrimarySoilType } from "@/data/keralaSoilMapping";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const phoneSchema = z.string().min(10, "Please enter a valid 10-digit phone number").max(10, "Phone number must be 10 digits");

type AuthMode = "signin" | "signup";
type AuthStep = "phone" | "otp" | "details" | "farm"; // phone -> otp -> details (signup only) -> farm (signup only)

const waterSources = ["Well", "Canal", "Borewell", "River", "Rainwater", "Mixed"];

const languageOptions: { code: Language; name: string; nativeName: string }[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "hi", name: "Hindi", nativeName: "हिंदी" },
];

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [step, setStep] = useState<AuthStep>("phone");
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("en");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [fullName, setFullName] = useState("");
  const [district, setDistrict] = useState("");
  const [village, setVillage] = useState("");
  const [landArea, setLandArea] = useState("");
  const [soilType, setSoilType] = useState("");
  const [availableSoilTypes, setAvailableSoilTypes] = useState<string[]>([]);
  const [waterSource, setWaterSource] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [soilDetectedByGPS, setSoilDetectedByGPS] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  
  const navigate = useNavigate();
  const locationHook = useLocation();
  const { sendOtp, verifyOtp, user } = useAuth();
  const { toast } = useToast();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      timerRef.current = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resendTimer]);

  const validatePhone = (): boolean => {
    const newErrors: Record<string, string> = {};
    const cleanPhone = phone.replace(/\D/g, '');
    
    try {
      phoneSchema.parse(cleanPhone);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.phone = e.errors[0].message;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateDetails = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Please enter your name";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateFarm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!district) {
      newErrors.district = "Please select your district";
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

  // Auto-fill soil type when district changes
  const handleDistrictChange = (selectedDistrict: string) => {
    setDistrict(selectedDistrict);
    setSoilDetectedByGPS(false);
    if (selectedDistrict) {
      const soilTypes = getSoilTypesForDistrict(selectedDistrict);
      setAvailableSoilTypes(soilTypes);
      const primarySoil = getPrimarySoilType(selectedDistrict);
      setSoilType(primarySoil);
    } else {
      setAvailableSoilTypes([]);
      setSoilType("");
    }
  };

  // Detect location and soil type using GPS
  const handleDetectLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location Not Supported",
        description: "Your browser does not support location services.",
        variant: "destructive",
      });
      return;
    }

    setIsDetectingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          const { data, error } = await supabase.functions.invoke('get-soil-type', {
            body: { latitude, longitude }
          });

          if (error) throw error;

          if (data?.success) {
            // Update district field
            setDistrict(data.district);
            
            // Update soil type fields (API returns camelCase)
            const detectedSoilType = data.soilType || data.soil_type;
            const detectedSoilTypes = data.soilTypes || data.soil_types || [];
            
            setSoilType(detectedSoilType);
            setAvailableSoilTypes(detectedSoilTypes.length > 0 ? detectedSoilTypes : [detectedSoilType]);
            setSoilDetectedByGPS(true);
            
            // Set village if available
            if (data.village) {
              setVillage(data.village);
            }
            
            toast({
              title: "Location Detected",
              description: `District: ${data.district}, Soil: ${detectedSoilType}`,
            });
          } else {
            toast({
              title: "Soil type not found",
              description: "Soil type not found for this location. Please select manually.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Soil detection error:", error);
          toast({
            title: "Detection Failed",
            description: "Unable to detect soil type. Please select manually.",
            variant: "destructive",
          });
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (error) => {
        setIsDetectingLocation(false);
        let message = "Unable to get your location.";
        if (error.code === error.PERMISSION_DENIED) {
          message = "Location permission denied. Please enable location access.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = "Location information unavailable.";
        } else if (error.code === error.TIMEOUT) {
          message = "Location request timed out.";
        }
        toast({
          title: "Location Error",
          description: message,
          variant: "destructive",
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSendOtp = async () => {
    if (!validatePhone()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const { error } = await sendOtp(cleanPhone);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setOtpSent(true);
      setStep("otp");
      setResendTimer(60);
      toast({
        title: "OTP Sent",
        description: `A 6-digit code has been sent to +91 ${cleanPhone}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setErrors({ otp: "Please enter the 6-digit OTP" });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const { error, isNewUser } = await verifyOtp(cleanPhone, otp);

      if (error) {
        toast({
          title: "Verification Failed",
          description: "Invalid OTP. Please try again.",
          variant: "destructive",
        });
        return;
      }

      localStorage.setItem("krishi-sakhi-language", selectedLanguage);

      if (mode === "signup" || isNewUser) {
        // New user - collect details
        setStep("details");
        toast({
          title: "Phone Verified",
          description: "Please complete your profile.",
        });
      } else {
        // Existing user - update language and redirect
        const { data: { user: loggedInUser } } = await supabase.auth.getUser();
        if (loggedInUser) {
          await supabase.from("profiles").update({
            language: selectedLanguage,
          }).eq("id", loggedInUser.id);
        }
        toast({
          title: "Welcome Back!",
          description: "Successfully signed in.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDetails = async () => {
    if (!validateDetails()) return;

    setIsLoading(true);

    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (currentUser) {
        await supabase.from("profiles").update({
          full_name: fullName,
          phone: phone.replace(/\D/g, ''),
          language: selectedLanguage,
        }).eq("id", currentUser.id);
      }

      setStep("farm");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveFarm = async () => {
    if (!validateFarm()) return;

    setIsLoading(true);

    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (currentUser) {
        // Format location
        const formattedLocation = village.trim() 
          ? `${village.trim()}, ${district}, Kerala` 
          : `${district}, Kerala`;

        // Update profile location
        await supabase.from("profiles").update({
          location: formattedLocation,
        }).eq("id", currentUser.id);

        // Create farm record
        await supabase.from("farms").insert({
          user_id: currentUser.id,
          name: `${fullName}'s Farm`,
          location: district,
          total_area: parseFloat(landArea),
          area_unit: "acres",
          soil_type: soilType,
          water_source: waterSource || null,
        });

        toast({
          title: "Welcome to Krishi Connect!",
          description: "Your account and farm profile have been created.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    await handleSendOtp();
  };

  const resetForm = () => {
    setStep("phone");
    setOtp("");
    setOtpSent(false);
    setErrors({});
  };

  const getStepTitle = () => {
    if (mode === "signin") {
      return step === "phone" ? t("signIn") : "Verify OTP";
    }
    switch (step) {
      case "phone": return t("signUp");
      case "otp": return "Verify OTP";
      case "details": return t("createAccount");
      case "farm": return t("farmDetails");
    }
  };

  const getStepDescription = () => {
    if (mode === "signin") {
      return step === "phone" ? "Enter your phone number to sign in" : "Enter the 6-digit code sent to your phone";
    }
    switch (step) {
      case "phone": return "Enter your phone number to get started";
      case "otp": return "Enter the 6-digit code sent to your phone";
      case "details": return "Enter your personal details";
      case "farm": return "Tell us about your farm";
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Full-screen background image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/kerala-bg-5.jpg')" }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
      
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative z-10">
        <div className="w-28 h-28 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6 animate-float shadow-2xl border border-white/30 overflow-hidden">
          <img 
            src="/krishi-connect-logo.jpg" 
            alt="Krishi Connect Logo" 
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className="text-3xl font-bold mb-1 text-white drop-shadow-lg">Krishi Connect</h1>
        <h2 className="text-xl font-semibold text-white/90 font-malayalam mb-2 drop-shadow-md">കൃഷി കണക്ട്</h2>
        <p className="text-white/80 text-sm drop-shadow-sm">Your AI-Powered Farming Companion</p>
      </div>

      {/* Auth Card */}
      <Card className="rounded-t-3xl rounded-b-none border-b-0 safe-bottom relative z-10 bg-card/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <CardTitle>{getStepTitle()}</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">{getStepDescription()}</p>
        </CardHeader>
        <CardContent className="pb-8 space-y-4">
          {/* Mode Toggle - only show on phone step */}
          {step === "phone" && (
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
          )}

          {/* Language Selection - only on phone step */}
          {step === "phone" && (
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
          )}

          {/* Phone Input Step */}
          {step === "phone" && (
            <>
              <div className="space-y-1.5">
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <div className="absolute left-12 top-1/2 -translate-y-1/2 text-muted-foreground border-r pr-2 mr-2">
                    +91
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter 10-digit mobile number"
                    className={cn(
                      "w-full h-14 pl-24 pr-4 rounded-xl bg-muted border-2 border-transparent focus:ring-0 focus:border-primary/50 outline-none",
                      errors.phone && "border-destructive"
                    )}
                    maxLength={10}
                  />
                </div>
                {errors.phone && <p className="text-xs text-destructive pl-1">{errors.phone}</p>}
              </div>

              <Button
                className="w-full h-14 rounded-xl text-base font-semibold"
                onClick={handleSendOtp}
                disabled={isLoading || phone.length !== 10}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <ShieldCheck className="w-5 h-5 mr-2" />
                )}
                Send OTP
              </Button>
            </>
          )}

          {/* OTP Verification Step */}
          {step === "otp" && (
            <>
              <div className="flex flex-col items-center space-y-4">
                <div className="text-center mb-2">
                  <p className="text-sm text-muted-foreground">
                    Code sent to <span className="font-semibold text-foreground">+91 {phone}</span>
                  </p>
                  <button 
                    onClick={() => setStep("phone")}
                    className="text-xs text-primary hover:underline mt-1"
                  >
                    Change number
                  </button>
                </div>

                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>

                {errors.otp && <p className="text-xs text-destructive">{errors.otp}</p>}

                <div className="text-center">
                  {resendTimer > 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Resend OTP in <span className="font-semibold">{resendTimer}s</span>
                    </p>
                  ) : (
                    <button
                      onClick={handleResendOtp}
                      className="text-sm text-primary hover:underline"
                      disabled={isLoading}
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </div>

              <Button
                className="w-full h-14 rounded-xl text-base font-semibold"
                onClick={handleVerifyOtp}
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <ShieldCheck className="w-5 h-5 mr-2" />
                )}
                Verify & Continue
              </Button>
            </>
          )}

          {/* Personal Details Step (Signup only) */}
          {step === "details" && (
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

              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="tel"
                  value={`+91 ${phone}`}
                  disabled
                  className="w-full h-14 pl-12 pr-4 rounded-xl bg-muted/50 border-2 border-transparent outline-none text-muted-foreground"
                />
              </div>

              <Button
                className="w-full h-14 rounded-xl text-base font-semibold"
                onClick={handleSaveDetails}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : null}
                Continue
              </Button>
            </>
          )}

          {/* Farm Details Step (Signup only) */}
          {step === "farm" && (
            <>
              {/* GPS Location Detection Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-14 gap-2 border-primary/30 hover:bg-primary/10"
                onClick={handleDetectLocation}
                disabled={isDetectingLocation}
              >
                {isDetectingLocation ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Detecting Location...
                  </>
                ) : (
                  <>
                    <Navigation className="w-5 h-5" />
                    Auto-Detect Location & Soil Type
                  </>
                )}
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">or select manually</span>
                </div>
              </div>

              {/* District Selection */}
              <div className="space-y-1.5">
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <select
                    value={district}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className={cn(
                      "w-full h-14 pl-12 pr-4 rounded-xl bg-muted border-2 border-transparent focus:ring-0 focus:border-primary/50 outline-none appearance-none",
                      errors.district && "border-destructive",
                      !district && "text-muted-foreground"
                    )}
                  >
                    <option value="">Select District</option>
                    {keralaDistricts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                {errors.district && <p className="text-xs text-destructive pl-1">{errors.district}</p>}
              </div>

              {/* Village/Town (Optional) */}
              <div className="space-y-1.5">
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="Village/Town (optional)"
                    className="w-full h-14 pl-12 pr-4 rounded-xl bg-muted border-2 border-transparent focus:ring-0 focus:border-primary/50 outline-none"
                  />
                </div>
              </div>

              {/* Land Area */}
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

              {/* Soil Type */}
              <div className="space-y-1.5">
                <div className="relative">
                  <Mountain className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <select
                    value={soilType}
                    onChange={(e) => {
                      setSoilType(e.target.value);
                      setSoilDetectedByGPS(false);
                    }}
                    className={cn(
                      "w-full h-14 pl-12 pr-4 rounded-xl bg-muted border-2 border-transparent focus:ring-0 focus:border-primary/50 outline-none appearance-none",
                      errors.soilType && "border-destructive",
                      !soilType && "text-muted-foreground",
                      soilDetectedByGPS && "border-primary/50 bg-primary/5"
                    )}
                  >
                    <option value="">Select Soil Type</option>
                    {availableSoilTypes.length > 0 ? (
                      availableSoilTypes.map((soil) => (
                        <option key={soil} value={soil}>{soil}</option>
                      ))
                    ) : (
                      <>
                        <option value="Laterite">Laterite</option>
                        <option value="Red Loam">Red Loam</option>
                        <option value="Alluvial">Alluvial</option>
                        <option value="Forest Loam">Forest Loam</option>
                        <option value="Sandy">Sandy</option>
                        <option value="Black Cotton">Black Cotton</option>
                        <option value="Clay">Clay</option>
                      </>
                    )}
                  </select>
                </div>
                {soilDetectedByGPS && (
                  <p className="text-xs text-primary pl-1 flex items-center gap-1">
                    <Navigation className="w-3 h-3" />
                    Auto-detected from GPS
                  </p>
                )}
                {errors.soilType && <p className="text-xs text-destructive pl-1">{errors.soilType}</p>}
              </div>

              {/* Water Source */}
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
                    <option value="">{t("waterSource")} (Optional)</option>
                    {waterSources.map((source) => (
                      <option key={source} value={source}>{source}</option>
                    ))}
                  </select>
                </div>
              </div>

              <Button
                className="w-full h-14 rounded-xl text-base font-semibold"
                onClick={handleSaveFarm}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : null}
                Complete Setup
              </Button>

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setStep("details")}
              >
                ← Back
              </Button>
            </>
          )}

          {/* Footer text */}
          {step === "phone" && (
            <p className="text-xs text-center text-muted-foreground pt-2">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
