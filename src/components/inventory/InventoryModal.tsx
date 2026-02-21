import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
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
import { toast } from 'sonner';
import { Package, Wrench, Save, X } from 'lucide-react';
import { 
  InventoryItem, 
  InventoryItemType, 
  useInventoryStore 
} from '@/stores/inventory/inventory-store';

interface InventoryModalProps {
  open: boolean;
  onClose: () => void;
  item?: InventoryItem | null;
}

const UNIT_OPTIONS = [
  { value: 'un', label: 'Unidade (un)' },
  { value: 'horas', label: 'Horas' },
  { value: 'sessões', label: 'Sessões' },
  { value: 'contratos', label: 'Contratos' },
  { value: 'licenças', label: 'Licenças' },
  { value: 'kg', label: 'Quilos (kg)' },
  { value: 'l', label: 'Litros (l)' },
  { value: 'm', label: 'Metros (m)' },
];

const CATEGORY_OPTIONS = [
  'Produtos',
  'Serviços',
  'Assinaturas',
  'Licenças',
  'Treinamentos',
  'Outros',
];

export const InventoryModal: React.FC<InventoryModalProps> = ({ 
  open, 
  onClose, 
  item 
}) => {
  const store = useInventoryStore();
  const isEditing = !!item;

  const [formData, setFormData] = useState({
    name: '',
    type: 'produto' as InventoryItemType,
    quantity: 0,
    unit: 'un',
    status: 'ativo' as 'ativo' | 'inativo',
    description: '',
    referenceValue: '',
    minStockAlert: '',
    category: '',
  });

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        type: item.type,
        quantity: item.quantity,
        unit: item.unit,
        status: item.status,
        description: item.description || '',
        referenceValue: item.referenceValue?.toString() || '',
        minStockAlert: item.minStockAlert?.toString() || '',
        category: item.category || '',
      });
    } else {
      setFormData({
        name: '',
        type: 'produto',
        quantity: 0,
        unit: 'un',
        status: 'ativo',
        description: '',
        referenceValue: '',
        minStockAlert: '',
        category: '',
      });
    }
  }, [item, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Nome do item é obrigatório');
      return;
    }

    const itemData = {
      name: formData.name.trim(),
      type: formData.type,
      quantity: formData.quantity,
      unit: formData.unit,
      status: formData.status,
      description: formData.description.trim() || undefined,
      referenceValue: formData.referenceValue ? parseFloat(formData.referenceValue) : undefined,
      minStockAlert: formData.minStockAlert ? parseInt(formData.minStockAlert) : undefined,
      category: formData.category || undefined,
    };

    if (isEditing && item) {
      store.updateItem(item.id, itemData);
      toast.success('Item atualizado com sucesso!');
    } else {
      store.addItem(itemData);
      toast.success('Item cadastrado com sucesso!');
    }

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {formData.type === 'produto' ? (
              <Package className="w-5 h-5 text-primary" />
            ) : (
              <Wrench className="w-5 h-5 text-info" />
            )}
            {isEditing ? 'Editar Item' : 'Novo Item de Estoque'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Item *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Plano Mensal, Kit Instalação..."
              required
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label>Tipo *</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={formData.type === 'produto' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setFormData(prev => ({ ...prev, type: 'produto' }))}
              >
                <Package className="w-4 h-4 mr-2" />
                Produto
              </Button>
              <Button
                type="button"
                variant={formData.type === 'servico' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setFormData(prev => ({ ...prev, type: 'servico' }))}
              >
                <Wrench className="w-4 h-4 mr-2" />
                Serviço
              </Button>
            </div>
          </div>

          {/* Quantity and Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade *</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Unidade *</Label>
              <Select 
                value={formData.unit} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNIT_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category and Reference Value */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="referenceValue">Valor Referência (R$)</Label>
              <Input
                id="referenceValue"
                type="number"
                min="0"
                step="0.01"
                value={formData.referenceValue}
                onChange={(e) => setFormData(prev => ({ ...prev, referenceValue: e.target.value }))}
                placeholder="0,00"
              />
            </div>
          </div>

          {/* Min Stock Alert */}
          <div className="space-y-2">
            <Label htmlFor="minStockAlert">Alerta de Estoque Mínimo</Label>
            <Input
              id="minStockAlert"
              type="number"
              min="0"
              value={formData.minStockAlert}
              onChange={(e) => setFormData(prev => ({ ...prev, minStockAlert: e.target.value }))}
              placeholder="Quantidade mínima para alertar"
            />
            <p className="text-xs text-muted-foreground">
              Você receberá um alerta visual quando o estoque atingir esse valor
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição curta do item..."
              rows={2}
            />
          </div>

          {/* Status */}
          <div className="flex items-center justify-between py-2 px-3 bg-secondary/30 rounded-lg">
            <div>
              <Label htmlFor="status" className="font-medium">Status</Label>
              <p className="text-xs text-muted-foreground">Item disponível para vendas</p>
            </div>
            <Switch
              id="status"
              checked={formData.status === 'ativo'}
              onCheckedChange={(checked) => setFormData(prev => ({ 
                ...prev, 
                status: checked ? 'ativo' : 'inativo' 
              }))}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              {isEditing ? 'Salvar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
