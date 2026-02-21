import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, X } from 'lucide-react';
import saltLogo from '@/assets/salt-logo.png';

interface SaleData {
  // Lead data
  leadName: string;
  leadPhone: string;
  leadOrigin: string;
  leadProduct?: string;
  
  // Sale data
  clientName: string;
  clientDocument: string;
  clientPhone: string;
  clientEmail?: string;
  clientAddress?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  productSold: string;
  saleCode?: string;
  saleDate: string;
  value: string;
  paymentMethod: string;
  paymentCondition: string;
  installments?: string;
  observations?: string;
  
  // Delivery/Service data
  deliveryDate?: string;
  deliveryShift?: string;
  deliveryTime?: string;
  deliveryContact?: string;
  
  // Metadata
  responsibleSeller: string;
}

interface SalePrintViewProps {
  open: boolean;
  onClose: () => void;
  saleData: SaleData;
}

const formatPaymentMethod = (method: string): string => {
  const methods: Record<string, string> = {
    pix: 'PIX',
    dinheiro: 'Dinheiro',
    cartao_vista: 'Cartão à Vista',
    cartao_parcelado: 'Cartão Parcelado',
    boleto: 'Boleto',
    transferencia: 'Transferência',
  };
  return methods[method] || method;
};

const formatShift = (shift: string): string => {
  const shifts: Record<string, string> = {
    manha: 'Manhã',
    tarde: 'Tarde',
    noite: 'Noite',
    personalizado: 'Personalizado',
  };
  return shifts[shift] || shift;
};

export const SalePrintView: React.FC<SalePrintViewProps> = ({ open, onClose, saleData }) => {
  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  };

  const formatAddress = () => {
    if (!saleData.clientAddress) return null;
    const { street, number, complement, neighborhood, city, state, zipCode } = saleData.clientAddress;
    if (!street) return null;
    
    let addr = `${street}, ${number}`;
    if (complement) addr += ` - ${complement}`;
    addr += ` • ${neighborhood} • ${city}/${state}`;
    if (zipCode) addr += ` • CEP: ${zipCode}`;
    return addr;
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto print:max-w-none print:max-h-none print:m-0 print:p-0">
        <DialogHeader className="print:hidden">
          <DialogTitle className="flex items-center justify-between">
            <span>Ficha da Venda</span>
            <div className="flex items-center gap-2">
              <Button onClick={handlePrint} className="gap-2">
                <Printer className="w-4 h-4" />
                Imprimir
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Print Content */}
        <div className="print:p-8 print:bg-white" id="sale-print-content">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b-2 border-gray-200 mb-6">
            <img src={saltLogo} alt="Logo" className="h-10" />
            <div className="text-right">
              <h1 className="text-xl font-bold text-gray-900">FICHA DE VENDA</h1>
              <p className="text-sm text-gray-600">Data: {formatDate(saleData.saleDate)}</p>
              {saleData.saleCode && (
                <p className="text-sm text-gray-600">Código: {saleData.saleCode}</p>
              )}
            </div>
          </div>

          {/* Client Data */}
          <div className="mb-6">
            <h2 className="text-sm font-bold text-primary uppercase tracking-wider mb-3 pb-1 border-b border-gray-200">
              Dados do Cliente
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Nome:</span>
                <span className="ml-2 font-medium text-gray-900">{saleData.clientName}</span>
              </div>
              <div>
                <span className="text-gray-500">Documento:</span>
                <span className="ml-2 font-medium text-gray-900">{saleData.clientDocument}</span>
              </div>
              <div>
                <span className="text-gray-500">Telefone:</span>
                <span className="ml-2 font-medium text-gray-900">{saleData.clientPhone}</span>
              </div>
              {saleData.clientEmail && (
                <div>
                  <span className="text-gray-500">E-mail:</span>
                  <span className="ml-2 font-medium text-gray-900">{saleData.clientEmail}</span>
                </div>
              )}
            </div>
            {formatAddress() && (
              <div className="mt-2 text-sm">
                <span className="text-gray-500">Endereço:</span>
                <span className="ml-2 font-medium text-gray-900">{formatAddress()}</span>
              </div>
            )}
          </div>

          {/* Sale Data */}
          <div className="mb-6">
            <h2 className="text-sm font-bold text-primary uppercase tracking-wider mb-3 pb-1 border-b border-gray-200">
              Dados da Venda
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Produto/Serviço:</span>
                <span className="ml-2 font-medium text-gray-900">{saleData.productSold}</span>
              </div>
              <div>
                <span className="text-gray-500">Origem:</span>
                <span className="ml-2 font-medium text-gray-900">{saleData.leadOrigin}</span>
              </div>
              <div>
                <span className="text-gray-500">Valor:</span>
                <span className="ml-2 font-bold text-green-600">R$ {saleData.value}</span>
              </div>
              <div>
                <span className="text-gray-500">Forma de Pagamento:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {formatPaymentMethod(saleData.paymentMethod)}
                  {saleData.paymentCondition === 'parcelado' && saleData.installments && (
                    <span className="text-gray-600"> ({saleData.installments}x)</span>
                  )}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Responsável:</span>
                <span className="ml-2 font-medium text-gray-900">{saleData.responsibleSeller}</span>
              </div>
            </div>
            {saleData.observations && (
              <div className="mt-3 text-sm">
                <span className="text-gray-500">Observações:</span>
                <p className="mt-1 p-2 bg-gray-50 rounded text-gray-700">{saleData.observations}</p>
              </div>
            )}
          </div>

          {/* Delivery/Service Data */}
          {(saleData.deliveryDate || saleData.deliveryContact) && (
            <div className="mb-6">
              <h2 className="text-sm font-bold text-primary uppercase tracking-wider mb-3 pb-1 border-b border-gray-200">
                Entrega / Serviço
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {saleData.deliveryDate && (
                  <div>
                    <span className="text-gray-500">Data:</span>
                    <span className="ml-2 font-medium text-gray-900">{formatDate(saleData.deliveryDate)}</span>
                  </div>
                )}
                {saleData.deliveryShift && (
                  <div>
                    <span className="text-gray-500">Turno:</span>
                    <span className="ml-2 font-medium text-gray-900">{formatShift(saleData.deliveryShift)}</span>
                  </div>
                )}
                {saleData.deliveryTime && (
                  <div>
                    <span className="text-gray-500">Horário:</span>
                    <span className="ml-2 font-medium text-gray-900">{saleData.deliveryTime}</span>
                  </div>
                )}
                {saleData.deliveryContact && (
                  <div>
                    <span className="text-gray-500">Falar com:</span>
                    <span className="ml-2 font-medium text-gray-900">{saleData.deliveryContact}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="pt-6 mt-6 border-t border-gray-200 text-center print:fixed print:bottom-8 print:left-0 print:right-0">
            <p className="text-xs text-gray-400">
              Documento gerado em {new Date().toLocaleString('pt-BR')}
            </p>
          </div>

          {/* Signature Area - Only for print */}
          <div className="hidden print:block mt-12 pt-8">
            <div className="grid grid-cols-2 gap-16">
              <div className="text-center">
                <div className="border-t border-gray-400 pt-2">
                  <p className="text-sm text-gray-600">Assinatura do Cliente</p>
                </div>
              </div>
              <div className="text-center">
                <div className="border-t border-gray-400 pt-2">
                  <p className="text-sm text-gray-600">Assinatura do Vendedor</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #sale-print-content, #sale-print-content * {
            visibility: visible;
          }
          #sale-print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 2rem;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </Dialog>
  );
};

export default SalePrintView;
