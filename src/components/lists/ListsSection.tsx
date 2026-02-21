import React, { useState, useRef } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ResponsiveModal, ModalActions } from '@/components/ui/responsive-modal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useListsStore, generateTemplateCSV, parseCSVToListItems, downloadCSV, ImportedList, ListItem } from '@/stores/lists';
import { useToast } from '@/hooks/use-toast';
import { Download, Upload, FileSpreadsheet, Trash2, Eye, FolderOpen, Check } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Color mapping for status badges
const statusColors: Record<string, string> = {
  'Frio': '#5B8DEF',
  'Morno': '#F5A15D',
  'Quente': '#E96A6A',
  'Qualificado': '#4FC3B5',
  'Em Atendimento': '#9B7CF4',
  'Em Negociação': '#F4C95D',
  'Fechado – Ganho': '#4CAF50',
  'Arquivado': '#607D8B',
};

export const ListsSection: React.FC = () => {
  const { toast } = useToast();
  const { lists, addList, deleteList } = useListsStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedList, setSelectedList] = useState<ImportedList | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  
  // Import form state
  const [importForm, setImportForm] = useState({
    name: '',
    type: 'carteira' as 'carteira' | 'prospeccao',
    file: null as File | null,
    previewItems: [] as ListItem[],
  });
  
  const handleDownloadTemplate = () => {
    const csvContent = generateTemplateCSV();
    downloadCSV(csvContent, 'modelo_importacao_leads.csv');
    toast({
      title: 'Modelo baixado',
      description: 'Use este modelo para preencher os dados e importar.',
    });
  };
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.csv')) {
      toast({
        title: 'Formato inválido',
        description: 'Por favor, selecione um arquivo CSV.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const content = await file.text();
      const items = parseCSVToListItems(content);
      
      if (items.length === 0) {
        toast({
          title: 'Arquivo vazio',
          description: 'O arquivo não contém dados válidos.',
          variant: 'destructive',
        });
        return;
      }
      
      setImportForm({
        ...importForm,
        file,
        name: file.name.replace('.csv', ''),
        previewItems: items,
      });
      setImportModalOpen(true);
    } catch (error) {
      toast({
        title: 'Erro ao ler arquivo',
        description: 'Não foi possível processar o arquivo CSV.',
        variant: 'destructive',
      });
    }
    
    // Reset input
    e.target.value = '';
  };
  
  const handleConfirmImport = () => {
    if (!importForm.name || importForm.previewItems.length === 0) {
      toast({
        title: 'Dados incompletos',
        description: 'Defina um nome para a lista e verifique os dados.',
        variant: 'destructive',
      });
      return;
    }
    
    addList({
      name: importForm.name,
      type: importForm.type,
      itemCount: importForm.previewItems.length,
      items: importForm.previewItems,
      uploadedBy: 'Usuário',
    });
    
    toast({
      title: 'Lista importada',
      description: `${importForm.previewItems.length} leads adicionados à lista "${importForm.name}".`,
    });
    
    setImportModalOpen(false);
    setImportForm({ name: '', type: 'carteira', file: null, previewItems: [] });
  };
  
  const handleViewList = (list: ImportedList) => {
    setSelectedList(list);
    setViewModalOpen(true);
  };
  
  const handleDeleteClick = (list: ImportedList) => {
    setSelectedList(list);
    setDeleteModalOpen(true);
  };
  
  const handleConfirmDelete = () => {
    if (selectedList) {
      deleteList(selectedList.id);
      toast({
        title: 'Lista removida',
        description: `A lista "${selectedList.name}" foi removida.`,
      });
      setDeleteModalOpen(false);
      setSelectedList(null);
    }
  };
  
  const getTypeBadge = (type: string) => {
    if (type === 'carteira') {
      return <Badge variant="default">Carteira</Badge>;
    }
    return <Badge variant="secondary">Prospecção</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const color = statusColors[status] || '#607D8B';
    return (
      <span
        className="px-2 py-0.5 rounded-full text-[9px] font-medium text-white"
        style={{ backgroundColor: color }}
      >
        {status}
      </span>
    );
  };

  const getQualifiedBadge = (qualified: boolean) => {
    return (
      <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${
        qualified 
          ? 'bg-success/15 text-success' 
          : 'bg-muted text-muted-foreground'
      }`}>
        {qualified ? 'Sim' : 'Não'}
      </span>
    );
  };
  
  const columns = [
    {
      key: 'name',
      header: 'Nome da Lista',
      mobileWidth: 'w-[35%]',
    },
    {
      key: 'type',
      header: 'Tipo',
      render: (item: ImportedList) => getTypeBadge(item.type),
    },
    {
      key: 'itemCount',
      header: 'Leads',
      render: (item: ImportedList) => (
        <span className="font-medium">{item.itemCount}</span>
      ),
    },
    {
      key: 'uploadedAt',
      header: 'Data Upload',
      render: (item: ImportedList) => format(new Date(item.uploadedAt), 'dd/MM/yyyy', { locale: ptBR }),
    },
    {
      key: 'actions',
      header: '',
      render: (item: ImportedList) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); handleViewList(item); }}
            className="p-1.5 hover:bg-primary/10 rounded-md transition-colors"
            title="Ver lista"
          >
            <Eye className="w-3.5 h-3.5 text-primary/70" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDeleteClick(item); }}
            className="p-1.5 hover:bg-destructive/10 rounded-md transition-colors"
            title="Remover"
          >
            <Trash2 className="w-3.5 h-3.5 text-destructive/70" />
          </button>
        </div>
      ),
    },
  ];
  
  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Listas de Leads</h2>
          <p className="text-sm text-muted-foreground">{lists.length} listas importadas</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Baixar Modelo
          </Button>
          <Button size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Importar Lista
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      </div>
      
      {/* Instructions Card */}
      <div className="p-4 bg-info/5 border border-info/20 rounded-xl">
        <div className="flex items-start gap-3">
          <FolderOpen className="w-5 h-5 text-info mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Como importar listas</p>
            <p className="text-xs text-muted-foreground mt-1">
              1. Baixe o modelo CSV clicando em "Baixar Modelo"<br />
              2. Preencha os dados seguindo o formato das colunas<br />
              3. Clique em "Importar Lista" e selecione seu arquivo
            </p>
          </div>
        </div>
      </div>
      
      {/* Data Table */}
      <DataTable
        data={lists}
        columns={columns}
        searchPlaceholder="Buscar listas..."
        showActions={false}
        pageSize={10}
        emptyMessage="Nenhuma lista importada. Clique em 'Importar Lista' para começar."
      />
      
      {/* Import Modal */}
      <ResponsiveModal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        title="Importar Lista"
        description="Confira os dados antes de confirmar a importação"
        size="lg"
        footer={
          <ModalActions
            onCancel={() => { setImportModalOpen(false); setImportForm({ name: '', type: 'carteira', file: null, previewItems: [] }); }}
            onConfirm={handleConfirmImport}
            cancelLabel="Cancelar"
            confirmLabel="Confirmar Importação"
          />
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome da Lista *</Label>
              <Input
                value={importForm.name}
                onChange={(e) => setImportForm({ ...importForm, name: e.target.value })}
                placeholder="Ex: Carteira Janeiro 2024"
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Select
                value={importForm.type}
                onValueChange={(value: 'carteira' | 'prospeccao') => setImportForm({ ...importForm, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="carteira">Carteira</SelectItem>
                  <SelectItem value="prospeccao">Prospecção</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Preview */}
          <div className="p-3 bg-success/10 border border-success/30 rounded-lg flex items-center gap-2">
            <Check className="w-4 h-4 text-success" />
            <span className="text-sm font-medium text-success">
              {importForm.previewItems.length} leads válidos encontrados
            </span>
          </div>
          
          {/* Preview Table - com mesmas colunas da tabela de leads */}
          <div className="border border-border/30 rounded-lg overflow-hidden max-h-[250px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="bg-secondary/30 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-[10px] font-medium text-muted-foreground/50 uppercase">Nome</th>
                  <th className="px-3 py-2 text-left text-[10px] font-medium text-muted-foreground/50 uppercase">Telefone</th>
                  <th className="px-3 py-2 text-left text-[10px] font-medium text-muted-foreground/50 uppercase">Origem</th>
                  <th className="px-3 py-2 text-left text-[10px] font-medium text-muted-foreground/50 uppercase">Qualificado</th>
                  <th className="px-3 py-2 text-left text-[10px] font-medium text-muted-foreground/50 uppercase">Status</th>
                  <th className="px-3 py-2 text-left text-[10px] font-medium text-muted-foreground/50 uppercase">Dt. Criação</th>
                  <th className="px-3 py-2 text-left text-[10px] font-medium text-muted-foreground/50 uppercase">Responsável</th>
                </tr>
              </thead>
              <tbody>
                {importForm.previewItems.slice(0, 10).map((item, idx) => (
                  <tr key={idx} className="border-t border-border/20">
                    <td className="px-3 py-2 font-medium">{item.name}</td>
                    <td className="px-3 py-2">{item.phone}</td>
                    <td className="px-3 py-2">{item.origin}</td>
                    <td className="px-3 py-2">{getQualifiedBadge(item.qualified)}</td>
                    <td className="px-3 py-2">{getStatusBadge(item.status)}</td>
                    <td className="px-3 py-2">{item.createdAt}</td>
                    <td className="px-3 py-2">{item.responsavel || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {importForm.previewItems.length > 10 && (
              <div className="px-3 py-2 bg-secondary/20 text-center text-xs text-muted-foreground">
                ...e mais {importForm.previewItems.length - 10} leads
              </div>
            )}
          </div>
        </div>
      </ResponsiveModal>
      
      {/* View List Modal - com mesmas colunas da tabela de leads */}
      <ResponsiveModal
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        title={selectedList?.name || 'Lista'}
        description={selectedList ? `${selectedList.itemCount} leads • Importada em ${format(new Date(selectedList.uploadedAt), 'dd/MM/yyyy', { locale: ptBR })}` : undefined}
        size="xl"
        footer={
          <Button variant="outline" onClick={() => setViewModalOpen(false)}>Fechar</Button>
        }
      >
        {selectedList && (
          <div className="max-h-[50vh] overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="bg-secondary/30 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-[10px] font-medium text-muted-foreground/50 uppercase">Nome</th>
                  <th className="px-3 py-2 text-left text-[10px] font-medium text-muted-foreground/50 uppercase">Telefone</th>
                  <th className="px-3 py-2 text-left text-[10px] font-medium text-muted-foreground/50 uppercase">Origem</th>
                  <th className="px-3 py-2 text-left text-[10px] font-medium text-muted-foreground/50 uppercase">Qualificado</th>
                  <th className="px-3 py-2 text-left text-[10px] font-medium text-muted-foreground/50 uppercase">Status</th>
                  <th className="px-3 py-2 text-left text-[10px] font-medium text-muted-foreground/50 uppercase">Dt. Criação</th>
                  <th className="px-3 py-2 text-left text-[10px] font-medium text-muted-foreground/50 uppercase">Responsável</th>
                </tr>
              </thead>
              <tbody>
                {selectedList.items.map((item, idx) => (
                  <tr key={idx} className="border-t border-border/20">
                    <td className="px-3 py-2 font-medium">{item.name}</td>
                    <td className="px-3 py-2">{item.phone}</td>
                    <td className="px-3 py-2">{item.origin}</td>
                    <td className="px-3 py-2">{getQualifiedBadge(item.qualified)}</td>
                    <td className="px-3 py-2">{getStatusBadge(item.status)}</td>
                    <td className="px-3 py-2">{item.createdAt}</td>
                    <td className="px-3 py-2">{item.responsavel || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ResponsiveModal>
      
      {/* Delete Confirmation Modal */}
      <ResponsiveModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Confirmar Exclusão"
        description={`Tem certeza que deseja remover a lista "${selectedList?.name}"?`}
        size="sm"
        footer={
          <ModalActions
            onCancel={() => setDeleteModalOpen(false)}
            onConfirm={handleConfirmDelete}
            cancelLabel="Cancelar"
            confirmLabel="Remover Lista"
            confirmVariant="destructive"
          />
        }
      >
        <p className="text-sm text-muted-foreground">Esta ação não pode ser desfeita.</p>
      </ResponsiveModal>
    </div>
  );
};
