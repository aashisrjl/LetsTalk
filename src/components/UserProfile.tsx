
import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Star, Users, UserPlus, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export function UserProfile() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [userData, setUserData] = useState({
    name: "",
    bio: "",
    location: "",
    nativeLanguages: [],
    learningLanguages: [],
    joinDate: "",
    photo: "/placeholder.svg",
    stats: {
      weeklySessions: 0,
      totalHours: 0,
      languagesPracticed: 0,
      sessions: 0,
    },
    recentActivity: [],
    likes: 0,
    sessions: 0,
    followers: [],
    following: [],
    friends: [],
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/auth/user-data', {
          withCredentials: true,
        });

        if (response.data.success) {
          const { user } = response.data;
          setUserData({
            name: user.name || "",
            bio: user.bio || "",
            location: user.location || "",
            nativeLanguages: user.nativeLanguages.map(lang => ({
              name: lang.name,
              level: lang.level,
            })) || [],
            learningLanguages: user.learningLanguages.map(lang => ({
              name: lang.name,
              level: lang.level,
            })) || [],
            joinDate: user.joinDate ? new Date(user.joinDate).toLocaleString('en-US', { month: 'long', year: 'numeric' }) : "",
            photo: user.photo || "/placeholder.svg",
            stats: {
              weeklySessions: user.stats?.weeklySessions || 0,
              totalHours: user.stats?.totalHours || 0,
              languagesPracticed: user.stats?.languagesPracticed || 0,
              sessions: user.stats?.sessions || 0,
            },
            recentActivity: user.recentActivity || [],
            likes: user.likes || 0,
            sessions: user.stats?.sessions || 0,
            followers: user.followers || [],
            following: user.following || [],
            friends: user.friends || [],
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast({
          title: "Error",
          description: "Failed to load user data. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchUserData();
  }, [toast]);

  return (
    <div className="space-y-6">
      {/* User Profile Card */}
      <Card>
        <CardHeader className="text-center pb-4">
          <div className="relative mx-auto mb-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={userData.photo} alt={userData.name} />
              <AvatarFallback className="text-lg">
                {userData.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-green-500 border-4 border-background"></span>
          </div>
          <CardTitle className="text-lg">{userData.name}</CardTitle>
          <p className="text-sm text-muted-foreground">{userData.bio || "Language Enthusiast"}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{userData.location || "New York, USA"}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Joined {userData.joinDate || "March 2024"}</span>
          </div>

          {/* Social Stats */}
          <div className="grid grid-cols-3 gap-4 py-4 border-y">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="font-semibold">{userData.followers.length}</span>
              </div>
              <p className="text-xs text-muted-foreground">Followers</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <UserPlus className="h-4 w-4 text-green-500" />
                <span className="font-semibold">{userData.following.length}</span>
              </div>
              <p className="text-xs text-muted-foreground">Following</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Heart className="h-4 w-4 text-red-500" />
                <span className="font-semibold">{userData.friends.length}</span>
              </div>
              <p className="text-xs text-muted-foreground">Friends</p>
            </div>
          </div>

          {/* Languages */}
          <div>
            <h4 className="font-medium mb-2">Speaking Languages</h4>
            <div className="flex flex-wrap gap-1">
              {userData.nativeLanguages.map((lang, index) => (
                <Badge
                  key={index}
                  className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                >
                  {`${lang.name} (${lang.level.charAt(0).toUpperCase() + lang.level.slice(1)})`}
                </Badge>
              ))}
              {userData.nativeLanguages.length === 0 && (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                  English (Native)
                </Badge>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Learning Languages</h4>
            <div className="flex flex-wrap gap-1">
              {userData.learningLanguages.map((lang, index) => (
                <Badge key={index} variant="outline">
                  {`${lang.name} (${lang.level.charAt(0).toUpperCase() + lang.level.slice(1)})`}
                </Badge>
              ))}
              {userData.learningLanguages.length === 0 && (
                <Badge variant="outline">French (A2)</Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="text-sm">
              {userData.likes} likes • {userData.sessions.toString()} sessions
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              Total hours: {userData.stats.totalHours.toFixed(2)}
            </span>
          </div>

          <Button className="w-full" onClick={() => navigate('/settings')}>
            Edit Profile
          </Button>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm">Sessions this week</span>
            <Badge variant="secondary">{userData.stats.weeklySessions}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Total sessions</span>
            <Badge variant="secondary">{userData.sessions}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Total hours</span>
            <Badge variant="secondary">{userData.stats.totalHours.toFixed(2)}h</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Languages practiced</span>
            <Badge variant="secondary">{userData.nativeLanguages.length}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {userData.recentActivity.length > 0 ? (
            userData.recentActivity.map((activity, index) => (
              <div key={index} className="text-sm">
                <p className="font-medium">
                  {activity.type === 'session' && `${activity.details} Session`}
                  {activity.type === 'message' && `New ${activity.details}`}
                  {activity.type === 'profileUpdate' && `Profile Updated: ${activity.details}`}
                </p>
                <p className="text-muted-foreground">
                  {new Date(activity.timestamp).toLocaleString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                    day: 'numeric',
                    month: 'short',
                  })}
                </p>
              </div>
            ))
          ) : (
            <>
              <div className="text-sm">
                <p className="font-medium">Spanish Grammar Workshop</p>
                <p className="text-muted-foreground">2 hours ago</p>
              </div>
              <div className="text-sm">
                <p className="font-medium">English Conversation</p>
                <p className="text-muted-foreground">Yesterday</p>
              </div>
              <div className="text-sm">
                <p className="font-medium">French Culture Chat</p>
                <p className="text-muted-foreground">2 days ago</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
