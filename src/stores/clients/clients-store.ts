// Clients Store - SALT CRM
// Estrutura alinhada com a tabela de leads
import { create } from 'zustand';

export interface Client {
  id: string;
  name: string;
  phone: string;
  origin: string;
  qualified: boolean;
  status: 'Frio' | 'Morno' | 'Quente' | 'Qualificado' | 'Em Atendimento' | 'Em Negociação' | 'Fechado – Ganho' | 'Arquivado';
  createdAt: string;
  responsavel: string;
  // Campos adicionais opcionais
  email?: string;
  product?: string;
  reference?: string;
  notes?: string;
}

// Color mapping for status badges
export const statusColors: Record<string, string> = {
  'Frio': '#5B8DEF',
  'Morno': '#F5A15D',
  'Quente': '#E96A6A',
  'Qualificado': '#4FC3B5',
  'Em Atendimento': '#9B7CF4',
  'Em Negociação': '#F4C95D',
  'Fechado – Ganho': '#4CAF50',
  'Arquivado': '#607D8B',
};

interface ClientsState {
  clients: Client[];
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => void;
  updateClient: (id: string, data: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  getClientById: (id: string) => Client | undefined;
}

// Mock data inicial
const mockClients: Client[] = [];

export const useClientsStore = create<ClientsState>((set, get) => ({
  clients: mockClients,

  addClient: (clientData) => {
    const newClient: Client = {
      ...clientData,
      id: `client-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    set((state) => ({ clients: [...state.clients, newClient] }));
  },

  updateClient: (id, data) => {
    set((state) => ({
      clients: state.clients.map((client) =>
        client.id === id ? { ...client, ...data } : client
      ),
    }));
  },

  deleteClient: (id) => {
    set((state) => ({
      clients: state.clients.filter((client) => client.id !== id),
    }));
  },

  getClientById: (id) => {
    return get().clients.find((client) => client.id === id);
  },
}));

// Export functions for CSV
export function exportClientsToCSV(clients: Client[]): string {
  const headers = [
    'Nome',
    'Telefone',
    'Origem',
    'Qualificado',
    'Status',
    'Dt. Criação',
    'Responsável',
    'Email',
    'Produto',
    'Referência',
    'Observações',
  ];

  const rows = clients.map((client) => [
    client.name,
    client.phone,
    client.origin,
    client.qualified ? 'Sim' : 'Não',
    client.status,
    client.createdAt,
    client.responsavel,
    client.email || '',
    client.product || '',
    client.reference || '',
    client.notes || '',
  ]);

  const csvContent = [
    headers.join(';'),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';')),
  ].join('\n');

  return csvContent;
}

export function downloadCSV(content: string, filename: string): void {
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
