import { useState, useEffect } from "react";
import { Leaf, Mail, Lock, User, ArrowRight, Eye, EyeOff, Phone, MapPin, Mountain, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");
const phoneSchema = z.string().min(10, "Please enter a valid phone number");

type AuthMode = "signin" | "signup";
type SignupStep = 1 | 2;

const soilTypes = ["Alluvial", "Black/Clay", "Red", "Laterite", "Sandy", "Loamy"];
const waterSources = ["Well", "Canal", "Borewell", "River", "Rainwater", "Mixed"];

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [signupStep, setSignupStep] = useState<SignupStep>(1);
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

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

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
          setSignupStep(1);
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
        // Update profile with phone and location
        await supabase.from("profiles").update({
          phone,
          location,
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
          title: "Welcome to FarmAssist!",
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
    } else if (signupStep === 1) {
      handleNextStep();
    } else {
      await handleSignUp();
    }
  };

  const resetForm = () => {
    setSignupStep(1);
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mb-6 animate-float">
          <Leaf className="w-10 h-10 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold mb-2">FarmAssist</h1>
        <p className="text-muted-foreground">Your AI-Powered Farming Companion</p>
      </div>

      {/* Auth Card */}
      <Card className="rounded-t-3xl rounded-b-none border-b-0 safe-bottom">
        <CardHeader className="text-center pb-2">
          <CardTitle>
            {mode === "signin" 
              ? "Welcome Back" 
              : signupStep === 1 
                ? "Create Account" 
                : "Farm Details"}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "signin" 
              ? "Sign in to access your farm data" 
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
              Sign In
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
              Sign Up
            </button>
          </div>

          {/* Sign In Form */}
          {mode === "signin" && (
            <>
              <div className="space-y-1.5">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
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
                    placeholder="Password"
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
                    placeholder="Full name"
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
                    placeholder="Mobile number"
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
                    placeholder="Email address"
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
                    placeholder="Password"
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
                    placeholder="Farm location (e.g., Thrissur, Kerala)"
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
                    placeholder="Total land area (in acres)"
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
                    <option value="">Select soil type</option>
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
                    <option value="">Select water source (optional)</option>
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
                ← Back to personal details
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
                  ? "Sign In" 
                  : signupStep === 1 
                    ? "Next" 
                    : "Create Account"}
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
