// Panel showing scheduled appointments for the seller with Google Calendar-like view
import React, { useState } from 'react';
import { Calendar, MessageCircle, Clock, MapPin, Users, RotateCcw, CalendarCheck, Pencil, Trash2, X, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useLeadSchedules, formatScheduleType, ScheduleType, LeadSchedule } from '@/stores/leads/lead-schedules-store';
import { format, isToday, isTomorrow, formatDistanceToNow, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SellerCalendarView } from './SellerCalendarView';
import { ScheduleAppointmentModal } from '@/components/chat/ScheduleAppointmentModal';
import { ChatDialog } from '@/components/chat/ChatDialog';
import { cn } from '@/lib/utils';

interface SellerSchedulesPanelProps {
  // When used standalone (from header), these control external open state
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  // When used with trigger button
  onOpenChat?: (leadId: string, leadName: string) => void;
  // Hide the trigger button when controlled externally
  showTrigger?: boolean;
}

const scheduleTypeIcons: Record<ScheduleType, React.ElementType> = {
  agenda_marcada: CalendarCheck,
  visita: MapPin,
  reuniao: Users,
  retorno: RotateCcw,
  outro: Calendar,
};

const scheduleTypeColors: Record<ScheduleType, string> = {
  agenda_marcada: 'bg-success/10 text-success border-success/30',
  visita: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  reuniao: 'bg-purple-500/10 text-purple-600 border-purple-500/30',
  retorno: 'bg-orange-500/10 text-orange-600 border-orange-500/30',
  outro: 'bg-muted text-muted-foreground border-muted-foreground/30',
};

