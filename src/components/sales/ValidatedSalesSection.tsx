import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useSalesStore, Sale } from '@/stores/sales';
import { SaleValidationModal } from './SaleValidationModal';
import { PostSaleConfig } from './PostSaleConfig';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle2,
  ChevronRight,
  Eye,
  Bot
} from 'lucide-react';

interface ValidatedSalesSectionProps {
  userRole: 'admin' | 'manager';
  userId?: string;
  className?: string;
}

const paymentMethodLabels: Record<string, string> = {
  pix: 'PIX',
  cartao_vista: 'Cartão à Vista',
  cartao_parcelado: 'Parcelado',
  boleto: 'Boleto',
  transferencia: 'Transferência',
};

export const ValidatedSalesSection: React.FC<ValidatedSalesSectionProps> = ({
  userRole,
  userId,
  className,
}) => {
  const salesStore = useSalesStore();
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [validationModalOpen, setValidationModalOpen] = useState(false);
  const [postSaleConfigOpen, setPostSaleConfigOpen] = useState(false);

  const kpis = salesStore.getSalesKPIs();
  
  // Para gerente: vendas pendentes de validação do seu time
  const pendingSales = userRole === 'manager' && userId
    ? salesStore.getPendingSalesForManager(userId)
    : salesStore.getPendingManagerValidation();
  
  // Vendas validadas
  const validatedSales = salesStore.getValidatedSales();

  const handleSaleClick = (sale: Sale) => {
    setSelectedSale(sale);
    setValidationModalOpen(true);
    
    // Se for Admin visualizando, marca como visto
    if (userRole === 'admin' && sale.status === 'validated') {
      salesStore.markSaleAsViewedByAdmin(sale.id);
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header com botão IA Pós-venda */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground">Gestão de Vendas</h3>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 h-8 text-xs bg-violet-500/10 border-violet-500/30 text-violet-600 hover:bg-violet-500/20"
          onClick={() => setPostSaleConfigOpen(true)}
        >
          <Bot className="w-4 h-4" />
          IA Pós-venda 365
        </Button>
      </div>

      {/* KPIs de Vendas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 rounded-xl p-3 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Validadas</span>
          </div>
          <p className="text-xl font-bold text-emerald-600">{kpis.totalValidatedSales}</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 rounded-xl p-3 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Receita</span>
          </div>
          <p className="text-lg font-bold text-emerald-600">{formatCurrency(kpis.totalRevenue)}</p>
        </div>

        <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-xl p-3 border border-amber-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-amber-600" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Pendentes</span>
          </div>
          <p className="text-xl font-bold text-amber-600">{kpis.pendingValidation}</p>
        </div>

        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-3 border border-primary/20">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Ticket Médio</span>
          </div>
          <p className="text-lg font-bold text-primary">{formatCurrency(kpis.averageTicket)}</p>
        </div>
      </div>

      {/* Vendas Pendentes (para Gerente) ou Recentes (para Admin) */}
      {userRole === 'manager' && pendingSales.length > 0 && (
        <div className="bg-amber-500/5 rounded-xl border border-amber-500/20 overflow-hidden">
          <div className="px-4 py-2 border-b border-amber-500/20 flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              Vendas Aguardando Validação
            </h3>
            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
              {pendingSales.length}
            </Badge>
          </div>
          <div className="divide-y divide-amber-500/10">
            {pendingSales.slice(0, 5).map((sale) => (
              <div
                key={sale.id}
                onClick={() => handleSaleClick(sale)}
                className="px-4 py-3 hover:bg-amber-500/5 cursor-pointer transition-colors flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{sale.leadName}</p>
                    <Badge variant="secondary" className="text-[9px]">
                      {paymentMethodLabels[sale.paymentMethod]}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {sale.agentName} • {formatDate(sale.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-emerald-600">
                    {formatCurrency(sale.saleValue)}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de Vendas Validadas (para Admin) */}
      {userRole === 'admin' && validatedSales.length > 0 && (
        <div className="bg-emerald-500/5 rounded-xl border border-emerald-500/20 overflow-hidden">
          <div className="px-4 py-2 border-b border-emerald-500/20 flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Vendas Validadas
            </h3>
            <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground">
              Ver todas
              <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
          <div className="divide-y divide-emerald-500/10">
            {validatedSales.slice(0, 5).map((sale) => (
              <div
                key={sale.id}
                onClick={() => handleSaleClick(sale)}
                className="px-4 py-3 hover:bg-emerald-500/5 cursor-pointer transition-colors flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{sale.leadName}</p>
                    <Badge variant="secondary" className="text-[9px]">
                      {sale.productSold}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {sale.agentName} • Validado por {sale.managerName}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-emerald-600">
                    {formatCurrency(sale.saleValue)}
                  </span>
                  {!sale.adminViewedAt && (
                    <Badge className="bg-primary text-primary-foreground text-[9px]">
                      Novo
                    </Badge>
                  )}
                  <Eye className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de Validação */}
      <SaleValidationModal
        open={validationModalOpen}
        onOpenChange={setValidationModalOpen}
        sale={selectedSale}
        onValidated={() => setSelectedSale(null)}
      />

      {/* Modal IA Pós-venda */}
      <PostSaleConfig
        open={postSaleConfigOpen}
        onOpenChange={setPostSaleConfigOpen}
      />
    </div>
  );
};
