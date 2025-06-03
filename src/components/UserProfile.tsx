
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Star } from "lucide-react";

export function UserProfile() {
  return (
    <div className="space-y-6">
      {/* User Profile Card */}
      <Card>
        <CardHeader className="text-center pb-4">
          <div className="relative mx-auto mb-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="/placeholder.svg" alt="User" />
              <AvatarFallback className="text-lg">JD</AvatarFallback>
            </Avatar>
            <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-green-500 border-4 border-background"></span>
          </div>
          <CardTitle className="text-lg">John Doe</CardTitle>
          <p className="text-sm text-muted-foreground">Language Enthusiast</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>New York, USA</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Joined March 2024</span>
          </div>

          <div>
            <h4 className="font-medium mb-2">Speaking Languages</h4>
            <div className="flex flex-wrap gap-1">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                English (Native)
              </Badge>
              <Badge variant="secondary">Spanish (B2)</Badge>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Learning Languages</h4>
            <div className="flex flex-wrap gap-1">
              <Badge variant="outline">French (A2)</Badge>
              <Badge variant="outline">Japanese (A1)</Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="text-sm">4.8 rating • 156 sessions</span>
          </div>

          <Button className="w-full">Edit Profile</Button>
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
            <Badge variant="secondary">8</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Total hours</span>
            <Badge variant="secondary">124h</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Languages practiced</span>
            <Badge variant="secondary">3</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
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
        </CardContent>
      </Card>
    </div>
  );
}
