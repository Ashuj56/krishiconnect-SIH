import { useState } from "react";
import { Leaf, Phone, ArrowRight, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

type AuthStep = "phone" | "otp" | "language";

const languages = [
  { code: "ml", name: "Malayalam", native: "മലയാളം" },
  { code: "en", name: "English", native: "English" },
  { code: "hi", name: "Hindi", native: "हिन्दी" },
];

export default function Auth() {
  const [step, setStep] = useState<AuthStep>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const navigate = useNavigate();

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleSubmitPhone = () => {
    if (phone.length >= 10) {
      setStep("otp");
    }
  };

  const handleVerifyOtp = () => {
    if (otp.join("").length === 6) {
      setStep("language");
    }
  };

  const handleLanguageSelect = () => {
    navigate("/");
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
        <CardHeader className="text-center">
          <CardTitle>
            {step === "phone" && "Enter Your Phone Number"}
            {step === "otp" && "Verify OTP"}
            {step === "language" && "Select Your Language"}
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-8">
          {step === "phone" && (
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-muted-foreground">
                  <span className="text-lg">🇮🇳</span>
                  <span className="font-medium">+91</span>
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="Enter phone number"
                  className="w-full h-14 pl-24 pr-4 rounded-xl bg-muted border-0 focus:ring-2 focus:ring-primary/20 outline-none text-lg"
                />
              </div>
              <Button
                size="xl"
                className="w-full"
                onClick={handleSubmitPhone}
                disabled={phone.length < 10}
              >
                Continue
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          )}

          {step === "otp" && (
            <div className="space-y-6">
              <p className="text-sm text-center text-muted-foreground">
                We've sent a 6-digit code to +91 {phone}
              </p>
              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    className="w-12 h-14 text-center text-xl font-bold rounded-xl bg-muted border-0 focus:ring-2 focus:ring-primary/20 outline-none"
                    maxLength={1}
                  />
                ))}
              </div>
              <Button
                size="xl"
                className="w-full"
                onClick={handleVerifyOtp}
                disabled={otp.join("").length < 6}
              >
                Verify & Continue
              </Button>
              <button className="w-full text-sm text-primary font-medium">
                Resend OTP
              </button>
            </div>
          )}

          {step === "language" && (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 mb-4 text-muted-foreground">
                <Globe className="w-5 h-5" />
                <span className="text-sm">Choose your preferred language</span>
              </div>
              <div className="space-y-3">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setSelectedLanguage(lang.code)}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 text-left transition-all",
                      selectedLanguage === lang.code
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <p className="font-semibold">{lang.name}</p>
                    <p className="text-sm text-muted-foreground">{lang.native}</p>
                  </button>
                ))}
              </div>
              <Button size="xl" className="w-full mt-4" onClick={handleLanguageSelect}>
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
