import { Bell, Globe, Moon, Shield, Download, Trash2, ChevronRight, HelpCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export default function Settings() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border safe-top">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold">Settings</h1>
          <p className="text-xs text-muted-foreground">Manage your preferences</p>
        </div>
      </header>

      <div className="p-4 space-y-4 animate-fade-in">
        {/* Notifications */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-muted-foreground">Receive alerts on your device</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Weather Alerts</p>
                <p className="text-sm text-muted-foreground">Severe weather warnings</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Task Reminders</p>
                <p className="text-sm text-muted-foreground">Daily farming tasks</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Market Price Updates</p>
                <p className="text-sm text-muted-foreground">Daily price notifications</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Language */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Language & Region
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 rounded-xl border hover:bg-muted/50 transition-colors">
              <div>
                <p className="font-medium">App Language</p>
                <p className="text-sm text-muted-foreground">Malayalam</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-xl border hover:bg-muted/50 transition-colors">
              <div>
                <p className="font-medium">Voice Input Language</p>
                <p className="text-sm text-muted-foreground">Malayalam</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-xl border hover:bg-muted/50 transition-colors">
              <div>
                <p className="font-medium">Units</p>
                <p className="text-sm text-muted-foreground">Metric (kg, hectares)</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-primary" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-muted-foreground">Use dark theme</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Privacy & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 rounded-xl border hover:bg-muted/50 transition-colors">
              <p className="font-medium">Change PIN</p>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-xl border hover:bg-muted/50 transition-colors">
              <p className="font-medium">Privacy Policy</p>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-xl border hover:bg-muted/50 transition-colors">
              <p className="font-medium">Terms of Service</p>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-primary" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Download className="w-4 h-4 mr-2" />
              Export My Data
            </Button>
            <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </CardContent>
        </Card>

        {/* Help & Support */}
        <Card>
          <CardContent className="p-4">
            <button className="w-full flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium">Help & Support</p>
                <p className="text-sm text-muted-foreground">FAQs, Contact Us</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto" />
            </button>
          </CardContent>
        </Card>

        {/* App Version */}
        <p className="text-center text-sm text-muted-foreground pt-4">
          FarmAssist v1.0.0
        </p>
      </div>
    </div>
  );
}
