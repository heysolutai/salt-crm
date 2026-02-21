import * as React from "react";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Calendar,
  Star,
  Phone,
  Clock,
  FileText,
  CalendarPlus,
  MoreHorizontal,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ScheduleAppointmentModal } from "@/components/chat/ScheduleAppointmentModal";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { LeadHistorySheetContent } from "@/components/leads/LeadHistorySheetContent";

type NpsCategory = "promotores" | "neutros" | "detratores";
type TreatmentStatus = "pendente" | "tratado";

interface NpsResponse {
  id: string;
  clientName: string;
  clientPhone: string;
  score: number;
  comment: string;
  respondedAt: string;
  salesperson?: string;
  treatmentStatus?: TreatmentStatus;
}

// Mock data for NPS responses
const initialNpsResponses: Record<NpsCategory, NpsResponse[]> = {
  promotores: [],
  neutros: [],
  detratores: [],
};

const categoryConfig: Record<NpsCategory, { title: string; color: string; bgColor: string; emoji: string }> = {
  promotores: { title: "Promotores", color: "text-success", bgColor: "bg-success/10", emoji: "🟢" },
  neutros: { title: "Neutros", color: "text-yellow-600", bgColor: "bg-yellow-500/10", emoji: "🟡" },
  detratores: { title: "Detratores", color: "text-destructive", bgColor: "bg-destructive/10", emoji: "🔴" },
};

interface NpsDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: NpsCategory;
  onOpenChat?: (lead: { id: string; name: string; phone: string }) => void;
}

