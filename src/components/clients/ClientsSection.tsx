import React, { useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ResponsiveModal, ModalActions } from '@/components/ui/responsive-modal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClientsStore, exportClientsToCSV, downloadCSV, Client, statusColors } from '@/stores/clients';
import { useToast } from '@/hooks/use-toast';
import { Download, Plus, Eye, Pencil, Trash2, User, Phone, Mail, History } from 'lucide-react';
import { LeadHistoryPanel } from '@/components/leads/LeadHistoryPanel';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusOptions = [
  'Frio', 'Morno', 'Quente', 'Qualificado', 'Em Atendimento', 'Em Negociação', 'Fechado – Ganho', 'Arquivado'
] as const;

export const ClientsSection: React.FC = () => {
  const { toast } = useToast();
  const { clients, addClient, updateClient, deleteClient } = useClientsStore();
  
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<Partial<Client>>({});
  
  const handleExportCSV = () => {
    const csvContent = exportClientsToCSV(clients);
    const filename = `clientes_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`;
    downloadCSV(csvContent, filename);
    toast({
      title: 'Exportação concluída',
      description: `${clients.length} clientes exportados com sucesso.`,
    });
  };
  
  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    setViewModalOpen(true);
  };
  
  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setFormData(client);
    setEditModalOpen(true);
  };
  
  const handleDeleteClick = (client: Client) => {
    setSelectedClient(client);
    setDeleteModalOpen(true);
  };
  
  const handleConfirmDelete = () => {
    if (selectedClient) {
      deleteClient(selectedClient.id);
      toast({
        title: 'Cliente removido',
        description: `${selectedClient.name} foi removido da base.`,
      });
      setDeleteModalOpen(false);
      setSelectedClient(null);
    }
  };
  
  const handleSaveClient = () => {
    if (selectedClient && formData.name && formData.phone) {
      updateClient(selectedClient.id, formData);
      toast({
        title: 'Cliente atualizado',
        description: 'As informações foram salvas com sucesso.',
      });
      setEditModalOpen(false);
      setSelectedClient(null);
      setFormData({});
    }
  };
  
  const handleAddClient = () => {
    setFormData({
      status: 'Frio',
      origin: '',
      qualified: false,
      responsavel: '',
    });
    setAddModalOpen(true);
  };
  
  const handleConfirmAdd = () => {
    if (formData.name && formData.phone && formData.origin && formData.responsavel) {
      addClient({
        name: formData.name,
        phone: formData.phone,
        origin: formData.origin,
        qualified: formData.qualified || false,
        status: formData.status || 'Frio',
        responsavel: formData.responsavel,
        email: formData.email,
        product: formData.product,
        reference: formData.reference,
        notes: formData.notes,
      });
      toast({
        title: 'Cliente adicionado',
        description: `${formData.name} foi adicionado à base.`,
      });
      setAddModalOpen(false);
      setFormData({});
    } else {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha Nome, Telefone, Origem e Responsável.',
        variant: 'destructive',
      });
    }
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
      header: 'Nome',
      mobileWidth: 'w-[25%]',
    },
    {
      key: 'phone',
      header: 'Telefone',
      mobileWidth: 'w-[20%]',
    },
    {
      key: 'origin',
      header: 'Origem',
      mobileWidth: 'w-[15%]',
    },
    {
      key: 'qualified',
      header: 'Qualificado',
      render: (item: Client) => getQualifiedBadge(item.qualified),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Client) => getStatusBadge(item.status),
    },
    {
      key: 'createdAt',
      header: 'Dt. Criação',
      render: (item: Client) => {
        try {
          return format(new Date(item.createdAt), 'dd/MM/yyyy', { locale: ptBR });
        } catch {
          return item.createdAt;
        }
      },
    },
    {
      key: 'responsavel',
      header: 'Responsável',
    },
    {
      key: 'actions',
      header: '',
      render: (item: Client) => (
        <div className="flex items-center gap-1">
          <LeadHistoryPanel
            leadId={item.id}
            leadName={item.name}
            trigger={
              <button
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 hover:bg-muted rounded-md transition-colors"
                title="Histórico WhatsApp"
              >
                <History className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            }
          />
          <button
            onClick={(e) => { e.stopPropagation(); handleViewClient(item); }}
            className="p-1.5 hover:bg-primary/10 rounded-md transition-colors"
            title="Ver detalhes"
          >
            <Eye className="w-3.5 h-3.5 text-primary/70" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleEditClient(item); }}
            className="p-1.5 hover:bg-warning/10 rounded-md transition-colors"
            title="Editar"
          >
            <Pencil className="w-3.5 h-3.5 text-warning/70" />
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
  
  const FormFields = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nome *</Label>
          <Input
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Nome completo"
          />
        </div>
        <div className="space-y-2">
          <Label>Telefone *</Label>
          <Input
            value={formData.phone || ''}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="(11) 99999-9999"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Origem *</Label>
          <Input
            value={formData.origin || ''}
            onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
            placeholder="Ex: Site, Indicação, Google Ads"
          />
        </div>
        <div className="space-y-2">
          <Label>Responsável *</Label>
          <Input
            value={formData.responsavel || ''}
            onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
            placeholder="Nome do vendedor/responsável"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={formData.status || 'Frio'}
            onValueChange={(value) => setFormData({ ...formData, status: value as Client['status'] })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Qualificado</Label>
          <Select
            value={formData.qualified ? 'sim' : 'nao'}
            onValueChange={(value) => setFormData({ ...formData, qualified: value === 'sim' })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sim">Sim</SelectItem>
              <SelectItem value="nao">Não</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Email</Label>
          <Input
            type="email"
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="email@exemplo.com"
          />
        </div>
        <div className="space-y-2">
          <Label>Produto</Label>
          <Input
            value={formData.product || ''}
            onChange={(e) => setFormData({ ...formData, product: e.target.value })}
            placeholder="Nome do produto/serviço"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Referência</Label>
          <Input
            value={formData.reference || ''}
            onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
            placeholder="COD REF / ID"
          />
        </div>
        <div className="space-y-2">
          <Label>Observações</Label>
          <Input
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Notas adicionais"
          />
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Base de Clientes</h2>
          <p className="text-sm text-muted-foreground">{clients.length} clientes cadastrados</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
          <Button size="sm" onClick={handleAddClient}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Cliente
          </Button>
        </div>
      </div>
      
      {/* Data Table */}
      <DataTable
        data={clients}
        columns={columns}
        searchPlaceholder="Buscar clientes..."
        showActions={false}
        pageSize={10}
      />
      
      {/* View Modal */}
      <ResponsiveModal
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        title="Detalhes do Cliente"
        description="Informações completas"
        size="lg"
        footer={
          <ModalActions
            onCancel={() => setViewModalOpen(false)}
            onConfirm={() => { setViewModalOpen(false); if (selectedClient) handleEditClient(selectedClient); }}
            cancelLabel="Fechar"
            confirmLabel="Editar"
          />
        }
      >
        {selectedClient && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{selectedClient.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusBadge(selectedClient.status)}
                  {getQualifiedBadge(selectedClient.qualified)}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{selectedClient.phone}</span>
              </div>
              {selectedClient.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedClient.email}</span>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-secondary/20 rounded-lg">
                <p className="text-xs text-muted-foreground">Origem</p>
                <p className="text-sm font-medium">{selectedClient.origin}</p>
              </div>
              <div className="p-3 bg-secondary/20 rounded-lg">
                <p className="text-xs text-muted-foreground">Produto</p>
                <p className="text-sm font-medium">{selectedClient.product || '-'}</p>
              </div>
              <div className="p-3 bg-secondary/20 rounded-lg">
                <p className="text-xs text-muted-foreground">Responsável</p>
                <p className="text-sm font-medium">{selectedClient.responsavel}</p>
              </div>
              <div className="p-3 bg-secondary/20 rounded-lg">
                <p className="text-xs text-muted-foreground">Referência</p>
                <p className="text-sm font-medium">{selectedClient.reference || '-'}</p>
              </div>
            </div>
            
            {selectedClient.notes && (
              <div className="p-3 bg-secondary/20 rounded-lg">
                <p className="text-xs text-muted-foreground">Observações</p>
                <p className="text-sm">{selectedClient.notes}</p>
              </div>
            )}
            
            <div className="text-xs text-muted-foreground pt-2">
              Cadastrado em {selectedClient.createdAt}
            </div>
          </div>
        )}
      </ResponsiveModal>
      
      {/* Edit Modal */}
      <ResponsiveModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        title="Editar Cliente"
        description="Atualize as informações do cliente"
        size="lg"
        footer={
          <ModalActions
            onCancel={() => { setEditModalOpen(false); setFormData({}); }}
            onConfirm={handleSaveClient}
            cancelLabel="Cancelar"
            confirmLabel="Salvar"
          />
        }
      >
        <FormFields />
      </ResponsiveModal>
      
      {/* Add Modal */}
      <ResponsiveModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        title="Novo Cliente"
        description="Adicione um novo cliente à base"
        size="lg"
        footer={
          <ModalActions
            onCancel={() => { setAddModalOpen(false); setFormData({}); }}
            onConfirm={handleConfirmAdd}
            cancelLabel="Cancelar"
            confirmLabel="Adicionar"
          />
        }
      >
        <FormFields />
      </ResponsiveModal>
      
      {/* Delete Confirmation Modal */}
      <ResponsiveModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Confirmar Exclusão"
        description={`Tem certeza que deseja remover ${selectedClient?.name} da base de clientes?`}
        size="sm"
        footer={
          <ModalActions
            onCancel={() => setDeleteModalOpen(false)}
            onConfirm={handleConfirmDelete}
            cancelLabel="Cancelar"
            confirmLabel="Remover"
            confirmVariant="destructive"
          />
        }
      >
        <p className="text-sm text-muted-foreground">Esta ação não pode ser desfeita.</p>
      </ResponsiveModal>
    </div>
  );
};
