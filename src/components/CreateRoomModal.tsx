
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Users, Globe, Lock, X } from "lucide-react";

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const languages = [
  "English", "Spanish", "French", "German", "Italian", "Portuguese", 
  "Chinese", "Japanese", "Korean", "Arabic", "Russian", "Dutch"
];

export function CreateRoomModal({ isOpen, onClose }: CreateRoomModalProps) {
  const [roomData, setRoomData] = useState({
    title: "",
    description: "",
    language: "",
    maxParticipants: "10",
    isPrivate: false,
    tags: [] as string[],
  });
  const [newTag, setNewTag] = useState("");

  const addTag = () => {
    if (newTag.trim() && !roomData.tags.includes(newTag.trim())) {
      setRoomData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setRoomData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = () => {
    console.log("Creating room:", roomData);
    // Here you would handle the room creation
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">+</span>
            </div>
            Create New Room
          </DialogTitle>
          <DialogDescription>
            Set up a new language practice room. Participants will have access to video, voice, and text chat.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Room Title</Label>
              <Input
                id="title"
                placeholder="e.g., English Conversation for Beginners"
                value={roomData.title}
                onChange={(e) => setRoomData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what participants can expect..."
                value={roomData.description}
                onChange={(e) => setRoomData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="language">Primary Language</Label>
              <Select value={roomData.language} onValueChange={(value) => setRoomData(prev => ({ ...prev, language: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="maxParticipants">Maximum Participants</Label>
              <Select value={roomData.maxParticipants} onValueChange={(value) => setRoomData(prev => ({ ...prev, maxParticipants: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 15, 20, 25, 30].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {num} participants
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Private Room</Label>
                <p className="text-sm text-muted-foreground">
                  Only invited users can join
                </p>
              </div>
              <div className="flex items-center gap-2">
                {roomData.isPrivate ? <Lock className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                <Switch
                  checked={roomData.isPrivate}
                  onCheckedChange={(checked) => setRoomData(prev => ({ ...prev, isPrivate: checked }))}
                />
              </div>
            </div>
          </div>

          {/* Communication Features Info */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Available Features</h4>
            <p className="text-sm text-muted-foreground">
              All rooms include video calls, voice chat, and text messaging. Participants can toggle between modes during the session.
            </p>
          </div>

          {/* Tags */}
          <div>
            <Label htmlFor="tags">Tags (Optional)</Label>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Add a tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addTag()}
              />
              <Button type="button" onClick={addTag} variant="outline">
                Add
              </Button>
            </div>
            {roomData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {roomData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!roomData.title || !roomData.language}>
            Create Room
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