const NpsDetailModal: React.FC<NpsDetailModalProps> = ({
  open,
  onOpenChange,
  category,
  onOpenChat,
}) => {
  const config = categoryConfig[category];

  // Local state for treatment status
  const [responses, setResponses] = React.useState<NpsResponse[]>(initialNpsResponses[category]);

  // Schedule modal state
  const [scheduleModalOpen, setScheduleModalOpen] = React.useState(false);
  const [selectedLeadForSchedule, setSelectedLeadForSchedule] = React.useState<NpsResponse | null>(null);

  // History panel state
  const [historyPanelOpen, setHistoryPanelOpen] = React.useState(false);
  const [selectedLeadForHistory, setSelectedLeadForHistory] = React.useState<{ id: string; name: string } | null>(null);
  const [historyAutoFocusObservation, setHistoryAutoFocusObservation] = React.useState(false);

  // Update responses when category changes
  React.useEffect(() => {
    setResponses(initialNpsResponses[category]);
  }, [category]);

  const pendingCount = responses.filter(r => r.treatmentStatus === "pendente").length;
  const treatedCount = responses.filter(r => r.treatmentStatus === "tratado").length;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 9) return "bg-success/20 text-success border-success/30";
    if (score >= 7) return "bg-yellow-500/20 text-yellow-600 border-yellow-500/30";
    return "bg-destructive/20 text-destructive border-destructive/30";
  };

  const handleCall = (phone: string, name: string) => {
    window.open(`tel:${phone.replace(/\D/g, '')}`, '_self');
    toast.success(`Iniciando chamada para ${name}`);
  };

  const handleChat = (response: NpsResponse) => {
    if (onOpenChat) {
      onOpenChat({ id: response.id, name: response.clientName, phone: response.clientPhone });
      onOpenChange(false);
    } else {
      toast.info(`Abrindo chat com ${response.clientName}`);
    }
  };

  const handleSchedule = (response: NpsResponse) => {
    setSelectedLeadForSchedule(response);
    setScheduleModalOpen(true);
  };

  const handleHistory = (response: NpsResponse) => {
    setSelectedLeadForHistory({ id: response.id, name: response.clientName });
    setHistoryAutoFocusObservation(false);
    setHistoryPanelOpen(true);
  };

  const handleAddNote = (response: NpsResponse) => {
    setSelectedLeadForHistory({ id: response.id, name: response.clientName });
    setHistoryAutoFocusObservation(true);
    setHistoryPanelOpen(true);
  };

  const handleToggleTreatment = (responseId: string) => {
    setResponses(prev => prev.map(r => {
      if (r.id === responseId) {
        const newStatus: TreatmentStatus = r.treatmentStatus === "tratado" ? "pendente" : "tratado";
        toast.success(newStatus === "tratado" ? "Lead marcado como tratado" : "Lead marcado como pendente");
        return { ...r, treatmentStatus: newStatus };
      }
      return r;
    }));
  };

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title={`${config.emoji} ${config.title}`}
      description={`${responses.length} respostas • ${pendingCount} pendentes • ${treatedCount} tratados`}
      size="lg"
      showBackButton
    >
      <ScrollArea className="h-[calc(60vh-60px)] pr-4">
        <div className="space-y-3 pb-4">
          {responses.map((response) => {
            const isTreated = response.treatmentStatus === "tratado";

            return (
              <div
                key={response.id}
                className={cn(
                  "rounded-xl p-4 border transition-all duration-200",
                  isTreated
                    ? "bg-muted/30 border-border/10 opacity-70"
                    : `${config.bgColor} border-border/20`
                )}
              >
                {/* Header: Client info + Treatment Badge */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10 border-2 border-background">
                      <AvatarFallback className={cn(
                        "text-sm font-semibold",
                        isTreated ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
                      )}>
                        {response.clientName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    {/* Treatment indicator */}
                    {isTreated && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-success rounded-full flex items-center justify-center border-2 border-background">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <h4 className={cn(
                          "font-semibold truncate",
                          isTreated ? "text-muted-foreground" : "text-foreground"
                        )}>
                          {response.clientName}
                        </h4>
                        {isTreated && (
                          <Badge variant="outline" className="bg-success/10 text-success border-success/30 text-[10px] shrink-0">
                            Tratado
                          </Badge>
                        )}
                        {!isTreated && (
                          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 text-[10px] shrink-0">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Pendente
                          </Badge>
                        )}
                      </div>
                      <Badge variant="outline" className={`${getScoreBadgeColor(response.score)} shrink-0`}>
                        <Star className="w-3 h-3 mr-1" />
                        {response.score}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {response.clientPhone}
                      </span>
                      {response.salesperson && (
                        <span className="text-primary/70">• {response.salesperson}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Comment */}
                <div className={cn(
                  "rounded-lg p-3 border mb-3",
                  isTreated ? "bg-muted/20 border-border/5" : "bg-background/50 border-border/10"
                )}>
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-muted-foreground/50 mt-0.5 shrink-0" />
                    <p className={cn(
                      "text-sm leading-relaxed",
                      isTreated ? "text-muted-foreground/70" : "text-foreground/80"
                    )}>
                      "{response.comment}"
                    </p>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="flex items-center justify-between">
                  {/* Date */}
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60">
                    <Calendar className="w-3 h-3" />
                    {formatDate(response.respondedAt)}
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center gap-1">
                    {/* Mark as Treated Button */}
                    <Button
                      variant={isTreated ? "outline" : "default"}
                      size="sm"
                      className={cn(
                        "h-8 px-3 text-xs gap-1.5",
                        isTreated
                          ? "border-success/30 text-success hover:bg-success/10"
                          : "bg-success hover:bg-success/90"
                      )}
                      onClick={() => handleToggleTreatment(response.id)}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {isTreated ? "Tratado" : "Marcar Tratado"}
                    </Button>

                    {/* Phone */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-success/20 hover:text-success"
                      onClick={() => handleCall(response.clientPhone, response.clientName)}
                      title="Ligar"
                    >
                      <Phone className="w-4 h-4" />
                    </Button>

                    {/* Chat */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-primary/20 hover:text-primary"
                      onClick={() => handleChat(response)}
                      title="Abrir Chat"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Button>

                    {/* Schedule */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-info/20 hover:text-info"
                      onClick={() => handleSchedule(response)}
                      title="Agendar Retorno"
                    >
                      <CalendarPlus className="w-4 h-4" />
                    </Button>

                    {/* More Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-secondary"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => handleHistory(response)}>
                          <Clock className="w-4 h-4 mr-2" />
                          Ver Histórico
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAddNote(response)}>
                          <FileText className="w-4 h-4 mr-2" />
                          Adicionar Observação
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleToggleTreatment(response.id)}>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          {isTreated ? "Marcar como Pendente" : "Marcar como Tratado"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Schedule Appointment Modal */}
      {selectedLeadForSchedule && (
        <ScheduleAppointmentModal
          open={scheduleModalOpen}
          onClose={() => {
            setScheduleModalOpen(false);
            setSelectedLeadForSchedule(null);
          }}
          lead={{
            id: selectedLeadForSchedule.id,
            name: selectedLeadForSchedule.clientName,
            origin: "NPS",
          }}
          onSuccess={() => {
            toast.success(`Retorno agendado para ${selectedLeadForSchedule.clientName}`);
            setScheduleModalOpen(false);
            setSelectedLeadForSchedule(null);
          }}
        />
      )}

      {/* Lead History Sheet */}
      <Sheet
        open={historyPanelOpen}
        onOpenChange={(next) => {
          setHistoryPanelOpen(next);
          if (!next) {
            setSelectedLeadForHistory(null);
            setHistoryAutoFocusObservation(false);
          }
        }}
      >
        <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
          {selectedLeadForHistory && (
            <LeadHistorySheetContent
              leadId={selectedLeadForHistory.id}
              leadName={selectedLeadForHistory.name}
              defaultTab="timeline"
              autoFocusObservation={historyAutoFocusObservation}
            />
          )}
        </SheetContent>
      </Sheet>
    </ResponsiveModal>
  );
};

export { NpsDetailModal };
export type { NpsCategory };
