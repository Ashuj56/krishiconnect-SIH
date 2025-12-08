import { useState, useEffect, useRef } from "react";
import { User, Phone, Mail, MapPin, Edit2, Camera, LogOut, ChevronRight, Award, Loader2, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProfileData {
  full_name: string | null;
  phone: string | null;
  location: string | null;
  avatar_url: string | null;
}

const KERALA_DISTRICTS = [
  "Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod",
  "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad",
  "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"
];

const achievements = [
  { icon: "🌾", title: "First Harvest Logged", date: "Apr 2024" },
  { icon: "🏆", title: "Active Farmer", date: "May 2024" },
  { icon: "📱", title: "Tech-Savvy Farmer", date: "Jun 2024" },
];

export default function Profile() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  // Edit form state
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editVillage, setEditVillage] = useState("");
  const [editDistrict, setEditDistrict] = useState("");

  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, phone, location, avatar_url')
        .eq('id', user.id)
        .maybeSingle();

      if (data) {
        setProfile(data);
        // Parse location into village and district
        if (data.location) {
          const parts = data.location.split(", ");
          if (parts.length >= 2) {
            setEditVillage(parts[0]);
            setEditDistrict(parts[1]);
          } else {
            setEditVillage(data.location);
          }
        }
        setEditName(data.full_name || "");
        setEditPhone(data.phone || "");
      }
      setLoading(false);
    };

    loadProfile();
  }, [user]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Add cache buster to URL
      const avatarUrl = `${publicUrl}?t=${Date.now()}`;

      // Update profile with avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : null);
      
      toast({
        title: "Photo updated",
        description: "Your profile photo has been uploaded successfully.",
      });
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleStartEdit = () => {
    setEditName(profile?.full_name || "");
    setEditPhone(profile?.phone || "");
    if (profile?.location) {
      const parts = profile.location.split(", ");
      if (parts.length >= 2) {
        setEditVillage(parts[0]);
        setEditDistrict(parts[1]);
      } else {
        setEditVillage(profile.location);
        setEditDistrict("");
      }
    }
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const locationString = editVillage && editDistrict 
        ? `${editVillage}, ${editDistrict}, Kerala, India`
        : editVillage || editDistrict || null;

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editName.trim() || null,
          phone: editPhone.trim() || null,
          location: locationString,
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile({
        ...profile,
        full_name: editName.trim() || null,
        phone: editPhone.trim() || null,
        location: locationString,
        avatar_url: profile?.avatar_url || null,
      });

      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
      navigate("/auth");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSigningOut(false);
    }
  };

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Farmer';
  const memberSince = user?.created_at 
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'New Member';

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarUpload}
        className="hidden"
      />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold">My Profile</h1>
          {isEditing ? (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCancelEdit}
                disabled={saving}
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={handleSaveProfile}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-1" />
                )}
                Save
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={handleStartEdit}>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </header>

      <div className="p-4 space-y-4 animate-fade-in">
        {/* Profile Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center overflow-hidden">
                  {profile?.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-primary-foreground" />
                  )}
                </div>
                <button 
                  onClick={handleAvatarClick}
                  disabled={uploadingAvatar}
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-card border-2 border-border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </button>
              </div>
              
              {isEditing ? (
                <div className="w-full mt-4 space-y-3">
                  <div className="text-left">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Enter your full name"
                      className="mt-1"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold mt-4">{displayName}</h2>
                  <p className="text-sm text-muted-foreground">Member since {memberSince}</p>
                </>
              )}
              
              {!isEditing && (
                <div className="flex gap-4 mt-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">--</p>
                    <p className="text-xs text-muted-foreground">Farm Size</p>
                  </div>
                  <div className="w-px bg-border" />
                  <div>
                    <p className="text-2xl font-bold text-primary">0</p>
                    <p className="text-xs text-muted-foreground">Active Crops</p>
                  </div>
                  <div className="w-px bg-border" />
                  <div>
                    <p className="text-2xl font-bold text-primary">0</p>
                    <p className="text-xs text-muted-foreground">Activities</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="village">Village/Town</Label>
                  <Input
                    id="village"
                    value={editVillage}
                    onChange={(e) => setEditVillage(e.target.value)}
                    placeholder="Enter your village or town"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="district">District</Label>
                  <Select value={editDistrict} onValueChange={setEditDistrict}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select your district" />
                    </SelectTrigger>
                    <SelectContent>
                      {KERALA_DISTRICTS.map((district) => (
                        <SelectItem key={district} value={district}>
                          {district}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="font-medium">{profile?.phone || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium">{user?.email || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="font-medium">{profile?.location || 'Not set'}</p>
                  </div>
                </div>
              </>
            )}
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
        <Button 
          variant="outline" 
          className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleSignOut}
          disabled={signingOut}
        >
          {signingOut ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <LogOut className="w-4 h-4 mr-2" />
          )}
          Sign Out
        </Button>
      </div>
    </div>
  );
}
