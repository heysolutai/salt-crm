// Panel showing pending deliveries/services for the seller
import React, { useState } from 'react';
import { Truck, Package, Wrench, Calendar, Clock, Phone, MapPin, CheckCircle, Pencil, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { usePendingDeliveries, formatShift, formatSaleType, PendingDelivery } from '@/stores/sales/delivery-store';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useUserRole } from '@/hooks/useUserRole';

export const SellerDeliveriesPanel: React.FC = () => {
  const { deliveries, kpis, completeDelivery, updateDelivery } = usePendingDeliveries();
  const { role } = useUserRole();
  const [open, setOpen] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState<PendingDelivery | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  
  // Estado de edição
  const [editData, setEditData] = useState({
    productName: '',
    productCode: '',
    saleValue: 0,
    scheduledDate: '',
    scheduledShift: 'manha' as 'manha' | 'tarde' | 'noite' | 'personalizado',
    scheduledTime: '',
    deliveryContact: '',
    observations: '',
  });

  // Verificar se é gerente/admin
  const canEdit = role === 'TENANT_ADMIN' || role === 'TENANT_GERENTE';

  const handleOpenEdit = (delivery: PendingDelivery, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingDelivery(delivery);
    setEditData({
      productName: delivery.productName,
      productCode: delivery.productCode || '',
      saleValue: delivery.saleValue,
      scheduledDate: delivery.scheduledDate ? format(new Date(delivery.scheduledDate), 'yyyy-MM-dd') : '',
      scheduledShift: delivery.scheduledShift || 'manha',
      scheduledTime: delivery.scheduledTime || '',
      deliveryContact: delivery.deliveryContact || '',
      observations: delivery.observations || '',
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingDelivery) return;
    
    updateDelivery(editingDelivery.id, {
      productName: editData.productName,
      productCode: editData.productCode || undefined,
      saleValue: editData.saleValue,
      scheduledDate: editData.scheduledDate ? new Date(editData.scheduledDate) : undefined,
      scheduledShift: editData.scheduledShift,
      scheduledTime: editData.scheduledTime || undefined,
      deliveryContact: editData.deliveryContact || undefined,
      observations: editData.observations || undefined,
    });
    
    toast.success('Entrega atualizada!');
    setEditModalOpen(false);
    setEditingDelivery(null);
  };

  const handleComplete = (deliveryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Confirmar entrega/serviço como concluído?')) {
      completeDelivery(deliveryId);
      toast.success('Entrega marcada como concluída!');
    }
  };

  const formatScheduledDate = (date: Date | undefined) => {
    if (!date) return 'Sem data';
    const d = new Date(date);
    
    if (isToday(d)) {
      return 'Hoje';
    }
    if (isTomorrow(d)) {
      return 'Amanhã';
    }
    return format(d, "dd/MM", { locale: ptBR });
  };

  const getDateBadgeClass = (date: Date | undefined) => {
    if (!date) return 'bg-muted text-muted-foreground';
    const d = new Date(date);
    
    if (isPast(d) && !isToday(d)) {
      return 'bg-destructive/20 text-destructive border-destructive/30';
    }
    if (isToday(d)) {
      return 'bg-success/20 text-success border-success/30';
    }
    if (isTomorrow(d)) {
      return 'bg-amber-500/20 text-amber-600 border-amber-500/30';
    }
    return 'bg-primary/10 text-primary border-primary/30';
  };

  const renderDeliveryCard = (delivery: PendingDelivery) => {
    const isProduct = delivery.saleType === 'produto';
    const TypeIcon = isProduct ? Package : Wrench;
    
    return (
      <div
        key={delivery.id}
        className="p-4 bg-card rounded-xl border border-border/30 hover:border-border/60 transition-all group"
      >
        <div className="flex items-start gap-3">
          {/* Ícone do tipo */}
          <div className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
            isProduct ? 'bg-blue-500/10 text-blue-600' : 'bg-purple-500/10 text-purple-600'
          )}>
            <TypeIcon className="w-5 h-5" />
          </div>

          {/* Conteúdo */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div>
                <p className="font-semibold text-sm text-foreground truncate">{delivery.clientName}</p>
                <p className="text-xs text-muted-foreground truncate">{delivery.productName}</p>
              </div>
              <Badge 
                variant="outline" 
                className={cn('text-[10px] shrink-0', getDateBadgeClass(delivery.scheduledDate))}
              >
                {formatScheduledDate(delivery.scheduledDate)}
              </Badge>
            </div>

            {/* Detalhes */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground">
              {delivery.scheduledTime && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {delivery.scheduledTime}
                  {delivery.scheduledShift && ` (${formatShift(delivery.scheduledShift)})`}
                </span>
              )}
              {delivery.deliveryContact && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {delivery.deliveryContact}
                </span>
              )}
            </div>

            {/* Endereço (para produtos) */}
            {isProduct && delivery.deliveryAddress && (
              <div className="flex items-start gap-1 mt-2 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                <span className="line-clamp-2">
                  {delivery.deliveryAddress.street}, {delivery.deliveryAddress.number}
                  {delivery.deliveryAddress.complement && ` - ${delivery.deliveryAddress.complement}`}
                  {' - '}{delivery.deliveryAddress.neighborhood}, {delivery.deliveryAddress.city}
                </span>
              </div>
            )}

            {/* Observações */}
            {delivery.observations && (
              <p className="text-xs text-muted-foreground/80 italic mt-2 line-clamp-1">
                {delivery.observations}
              </p>
            )}

            {/* Valor + Ações */}
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/20">
              <span className="text-sm font-semibold text-foreground">
                R$ {delivery.saleValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <div className="flex items-center gap-1">
                {canEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1.5 text-xs text-primary hover:bg-primary/10 hover:text-primary"
                    onClick={(e) => handleOpenEdit(delivery, e)}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Editar
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1.5 text-xs text-success hover:bg-success/10 hover:text-success"
                  onClick={(e) => handleComplete(delivery.id, e)}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Concluir
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button className="relative p-2 hover:bg-secondary/60 rounded-lg transition-all active:scale-95">
            <Truck className="w-4 h-4 text-foreground" />
            {kpis.totalPending > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[9px] font-bold flex items-center justify-center"
              >
                {kpis.totalPending}
              </Badge>
            )}
          </button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:w-[420px] p-0">
          <SheetHeader className="px-4 py-3 border-b border-border/30">
            <SheetTitle className="flex items-center gap-2 text-base">
              <Truck className="w-4 h-4 text-primary" />
              Entregas Pendentes
              {kpis.totalPending > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {kpis.totalPending}
                </Badge>
              )}
            </SheetTitle>
          </SheetHeader>

          {/* KPIs rápidos */}
          {kpis.totalPending > 0 && (
            <div className="px-4 py-3 border-b border-border/20 bg-muted/30">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-lg font-bold text-foreground">{kpis.todayCount}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Hoje</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-blue-600">{kpis.pendingProducts}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Produtos</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-purple-600">{kpis.pendingServices}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Serviços</p>
                </div>
              </div>
            </div>
          )}

          <ScrollArea className="h-[calc(100vh-180px)]">
            <div className="p-4 space-y-3">
              {deliveries.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Truck className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Nenhuma entrega pendente</p>
                  <p className="text-xs mt-1">As entregas agendadas aparecerão aqui</p>
                </div>
              ) : (
                deliveries.map(renderDeliveryCard)
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Modal de Edição */}
      <ResponsiveModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        title="Editar Entrega"
        description={editingDelivery ? `${editingDelivery.clientName} - ${editingDelivery.productName}` : ''}
      >
        <div className="space-y-4">
          {/* Produto */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Produto/Serviço</Label>
              <Input
                value={editData.productName}
                onChange={(e) => setEditData(prev => ({ ...prev, productName: e.target.value }))}
                placeholder="Nome do produto"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Valor (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={editData.saleValue}
                onChange={(e) => setEditData(prev => ({ ...prev, saleValue: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          </div>

          {/* Data e Turno */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Data da Entrega</Label>
              <Input
                type="date"
                value={editData.scheduledDate}
                onChange={(e) => setEditData(prev => ({ ...prev, scheduledDate: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Turno</Label>
              <Select
                value={editData.scheduledShift}
                onValueChange={(v: 'manha' | 'tarde' | 'noite' | 'personalizado') => 
                  setEditData(prev => ({ ...prev, scheduledShift: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manha">Manhã</SelectItem>
                  <SelectItem value="tarde">Tarde</SelectItem>
                  <SelectItem value="noite">Noite</SelectItem>
                  <SelectItem value="personalizado">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Horário e Contato */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Horário</Label>
              <Input
                type="time"
                value={editData.scheduledTime}
                onChange={(e) => setEditData(prev => ({ ...prev, scheduledTime: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Contato Responsável</Label>
              <Input
                value={editData.deliveryContact}
                onChange={(e) => setEditData(prev => ({ ...prev, deliveryContact: e.target.value }))}
                placeholder="Nome do contato"
              />
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-1">
            <Label className="text-xs">Observações</Label>
            <Textarea
              value={editData.observations}
              onChange={(e) => setEditData(prev => ({ ...prev, observations: e.target.value }))}
              placeholder="Observações sobre a entrega..."
              rows={2}
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => setEditModalOpen(false)}
            >
              <X className="w-4 h-4" />
              Cancelar
            </Button>
            <Button
              className="flex-1 gap-2"
              onClick={handleSaveEdit}
            >
              <Save className="w-4 h-4" />
              Salvar
            </Button>
          </div>
        </div>
      </ResponsiveModal>
    </>
  );
};
