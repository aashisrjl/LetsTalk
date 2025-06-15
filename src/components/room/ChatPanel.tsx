
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

interface ChatMessage {
  message: string;
  userName: string;
  time: string;
}

interface ChatPanelProps {
  messages: ChatMessage[];
  messageInput: string;
  setMessageInput: (value: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
  isConnected: boolean;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  messageInput,
  setMessageInput,
  onSendMessage,
  isConnected,
}) => {
  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle>Chat</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 flex flex-col">
        <ScrollArea className="h-64 flex-1">
          <div className="space-y-2">
            {messages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No messages yet. Start the conversation!
              </p>
            ) : (
              messages.map((msg, index) => (
                <div key={index} className="p-2 rounded-lg bg-muted">
                  <p className="text-xs text-muted-foreground">{msg.userName}</p>
                  <p className="text-sm">{msg.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(msg.time).toLocaleTimeString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        
        <Separator />
        
        <form onSubmit={onSendMessage} className="flex gap-2">
          <Input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type a message..."
            disabled={!isConnected}
          />
          <Button type="submit" size="icon" disabled={!isConnected || !messageInput.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
        
        {!isConnected && (
          <p className="text-xs text-muted-foreground text-center">
            Connecting to chat...
          </p>
        )}
      </CardContent>
    </Card>
  );
};
