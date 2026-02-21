import React, { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowRightLeft,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  FileText,
  History,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  Send,
  Tag,
  Thermometer,
  User,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  formatHistoryEventType,
  getHistoryEventColor,
  type HistoryEventType,
  useLeadHistory,
} from "@/stores/leads/lead-history-store";

type LeadHistoryTab = "timeline" | "profile";

export interface LeadHistorySheetContentProps {
  leadId: string;
  leadName: string;
  defaultTab?: LeadHistoryTab;
  autoFocusObservation?: boolean;
}

const getEventIcon = (type: HistoryEventType) => {
  const icons: Record<HistoryEventType, React.ReactNode> = {
    observation: <FileText className="w-4 h-4" />,
    schedule_created: <Calendar className="w-4 h-4" />,
    schedule_completed: <CheckCircle2 className="w-4 h-4" />,
    schedule_cancelled: <XCircle className="w-4 h-4" />,
    status_change: <Tag className="w-4 h-4" />,
    temperature_change: <Thermometer className="w-4 h-4" />,
    transfer: <ArrowRightLeft className="w-4 h-4" />,
    sale_registered: <DollarSign className="w-4 h-4" />,
    contact_attempt: <Phone className="w-4 h-4" />,
    message_sent: <MessageSquare className="w-4 h-4" />,
  };
  return icons[type] || <FileText className="w-4 h-4" />;
};

export const LeadHistorySheetContent: React.FC<LeadHistorySheetContentProps> = ({
  leadId,
  leadName,
  defaultTab = "timeline",
  autoFocusObservation = false,
}) => {
  const [newObservation, setNewObservation] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { history, profile, historyCount, addObservation } = useLeadHistory(leadId);

  const stableDefaultTab = useMemo(() => defaultTab, [defaultTab]);

  useEffect(() => {
    if (!autoFocusObservation) return;
    // Aguardar render do textarea
    const t = window.setTimeout(() => textareaRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [autoFocusObservation]);

  const handleAddObservation = () => {
    if (!newObservation.trim()) {
      toast.error("Digite uma observação");
      return;
    }

    addObservation(newObservation.trim(), "Usuário Atual");
    setNewObservation("");
    toast.success("Observação adicionada ao histórico");
  };

  return (
    <div className="p-0 flex flex-col h-full min-h-0">
      <div className="px-4 py-3 border-b border-border/30 shrink-0">
        <div className="flex items-center gap-2 text-base font-semibold">
          <History className="w-5 h-5 text-primary" />
          Histórico do Lead
          {historyCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {historyCount} eventos
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">{leadName}</p>
      </div>

      <Tabs defaultValue={stableDefaultTab} className="flex-1 flex flex-col min-h-0">
        <TabsList className="mx-4 mt-3 grid grid-cols-2 shrink-0">
          <TabsTrigger value="timeline" className="text-xs">
            <Clock className="w-3.5 h-3.5 mr-1.5" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="profile" className="text-xs">
            <User className="w-3.5 h-3.5 mr-1.5" />
            Perfil
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="flex-1 flex flex-col min-h-0 mt-0 px-4">
          <div className="py-3 space-y-2 shrink-0">
            <Textarea
              ref={textareaRef}
              placeholder="Adicionar nova observação..."
              value={newObservation}
              onChange={(e) => setNewObservation(e.target.value)}
              className="min-h-[60px] text-sm resize-none"
            />
            <Button
              size="sm"
              onClick={handleAddObservation}
              disabled={!newObservation.trim()}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Adicionar Observação
            </Button>
          </div>

          <Separator />

          <ScrollArea className="flex-1 py-3">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <History className="w-10 h-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">Nenhum evento registrado</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Observações e ações aparecerão aqui</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((event) => (
                  <div key={event.id} className="relative pl-6 pb-3 border-l-2 border-border/50 last:border-l-0">
                    <div
                      className={`absolute left-0 top-0 -translate-x-1/2 w-6 h-6 rounded-full bg-background border-2 border-border flex items-center justify-center ${getHistoryEventColor(
                        event.type,
                      )}`}
                    >
                      {getEventIcon(event.type)}
                    </div>

                    <div className="bg-muted/30 rounded-lg p-3 ml-2">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 ${getHistoryEventColor(event.type)}`}
                        >
                          {formatHistoryEventType(event.type)}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {format(event.createdAt, "dd/MM HH:mm", { locale: ptBR })}
                        </span>
                      </div>

                      <p className="text-sm font-medium mb-1">{event.title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{event.description}</p>

                      <p className="text-[10px] text-muted-foreground/70 mt-2">por {event.createdBy}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="profile" className="flex-1 min-h-0 mt-0 px-4">
          <ScrollArea className="h-full py-3">
            {profile ? (
              <div className="space-y-4">
                {profile.isClient && (
                  <Badge className="bg-success/10 text-success border-success/20">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Cliente desde {profile.convertedToClientAt && format(profile.convertedToClientAt, "dd/MM/yyyy", { locale: ptBR })}
                  </Badge>
                )}

                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">Informações Básicas</h4>

                  <div className="grid gap-3">
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                      <User className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Nome</p>
                        <p className="text-sm font-medium truncate">{profile.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                      <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Telefone</p>
                        <p className="text-sm font-medium">{profile.phone}</p>
                      </div>
                    </div>

                    {profile.email && (
                      <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                        <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">E-mail</p>
                          <p className="text-sm font-medium truncate">{profile.email}</p>
                        </div>
                      </div>
                    )}

                    {profile.document && (
                      <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                        <CreditCard className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">CPF/CNPJ</p>
                          <p className="text-sm font-medium">{profile.document}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                      <Send className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Origem</p>
                        <p className="text-sm font-medium">{profile.origin}</p>
                      </div>
                    </div>

                    {profile.reference && (
                      <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                        <Tag className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">COD REF / ID</p>
                          <p className="text-sm font-medium">{profile.reference}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {profile.address && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Endereço
                      </h4>

                      <div className="p-3 rounded-lg bg-muted/30 space-y-1">
                        {profile.address.street && (
                          <p className="text-sm">
                            {profile.address.street}
                            {profile.address.number && `, ${profile.address.number}`}
                            {profile.address.complement && ` - ${profile.address.complement}`}
                          </p>
                        )}
                        {profile.address.neighborhood && (
                          <p className="text-sm text-muted-foreground">{profile.address.neighborhood}</p>
                        )}
                        {(profile.address.city || profile.address.state) && (
                          <p className="text-sm text-muted-foreground">
                            {profile.address.city}
                            {profile.address.state && ` - ${profile.address.state}`}
                          </p>
                        )}
                        {profile.address.cep && (
                          <p className="text-xs text-muted-foreground/70">CEP: {profile.address.cep}</p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                <Separator />
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Datas</h4>
                  <div className="grid gap-2 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Criado em:</span>
                      <span>{format(profile.createdAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                    </div>
                    {profile.convertedToClientAt && (
                      <div className="flex justify-between">
                        <span>Convertido em:</span>
                        <span>{format(profile.convertedToClientAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <User className="w-10 h-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">Perfil não encontrado</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Dados serão preenchidos ao registrar a venda</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};
