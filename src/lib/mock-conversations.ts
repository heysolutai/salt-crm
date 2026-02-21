// Conversations data - will be fetched from API

export interface MockConversation {
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
  funnelTab: 'funil' | 'carteira' | 'prospeccao';
  funnelStatus: string;
}

export interface MockMessage {
  id: string;
  content: string;
  sender: 'client' | 'agent';
  agentName?: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
}

// Dados vazios - sem mock data
export const mockConversations: MockConversation[] = [];
export const mockMessagesByConversation: Record<string, MockMessage[]> = {};

export function getMessagesForConversation(conversationId: string): MockMessage[] {
  return mockMessagesByConversation[conversationId] || [];
}
