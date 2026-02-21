import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  RefreshCw, 
  Fish, 
  Users, 
  Layers, 
  Plus, 
  Trash2, 
  Save,
  Edit2,
  X
} from 'lucide-react';

export type DistributionMode = 'roleta' | 'pescaria';
export type FishingQueueType = 'fila_unica' | 'por_setor' | 'hibrido';

export interface Sector {
  id: string;
  name: string;
  active: boolean;
}

interface DistributionConfigProps {
  open: boolean;
  onClose: () => void;
  onSave: (config: DistributionConfigData) => void;
  initialConfig?: DistributionConfigData;
}

export interface DistributionConfigData {
  mode: DistributionMode;
  fishingQueueType: FishingQueueType;
  sectors: Sector[];
}

const defaultConfig: DistributionConfigData = {
  mode: 'roleta',
  fishingQueueType: 'fila_unica',
  sectors: [
    { id: '1', name: 'Vendas Externas', active: true },
    { id: '2', name: 'Vendas Internas', active: true },
  ],
};

export const DistributionConfig: React.FC<DistributionConfigProps> = ({ 
  open, 
  onClose, 
  onSave, 
  initialConfig = defaultConfig 
}) => {
  const { toast } = useToast();
  const [config, setConfig] = useState<DistributionConfigData>(initialConfig);
  const [newSectorName, setNewSectorName] = useState('');
  const [editingSector, setEditingSector] = useState<string | null>(null);
  const [editSectorName, setEditSectorName] = useState('');

  const handleModeChange = (mode: DistributionMode) => {
    setConfig(prev => ({ ...prev, mode }));
  };

  const handleQueueTypeChange = (queueType: FishingQueueType) => {
    setConfig(prev => ({ ...prev, fishingQueueType: queueType }));
  };

  const handleAddSector = () => {
    if (!newSectorName.trim()) return;
    
    const newSector: Sector = {
      id: Date.now().toString(),
      name: newSectorName.trim(),
      active: true,
    };
    
    setConfig(prev => ({
      ...prev,
      sectors: [...prev.sectors, newSector],
    }));
    setNewSectorName('');
    
    toast({
      title: 'Setor adicionado',
      description: `${newSector.name} foi criado com sucesso.`,
    });
  };

  const handleRemoveSector = (sectorId: string) => {
    setConfig(prev => ({
      ...prev,
      sectors: prev.sectors.filter(s => s.id !== sectorId),
    }));
    toast({
      title: 'Setor removido',
      description: 'O setor foi excluído.',
    });
  };

  const handleToggleSector = (sectorId: string) => {
    setConfig(prev => ({
      ...prev,
      sectors: prev.sectors.map(s => 
        s.id === sectorId ? { ...s, active: !s.active } : s
      ),
    }));
  };

  const handleStartEditSector = (sector: Sector) => {
    setEditingSector(sector.id);
    setEditSectorName(sector.name);
  };

  const handleSaveEditSector = () => {
    if (!editSectorName.trim() || !editingSector) return;
    
    setConfig(prev => ({
      ...prev,
      sectors: prev.sectors.map(s => 
        s.id === editingSector ? { ...s, name: editSectorName.trim() } : s
      ),
    }));
    setEditingSector(null);
    setEditSectorName('');
  };

  const handleSave = () => {
    onSave(config);
    toast({
      title: 'Configurações salvas',
      description: 'Modo de distribuição atualizado com sucesso.',
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Configuração de Distribuição
          </DialogTitle>
          <DialogDescription>
            Escolha como os leads serão distribuídos para sua equipe
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          <div className="space-y-6 py-2">
            {/* Distribution Mode */}
            <div className="space-y-3">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Modo de Distribuição
              </Label>
              <RadioGroup 
                value={config.mode} 
                onValueChange={(val) => handleModeChange(val as DistributionMode)}
                className="grid grid-cols-2 gap-3"
              >
                <label 
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all",
                    config.mode === 'roleta' 
                      ? "border-primary bg-primary/5" 
                      : "border-border/30 hover:border-border/50"
                  )}
                >
                  <RadioGroupItem value="roleta" className="sr-only" />
                  <RefreshCw className={cn(
                    "w-8 h-8",
                    config.mode === 'roleta' ? "text-primary" : "text-muted-foreground"
                  )} />
                  <div className="text-center">
                    <p className={cn(
                      "text-sm font-medium",
                      config.mode === 'roleta' ? "text-primary" : "text-foreground"
                    )}>Roleta</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Distribuição automática sequencial
                    </p>
                  </div>
                </label>

                <label 
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all",
                    config.mode === 'pescaria' 
                      ? "border-primary bg-primary/5" 
                      : "border-border/30 hover:border-border/50"
                  )}
                >
                  <RadioGroupItem value="pescaria" className="sr-only" />
                  <Fish className={cn(
                    "w-8 h-8",
                    config.mode === 'pescaria' ? "text-primary" : "text-muted-foreground"
                  )} />
                  <div className="text-center">
                    <p className={cn(
                      "text-sm font-medium",
                      config.mode === 'pescaria' ? "text-primary" : "text-foreground"
                    )}>Pescaria</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Vendedores escolhem os leads
                    </p>
                  </div>
                </label>
              </RadioGroup>
            </div>

            {/* Fishing Queue Type - Only show if pescaria mode */}
            {config.mode === 'pescaria' && (
              <div className="space-y-3">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Tipo de Fila
                </Label>
                <RadioGroup 
                  value={config.fishingQueueType} 
                  onValueChange={(val) => handleQueueTypeChange(val as FishingQueueType)}
                  className="space-y-2"
                >
                  <label 
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                      config.fishingQueueType === 'fila_unica' 
                        ? "border-primary bg-primary/5" 
                        : "border-border/30 hover:border-border/50"
                    )}
                  >
                    <RadioGroupItem value="fila_unica" />
                    <Users className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Fila Única</p>
                      <p className="text-[11px] text-muted-foreground">Todos os leads em uma fila geral</p>
                    </div>
                  </label>

                  <label 
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                      config.fishingQueueType === 'por_setor' 
                        ? "border-primary bg-primary/5" 
                        : "border-border/30 hover:border-border/50"
                    )}
                  >
                    <RadioGroupItem value="por_setor" />
                    <Layers className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Por Setor</p>
                      <p className="text-[11px] text-muted-foreground">Leads separados por setor específico</p>
                    </div>
                  </label>

                  <label 
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                      config.fishingQueueType === 'hibrido' 
                        ? "border-primary bg-primary/5" 
                        : "border-border/30 hover:border-border/50"
                    )}
                  >
                    <RadioGroupItem value="hibrido" />
                    <div className="flex">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <Layers className="w-4 h-4 text-muted-foreground -ml-1" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Híbrido</p>
                      <p className="text-[11px] text-muted-foreground">Fila geral + filas por setor</p>
                    </div>
                  </label>
                </RadioGroup>
              </div>
            )}

            {/* Sectors Management - Show if pescaria with sectors */}
            {config.mode === 'pescaria' && (config.fishingQueueType === 'por_setor' || config.fishingQueueType === 'hibrido') && (
              <div className="space-y-3">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Setores
                </Label>
                
                {/* Add Sector */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Nome do novo setor..."
                    value={newSectorName}
                    onChange={(e) => setNewSectorName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSector()}
                    className="flex-1 h-9 text-sm"
                  />
                  <Button 
                    onClick={handleAddSector}
                    disabled={!newSectorName.trim()}
                    size="sm"
                    className="h-9 px-3"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Sectors List */}
                <div className="space-y-2">
                  {config.sectors.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <Layers className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">Nenhum setor cadastrado</p>
                    </div>
                  ) : (
                    config.sectors.map((sector) => (
                      <div 
                        key={sector.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border transition-all",
                          sector.active ? "border-border/30 bg-card" : "border-border/20 bg-muted/20"
                        )}
                      >
                        {editingSector === sector.id ? (
                          <>
                            <Input
                              value={editSectorName}
                              onChange={(e) => setEditSectorName(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSaveEditSector()}
                              className="flex-1 h-8 text-sm"
                              autoFocus
                            />
                            <Button 
                              size="sm" 
                              onClick={handleSaveEditSector}
                              className="h-8 px-2"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => setEditingSector(null)}
                              className="h-8 px-2"
                            >
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <div className="flex-1">
                              <span className={cn(
                                "text-sm font-medium",
                                sector.active ? "text-foreground" : "text-muted-foreground"
                              )}>
                                {sector.name}
                              </span>
                            </div>
                            <Badge 
                              variant={sector.active ? "default" : "secondary"}
                              className="text-[10px] h-5"
                            >
                              {sector.active ? 'Ativo' : 'Inativo'}
                            </Badge>
                            <Switch
                              checked={sector.active}
                              onCheckedChange={() => handleToggleSector(sector.id)}
                              className="scale-90"
                            />
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleStartEditSector(sector)}
                              className="h-7 w-7 p-0"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleRemoveSector(sector.id)}
                              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2 border-t pt-4 mt-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            Salvar Configuração
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DistributionConfig;
