import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pin, MessageSquare, User } from 'lucide-react';
import { toast } from 'sonner';

interface Seller {
  id: string;
  name: string;
  email: string;
}

interface PinConversationModalProps {
  open: boolean;
  onClose: () => void;
  leadId: string;
  leadName: string;
  currentSellerId?: string;
  sellers: Seller[];
  onPin: (sellerId: string, note: string) => void;
}

export const PinConversationModal: React.FC<PinConversationModalProps> = ({
  open,
  onClose,
  leadId,
  leadName,
  currentSellerId,
  sellers,
  onPin,
}) => {
  const [selectedSeller, setSelectedSeller] = useState<string>(currentSellerId || '');
  const [managerNote, setManagerNote] = useState('');

  const handlePin = () => {
    if (!selectedSeller) {
      toast.error('Selecione um vendedor');
      return;
    }
    if (!managerNote.trim()) {
      toast.error('Adicione uma observação');
      return;
    }

    onPin(selectedSeller, managerNote.trim());
    
    const sellerName = sellers.find(s => s.id === selectedSeller)?.name || 'vendedor';
    toast.success(`Conversa fixada para ${sellerName}`);
    
    // Reset and close
    setManagerNote('');
    onClose();
  };

  const handleCancel = () => {
    setManagerNote('');
    setSelectedSeller(currentSellerId || '');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pin className="w-5 h-5 text-primary" />
            Fixar Conversa para Vendedor
          </DialogTitle>
          <DialogDescription>
            Fixe esta conversa no topo da lista do vendedor com uma observação
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Lead Info */}
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{leadName}</p>
              <p className="text-xs text-muted-foreground">Lead a ser fixado</p>
            </div>
          </div>

          {/* Seller Selection */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Vendedor Responsável
            </Label>
            <Select value={selectedSeller} onValueChange={setSelectedSeller}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Selecione o vendedor" />
              </SelectTrigger>
              <SelectContent>
                {sellers.map((seller) => (
                  <SelectItem key={seller.id} value={seller.id}>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>{seller.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Manager Note */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Observação do Gerente <span className="text-destructive">*</span>
            </Label>
            <Textarea
              value={managerNote}
              onChange={(e) => setManagerNote(e.target.value)}
              placeholder="Ex: Priorizar este cliente, retornar urgente..."
              className="min-h-[100px] resize-none"
            />
            <p className="text-[10px] text-muted-foreground">
              Esta observação será exibida para o vendedor junto com a conversa fixada
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button 
            onClick={handlePin}
            disabled={!selectedSeller || !managerNote.trim()}
            className="gap-2"
          >
            <Pin className="w-4 h-4" />
            Fixar Conversa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PinConversationModal;
