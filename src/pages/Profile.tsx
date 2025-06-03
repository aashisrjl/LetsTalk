
import { useState } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { UserProfile } from "@/components/UserProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MessageSquare, Trophy, Clock } from "lucide-react";

const Profile = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const recentSessions = [
    {
      id: 1,
      title: "English Conversation",
      language: "English",
      duration: "45 min",
      date: "2024-01-15",
      rating: 5
    },
    {
      id: 2,
      title: "Spanish Grammar",
      language: "Spanish",
      duration: "30 min",
      date: "2024-01-14",
      rating: 4
    },
    {
      id: 3,
      title: "French Culture Chat",
      language: "French",
      duration: "60 min",
      date: "2024-01-13",
      rating: 5
    }
  ];

  const achievements = [
    {
      id: 1,
      title: "First Session",
      description: "Completed your first language session",
      earned: true,
      icon: "🎯"
    },
    {
      id: 2,
      title: "Week Warrior",
      description: "Practiced 7 days in a row",
      earned: true,
      icon: "🔥"
    },
    {
      id: 3,
      title: "Polyglot",
      description: "Practiced 3 different languages",
      earned: false,
      icon: "🌍"
    },
    {
      id: 4,
      title: "Helper",
      description: "Helped 10 other learners",
      earned: true,
      icon: "🤝"
    }
  ];

  return (
    <ThemeProvider defaultTheme="light" storageKey="language-app-theme">
      <div className="min-h-screen bg-background text-foreground">
        <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <div className="flex">
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
          
          <main className="flex-1 p-4 lg:p-6">
            <div className="max-w-7xl mx-auto">
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Left Column - User Profile */}
                <div className="lg:col-span-1">
                  <UserProfile />
                </div>

                {/* Right Column - Detailed Info */}
                <div className="lg:col-span-2 space-y-6">
                  <Tabs defaultValue="sessions" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="sessions">Recent Sessions</TabsTrigger>
                      <TabsTrigger value="achievements">Achievements</TabsTrigger>
                      <TabsTrigger value="progress">Progress</TabsTrigger>
                    </TabsList>

                    <TabsContent value="sessions" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            Recent Sessions
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {recentSessions.map((session) => (
                            <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="space-y-1">
                                <h4 className="font-medium">{session.title}</h4>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {session.date}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {session.duration}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge>{session.language}</Badge>
                                <div className="flex">
                                  {Array.from({ length: session.rating }).map((_, i) => (
                                    <span key={i} className="text-yellow-500">⭐</span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="achievements" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5" />
                            Achievements
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-4 sm:grid-cols-2">
                            {achievements.map((achievement) => (
                              <div
                                key={achievement.id}
                                className={`p-4 border rounded-lg ${
                                  achievement.earned 
                                    ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
                                    : 'bg-gray-50 border-gray-200 dark:bg-gray-950 dark:border-gray-800 opacity-60'
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <span className="text-2xl">{achievement.icon}</span>
                                  <div>
                                    <h4 className="font-medium">{achievement.title}</h4>
                                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                                    {achievement.earned && (
                                      <Badge className="mt-2" variant="secondary">Earned</Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="progress" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Learning Progress</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div>
                            <div className="flex justify-between mb-2">
                              <span className="font-medium">Spanish</span>
                              <span className="text-sm text-muted-foreground">B2 Level</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                              <div className="bg-blue-600 h-2 rounded-full" style={{width: '75%'}}></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between mb-2">
                              <span className="font-medium">French</span>
                              <span className="text-sm text-muted-foreground">A2 Level</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                              <div className="bg-green-600 h-2 rounded-full" style={{width: '40%'}}></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between mb-2">
                              <span className="font-medium">Japanese</span>
                              <span className="text-sm text-muted-foreground">A1 Level</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                              <div className="bg-orange-600 h-2 rounded-full" style={{width: '20%'}}></div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Profile;
