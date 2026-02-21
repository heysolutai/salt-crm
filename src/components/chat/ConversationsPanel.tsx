import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Search,
  Plus,
  Tag,
  Wifi,
  X,
  Send,
  Paperclip,
  Mic,
  Smile,
  MoreVertical,
  Bot,
  User,
  Clock,
  ArrowLeft,
  StickyNote,
  Bell,
  ArrowRightLeft,
  XCircle,
} from 'lucide-react';

interface Conversation {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  status: 'ia' | 'manual' | 'waiting';
  isActive: boolean;
  tags?: string[];
}

interface Message {
  id: string;
  content: string;
  sender: 'client' | 'agent';
  agentName?: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
}

interface ConversationsPanelProps {
  open: boolean;
  onClose: () => void;
}

// Mock conversations data
const mockConversations: Conversation[] = [];

// Mock messages for selected conversation
const mockMessages: Message[] = [];

export const ConversationsPanel: React.FC<ConversationsPanelProps> = ({ open, onClose }) => {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ativas');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Filter conversations based on search and status
  const filteredConversations = mockConversations.filter(conv => {
    const matchesSearch = conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.phone.includes(searchQuery);
    const matchesStatus = filterStatus === 'ativas' ? conv.isActive :
      filterStatus === 'aguardando' ? conv.status === 'waiting' : true;
    return matchesSearch && matchesStatus;
  });

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv);
    if (isMobile) {
      setShowMobileChat(true);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: 'agent',
      agentName: 'Você',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleBackToList = () => {
    setShowMobileChat(false);
    setSelectedConversation(null);
  };

  // Conversation list component
  const ConversationList = () => (
    <div className="flex flex-col h-full bg-card border-r border-border/20">
      {/* Header */}
      <div className="p-4 border-b border-border/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">Conversas</h2>
            <Wifi className="w-4 h-4 text-success" />
          </div>
          <Button size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" />
            Nova
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar conversas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-secondary/50 border-border/30"
          />
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="flex-1 h-9 bg-secondary/50 border-border/30">
              <SelectValue placeholder="Filtrar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ativas">Ativas</SelectItem>
              <SelectItem value="aguardando">Aguardando</SelectItem>
              <SelectItem value="todas">Todas</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" className="h-9 w-9 border-border/30">
            <Tag className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="divide-y divide-border/10">
          {filteredConversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => handleSelectConversation(conv)}
              className={cn(
                "flex items-center gap-3 p-3 cursor-pointer transition-colors",
                selectedConversation?.id === conv.id
                  ? "bg-primary/10 border-l-2 border-primary"
                  : "hover:bg-secondary/50"
              )}
            >
              {/* Avatar with status indicator */}
              <div className="relative flex-shrink-0">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={conv.avatar} />
                  <AvatarFallback className="bg-secondary text-foreground text-sm">
                    {conv.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <span className={cn(
                  "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card",
                  conv.isActive ? "bg-success" : "bg-muted-foreground"
                )} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-medium text-foreground truncate">{conv.name}</span>
                  {conv.unreadCount > 0 && (
                    <Badge
                      variant="default"
                      className="ml-2 h-5 min-w-[20px] px-1.5 text-xs bg-secondary text-foreground"
                    >
                      {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate mb-1">{conv.timestamp}</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-success" />
                  <span className="text-xs text-muted-foreground">
                    {conv.status === 'ia' ? 'Atendimento automático (IA)' :
                      conv.status === 'manual' ? 'Atendimento manual' : 'Aguardando'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  // Chat area component
  const ChatArea = () => (
    <div className="flex flex-col h-full bg-background">
      {selectedConversation ? (
        <>
          {/* Chat Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/20 bg-card">
            <div className="flex items-center gap-3">
              {isMobile && (
                <Button variant="ghost" size="icon" onClick={handleBackToList} className="mr-1">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              )}
              <Avatar className="w-10 h-10">
                <AvatarImage src={selectedConversation.avatar} />
                <AvatarFallback className="bg-secondary text-foreground text-sm">
                  {selectedConversation.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{selectedConversation.name}</span>
                  <Badge className="bg-success/20 text-success border-0 text-xs px-1.5 py-0">
                    Ativa
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{selectedConversation.timestamp}</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs border-primary/30 text-primary hover:bg-primary/10">
                <User className="w-3.5 h-3.5" />
                Atendimento Manual
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs border-warning/30 text-warning hover:bg-warning/10">
                <Bot className="w-3.5 h-3.5" />
                IA Pausada
              </Button>
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                <StickyNote className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Notas & Lembretes</span>
              </Button>
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Transferir</span>
              </Button>
              <Button variant="ghost" size="sm" className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10">
                Encerrar
              </Button>
            </div>
          </div>

          {/* Tags area */}
          <div className="px-4 py-2 border-b border-border/10 bg-card/50">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
              <Plus className="w-3.5 h-3.5" />
              Adicionar Etiqueta
            </Button>
          </div>

          {/* Messages area */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex",
                    msg.sender === 'agent' ? "justify-end" : "justify-start"
                  )}
                >
                  <div className="flex items-end gap-2 max-w-[70%]">
                    {msg.sender === 'client' && (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="bg-secondary text-foreground text-xs">
                          {selectedConversation.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div>
                      {msg.sender === 'client' && (
                        <span className="text-xs text-muted-foreground mb-1 block">
                          {selectedConversation.name}
                        </span>
                      )}
                      {msg.sender === 'agent' && (
                        <span className="text-xs text-muted-foreground mb-1 block text-right">
                          {msg.agentName || 'Agente'}
                        </span>
                      )}
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-2",
                          msg.sender === 'agent'
                            ? "bg-success text-success-foreground rounded-br-sm"
                            : "bg-secondary text-foreground rounded-bl-sm"
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                        <div className={cn(
                          "flex items-center gap-1 mt-1",
                          msg.sender === 'agent' ? "justify-end" : "justify-start"
                        )}>
                          <span className="text-[10px] opacity-70">{msg.timestamp}</span>
                          {msg.sender === 'agent' && msg.status === 'read' && (
                            <span className="text-[10px] opacity-70">✓✓</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {msg.sender === 'agent' && (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="bg-success text-success-foreground text-xs">
                          AG
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input area */}
          <div className="p-4 border-t border-border/20 bg-card">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Paperclip className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                <Mic className="w-5 h-5" />
              </Button>
              <Input
                placeholder="Digite sua mensagem..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 bg-secondary/50 border-border/30"
              />
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Smile className="w-5 h-5" />
              </Button>
              <Button
                size="icon"
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="bg-primary hover:bg-primary/90"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-secondary/20">
          <div className="text-center text-muted-foreground">
            <MessageSquareIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">Selecione uma conversa</p>
            <p className="text-sm">Escolha uma conversa na lista para começar</p>
          </div>
        </div>
      )}
    </div>
  );

  // Custom message square icon for empty state
  const MessageSquareIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        className={cn(
          "p-0 gap-0 overflow-hidden",
          isMobile
            ? "max-w-full w-full h-full max-h-full rounded-none"
            : "max-w-6xl w-[95vw] h-[85vh]"
        )}
      >
        <VisuallyHidden>
          <DialogTitle>Central de Conversas</DialogTitle>
        </VisuallyHidden>

        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute right-2 top-2 z-50 rounded-full bg-card/80 hover:bg-secondary"
        >
          <X className="w-4 h-4" />
        </Button>

        {/* Desktop: Side by side layout */}
        {!isMobile && (
          <div className="flex h-full">
            <div className="w-[380px] flex-shrink-0">
              <ConversationList />
            </div>
            <div className="flex-1">
              <ChatArea />
            </div>
          </div>
        )}

        {/* Mobile: Stacked layout with navigation */}
        {isMobile && (
          <div className="h-full">
            {showMobileChat ? (
              <ChatArea />
            ) : (
              <ConversationList />
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ConversationsPanel;
