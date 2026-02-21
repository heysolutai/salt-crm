// Panel showing pinned leads for the seller
import React from 'react';
import { Pin, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useLeadDemands, leadDemandsStore } from '@/stores/leads/lead-demands-store';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChatDialog } from '@/components/chat/ChatDialog';

interface SellerPinsPanelProps {
  // When used standalone (from header), these control external open state
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  // When used with trigger button (from Funil), these are required
  onOpenChat?: (leadId: string, leadName: string) => void;
  pinnedLeads?: Array<{
    id: string;
    name: string;
    origin?: string;
  }>;
  // Hide the trigger button when controlled externally
  showTrigger?: boolean;
}

export const SellerPinsPanel: React.FC<SellerPinsPanelProps> = ({
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
  onOpenChat,
  pinnedLeads: externalPinnedLeads,
  showTrigger = true,
}) => {
  const { getPendingDemand, resolveDemand } = useLeadDemands();
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [chatOpen, setChatOpen] = React.useState(false);
  const [selectedLead, setSelectedLead] = React.useState<{ id: string; name: string } | null>(null);

  // Use external control if provided, otherwise internal
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const setIsOpen = externalOnOpenChange || setInternalOpen;

  // If no pinnedLeads provided, get from store
  const allDemands = leadDemandsStore.getDemands();
  const pinnedLeads = externalPinnedLeads || allDemands.filter(d => !d.resolved).map(d => ({
    id: d.leadId,
    name: `Lead ${d.leadId}`,
    origin: undefined,
  }));

  // Get demands for pinned leads
  const pinnedWithDemands = pinnedLeads.map(lead => ({
    ...lead,
    demand: getPendingDemand(lead.id),
  })).filter(l => l.demand);

  const handleResolve = (leadId: string) => {
    resolveDemand(leadId);
  };

  const handleOpenChat = (leadId: string, leadName: string) => {
    setIsOpen(false);
    if (onOpenChat) {
      onOpenChat(leadId, leadName);
    } else {
      // Open chat dialog internally
      setSelectedLead({ id: leadId, name: leadName });
      setChatOpen(true);
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        {showTrigger && externalOpen === undefined && (
          <SheetTrigger asChild>
            <button className="relative p-2 hover:bg-secondary/60 rounded-lg transition-all active:scale-95">
              <Pin className="w-4 h-4 text-foreground" />
              {pinnedWithDemands.length > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[9px] font-bold flex items-center justify-center"
                >
                  {pinnedWithDemands.length}
                </Badge>
              )}
            </button>
          </SheetTrigger>
        )}
        <SheetContent side="right" className="w-full sm:w-[400px] p-0">
          <SheetHeader className="px-4 py-3 border-b border-border/30">
            <SheetTitle className="flex items-center gap-2 text-base">
              <Pin className="w-4 h-4 text-primary" />
              Pins Pendentes
              {pinnedWithDemands.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {pinnedWithDemands.length}
                </Badge>
              )}
            </SheetTitle>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-80px)]">
            <div className="p-4 space-y-2">
              {pinnedWithDemands.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Pin className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Nenhum pin pendente</p>
                  <p className="text-xs mt-1 opacity-60">
                    Quando um gerente fixar um lead para você, aparecerá aqui.
                  </p>
                </div>
              ) : (
                pinnedWithDemands.map(({ id, name, origin, demand }) => (
                  <div
                    key={id}
                    className="p-3 rounded-xl bg-card border border-border/20 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">
                          {name}
                        </p>
                        {origin && (
                          <p className="text-xs text-muted-foreground truncate">
                            {origin}
                          </p>
                        )}
                        {demand && (
                          <p className="text-[10px] text-muted-foreground/60 mt-1">
                            Fixado em {format(new Date(demand.createdAt), "dd/MM 'às' HH:mm", { locale: ptBR })}
                          </p>
                        )}
                      </div>
                      <Pin className="w-4 h-4 text-primary fill-primary shrink-0" />
                    </div>

                    {demand && (
                      <div className="p-2 rounded-lg bg-muted/50">
                        <p className="text-[10px] uppercase font-medium text-muted-foreground/60 mb-1">
                          Observação do Gerente
                        </p>
                        <p className="text-xs text-foreground/80">
                          {demand.message}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-8 text-xs gap-1.5"
                        onClick={() => handleOpenChat(id, name)}
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Abrir Conversa
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        className="h-8 text-xs gap-1.5"
                        onClick={() => handleResolve(id)}
                      >
                        Resolver
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

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
