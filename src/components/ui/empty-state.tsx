import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon, Inbox, Lock, AlertCircle, Loader2, SearchX, FileX } from "lucide-react";
import { Button } from "@/components/ui/button";

type EmptyStateVariant = "default" | "no-data" | "no-results" | "error" | "blocked" | "loading";

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: EmptyStateVariant;
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "secondary";
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  compact?: boolean;
}

const variantConfig: Record<EmptyStateVariant, { icon: LucideIcon; iconColor: string }> = {
  default: { icon: Inbox, iconColor: "text-muted-foreground/50" },
  "no-data": { icon: FileX, iconColor: "text-muted-foreground/50" },
  "no-results": { icon: SearchX, iconColor: "text-muted-foreground/50" },
  error: { icon: AlertCircle, iconColor: "text-destructive/70" },
  blocked: { icon: Lock, iconColor: "text-warning/70" },
  loading: { icon: Loader2, iconColor: "text-primary/70" },
};

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ 
    className, 
    variant = "default", 
    icon, 
    title, 
    description, 
    action, 
    secondaryAction,
    compact = false,
    ...props 
  }, ref) => {
    const config = variantConfig[variant];
    const Icon = icon || config.icon;
    const isLoading = variant === "loading";

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center text-center",
          compact ? "py-6 px-4" : "py-12 px-6",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "rounded-full flex items-center justify-center mb-4",
            compact ? "w-12 h-12 bg-muted/50" : "w-16 h-16 bg-muted/30"
          )}
        >
          <Icon
            className={cn(
              config.iconColor,
              compact ? "w-6 h-6" : "w-8 h-8",
              isLoading && "animate-spin"
            )}
          />
        </div>
        
        <h3
          className={cn(
            "font-semibold text-foreground/90",
            compact ? "text-sm" : "text-base"
          )}
        >
          {title}
        </h3>
        
        {description && (
          <p
            className={cn(
              "text-muted-foreground/70 max-w-xs mx-auto mt-1.5",
              compact ? "text-xs" : "text-sm"
            )}
          >
            {description}
          </p>
        )}
        
        {(action || secondaryAction) && (
          <div className={cn(
            "flex flex-wrap items-center justify-center gap-2",
            compact ? "mt-4" : "mt-6"
          )}>
            {action && (
              <Button
                size={compact ? "sm" : "default"}
                variant={action.variant || "default"}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            )}
            {secondaryAction && (
              <Button
                size={compact ? "sm" : "default"}
                variant="ghost"
                onClick={secondaryAction.onClick}
              >
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }
);
EmptyState.displayName = "EmptyState";

// Componentes especializados para casos comuns
const NoDataState = React.forwardRef<
  HTMLDivElement,
  Omit<EmptyStateProps, "variant" | "title"> & { title?: string }
>(({ title = "Sem dados", ...props }, ref) => (
  <EmptyState ref={ref} variant="no-data" title={title} {...props} />
));
NoDataState.displayName = "NoDataState";

const NoResultsState = React.forwardRef<
  HTMLDivElement,
  Omit<EmptyStateProps, "variant" | "title"> & { title?: string }
>(({ title = "Nenhum resultado encontrado", ...props }, ref) => (
  <EmptyState ref={ref} variant="no-results" title={title} {...props} />
));
NoResultsState.displayName = "NoResultsState";

const ErrorState = React.forwardRef<
  HTMLDivElement,
  Omit<EmptyStateProps, "variant" | "title"> & { title?: string }
>(({ title = "Ocorreu um erro", ...props }, ref) => (
  <EmptyState ref={ref} variant="error" title={title} {...props} />
));
ErrorState.displayName = "ErrorState";

const BlockedState = React.forwardRef<
  HTMLDivElement,
  Omit<EmptyStateProps, "variant" | "title"> & { title?: string; reason?: "plan" | "permission" }
>(({ title, reason = "plan", ...props }, ref) => {
  const defaultTitle = reason === "plan" 
    ? "Recurso não disponível no seu plano" 
    : "Você não tem permissão para acessar";
  
  return (
    <EmptyState 
      ref={ref} 
      variant="blocked" 
      title={title || defaultTitle} 
      {...props} 
    />
  );
});
BlockedState.displayName = "BlockedState";

const LoadingState = React.forwardRef<
  HTMLDivElement,
  Omit<EmptyStateProps, "variant" | "title"> & { title?: string }
>(({ title = "Carregando...", ...props }, ref) => (
  <EmptyState ref={ref} variant="loading" title={title} {...props} />
));
LoadingState.displayName = "LoadingState";

export { 
  EmptyState, 
  NoDataState, 
  NoResultsState, 
  ErrorState, 
  BlockedState, 
  LoadingState 
};
