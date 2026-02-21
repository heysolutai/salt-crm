import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  History,
} from 'lucide-react';
import { LeadHistorySheetContent } from '@/components/leads/LeadHistorySheetContent';
import { useLeadHistory } from '@/stores/leads/lead-history-store';

interface LeadHistoryPanelProps {
  leadId: string;
  leadName: string;
  trigger?: React.ReactNode;
}

export const LeadHistoryPanel: React.FC<LeadHistoryPanelProps> = ({
  leadId,
  leadName,
  trigger,
}) => {
  const [open, setOpen] = useState(false);
  const { historyCount } = useLeadHistory(leadId);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground relative"
            title="Histórico do Lead"
          >
            <History className="w-4 h-4" />
            {historyCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center">
                {historyCount > 9 ? '9+' : historyCount}
              </span>
            )}
          </Button>
        )}
      </SheetTrigger>
      
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-md p-0 flex flex-col"
      >
        <LeadHistorySheetContent leadId={leadId} leadName={leadName} />
      </SheetContent>
    </Sheet>
  );
};

export default LeadHistoryPanel;
