import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon, ChevronRight } from "lucide-react";

interface IOSCardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  icon?: LucideIcon;
  iconColor?: string;
  title?: string;
  description?: string;
}

const IOSCard = React.forwardRef<HTMLDivElement, IOSCardProps>(
  ({ className, interactive = false, icon: Icon, iconColor, title, description, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-card rounded-xl p-4 transition-all duration-200 ease-out",
          interactive && "hover:bg-secondary/30 active:scale-[0.99] cursor-pointer",
          className
        )}
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        {...props}
      >
        {(Icon || title || description) && (
          <div className="flex items-start gap-3">
            {Icon && (
              <div
                className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
                  iconColor || "bg-primary/10"
                )}
              >
                <Icon className={cn("w-[18px] h-[18px]", iconColor ? "text-white" : "text-primary")} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              {title && (
                <h3 className="font-medium text-[15px] text-foreground/90 leading-tight">{title}</h3>
              )}
              {description && (
                <p className="text-muted-foreground/70 text-[13px] mt-0.5 leading-relaxed">{description}</p>
              )}
            </div>
          </div>
        )}
        {children}
      </div>
    );
  }
);
IOSCard.displayName = "IOSCard";

interface IOSSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
}

const IOSSection = React.forwardRef<HTMLDivElement, IOSSectionProps>(
  ({ className, title, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        {title && (
          <h2 className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider px-1">
            {title}
          </h2>
        )}
        <div 
          className="bg-card rounded-xl overflow-hidden divide-y divide-border/10"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        >
          {children}
        </div>
      </div>
    );
  }
);
IOSSection.displayName = "IOSSection";

interface IOSSectionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  iconColor?: string;
  label: string;
  value?: string | React.ReactNode;
  showArrow?: boolean;
  destructive?: boolean;
}

const IOSSectionItem = React.forwardRef<HTMLDivElement, IOSSectionItemProps>(
  ({ className, icon: Icon, iconColor, label, value, showArrow = false, destructive = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5",
          "hover:bg-secondary/30 transition-colors cursor-pointer active:bg-secondary/50",
          className
        )}
        {...props}
      >
        {Icon && (
          <div
            className={cn(
              "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0",
              iconColor || "bg-primary"
            )}
          >
            <Icon className="w-[14px] h-[14px] text-white" />
          </div>
        )}
        <span className={cn(
          "flex-1 text-[15px] font-medium text-foreground/85",
          destructive && "text-destructive"
        )}>
          {label}
        </span>
        {value && (
          <span className="text-muted-foreground/60 text-[13px]">{value}</span>
        )}
        {showArrow && (
          <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
        )}
      </div>
    );
  }
);
IOSSectionItem.displayName = "IOSSectionItem";

export { IOSCard, IOSSection, IOSSectionItem };
