
import React, { useEffect, useRef } from 'react';
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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="h-full flex flex-col p-4 space-y-4">
      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-2">
          {messages.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">
              No messages yet. Start the conversation!
            </p>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className="p-2 rounded-lg bg-slate-700/50">
                <div className="flex justify-between items-center">
                  <p className="text-xs font-semibold text-blue-400">{msg.userName}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <p className="text-sm break-words text-slate-200">{msg.message}</p>
              </div>
            ))
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>
      
      <Separator className="bg-slate-700" />
      
      <form onSubmit={onSendMessage} className="flex gap-2">
        <Input
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Type a message..."
          disabled={!isConnected}
          className="bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:ring-blue-500"
        />
        <Button type="submit" size="icon" disabled={!isConnected || !messageInput.trim()} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Send className="w-4 h-4" />
        </Button>
      </form>
      
      {!isConnected && (
        <p className="text-xs text-slate-400 text-center">
          Connecting to chat...
        </p>
      )}
    </div>
  );
};
