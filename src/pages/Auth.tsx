import { useState, useEffect } from "react";
import { Leaf, Mail, Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

type AuthMode = "signin" | "signup";

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; fullName?: string }>({});
  
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();

  const from = (location.state as any)?.from?.pathname || "/";

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

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

    if (mode === "signup" && !fullName.trim()) {
      newErrors.fullName = "Please enter your name";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      if (mode === "signin") {
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
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              title: "Account Exists",
              description: "This email is already registered. Please sign in instead.",
              variant: "destructive",
            });
            setMode("signin");
          } else {
            toast({
              title: "Error",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Account Created",
            description: "Welcome to FarmAssist! You're now signed in.",
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
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
            {mode === "signin" ? "Welcome Back" : "Create Account"}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "signin" 
              ? "Sign in to access your farm data" 
              : "Join FarmAssist to save your data"}
          </p>
        </CardHeader>
        <CardContent className="pb-8 space-y-4">
          {/* Mode Toggle */}
          <div className="flex rounded-xl bg-muted p-1 mb-6">
            <button
              onClick={() => setMode("signin")}
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
              onClick={() => setMode("signup")}
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

          {/* Full Name (Sign Up only) */}
          {mode === "signup" && (
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
              {errors.fullName && (
                <p className="text-xs text-destructive pl-1">{errors.fullName}</p>
              )}
            </div>
          )}

          {/* Email */}
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
            {errors.email && (
              <p className="text-xs text-destructive pl-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
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
            {errors.password && (
              <p className="text-xs text-destructive pl-1">{errors.password}</p>
            )}
          </div>

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
                {mode === "signin" ? "Sign In" : "Create Account"}
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
