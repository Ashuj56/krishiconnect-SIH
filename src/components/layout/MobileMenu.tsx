import { useState } from "react";
import { Menu, X, Sun, TrendingUp, FileText, BookOpen, User, Settings, Tractor, LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const menuItems = [
  { icon: Sun, labelKey: "advisory", path: "/advisory" },
  { icon: TrendingUp, labelKey: "marketPrices", path: "/market" },
  { icon: FileText, labelKey: "schemes", path: "/schemes" },
  { icon: BookOpen, labelKey: "knowledge", path: "/knowledge" },
  { icon: Tractor, labelKey: "farm", path: "/farm" },
  { icon: User, labelKey: "profile", path: "/profile" },
  { icon: Settings, labelKey: "settings", path: "/settings" },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    setOpen(false);
    navigate("/auth");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all duration-300 text-muted-foreground hover:text-foreground">
          <div className="relative p-2 rounded-xl transition-all duration-300">
            <Menu className="w-6 h-6 relative z-10" strokeWidth={2} />
          </div>
          <span className="text-[10px] font-medium font-malayalam">{t("menu")}</span>
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[80vh] pb-safe">
        <SheetHeader className="pb-4 border-b border-border/50">
          <SheetTitle className="text-lg font-semibold">{t("resources")}</SheetTitle>
        </SheetHeader>
        <div className="py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn("w-5 h-5", isActive && "text-primary")} />
                  <span className="font-medium">{t(item.labelKey)}</span>
                </>
              )}
            </NavLink>
          ))}
          
          <div className="pt-4 border-t border-border/50 mt-4">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start gap-4 px-4 py-3.5 h-auto text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">{t("logout")}</span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
