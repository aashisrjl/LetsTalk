
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
          
          <main className="flex-1 p-4 lg:p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Page Header */}
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <SettingsIcon className="h-8 w-8" />
                  Settings
                </h1>
                <p className="text-muted-foreground mt-1">
                  Manage your account preferences and app settings
                </p>
              </div>

              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  <TabsTrigger value="privacy">Privacy</TabsTrigger>
                  <TabsTrigger value="audio">Audio/Video</TabsTrigger>
                  <TabsTrigger value="appearance">Appearance</TabsTrigger>
                </TabsList>

                {/* Profile Settings */}
                <TabsContent value="profile" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Profile Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input
                          id="displayName"
                          value={profileSettings.displayName}
                          onChange={(e) => setProfileSettings(prev => ({
                            ...prev,
                            displayName: e.target.value
                          }))}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={profileSettings.bio}
                          onChange={(e) => setProfileSettings(prev => ({
                            ...prev,
                            bio: e.target.value
                          }))}
                          className="min-h-[100px]"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={profileSettings.location}
                          onChange={(e) => setProfileSettings(prev => ({
                            ...prev,
                            location: e.target.value
                          }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Native Languages</Label>
                        <div className="flex flex-wrap gap-2">
                          {profileSettings.nativeLanguages.map((lang, index) => (
                            <Badge key={index} className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                              {lang}
                            </Badge>
                          ))}
                          <Button variant="outline" size="sm">Add Language</Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Learning Languages</Label>
                        <div className="flex flex-wrap gap-2">
                          {profileSettings.learningLanguages.map((lang, index) => (
                            <Badge key={index} variant="outline">
                              {lang}
                            </Badge>
                          ))}
                          <Button variant="outline" size="sm">Add Language</Button>
                        </div>
                      </div>

                      <Button>Save Profile Changes</Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Notification Settings */}
                <TabsContent value="notifications" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Notification Preferences
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {Object.entries(notificationSettings).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <Label htmlFor={key} className="capitalize">
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
                <TabsContent value="privacy" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Privacy & Security
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {Object.entries(privacySettings).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <Label htmlFor={key} className="capitalize">
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
                            <Badge variant="secondary">{value}</Badge>
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
                <TabsContent value="audio" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Volume2 className="h-5 w-5" />
                        Audio & Video Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Volume2 className="h-4 w-4" />
                          <Label>Microphone Access</Label>
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

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Camera className="h-4 w-4" />
                          <Label>Camera Access</Label>
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

                      <div className="flex items-center justify-between">
                        <Label>Echo Cancellation</Label>
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

                      <div className="flex items-center justify-between">
                        <Label>Noise Suppression</Label>
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

                      <Button>Test Audio/Video</Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Appearance Settings */}
                <TabsContent value="appearance" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Palette className="h-5 w-5" />
                        Appearance & Language
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Theme</Label>
                        <ThemeToggle />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <Label>App Language</Label>
                        </div>
                        <Badge variant="secondary">English</Badge>
                      </div>

                      <div className="space-y-2">
                        <Label>Font Size</Label>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Small</Button>
                          <Button variant="secondary" size="sm">Medium</Button>
                          <Button variant="outline" size="sm">Large</Button>
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
