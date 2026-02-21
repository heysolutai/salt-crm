import React, { useState } from 'react';
import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  usePostSaleStore, 
  PostSaleTemplate, 
  PostSaleJourney,
  MessageChannel 
} from '@/stores/sales';
import { 
  Bot, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Edit2, 
  Mail, 
  MessageSquare, 
  Phone,
  Play,
  Plus,
  Settings2,
  Sparkles,
  TrendingUp,
  Users,
  X,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PostSaleConfigProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const channelIcons: Record<MessageChannel, React.ReactNode> = {
  whatsapp: <MessageSquare className="w-4 h-4 text-green-500" />,
  email: <Mail className="w-4 h-4 text-blue-500" />,
  sms: <Phone className="w-4 h-4 text-purple-500" />,
};

const channelLabels: Record<MessageChannel, string> = {
  whatsapp: 'WhatsApp',
  email: 'E-mail',
  sms: 'SMS',
};

export const PostSaleConfig: React.FC<PostSaleConfigProps> = ({
  open,
  onOpenChange,
}) => {
  const store = usePostSaleStore();
  const [editingTemplate, setEditingTemplate] = useState<PostSaleTemplate | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const templates = store.getTemplates();
  const journeys = store.getJourneys();
  const stats = store.getStats();

  const handleToggleTemplate = (id: string) => {
    store.toggleTemplateStatus(id);
    toast.success('Template atualizado');
  };

  const handleSaveTemplate = () => {
    if (editingTemplate) {
      store.updateTemplate(editingTemplate.id, editingTemplate);
      setEditingTemplate(null);
      toast.success('Template salvo com sucesso');
    }
  };

  const formatDayOffset = (days: number): string => {
    if (days === 1) return 'D+1';
    if (days < 30) return `D+${days}`;
    if (days < 365) return `${Math.floor(days / 30)} mês${days >= 60 ? 'es' : ''}`;
    return '1 ano';
  };

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title="IA Pós-venda 365 dias"
      description="Configure mensagens automáticas para nutrir seus clientes"
      size="xl"
      allowFullscreen
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">
            <TrendingUp className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Visão Geral</span>
            <span className="sm:hidden">Geral</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="text-xs sm:text-sm">
            <Settings2 className="w-4 h-4 mr-1 sm:mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="journeys" className="text-xs sm:text-sm">
            <Users className="w-4 h-4 mr-1 sm:mr-2" />
            Jornadas
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-3 border border-primary/20">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-[10px] text-muted-foreground uppercase">Jornadas Ativas</span>
              </div>
              <p className="text-xl font-bold text-primary">{stats.activeJourneys}</p>
            </div>

            <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-xl p-3 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="text-[10px] text-muted-foreground uppercase">Pendentes</span>
              </div>
              <p className="text-xl font-bold text-amber-600">{stats.pendingMessages}</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 rounded-xl p-3 border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-[10px] text-muted-foreground uppercase">Enviadas</span>
              </div>
              <p className="text-xl font-bold text-emerald-600">{stats.sentMessages}</p>
            </div>

            <div className="bg-gradient-to-br from-violet-500/10 to-violet-600/5 rounded-xl p-3 border border-violet-500/20">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-violet-600" />
                <span className="text-[10px] text-muted-foreground uppercase">Com IA</span>
              </div>
              <p className="text-xl font-bold text-violet-600">{stats.aiMessages}</p>
            </div>
          </div>

          {/* Timeline Preview */}
          <div className="bg-secondary/30 rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Linha do Tempo (365 dias)
            </h3>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
              <div className="space-y-3">
                {templates.filter(t => t.status === 'active').slice(0, 5).map((template, index) => (
                  <div key={template.id} className="flex items-start gap-3 pl-2">
                    <div className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center z-10",
                      "bg-primary text-primary-foreground"
                    )}>
                      <span className="text-[10px] font-bold">{index + 1}</span>
                    </div>
                    <div className="flex-1 bg-background rounded-lg p-2 border">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">{template.name}</span>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-[9px]">
                            {formatDayOffset(template.dayOffset)}
                          </Badge>
                          {channelIcons[template.channel]}
                          {template.useAI && (
                            <Bot className="w-3 h-3 text-violet-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {templates.filter(t => t.status === 'active').length > 5 && (
                  <div className="pl-8 text-xs text-muted-foreground">
                    +{templates.filter(t => t.status === 'active').length - 5} mensagens programadas
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button 
              className="flex-1 gap-2" 
              variant="outline"
              onClick={() => setActiveTab('templates')}
            >
              <Settings2 className="w-4 h-4" />
              Configurar Templates
            </Button>
            <Button 
              className="flex-1 gap-2"
              onClick={() => setActiveTab('journeys')}
            >
              <Play className="w-4 h-4" />
              Ver Jornadas
            </Button>
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground">
              {templates.filter(t => t.status === 'active').length} de {templates.length} ativos
            </p>
            <Button size="sm" variant="outline" className="gap-1 h-7 text-xs">
              <Plus className="w-3 h-3" />
              Novo
            </Button>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {templates.map((template) => (
              <div
                key={template.id}
                className={cn(
                  "p-3 rounded-xl border transition-all",
                  template.status === 'active' 
                    ? "bg-secondary/50 border-primary/20" 
                    : "bg-secondary/20 border-transparent opacity-60"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{template.name}</span>
                      <Badge variant="outline" className="text-[9px]">
                        {formatDayOffset(template.dayOffset)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {channelIcons[template.channel]}
                      <span>{channelLabels[template.channel]}</span>
                      {template.useAI && (
                        <>
                          <span>•</span>
                          <Bot className="w-3 h-3 text-violet-500" />
                          <span className="text-violet-500">IA Ativa</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => setEditingTemplate(template)}
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Switch
                      checked={template.status === 'active'}
                      onCheckedChange={() => handleToggleTemplate(template.id)}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                  {template.content}
                </p>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Journeys Tab */}
        <TabsContent value="journeys" className="space-y-3">
          {journeys.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma jornada ativa</p>
              <p className="text-xs">As jornadas iniciam automaticamente após cada venda validada</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {journeys.map((journey) => (
                <JourneyCard key={journey.saleId} journey={journey} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Template Modal */}
      {editingTemplate && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-xl border shadow-lg w-full max-w-md p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Editar Template</h3>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setEditingTemplate(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-xs">Nome do Template</Label>
                <Input
                  value={editingTemplate.name}
                  onChange={(e) => setEditingTemplate({
                    ...editingTemplate,
                    name: e.target.value
                  })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Dia (D+X)</Label>
                  <Input
                    type="number"
                    value={editingTemplate.dayOffset}
                    onChange={(e) => setEditingTemplate({
                      ...editingTemplate,
                      dayOffset: parseInt(e.target.value) || 0
                    })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Canal</Label>
                  <select
                    className="w-full h-9 rounded-md border bg-background px-3 text-sm"
                    value={editingTemplate.channel}
                    onChange={(e) => setEditingTemplate({
                      ...editingTemplate,
                      channel: e.target.value as MessageChannel
                    })}
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">E-mail</option>
                    <option value="sms">SMS</option>
                  </select>
                </div>
              </div>

              <div>
                <Label className="text-xs">Mensagem</Label>
                <Textarea
                  value={editingTemplate.content}
                  onChange={(e) => setEditingTemplate({
                    ...editingTemplate,
                    content: e.target.value
                  })}
                  rows={4}
                  placeholder="Use {nome} e {produto} para personalizar"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Variáveis: {'{nome}'}, {'{produto}'}, {'{vendedor}'}
                </p>
              </div>

              <div className="flex items-center justify-between p-3 bg-violet-500/10 rounded-lg border border-violet-500/20">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-violet-500" />
                  <span className="text-sm">Personalizar com IA</span>
                </div>
                <Switch
                  checked={editingTemplate.useAI}
                  onCheckedChange={(checked) => setEditingTemplate({
                    ...editingTemplate,
                    useAI: checked
                  })}
                />
              </div>

              {editingTemplate.useAI && (
                <div>
                  <Label className="text-xs">Prompt da IA</Label>
                  <Textarea
                    value={editingTemplate.aiPrompt || ''}
                    onChange={(e) => setEditingTemplate({
                      ...editingTemplate,
                      aiPrompt: e.target.value
                    })}
                    rows={2}
                    placeholder="Instruções para a IA personalizar a mensagem..."
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setEditingTemplate(null)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={handleSaveTemplate}
              >
                Salvar
              </Button>
            </div>
          </div>
        </div>
      )}
    </ResponsiveModal>
  );
};

// Journey Card Component
const JourneyCard: React.FC<{ journey: PostSaleJourney }> = ({ journey }) => {
  const progress = (journey.messagesSent / journey.messagesTotal) * 100;

  return (
    <div className="p-4 rounded-xl border bg-secondary/30">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-medium">{journey.clientName}</p>
          <p className="text-xs text-muted-foreground">{journey.productSold}</p>
        </div>
        <Badge variant="outline" className="text-[10px]">
          {journey.messagesSent}/{journey.messagesTotal}
        </Badge>
      </div>

      <div className="h-2 bg-secondary rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-gradient-to-r from-primary to-emerald-500 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          Iniciada em {new Date(journey.startedAt).toLocaleDateString('pt-BR')}
        </span>
        <Badge variant={journey.status === 'active' ? 'default' : 'secondary'} className="text-[9px]">
          {journey.status === 'active' ? 'Ativa' : 'Concluída'}
        </Badge>
      </div>
    </div>
  );
};

export default PostSaleConfig;