export const SellerSchedulesPanel: React.FC<SellerSchedulesPanelProps> = ({
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
  onOpenChat,
  showTrigger = true,
}) => {
  const { schedules, scheduleCount, deleteSchedule } = useLeadSchedules();
  const [internalOpen, setInternalOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<LeadSchedule | null>(null);
  const [newScheduleData, setNewScheduleData] = useState<{ date: Date; time: string } | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<{ id: string; name: string } | null>(null);

  // Use external control if provided, otherwise internal
  const sheetOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const setSheetOpen = externalOnOpenChange || setInternalOpen;

  const handleOpenChat = (leadId: string, leadName: string) => {
    setSheetOpen(false);
    setCalendarOpen(false);
    if (onOpenChat) {
      onOpenChat(leadId, leadName);
    } else {
      // Open chat dialog internally
      setSelectedLead({ id: leadId, name: leadName });
      setChatOpen(true);
    }
  };

  const handleEditSchedule = (schedule: LeadSchedule) => {
    setEditingSchedule(schedule);
  };

  const handleCreateSchedule = (date: Date, time: string) => {
    setNewScheduleData({ date, time });
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    if (confirm('Deseja remover este agendamento?')) {
      deleteSchedule(scheduleId);
    }
  };

  const handleOpenCalendar = () => {
    setSheetOpen(false);
    setCalendarOpen(true);
  };

  const formatScheduleDate = (date: Date) => {
    const d = new Date(date);
    if (isToday(d)) {
      return `Hoje às ${format(d, 'HH:mm')}`;
    }
    if (isTomorrow(d)) {
      return `Amanhã às ${format(d, 'HH:mm')}`;
    }
    return format(d, "dd/MM 'às' HH:mm", { locale: ptBR });
  };

  const getTimeUntil = (date: Date) => {
    return formatDistanceToNow(new Date(date), { locale: ptBR, addSuffix: true });
  };

  // Group schedules by date
  const groupedSchedules = schedules.reduce((acc, schedule) => {
    const dateKey = format(new Date(schedule.scheduledAt), 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(schedule);
    return acc;
  }, {} as Record<string, LeadSchedule[]>);

  const sortedDates = Object.keys(groupedSchedules).sort();

  return (
    <>
      {/* Sheet for List View (Appointments Detail - like Pins) */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        {showTrigger && externalOpen === undefined && (
          <SheetTrigger asChild>
            <button className="relative p-2 hover:bg-secondary/60 rounded-lg transition-all active:scale-95">
              <Calendar className="w-4 h-4 text-foreground" />
              {scheduleCount > 0 && (
                <Badge 
                  variant="default" 
                  className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[9px] font-bold flex items-center justify-center bg-success"
                >
                  {scheduleCount}
                </Badge>
              )}
            </button>
          </SheetTrigger>
        )}
        <SheetContent side="right" className="w-full sm:w-[400px] p-0">
          <SheetHeader className="px-4 py-3 border-b border-border/30">
            <div className="flex items-center justify-between w-full">
              <SheetTitle className="flex items-center gap-2 text-base">
                <Calendar className="w-4 h-4 text-success" />
                Meus Agendamentos
                {scheduleCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {scheduleCount}
                  </Badge>
                )}
              </SheetTitle>
            </div>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-140px)]">
            <div className="p-4 space-y-4">
              {schedules.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Nenhum agendamento</p>
                  <p className="text-xs mt-1 opacity-60">
                    Marque "Agenda Marcada" em um lead para criar um agendamento.
                  </p>
                </div>
              ) : (
                sortedDates.map((dateKey) => {
                  const dateSchedules = groupedSchedules[dateKey];
                  const date = new Date(dateKey);
                  const isPast = isBefore(date, new Date()) && !isToday(date);
                  
                  return (
                    <div key={dateKey} className="space-y-2">
                      <div className={cn(
                        "flex items-center gap-2 text-xs font-medium sticky top-0 bg-background py-1",
                        isPast ? 'text-muted-foreground' : 'text-foreground'
                      )}>
                        <CalendarCheck className="w-3.5 h-3.5" />
                        {isToday(date) ? 'Hoje' : isTomorrow(date) ? 'Amanhã' : format(date, "EEEE, d 'de' MMMM", { locale: ptBR })}
                      </div>
                      
                      {dateSchedules.map((schedule) => {
                        const Icon = scheduleTypeIcons[schedule.scheduleType] || Calendar;
                        const colorClass = scheduleTypeColors[schedule.scheduleType];
                        const scheduleTime = new Date(schedule.scheduledAt);
                        const isSchedulePast = isBefore(scheduleTime, new Date());
                        
                        return (
                          <div
                            key={schedule.id}
                            className={cn(
                              "p-3 rounded-xl bg-card border space-y-2 transition-all",
                              colorClass,
                              isSchedulePast && 'opacity-60'
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-bold">
                                    {format(scheduleTime, 'HH:mm')}
                                  </span>
                                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-background/50">
                                    <Icon className="w-3 h-3" />
                                    <span className="text-[10px] font-medium">
                                      {formatScheduleType(schedule.scheduleType)}
                                    </span>
                                  </div>
                                </div>
                                <p className="font-medium text-sm truncate">
                                  {schedule.leadName}
                                </p>
                                {schedule.leadOrigin && (
                                  <p className="text-xs opacity-70 truncate">
                                    {schedule.leadOrigin}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleEditSchedule(schedule)}
                                  className="p-1.5 hover:bg-background/50 rounded-lg transition-colors"
                                  title="Editar agendamento"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteSchedule(schedule.id)}
                                  className="p-1.5 hover:bg-destructive/20 rounded-lg transition-colors text-destructive"
                                  title="Remover agendamento"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-xs opacity-70">
                              <Clock className="w-3 h-3" />
                              <span>{getTimeUntil(schedule.scheduledAt)}</span>
                            </div>

                            {schedule.description && (
                              <p className="text-xs opacity-80 line-clamp-2 bg-background/30 rounded-lg p-2">
                                {schedule.description}
                              </p>
                            )}

                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full h-8 text-xs gap-1.5 bg-background/50"
                              onClick={() => handleOpenChat(schedule.leadId, schedule.leadName)}
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              Abrir Conversa
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>

          {/* Footer with "Ver Agenda Completa" button */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border/30 bg-background">
            <Button
              variant="default"
              size="lg"
              className="w-full h-12 gap-2 text-sm font-medium bg-success hover:bg-success/90"
              onClick={handleOpenCalendar}
            >
              <Maximize2 className="w-4 h-4" />
              Ver Agenda Completa
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Full Screen Dialog for Calendar View Only */}
      <Dialog open={calendarOpen} onOpenChange={setCalendarOpen}>
        <DialogContent className="fixed inset-0 !top-0 !left-0 !right-0 !bottom-0 !max-w-none !w-screen !h-screen !max-h-screen !rounded-none !translate-x-0 !translate-y-0 !transform-none flex flex-col p-0 !pb-0 border-0 data-[state=open]:!slide-in-from-bottom-0 data-[state=closed]:!slide-out-to-bottom-0 !pt-[var(--safe-area-top)]">
          {/* Hide default mobile drag handle */}
          <div className="hidden" />
          
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 shrink-0 bg-background">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCalendarOpen(false)}
                className="h-9 w-9 -ml-2"
              >
                <X className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2 text-base font-semibold">
                <Calendar className="w-5 h-5 text-success" />
                Minha Agenda
                {scheduleCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {scheduleCount}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto min-h-0">
            <SellerCalendarView 
              onOpenChat={handleOpenChat}
              onEditSchedule={handleEditSchedule}
              onCreateSchedule={handleCreateSchedule}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Schedule Modal */}
      {editingSchedule && (
        <ScheduleAppointmentModal
          open={!!editingSchedule}
          onClose={() => setEditingSchedule(null)}
          lead={{
            id: editingSchedule.leadId,
            name: editingSchedule.leadName,
            origin: editingSchedule.leadOrigin,
          }}
          existingSchedule={{
            id: editingSchedule.id,
            scheduledAt: editingSchedule.scheduledAt,
            scheduleType: editingSchedule.scheduleType,
            description: editingSchedule.description,
          }}
          onSuccess={() => setEditingSchedule(null)}
        />
      )}

      {/* Create New Schedule Modal */}
      {newScheduleData && (
        <ScheduleAppointmentModal
          open={!!newScheduleData}
          onClose={() => setNewScheduleData(null)}
          lead={{
            id: '',
            name: '',
          }}
          defaultDateTime={{
            date: newScheduleData.date,
            time: newScheduleData.time,
          }}
          onSuccess={() => setNewScheduleData(null)}
        />
      )}

      {/* Chat Dialog for standalone use */}
      {selectedLead && (
        <ChatDialog
          open={chatOpen}
          onClose={() => {
            setChatOpen(false);
            setSelectedLead(null);
          }}
          lead={{
            id: selectedLead.id,
            name: selectedLead.name,
            phone: '',
          }}
        />
      )}
    </>
  );
};
