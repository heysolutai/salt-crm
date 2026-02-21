// Modal for scheduling an appointment when selecting "Agenda Marcada"
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useLeadSchedules, ScheduleType, formatScheduleType } from '@/stores/leads/lead-schedules-store';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ScheduleAppointmentModalProps {
  open: boolean;
  onClose: () => void;
  lead: {
    id: string;
    name: string;
    origin?: string;
  };
  existingSchedule?: {
    id: string;
    scheduledAt: Date;
    scheduleType: ScheduleType;
    description: string;
  };
  defaultDateTime?: {
    date: Date;
    time: string;
  };
  onSuccess?: () => void;
}

const scheduleTypes: { value: ScheduleType; label: string }[] = [
  { value: 'agenda_marcada', label: 'Agenda Marcada' },
  { value: 'visita', label: 'Visita Marcada' },
  { value: 'reuniao', label: 'Reunião Agendada' },
  { value: 'retorno', label: 'Retorno' },
  { value: 'outro', label: 'Outro' },
];

export const ScheduleAppointmentModal: React.FC<ScheduleAppointmentModalProps> = ({
  open,
  onClose,
  lead,
  existingSchedule,
  defaultDateTime,
  onSuccess,
}) => {
  const { userName } = useUserRole();
  const { upsertScheduleForLead, createSchedule, hasScheduleConflict } = useLeadSchedules();

  // Check if this is a "blank" schedule (created from calendar without a lead)
  const isBlankSchedule = !lead.id && !lead.name;

  // Lead input state for blank schedules
  const [leadName, setLeadName] = useState('');
  const [leadOrigin, setLeadOrigin] = useState('');

  // Form state
  const [scheduleDate, setScheduleDate] = useState(() => {
    if (existingSchedule) {
      return new Date(existingSchedule.scheduledAt).toISOString().split('T')[0];
    }
    if (defaultDateTime) {
      return defaultDateTime.date.toISOString().split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
  });

  const [scheduleTime, setScheduleTime] = useState(() => {
    if (existingSchedule) {
      const d = new Date(existingSchedule.scheduledAt);
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    }
    if (defaultDateTime) {
      return defaultDateTime.time;
    }
    return '09:00';
  });

  const [scheduleType, setScheduleType] = useState<ScheduleType>(
    existingSchedule?.scheduleType || 'agenda_marcada'
  );

  const [description, setDescription] = useState(existingSchedule?.description || '');
  const [errors, setErrors] = useState<{ date?: string; time?: string; conflict?: string; leadName?: string }>({});
  const [hasConflict, setHasConflict] = useState(false);

  // Reset form when opening with different data
  useEffect(() => {
    if (open) {
      if (existingSchedule) {
        setScheduleDate(new Date(existingSchedule.scheduledAt).toISOString().split('T')[0]);
        const d = new Date(existingSchedule.scheduledAt);
        setScheduleTime(`${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`);
        setScheduleType(existingSchedule.scheduleType);
        setDescription(existingSchedule.description);
      } else if (defaultDateTime) {
        setScheduleDate(defaultDateTime.date.toISOString().split('T')[0]);
        setScheduleTime(defaultDateTime.time);
        setScheduleType('agenda_marcada');
        setDescription('');
      } else {
        setScheduleDate(new Date().toISOString().split('T')[0]);
        setScheduleTime('09:00');
        setScheduleType('agenda_marcada');
        setDescription('');
      }
      setLeadName('');
      setLeadOrigin('');
      setErrors({});
      setHasConflict(false);
    }
  }, [open, existingSchedule, defaultDateTime]);

  // Check for conflicts when date/time changes
  useEffect(() => {
    if (scheduleDate && scheduleTime) {
      const scheduledAt = new Date(`${scheduleDate}T${scheduleTime}`);
      const conflict = hasScheduleConflict(scheduledAt, existingSchedule?.id);
      setHasConflict(conflict);
      if (conflict) {
        setErrors(prev => ({ ...prev, conflict: 'Você já tem um agendamento neste horário' }));
      } else {
        setErrors(prev => {
          const { conflict, ...rest } = prev;
          return rest;
        });
      }
    }
  }, [scheduleDate, scheduleTime, hasScheduleConflict, existingSchedule?.id]);

  const handleSave = () => {
    const newErrors: { date?: string; time?: string; conflict?: string; leadName?: string } = {};

    if (!scheduleDate) {
      newErrors.date = 'Data é obrigatória';
    }
    if (!scheduleTime) {
      newErrors.time = 'Hora é obrigatória';
    }

    // For blank schedules, require lead name
    if (isBlankSchedule && !leadName.trim()) {
      newErrors.leadName = 'Nome do cliente é obrigatório';
    }

    // Check if date/time is in the future
    const scheduledAt = new Date(`${scheduleDate}T${scheduleTime}`);
    if (scheduledAt <= new Date()) {
      newErrors.date = 'A data/hora deve ser no futuro';
    }

    // Check for conflicts
    if (hasConflict) {
      newErrors.conflict = 'Você já tem um agendamento neste horário';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // For blank schedules, create a new schedule directly
    if (isBlankSchedule) {
      const newLeadId = `lead_${Date.now()}`;
      const name = leadName.trim();
      createSchedule({
        leadId: newLeadId,
        leadName: name,
        leadOrigin: leadOrigin.trim() || undefined,
        sellerId: 'seller_current',
        sellerName: userName,
        scheduledAt,
        scheduleType,
        summary: `${formatScheduleType(scheduleType)}: ${name}`,
        description: description.trim(),
      });
    } else {
      // Save schedule with existing lead
      upsertScheduleForLead(lead.id, {
        leadId: lead.id,
        leadName: lead.name,
        leadOrigin: lead.origin,
        sellerId: 'seller_current',
        sellerName: userName,
        scheduledAt,
        scheduleType,
        summary: `${formatScheduleType(scheduleType)}: ${lead.name}`,
        description: description.trim(),
      });
    }

    toast.success(existingSchedule ? 'Agendamento atualizado!' : 'Agendamento salvo com sucesso!');
    onSuccess?.();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-success" />
            {existingSchedule ? 'Editar Agendamento' : 'Novo Agendamento'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-5 py-4">
            {/* Lead info - show input fields for blank schedules */}
            {isBlankSchedule ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">
                    Nome do Cliente <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={leadName}
                    onChange={(e) => {
                      setLeadName(e.target.value);
                      if (errors.leadName) setErrors({ ...errors, leadName: undefined });
                    }}
                    placeholder="Nome do cliente"
                    className={cn('h-11 text-[16px]', errors.leadName && 'border-destructive')}
                  />
                  {errors.leadName && (
                    <p className="text-[11px] text-destructive mt-1">{errors.leadName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Origem</Label>
                  <Input
                    value={leadOrigin}
                    onChange={(e) => setLeadOrigin(e.target.value)}
                    placeholder="Ex: Instagram, Indicação..."
                    className="h-11 text-[16px]"
                  />
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm font-medium text-foreground">{lead.name}</p>
                {lead.origin && (
                  <p className="text-xs text-muted-foreground">{lead.origin}</p>
                )}
              </div>
            )}

            {/* Conflict warning */}
            {hasConflict && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <p className="text-xs">
                  Você já tem um agendamento neste horário. Escolha outro horário.
                </p>
              </div>
            )}

            {/* Date and Time - separate rows on mobile */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium">
                  Data <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => {
                      setScheduleDate(e.target.value);
                      if (errors.date) setErrors({ ...errors, date: undefined });
                    }}
                    className={cn(
                      'pl-10 h-11 text-[16px]',
                      errors.date && 'border-destructive',
                      hasConflict && 'border-orange-500'
                    )}
                  />
                </div>
                {errors.date && (
                  <p className="text-[11px] text-destructive mt-1">{errors.date}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium">
                  Hora <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => {
                      setScheduleTime(e.target.value);
                      if (errors.time) setErrors({ ...errors, time: undefined });
                    }}
                    className={cn(
                      'pl-10 h-11 text-[16px]',
                      errors.time && 'border-destructive',
                      hasConflict && 'border-orange-500'
                    )}
                  />
                </div>
                {errors.time && (
                  <p className="text-[11px] text-destructive mt-1">{errors.time}</p>
                )}
              </div>
            </div>

            {/* Schedule Type */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Tipo do Agendamento</Label>
              <Select value={scheduleType} onValueChange={(v) => setScheduleType(v as ScheduleType)}>
                <SelectTrigger className="h-11 text-[16px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {scheduleTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Descrição</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalhes do agendamento..."
                className="min-h-[80px] resize-none text-[16px]"
              />
            </div>
          </div>
        </ScrollArea>

        {/* Fixed footer with buttons */}
        <div className="shrink-0 px-6 py-4 border-t bg-background flex flex-col gap-2">
          <Button variant="outline" onClick={onClose} className="w-full h-11">
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            className="bg-success hover:bg-success/90 w-full h-11"
            disabled={hasConflict}
          >
            {existingSchedule ? 'Atualizar' : 'Salvar Agendamento'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
