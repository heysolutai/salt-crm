// Google Calendar-like view for seller schedules
import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  MapPin, 
  Users, 
  RotateCcw, 
  CalendarCheck,
  MessageCircle,
  Trash2,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLeadSchedules, formatScheduleType, ScheduleType, LeadSchedule } from '@/stores/leads/lead-schedules-store';
import { format, addDays, startOfWeek, isSameDay, isToday, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SellerCalendarViewProps {
  onOpenChat: (leadId: string, leadName: string) => void;
  onEditSchedule: (schedule: LeadSchedule) => void;
  onCreateSchedule: (date: Date, time: string) => void;
}

const scheduleTypeIcons: Record<ScheduleType, React.ElementType> = {
  agenda_marcada: CalendarCheck,
  visita: MapPin,
  reuniao: Users,
  retorno: RotateCcw,
  outro: CalendarIcon,
};

const scheduleTypeColors: Record<ScheduleType, string> = {
  agenda_marcada: 'bg-success/20 border-success text-success',
  visita: 'bg-blue-500/20 border-blue-500 text-blue-600',
  reuniao: 'bg-purple-500/20 border-purple-500 text-purple-600',
  retorno: 'bg-orange-500/20 border-orange-500 text-orange-600',
  outro: 'bg-muted border-muted-foreground/30 text-muted-foreground',
};

// Time slots from 7:00 to 20:00
const TIME_SLOTS = Array.from({ length: 14 }, (_, i) => {
  const hour = i + 7;
  return `${hour.toString().padStart(2, '0')}:00`;
});

export const SellerCalendarView: React.FC<SellerCalendarViewProps> = ({
  onOpenChat,
  onEditSchedule,
  onCreateSchedule,
}) => {
  const { schedules, deleteSchedule, hasScheduleConflict } = useLeadSchedules();
  const [currentDate, setCurrentDate] = useState(new Date());
  // Always start in week view showing all 7 days
  const [view, setView] = useState<'day' | 'week'>('week');

  // Get the start of the current week (Monday)
  const weekStart = useMemo(() => startOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);

  // Generate days for the week view
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  // Get schedules for a specific day and time slot
  const getSchedulesForSlot = (date: Date, timeSlot: string) => {
    const slotHour = parseInt(timeSlot.split(':')[0]);
    return schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.scheduledAt);
      return isSameDay(scheduleDate, date) && scheduleDate.getHours() === slotHour;
    });
  };

  // Check if a time slot is available (no conflict and in the future)
  const isSlotAvailable = (date: Date, timeSlot: string) => {
    const slotDate = new Date(date);
    const [hours] = timeSlot.split(':').map(Number);
    slotDate.setHours(hours, 0, 0, 0);
    
    // Check if slot is in the past
    if (isBefore(slotDate, new Date())) return false;
    
    // Check for conflicts
    return !hasScheduleConflict(slotDate);
  };

  // Navigation handlers
  const goToPreviousWeek = () => setCurrentDate(addDays(currentDate, -7));
  const goToNextWeek = () => setCurrentDate(addDays(currentDate, 7));
  const goToToday = () => setCurrentDate(new Date());

  const handleDeleteSchedule = (scheduleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Deseja remover este agendamento?')) {
      deleteSchedule(scheduleId);
    }
  };

  const handleCreateClick = (date: Date, timeSlot: string) => {
    onCreateSchedule(date, timeSlot);
  };

  const renderScheduleCard = (schedule: LeadSchedule, compact = false) => {
    const Icon = scheduleTypeIcons[schedule.scheduleType] || CalendarIcon;
    const colorClass = scheduleTypeColors[schedule.scheduleType];
    const scheduleTime = format(new Date(schedule.scheduledAt), 'HH:mm');
    const isPast = isBefore(new Date(schedule.scheduledAt), new Date());

    return (
      <div
        key={schedule.id}
        className={cn(
          'rounded-lg border-l-4 p-2 cursor-pointer transition-all hover:shadow-md',
          colorClass,
          isPast && 'opacity-50',
          compact ? 'text-[10px]' : 'text-xs'
        )}
        onClick={() => onEditSchedule(schedule)}
      >
        <div className="flex items-start justify-between gap-1">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-0.5">
              <span className="font-bold">{scheduleTime}</span>
              <Icon className="w-3 h-3" />
            </div>
            <p className="font-medium truncate">{schedule.leadName}</p>
            {!compact && schedule.description && (
              <p className="text-[10px] opacity-70 truncate mt-0.5">{schedule.description}</p>
            )}
          </div>
          {!compact && (
            <div className="flex items-center gap-0.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenChat(schedule.leadId, schedule.leadName);
                }}
                className="p-1 hover:bg-background/50 rounded"
                title="Abrir conversa"
              >
                <MessageCircle className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => handleDeleteSchedule(schedule.id, e)}
                className="p-1 hover:bg-destructive/20 rounded text-destructive"
                title="Remover"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAddButton = (date: Date, timeSlot: string, compact = false) => {
    const available = isSlotAvailable(date, timeSlot);
    if (!available) return null;

    return (
      <button
        onClick={() => handleCreateClick(date, timeSlot)}
        className={cn(
          'flex items-center justify-center rounded-lg border-2 border-dashed border-primary/30 hover:border-primary hover:bg-primary/5 transition-all group',
          compact ? 'w-full h-[50px]' : 'w-full h-12'
        )}
        title="Criar agendamento"
      >
        <Plus className={cn(
          'text-primary/40 group-hover:text-primary transition-colors',
          compact ? 'w-4 h-4' : 'w-5 h-5'
        )} />
      </button>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with navigation */}
      <div className="flex flex-col gap-2 px-4 py-3 border-b border-border/30 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" onClick={goToToday} className="h-8 text-xs px-3">
              Hoje
            </Button>
            <div className="flex items-center">
              <Button variant="ghost" size="icon" onClick={goToPreviousWeek} className="h-8 w-8">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={goToNextWeek} className="h-8 w-8">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-muted/50 p-0.5 rounded-lg">
            <Button
              variant={view === 'day' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('day')}
              className="h-7 text-xs px-3"
            >
              Dia
            </Button>
            <Button
              variant={view === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('week')}
              className="h-7 text-xs px-3"
            >
              Semana
            </Button>
          </div>
        </div>
        <span className="text-sm font-medium text-center">
          {format(weekStart, "d 'de' MMMM", { locale: ptBR })} - {format(addDays(weekStart, 6), "d 'de' MMMM", { locale: ptBR })}
        </span>
      </div>

      {/* Calendar Grid - Horizontal scroll for week view */}
      <div className="flex-1 overflow-auto">
        {view === 'week' ? (
          <div className="w-full">
            {/* Week grid with 7 days */}
            <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border/30 sticky top-0 bg-background z-10">
              <div className="p-2 text-xs text-muted-foreground text-center border-r border-border/20">
                Hora
              </div>
              {weekDays.map((day, i) => (
                <div
                  key={i}
                  className={cn(
                    'p-2 text-center border-r border-border/20 last:border-r-0',
                    isToday(day) && 'bg-primary/5'
                  )}
                >
                  <div className="text-[10px] text-muted-foreground uppercase font-medium tracking-wide">
                    {format(day, 'EEEEEE', { locale: ptBR }).toUpperCase()}
                  </div>
                  <div className={cn(
                    'text-sm font-semibold mt-0.5',
                    isToday(day) && 'bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center mx-auto'
                  )}>
                    {format(day, 'd')}
                  </div>
                </div>
              ))}
            </div>

            {/* Time slots grid */}
            {TIME_SLOTS.map((timeSlot) => (
              <div key={timeSlot} className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border/10 min-h-[60px]">
                <div className="p-1 text-[10px] text-muted-foreground text-right pr-2 border-r border-border/20 flex items-start justify-end pt-2">
                  {timeSlot}
                </div>
                {weekDays.map((day, i) => {
                  const slotSchedules = getSchedulesForSlot(day, timeSlot);
                  const hasSchedules = slotSchedules.length > 0;
                  
                  return (
                    <div
                      key={i}
                      className={cn(
                        'p-0.5 border-r border-border/10 last:border-r-0',
                        isToday(day) && 'bg-primary/5'
                      )}
                    >
                      {hasSchedules 
                        ? slotSchedules.map((schedule) => renderScheduleCard(schedule, true))
                        : renderAddButton(day, timeSlot, true)
                      }
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ) : (
          // Day view
          <div className="p-4 space-y-2">
            <h3 className="font-medium text-sm mb-3">
              {format(currentDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
            </h3>
            {TIME_SLOTS.map((timeSlot) => {
              const slotSchedules = getSchedulesForSlot(currentDate, timeSlot);
              const hasSchedules = slotSchedules.length > 0;
              
              return (
                <div key={timeSlot} className="flex gap-3">
                  <div className="w-12 text-xs text-muted-foreground text-right pt-2 shrink-0">
                    {timeSlot}
                  </div>
                  <div className="flex-1">
                    {hasSchedules 
                      ? slotSchedules.map((schedule) => renderScheduleCard(schedule))
                      : renderAddButton(currentDate, timeSlot)
                    }
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="px-4 py-2 border-t border-border/30 shrink-0">
        <div className="flex flex-wrap gap-2 text-[10px]">
          {Object.entries(scheduleTypeColors).map(([type, color]) => {
            const Icon = scheduleTypeIcons[type as ScheduleType];
            return (
              <div key={type} className={cn('flex items-center gap-1 px-2 py-0.5 rounded', color)}>
                <Icon className="w-3 h-3" />
                <span>{formatScheduleType(type as ScheduleType)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
