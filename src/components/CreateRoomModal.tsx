import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Users, Globe, Lock, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const languages = [
  'English',
  'Spanish',
  'French',
  'German',
  'Italian',
  'Portuguese',
  'Chinese',
  'Japanese',
  'Korean',
  'Arabic',
  'Russian',
  'Dutch',
];

export function CreateRoomModal({ isOpen, onClose }: CreateRoomModalProps) {
  const [roomData, setRoomData] = useState({
    title: '',
    description: '',
    language: '',
    maxParticipants: '10',
    isPrivate: false,
    tags: [] as string[],
    level: 'beginner',
    topic: '',
  });

  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ title: '', language: '' });
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateForm = () => {
    let isValid = true;
    const newErrors = { title: '', language: '' };

    if (!roomData.title.trim()) {
      newErrors.title = 'Room title is required';
      isValid = false;
    }
    if (!roomData.language) {
      newErrors.language = 'Primary language is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const addTag = () => {
    if (newTag.trim() && !roomData.tags.includes(newTag.trim())) {
      setRoomData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setRoomData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      console.log('Creating room with data:', roomData);

      const payload = {
        title: roomData.title,
        description: roomData.description,
        language: roomData.language,
        maxParticipants: parseInt(roomData.maxParticipants),
        private: roomData.isPrivate,
        tags: roomData.tags,
        supports: ['video', 'audio', 'text'],
        topic: roomData.topic || 'General',
        level: roomData.level, // Include if schema supports it
      };

      console.log('Sending payload:', payload);

      const response = await axios.post('http://localhost:3000/rooms', payload, {
        withCredentials: true,
      });

      console.log('Room created successfully:', response.data);

      if (response.data.success && response.data.room) {
        const roomId = response.data.room.roomId;
        console.log('Navigating to room:', roomId);

        toast({
          title: 'Room Created',
          description: 'Your room has been created successfully!',
        });

        onClose();
        navigate(`/room/${roomId}`);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error('Error creating room:', error);

      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to create room';

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
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
          {/* Room Title */}
          <div>
            <Label htmlFor="title">Room Title</Label>
            <Input
              id="title"
              placeholder="e.g., English Conversation for Beginners"
              value={roomData.title}
              onChange={(e) =>
                setRoomData((prev) => ({ ...prev, title: e.target.value }))
              }
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Topic */}
          <div>
            <Label htmlFor="topic">Topic</Label>
            <Input
              id="topic"
              placeholder="e.g., Travel, Hobbies, Technology"
              value={roomData.topic}
              onChange={(e) =>
                setRoomData((prev) => ({ ...prev, topic: e.target.value }))
              }
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what participants can expect..."
              value={roomData.description}
              onChange={(e) =>
                setRoomData((prev) => ({ ...prev, description: e.target.value }))
              }
              rows={3}
            />
          </div>

          {/* Language Select */}
          <div>
            <Label htmlFor="language">Primary Language</Label>
            <Select
              value={roomData.language}
              onValueChange={(value) =>
                setRoomData((prev) => ({ ...prev, language: value }))
              }
            >
              <SelectTrigger className={errors.language ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.language && <p className="text-red-500 text-xs mt-1">{errors.language}</p>}
          </div>

          {/* Level Select */}
          <div>
            <Label htmlFor="level">Difficulty Level</Label>
            <Select
              value={roomData.level}
              onValueChange={(value) =>
                setRoomData((prev) => ({ ...prev, level: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Max Participants */}
          <div>
            <Label htmlFor="maxParticipants">Maximum Participants</Label>
            <Select
              value={roomData.maxParticipants}
              onValueChange={(value) =>
                setRoomData((prev) => ({ ...prev, maxParticipants: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2, 3, 4, 5, 7, 10].map((num) => (
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

          {/* Private Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Private Room</Label>
              <p className="text-sm text-muted-foreground">Only invited users can join</p>
            </div>
            <div className="flex items-center gap-2">
              {roomData.isPrivate ? <Lock className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
              <Switch
                checked={roomData.isPrivate}
                onCheckedChange={(checked) =>
                  setRoomData((prev) => ({ ...prev, isPrivate: checked }))
                }
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label htmlFor="tags">Tags (Optional)</Label>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Add a tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTag()}
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
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Features Info */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Available Features</h4>
            <p className="text-sm text-muted-foreground">
              All rooms include video calls, voice chat, and text messaging. Participants can toggle between modes during the session.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Room'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}