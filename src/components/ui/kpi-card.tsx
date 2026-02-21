import * as React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPICardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  color?: 'primary' | 'success' | 'warning' | 'destructive' | 'info';
  size?: 'sm' | 'md' | 'lg';
}

const colorClasses = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  destructive: 'bg-destructive/10 text-destructive',
  info: 'bg-info/10 text-info',
};

const accentClasses = {
  primary: 'from-primary/20 to-primary/5',
  success: 'from-success/20 to-success/5',
  warning: 'from-warning/20 to-warning/5',
  destructive: 'from-destructive/20 to-destructive/5',
  info: 'from-info/20 to-info/5',
};

const KPICard = React.forwardRef<HTMLDivElement, KPICardProps>(
  ({ className, label, value, change, changeLabel, color = 'primary', size = 'md', ...props }, ref) => {
    const isPositive = change && change > 0;
    const isNegative = change && change < 0;
    const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

    // Premium compact padding
    const sizeClasses = {
      sm: 'px-2.5 py-2',
      md: 'px-3 py-2.5',
      lg: 'px-3.5 py-3',
    };

    // Premium typography - balanced sizing
    const valueSizeClasses = {
      sm: 'text-[17px]',
      md: 'text-[18px]',
      lg: 'text-[20px]',
    };

    return (
      <div
        ref={ref}
        className={cn(
          "bg-card rounded-xl border border-border/20 overflow-hidden relative",
          sizeClasses[size],
          className
        )}
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        {...props}
      >
        {/* Very subtle gradient accent */}
        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-20", accentClasses[color])} />
        
        <div className="relative z-10">
          <p className="text-muted-foreground/60 text-[10px] font-medium tracking-wider uppercase mb-0.5">{label}</p>
          <p className={cn("font-semibold text-foreground/85 leading-tight tracking-tight", valueSizeClasses[size])}>
            {value}
          </p>
          
          {(change !== undefined || changeLabel) && (
            <div className="flex items-center gap-1 mt-1">
              {change !== undefined && (
                <div
                  className={cn(
                    "flex items-center gap-0.5 text-[9px] font-medium px-1 py-0.5 rounded-md",
                    isPositive && "bg-success/8 text-success/80",
                    isNegative && "bg-destructive/8 text-destructive/80",
                    !isPositive && !isNegative && "bg-muted/50 text-muted-foreground/60"
                  )}
                >
                  <TrendIcon className="w-2 h-2" />
                  <span>{Math.abs(change)}%</span>
                </div>
              )}
              {changeLabel && (
                <span className="text-[9px] text-muted-foreground/50">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
);
KPICard.displayName = "KPICard";

export { KPICard };
