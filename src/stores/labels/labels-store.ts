import { create } from 'zustand';

export interface Label {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

interface LabelsState {
  labels: Label[];
  addLabel: (name: string, color: string) => void;
  removeLabel: (id: string) => void;
  updateLabel: (id: string, name: string, color: string) => void;
}

// Mock initial labels
const initialLabels: Label[] = [
  { id: '1', name: 'VIP', color: '#F5A15D', createdAt: '2024-01-15' },
  { id: '2', name: 'Urgente', color: '#E96A6A', createdAt: '2024-01-16' },
  { id: '3', name: 'Novo', color: '#4CAF50', createdAt: '2024-01-17' },
  { id: '4', name: 'Premium', color: '#9B7CF4', createdAt: '2024-01-18' },
];

export const useLabelsStore = create<LabelsState>((set) => ({
  labels: initialLabels,
  
  addLabel: (name: string, color: string) => {
    const newLabel: Label = {
      id: Date.now().toString(),
      name,
      color,
      createdAt: new Date().toISOString().split('T')[0],
    };
    set((state) => ({ labels: [...state.labels, newLabel] }));
  },
  
  removeLabel: (id: string) => {
    set((state) => ({ labels: state.labels.filter(l => l.id !== id) }));
  },
  
  updateLabel: (id: string, name: string, color: string) => {
    set((state) => ({
      labels: state.labels.map(l => 
        l.id === id ? { ...l, name, color } : l
      ),
    }));
  },
}));

// Export API functions for external use
export const labelsApi = {
  getLabels: () => useLabelsStore.getState().labels,
  addLabel: (name: string, color: string) => useLabelsStore.getState().addLabel(name, color),
  removeLabel: (id: string) => useLabelsStore.getState().removeLabel(id),
  updateLabel: (id: string, name: string, color: string) => useLabelsStore.getState().updateLabel(id, name, color),
};
