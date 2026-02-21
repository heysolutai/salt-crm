import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Download, Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useInventoryStore, InventoryItemType } from '@/stores/inventory/inventory-store';

interface InventoryCsvImportProps {
  open: boolean;
  onClose: () => void;
}

interface CsvRow {
  nome: string;
  tipo: string;
  quantidade: string;
  unidade: string;
  categoria?: string;
  valor_referencia?: string;
  alerta_minimo?: string;
  descricao?: string;
  status?: string;
}

interface ImportResult {
  success: number;
  errors: string[];
}

const CSV_TEMPLATE = `nome,tipo,quantidade,unidade,categoria,valor_referencia,alerta_minimo,descricao,status
Plano Básico Mensal,servico,50,contratos,Assinaturas,99.90,10,Assinatura mensal do plano básico,ativo
Kit Instalação,produto,30,un,Produtos,450.00,5,Kit completo para instalação,ativo
Consultoria Avulsa,servico,20,horas,Serviços,250.00,5,Hora de consultoria especializada,ativo`;

const VALID_UNITS = ['un', 'horas', 'sessões', 'contratos', 'licenças', 'kg', 'l', 'm'];
const VALID_TYPES = ['produto', 'servico'];

export const InventoryCsvImport: React.FC<InventoryCsvImportProps> = ({ open, onClose }) => {
  const store = useInventoryStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'modelo_estoque.csv';
    link.click();
    URL.revokeObjectURL(link.href);
    toast.success('Modelo CSV baixado!');
  };

  const parseCSV = (text: string): CsvRow[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    const rows: CsvRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row: Record<string, string> = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      rows.push({
        nome: row['nome'] || '',
        tipo: row['tipo'] || '',
        quantidade: row['quantidade'] || '0',
        unidade: row['unidade'] || 'un',
        categoria: row['categoria'],
        valor_referencia: row['valor_referencia'],
        alerta_minimo: row['alerta_minimo'],
        descricao: row['descricao'],
        status: row['status'],
      });
    }

    return rows;
  };

  const validateRow = (row: CsvRow, index: number): string | null => {
    if (!row.nome.trim()) {
      return `Linha ${index + 2}: Nome é obrigatório`;
    }

    const tipo = row.tipo.toLowerCase();
    if (!VALID_TYPES.includes(tipo)) {
      return `Linha ${index + 2}: Tipo inválido "${row.tipo}". Use "produto" ou "servico"`;
    }

    const quantidade = parseInt(row.quantidade);
    if (isNaN(quantidade) || quantidade < 0) {
      return `Linha ${index + 2}: Quantidade inválida "${row.quantidade}"`;
    }

    const unidade = row.unidade.toLowerCase();
    if (!VALID_UNITS.includes(unidade)) {
      return `Linha ${index + 2}: Unidade inválida "${row.unidade}". Use: ${VALID_UNITS.join(', ')}`;
    }

    return null;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Por favor, selecione um arquivo CSV');
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      const text = await file.text();
      const rows = parseCSV(text);

      if (rows.length === 0) {
        toast.error('Arquivo CSV vazio ou formato inválido');
        setIsProcessing(false);
        return;
      }

      const errors: string[] = [];
      let successCount = 0;

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const error = validateRow(row, i);

        if (error) {
          errors.push(error);
          continue;
        }

        // Add valid item to store
        store.addItem({
          name: row.nome.trim(),
          type: row.tipo.toLowerCase() as InventoryItemType,
          quantity: parseInt(row.quantidade) || 0,
          unit: row.unidade.toLowerCase(),
          category: row.categoria?.trim() || undefined,
          referenceValue: row.valor_referencia ? parseFloat(row.valor_referencia) : undefined,
          minStockAlert: row.alerta_minimo ? parseInt(row.alerta_minimo) : undefined,
          description: row.descricao?.trim() || undefined,
          status: (row.status?.toLowerCase() === 'inativo' ? 'inativo' : 'ativo'),
        });

        successCount++;
      }

      setResult({ success: successCount, errors });

      if (successCount > 0 && errors.length === 0) {
        toast.success(`${successCount} itens importados com sucesso!`);
      } else if (successCount > 0) {
        toast.warning(`${successCount} itens importados, ${errors.length} com erro`);
      } else {
        toast.error('Nenhum item foi importado');
      }
    } catch (error) {
      toast.error('Erro ao processar arquivo CSV');
      console.error('CSV parse error:', error);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClose = () => {
    setResult(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            Importar Estoque via CSV
          </DialogTitle>
          <DialogDescription>
            Importe múltiplos itens de uma vez usando um arquivo CSV
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Step 1: Download Template */}
          <div className="p-4 bg-secondary/30 rounded-lg space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold text-primary">1</span>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-foreground">Baixe o modelo</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Use nosso modelo CSV com as colunas corretas
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={downloadTemplate}
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar modelo CSV
            </Button>
          </div>

          {/* Step 2: Fill Data Info */}
          <div className="p-4 bg-secondary/30 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold text-primary">2</span>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-foreground">Preencha seus dados</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Colunas obrigatórias: <span className="font-medium">nome, tipo, quantidade, unidade</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Colunas opcionais: categoria, valor_referencia, alerta_minimo, descricao, status
                </p>
              </div>
            </div>
          </div>

          {/* Step 3: Upload */}
          <div className="p-4 bg-secondary/30 rounded-lg space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold text-primary">3</span>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-foreground">Faça o upload</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Selecione seu arquivo CSV preenchido
                </p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isProcessing ? 'Processando...' : 'Selecionar arquivo CSV'}
            </Button>
          </div>

          {/* Results */}
          {result && (
            <div className="p-4 rounded-lg border space-y-2">
              <div className="flex items-center gap-2">
                {result.success > 0 ? (
                  <CheckCircle2 className="w-4 h-4 text-success" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-destructive" />
                )}
                <span className="text-sm font-medium">
                  {result.success} {result.success === 1 ? 'item importado' : 'itens importados'}
                </span>
              </div>
              
              {result.errors.length > 0 && (
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  <p className="text-xs font-medium text-destructive">
                    {result.errors.length} {result.errors.length === 1 ? 'erro encontrado' : 'erros encontrados'}:
                  </p>
                  {result.errors.map((error, i) => (
                    <p key={i} className="text-xs text-muted-foreground pl-2">
                      • {error}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
