import React, { useState, useEffect } from 'react';
import { ResponsiveModal, ModalActions } from '@/components/ui/responsive-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sale, salesStore, PaymentMethodType } from '@/stores/sales';
import { SalePrintView } from './SalePrintView';
import { 
  CheckCircle2, 
  XCircle, 
  DollarSign, 
  User, 
  Phone, 
  Package,
  CreditCard,
  Calendar,
  FileText,
  Printer,
  Pencil,
  Save,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SaleValidationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sale: Sale | null;
  onValidated?: () => void;
}

const paymentMethodLabels: Record<string, string> = {
  pix: 'PIX',
  cartao_vista: 'Cartão à Vista',
  cartao_parcelado: 'Cartão Parcelado',
  boleto: 'Boleto',
  transferencia: 'Transferência',
  dinheiro: 'Dinheiro',
};

const paymentMethods: { value: PaymentMethodType; label: string }[] = [
  { value: 'pix', label: 'PIX' },
  { value: 'cartao_vista', label: 'Cartão à Vista' },
  { value: 'cartao_parcelado', label: 'Cartão Parcelado' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'transferencia', label: 'Transferência' },
  { value: 'dinheiro', label: 'Dinheiro' },
];

export const SaleValidationModal: React.FC<SaleValidationModalProps> = ({
  open,
  onOpenChange,
  sale,
  onValidated,
}) => {
  const [action, setAction] = useState<'validate' | 'reject' | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [printViewOpen, setPrintViewOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Estado de edição
  const [editData, setEditData] = useState({
    productSold: '',
    productCode: '',
    productDescription: '',
    saleValue: 0,
    paymentMethod: 'pix' as PaymentMethodType,
    installments: 1,
    observations: '',
  });

  // Sincroniza dados quando a venda muda
  useEffect(() => {
    if (sale) {
      setEditData({
        productSold: sale.productSold,
        productCode: sale.productCode || '',
        productDescription: sale.productDescription || '',
        saleValue: sale.saleValue,
        paymentMethod: sale.paymentMethod,
        installments: sale.installments || 1,
        observations: sale.observations || '',
      });
    }
  }, [sale]);

  const handleSaveEdit = () => {
    if (!sale) return;
    
    salesStore.updateSale(sale.id, {
      productSold: editData.productSold,
      productCode: editData.productCode || undefined,
      productDescription: editData.productDescription || undefined,
      saleValue: editData.saleValue,
      paymentMethod: editData.paymentMethod,
      installments: editData.paymentMethod === 'cartao_parcelado' ? editData.installments : undefined,
      paymentCondition: editData.paymentMethod === 'cartao_parcelado' ? 'parcelado' : 'avista',
      observations: editData.observations || undefined,
    });
    
    toast.success('Dados da venda atualizados!');
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    if (sale) {
      setEditData({
        productSold: sale.productSold,
        productCode: sale.productCode || '',
        productDescription: sale.productDescription || '',
        saleValue: sale.saleValue,
        paymentMethod: sale.paymentMethod,
        installments: sale.installments || 1,
        observations: sale.observations || '',
      });
    }
    setIsEditing(false);
  };

  const handleConfirmAction = async () => {
    if (!sale) return;
    
    setIsSubmitting(true);
    
    // Simula delay de API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (action === 'validate') {
      salesStore.validateSale(sale.id, comment || undefined);
      toast.success('Venda validada com sucesso!', {
        description: `A venda de ${sale.leadName} foi aprovada.`,
      });
    } else if (action === 'reject') {
      if (!comment.trim()) {
        toast.error('Informe o motivo da rejeição');
        setIsSubmitting(false);
        return;
      }
      salesStore.rejectSale(sale.id, comment);
      toast.success('Venda rejeitada', {
        description: `A venda de ${sale.leadName} foi devolvida ao vendedor.`,
      });
    }
    
    setIsSubmitting(false);
    setAction(null);
    setComment('');
    setIsEditing(false);
    onOpenChange(false);
    onValidated?.();
  };

  const handleClose = () => {
    setAction(null);
    setComment('');
    setIsEditing(false);
    onOpenChange(false);
  };

  if (!sale) return null;

  // Usa editData se editando, senão usa dados originais
  const displayValue = isEditing ? editData.saleValue : sale.saleValue;
  const displayProduct = isEditing ? editData.productSold : sale.productSold;
  const displayProductCode = isEditing ? editData.productCode : sale.productCode;
  const displayProductDescription = isEditing ? editData.productDescription : sale.productDescription;
  const displayPaymentMethod = isEditing ? editData.paymentMethod : sale.paymentMethod;
  const displayInstallments = isEditing ? editData.installments : sale.installments;
  const displayObservations = isEditing ? editData.observations : sale.observations;

  const formattedValue = displayValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const formattedDate = new Date(sale.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={handleClose}
      title="Validar Venda"
      description={`Venda registrada por ${sale.agentName}`}
      size="lg"
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        {/* Header com valor em destaque */}
        <div className="bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 rounded-xl p-4 border border-emerald-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                {isEditing ? (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Valor da Venda</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editData.saleValue}
                      onChange={(e) => setEditData(prev => ({ ...prev, saleValue: parseFloat(e.target.value) || 0 }))}
                      className="h-9 w-40 text-lg font-bold"
                    />
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-emerald-600">{formattedValue}</p>
                    <p className="text-xs text-muted-foreground">
                      {paymentMethodLabels[displayPaymentMethod]}
                      {displayInstallments && displayInstallments > 1 && ` em ${displayInstallments}x`}
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing && sale.status === 'pending_manager' && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-primary"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="w-4 h-4" />
                  Editar
                </Button>
              )}
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                Aguardando Validação
              </Badge>
            </div>
          </div>
        </div>

        {/* Dados do Lead */}
        <div className="bg-secondary/30 rounded-xl p-4 space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Dados do Cliente
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">{sale.leadName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{sale.leadPhone}</span>
            </div>
          </div>
        </div>

        {/* Dados do Produto */}
        <div className="bg-secondary/30 rounded-xl p-4 space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Produto/Serviço Vendido
          </h4>
          {isEditing ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Nome do Produto</Label>
                  <Input
                    value={editData.productSold}
                    onChange={(e) => setEditData(prev => ({ ...prev, productSold: e.target.value }))}
                    placeholder="Ex: Sofá 3 Lugares"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Código</Label>
                  <Input
                    value={editData.productCode}
                    onChange={(e) => setEditData(prev => ({ ...prev, productCode: e.target.value }))}
                    placeholder="Ex: SOF-001"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Descrição</Label>
                <Textarea
                  value={editData.productDescription}
                  onChange={(e) => setEditData(prev => ({ ...prev, productDescription: e.target.value }))}
                  placeholder="Descrição do produto..."
                  rows={2}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{displayProduct}</span>
                {displayProductCode && (
                  <Badge variant="secondary" className="text-[10px]">
                    {displayProductCode}
                  </Badge>
                )}
              </div>
              {displayProductDescription && (
                <p className="text-xs text-muted-foreground pl-6">
                  {displayProductDescription}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Dados do Pagamento */}
        <div className="bg-secondary/30 rounded-xl p-4 space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Pagamento
          </h4>
          {isEditing ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Forma de Pagamento</Label>
                <Select
                  value={editData.paymentMethod}
                  onValueChange={(v: PaymentMethodType) => setEditData(prev => ({ ...prev, paymentMethod: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map(pm => (
                      <SelectItem key={pm.value} value={pm.value}>{pm.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {editData.paymentMethod === 'cartao_parcelado' && (
                <div className="space-y-1">
                  <Label className="text-xs">Parcelas</Label>
                  <Select
                    value={editData.installments.toString()}
                    onValueChange={(v) => setEditData(prev => ({ ...prev, installments: parseInt(v) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2,3,4,5,6,7,8,9,10,11,12].map(n => (
                        <SelectItem key={n} value={n.toString()}>{n}x</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{paymentMethodLabels[displayPaymentMethod]}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{formattedDate}</span>
              </div>
            </div>
          )}
        </div>

        {/* Observações (modo edição) */}
        {isEditing && (
          <div className="bg-secondary/30 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Observações
            </h4>
            <Textarea
              value={editData.observations}
              onChange={(e) => setEditData(prev => ({ ...prev, observations: e.target.value }))}
              placeholder="Observações sobre a venda..."
              rows={2}
            />
          </div>
        )}

        {/* Botões de Edição */}
        {isEditing && (
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={handleCancelEdit}
            >
              <X className="w-4 h-4" />
              Cancelar
            </Button>
            <Button
              className="flex-1 gap-2 bg-primary"
              onClick={handleSaveEdit}
            >
              <Save className="w-4 h-4" />
              Salvar Alterações
            </Button>
          </div>
        )}

        {/* Botão Imprimir Ficha */}
        {!isEditing && (
          <div className="pt-2">
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => setPrintViewOpen(true)}
            >
              <Printer className="w-4 h-4" />
              Imprimir Ficha da Venda
            </Button>
          </div>
        )}

        {/* Ação de validação */}
        {!isEditing && (
          action === null ? (
            <div className="flex gap-3 pt-2">
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                onClick={() => setAction('validate')}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Validar Venda
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10"
                onClick={() => setAction('reject')}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Rejeitar
              </Button>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              <div className={cn(
                "p-3 rounded-lg border",
                action === 'validate' 
                  ? "bg-emerald-500/10 border-emerald-500/30" 
                  : "bg-destructive/10 border-destructive/30"
              )}>
                <p className="text-sm font-medium mb-2">
                  {action === 'validate' 
                    ? 'Confirmar validação da venda?' 
                    : 'Motivo da rejeição (obrigatório)'
                  }
                </p>
                <Textarea
                  placeholder={action === 'validate' 
                    ? "Comentário opcional..." 
                    : "Descreva o motivo da rejeição..."
                  }
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="resize-none"
                  rows={2}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setAction(null);
                    setComment('');
                  }}
                  disabled={isSubmitting}
                >
                  Voltar
                </Button>
                <Button
                  className={cn(
                    "flex-1",
                    action === 'validate' 
                      ? "bg-emerald-600 hover:bg-emerald-700" 
                      : "bg-destructive hover:bg-destructive/90"
                  )}
                  onClick={handleConfirmAction}
                  disabled={isSubmitting || (action === 'reject' && !comment.trim())}
                >
                  {isSubmitting ? 'Processando...' : 'Confirmar'}
                </Button>
              </div>
            </div>
          )
        )}
      </div>

      {/* Print View Modal */}
      <SalePrintView
        open={printViewOpen}
        onClose={() => setPrintViewOpen(false)}
        saleData={{
          leadName: sale.leadName,
          leadPhone: sale.leadPhone,
          leadOrigin: 'CRM',
          leadProduct: displayProduct,
          clientName: sale.client?.name || sale.leadName,
          clientDocument: sale.client?.document || '',
          clientPhone: sale.client?.phone || sale.leadPhone,
          clientEmail: sale.client?.email,
          clientAddress: sale.client?.address,
          productSold: displayProduct,
          saleCode: displayProductCode,
          saleDate: sale.createdAt,
          value: displayValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
          paymentMethod: displayPaymentMethod,
          paymentCondition: displayInstallments && displayInstallments > 1 ? 'parcelado' : 'avista',
          installments: displayInstallments?.toString(),
          observations: displayObservations || displayProductDescription,
          responsibleSeller: sale.agentName,
        }}
      />
    </ResponsiveModal>
  );
};
