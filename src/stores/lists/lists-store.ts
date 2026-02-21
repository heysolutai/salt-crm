// Lists Store - Import/Export de Listas de Leads
// Estrutura alinhada com a tabela de leads
import { create } from 'zustand';

export interface ListItem {
  id: string;
  name: string;
  phone: string;
  origin: string;
  qualified: boolean;
  status: string;
  createdAt: string;
  responsavel: string;
  email?: string;
  product?: string;
  reference?: string;
  notes?: string;
}

export interface ImportedList {
  id: string;
  name: string;
  type: 'carteira' | 'prospeccao';
  itemCount: number;
  items: ListItem[];
  uploadedAt: string;
  uploadedBy: string;
}

interface ListsState {
  lists: ImportedList[];
  addList: (list: Omit<ImportedList, 'id' | 'uploadedAt'>) => void;
  deleteList: (id: string) => void;
  getListById: (id: string) => ImportedList | undefined;
}

// Mock data inicial
const mockLists: ImportedList[] = [];

export const useListsStore = create<ListsState>((set, get) => ({
  lists: mockLists,

  addList: (listData) => {
    const newList: ImportedList = {
      ...listData,
      id: `list-${Date.now()}`,
      uploadedAt: new Date().toISOString(),
    };
    set((state) => ({ lists: [...state.lists, newList] }));
  },

  deleteList: (id) => {
    set((state) => ({
      lists: state.lists.filter((list) => list.id !== id),
    }));
  },

  getListById: (id) => {
    return get().lists.find((list) => list.id === id);
  },
}));

// Template CSV columns (aligned with leads table)
export const CSV_TEMPLATE_COLUMNS = [
  'Nome*',
  'Telefone*',
  'Origem*',
  'Qualificado',
  'Status',
  'Dt. Criação',
  'Responsável',
  'Email',
  'Produto',
  'Referência',
  'Observações',
];

// Generate template CSV
export function generateTemplateCSV(): string {
  const headers = CSV_TEMPLATE_COLUMNS.join(';');
  const exampleRows = [
    '"João Silva";"(11) 99999-1111";"Site";"Sim";"Frio";"2024-01-15";"Carlos Vendedor";"joao@email.com";"Plano Premium";"REF-001";"Cliente potencial"',
    '"Ana Costa";"(11) 99999-2222";"Indicação";"Não";"Morno";"2024-01-14";"Ana Vendedora";"ana@email.com";"Plano Básico";"";"Primeiro contato"',
  ];

  return [headers, ...exampleRows].join('\n');
}

// Parse CSV file to ListItems
export function parseCSVToListItems(csvContent: string): ListItem[] {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  // Skip header
  const dataLines = lines.slice(1);

  return dataLines.map((line, index) => {
    // Handle quoted values with semicolons inside
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ';' && !inQuotes) {
        values.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim().replace(/^"|"$/g, ''));

    const qualifiedValue = values[3]?.toLowerCase();

    return {
      id: `imported-${Date.now()}-${index}`,
      name: values[0] || '',
      phone: values[1] || '',
      origin: values[2] || 'Importação',
      qualified: qualifiedValue === 'sim' || qualifiedValue === 'yes' || qualifiedValue === '1' || qualifiedValue === 'true',
      status: values[4] || 'Frio',
      createdAt: values[5] || new Date().toISOString().split('T')[0],
      responsavel: values[6] || '',
      email: values[7] || undefined,
      product: values[8] || undefined,
      reference: values[9] || undefined,
      notes: values[10] || undefined,
    };
  }).filter(item => item.name && item.phone);
}

// Download helper
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
