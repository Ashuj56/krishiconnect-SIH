import { User, Phone, Mail, MapPin, Edit2, Camera, LogOut, ChevronRight, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface UserProfile {
  name: string;
  phone: string;
  email: string;
  location: string;
  memberSince: string;
  farmSize: string;
  language: string;
}

const userProfile: UserProfile = {
  name: "Rajesh Kumar",
  phone: "+91 98765 43210",
  email: "rajesh.kumar@email.com",
  location: "Thrissur, Kerala",
  memberSince: "March 2024",
  farmSize: "6.5 acres",
  language: "Malayalam",
};

const achievements = [
  { icon: "🌾", title: "First Harvest Logged", date: "Apr 2024" },
  { icon: "🏆", title: "Active Farmer", date: "May 2024" },
  { icon: "📱", title: "Tech-Savvy Farmer", date: "Jun 2024" },
];

export default function Profile() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold">My Profile</h1>
          <Button variant="outline" size="sm">
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-4 animate-fade-in">
        {/* Profile Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center">
                  <User className="w-12 h-12 text-primary-foreground" />
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-card border-2 border-border flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <h2 className="text-xl font-bold mt-4">{userProfile.name}</h2>
              <p className="text-sm text-muted-foreground">Member since {userProfile.memberSince}</p>
              
              <div className="flex gap-4 mt-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">{userProfile.farmSize}</p>
                  <p className="text-xs text-muted-foreground">Farm Size</p>
                </div>
                <div className="w-px bg-border" />
                <div>
                  <p className="text-2xl font-bold text-primary">4</p>
                  <p className="text-xs text-muted-foreground">Active Crops</p>
                </div>
                <div className="w-px bg-border" />
                <div>
                  <p className="text-2xl font-bold text-primary">127</p>
                  <p className="text-xs text-muted-foreground">Activities</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="font-medium">{userProfile.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium">{userProfile.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="font-medium">{userProfile.location}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className="shrink-0 w-32 p-3 rounded-xl border bg-card text-center"
                >
                  <span className="text-3xl">{achievement.icon}</span>
                  <p className="font-medium text-sm mt-2">{achievement.title}</p>
                  <p className="text-xs text-muted-foreground">{achievement.date}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardContent className="p-0">
            {[
              { label: "View Farm Profile", path: "/farm" },
              { label: "Settings", path: "/settings" },
              { label: "Help & Support", path: "/help" },
            ].map((link, index) => (
              <button
                key={index}
                onClick={() => navigate(link.path)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors border-b last:border-b-0"
              >
                <span className="font-medium">{link.label}</span>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Button variant="outline" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10">
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
