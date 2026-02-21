import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, AlertCircle, Info, X } from "lucide-react";

export interface InlineNotificationProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  visible: boolean;
  onClose?: () => void;
}

const InlineNotification = React.forwardRef<HTMLDivElement, InlineNotificationProps>(
  ({ message, type = 'info', visible, onClose }, ref) => {
    const icons = {
      success: Check,
      error: AlertCircle,
      info: Info,
      warning: AlertCircle,
    };

    const styles = {
      success: 'text-success',
      error: 'text-destructive',
      info: 'text-primary',
      warning: 'text-warning',
    };

    const Icon = icons[type];

    if (!visible) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/80 backdrop-blur-sm",
          "animate-fade-in text-sm font-medium",
          "transition-all duration-300",
          styles[type]
        )}
      >
        <Icon className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="text-foreground/90 text-xs whitespace-nowrap">{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="p-0.5 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-3 h-3 text-muted-foreground" />
          </button>
        )}
      </div>
    );
  }
);

InlineNotification.displayName = "InlineNotification";

export { InlineNotification };
