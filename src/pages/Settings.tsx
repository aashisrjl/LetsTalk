
import { useState } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Globe, 
  Palette,
  Volume2,
  Camera,
  Trash2
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const Settings = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profileSettings, setProfileSettings] = useState({
    displayName: "John Doe",
    bio: "Language enthusiast passionate about connecting cultures through conversation.",
    location: "New York, USA",
    nativeLanguages: ["English"],
    learningLanguages: ["Spanish", "French"]
  });

  const [notificationSettings, setNotificationSettings] = useState({
    messages: true,
    friendRequests: true,
    sessionReminders: true,
    roomInvitations: false,
    systemUpdates: true,
    emailNotifications: false
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "public",
    showOnlineStatus: true,
    allowDirectMessages: true,
    showLanguageProgress: true
  });

  const [audioSettings, setAudioSettings] = useState({
    microphoneEnabled: true,
    cameraEnabled: true,
    audioQuality: "high",
    echoCancellation: true,
    noiseSuppression: true
  });

  return (
    <ThemeProvider defaultTheme="light" storageKey="language-app-theme">
      <div className="min-h-screen bg-background text-foreground">
        <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <div className="flex">
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
          
          <main className="flex-1 p-2 sm:p-4 lg:p-6">
            <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
              {/* Page Header */}
              <div className="px-2 sm:px-0">
                <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                  <SettingsIcon className="h-6 w-6 sm:h-8 sm:w-8" />
                  Settings
                </h1>
                <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                  Manage your account preferences and app settings
                </p>
              </div>

              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 h-auto p-1">
                  <TabsTrigger value="profile" className="text-xs sm:text-sm py-2">Profile</TabsTrigger>
                  <TabsTrigger value="notifications" className="text-xs sm:text-sm py-2">Notifications</TabsTrigger>
                  <TabsTrigger value="privacy" className="text-xs sm:text-sm py-2">Privacy</TabsTrigger>
                  <TabsTrigger value="audio" className="text-xs sm:text-sm py-2">Audio/Video</TabsTrigger>
                  <TabsTrigger value="appearance" className="text-xs sm:text-sm py-2">Appearance</TabsTrigger>
                </TabsList>

                {/* Profile Settings */}
                <TabsContent value="profile" className="space-y-4 sm:space-y-6">
                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                        <User className="h-4 w-4 sm:h-5 sm:w-5" />
                        Profile Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="displayName" className="text-sm">Display Name</Label>
                        <Input
                          id="displayName"
                          value={profileSettings.displayName}
                          onChange={(e) => setProfileSettings(prev => ({
                            ...prev,
                            displayName: e.target.value
                          }))}
                          className="text-sm"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="bio" className="text-sm">Bio</Label>
                        <Textarea
                          id="bio"
                          value={profileSettings.bio}
                          onChange={(e) => setProfileSettings(prev => ({
                            ...prev,
                            bio: e.target.value
                          }))}
                          className="min-h-[80px] sm:min-h-[100px] text-sm"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="location" className="text-sm">Location</Label>
                        <Input
                          id="location"
                          value={profileSettings.location}
                          onChange={(e) => setProfileSettings(prev => ({
                            ...prev,
                            location: e.target.value
                          }))}
                          className="text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm">Native Languages</Label>
                        <div className="flex flex-wrap gap-2">
                          {profileSettings.nativeLanguages.map((lang, index) => (
                            <Badge key={index} className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs">
                              {lang}
                            </Badge>
                          ))}
                          <Button variant="outline" size="sm" className="text-xs h-6">Add Language</Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm">Learning Languages</Label>
                        <div className="flex flex-wrap gap-2">
                          {profileSettings.learningLanguages.map((lang, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {lang}
                            </Badge>
                          ))}
                          <Button variant="outline" size="sm" className="text-xs h-6">Add Language</Button>
                        </div>
                      </div>

                      <Button className="w-full sm:w-auto">Save Profile Changes</Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Notification Settings */}
                <TabsContent value="notifications" className="space-y-4 sm:space-y-6">
                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                        <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                        Notification Preferences
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {Object.entries(notificationSettings).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between py-2">
                          <Label htmlFor={key} className="capitalize text-sm sm:text-base flex-1 pr-4">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </Label>
                          <Switch
                            id={key}
                            checked={value}
                            onCheckedChange={(checked) => 
                              setNotificationSettings(prev => ({
                                ...prev,
                                [key]: checked
                              }))
                            }
                          />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Privacy Settings */}
                <TabsContent value="privacy" className="space-y-4 sm:space-y-6">
                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                        <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                        Privacy & Security
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {Object.entries(privacySettings).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between py-2">
                          <Label htmlFor={key} className="capitalize text-sm sm:text-base flex-1 pr-4">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </Label>
                          {typeof value === 'boolean' ? (
                            <Switch
                              id={key}
                              checked={value}
                              onCheckedChange={(checked) => 
                                setPrivacySettings(prev => ({
                                  ...prev,
                                  [key]: checked
                                }))
                              }
                            />
                          ) : (
                            <Badge variant="secondary" className="text-xs">{value}</Badge>
                          )}
                        </div>
                      ))}
                      
                      <div className="pt-4 border-t">
                        <Button variant="destructive" className="w-full">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Account
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Audio/Video Settings */}
                <TabsContent value="audio" className="space-y-4 sm:space-y-6">
                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                        <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />
                        Audio & Video Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2 flex-1 pr-4">
                          <Volume2 className="h-4 w-4" />
                          <Label className="text-sm sm:text-base">Microphone Access</Label>
                        </div>
                        <Switch
                          checked={audioSettings.microphoneEnabled}
                          onCheckedChange={(checked) => 
                            setAudioSettings(prev => ({
                              ...prev,
                              microphoneEnabled: checked
                            }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2 flex-1 pr-4">
                          <Camera className="h-4 w-4" />
                          <Label className="text-sm sm:text-base">Camera Access</Label>
                        </div>
                        <Switch
                          checked={audioSettings.cameraEnabled}
                          onCheckedChange={(checked) => 
                            setAudioSettings(prev => ({
                              ...prev,
                              cameraEnabled: checked
                            }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between py-2">
                        <Label className="text-sm sm:text-base flex-1 pr-4">Echo Cancellation</Label>
                        <Switch
                          checked={audioSettings.echoCancellation}
                          onCheckedChange={(checked) => 
                            setAudioSettings(prev => ({
                              ...prev,
                              echoCancellation: checked
                            }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between py-2">
                        <Label className="text-sm sm:text-base flex-1 pr-4">Noise Suppression</Label>
                        <Switch
                          checked={audioSettings.noiseSuppression}
                          onCheckedChange={(checked) => 
                            setAudioSettings(prev => ({
                              ...prev,
                              noiseSuppression: checked
                            }))
                          }
                        />
                      </div>

                      <Button className="w-full sm:w-auto">Test Audio/Video</Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Appearance Settings */}
                <TabsContent value="appearance" className="space-y-4 sm:space-y-6">
                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                        <Palette className="h-4 w-4 sm:h-5 sm:w-5" />
                        Appearance & Language
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between py-2">
                        <Label className="text-sm sm:text-base">Theme</Label>
                        <ThemeToggle />
                      </div>

                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2 flex-1 pr-4">
                          <Globe className="h-4 w-4" />
                          <Label className="text-sm sm:text-base">App Language</Label>
                        </div>
                        <Badge variant="secondary" className="text-xs">English</Badge>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm">Font Size</Label>
                        <div className="flex gap-2 flex-wrap">
                          <Button variant="outline" size="sm" className="text-xs">Small</Button>
                          <Button variant="secondary" size="sm" className="text-xs">Medium</Button>
                          <Button variant="outline" size="sm" className="text-xs">Large</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Settings;
