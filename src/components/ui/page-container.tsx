import * as React from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Aplica safe-area padding no topo (PWA/iOS) */
  safeAreaTop?: boolean;
  /** Aplica safe-area padding no bottom (PWA/iOS) */
  safeAreaBottom?: boolean;
  /** Espaçamento vertical do conteúdo */
  spacing?: "none" | "sm" | "default" | "lg";
}

const spacingClasses = {
  none: "",
  sm: "py-3",
  default: "py-4 sm:py-5",
  lg: "py-6 sm:py-8",
};

const PageContainer = React.forwardRef<HTMLDivElement, PageContainerProps>(
  ({ 
    className, 
    safeAreaTop = false, 
    safeAreaBottom = true, 
    spacing = "default",
    children,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "min-h-screen bg-background",
          safeAreaTop && "pt-[var(--safe-area-top)]",
          safeAreaBottom && "pb-[var(--safe-area-bottom)]",
          className
        )}
        {...props}
      >
        <main className={cn("container", spacingClasses[spacing])}>
          {children}
        </main>
      </div>
    );
  }
);
PageContainer.displayName = "PageContainer";

interface PageSectionProps extends React.HTMLAttributes<HTMLElement> {
  /** Título da seção (uppercase, tracking-wider) */
  title?: string;
  /** Conteúdo à direita do título */
  titleAction?: React.ReactNode;
  /** Espaçamento interno */
  spacing?: "none" | "sm" | "default";
}

const sectionSpacing = {
  none: "space-y-0",
  sm: "space-y-2",
  default: "space-y-3 sm:space-y-4",
};

const PageSection = React.forwardRef<HTMLElement, PageSectionProps>(
  ({ className, title, titleAction, spacing = "default", children, ...props }, ref) => {
    return (
      <section
        ref={ref}
        className={cn(sectionSpacing[spacing], className)}
        {...props}
      >
        {(title || titleAction) && (
          <div className="flex items-center justify-between">
            {title && (
              <h2 className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider">
                {title}
              </h2>
            )}
            {titleAction}
          </div>
        )}
        {children}
      </section>
    );
  }
);
PageSection.displayName = "PageSection";

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Título principal */
  title: string;
  /** Subtítulo ou descrição */
  subtitle?: string;
  /** Ações à direita */
  actions?: React.ReactNode;
  /** Contador de itens */
  count?: number;
  /** Label do contador */
  countLabel?: string;
}

const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ className, title, subtitle, actions, count, countLabel = "itens", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4",
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-3">
          <h1 className="text-lg sm:text-xl font-semibold text-foreground/90">
            {title}
          </h1>
          {typeof count === "number" && (
            <span className="text-xs font-medium text-muted-foreground/60 bg-muted/50 px-2 py-0.5 rounded-full">
              {count} {countLabel}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-sm text-muted-foreground/70">{subtitle}</p>
        )}
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    );
  }
);
PageHeader.displayName = "PageHeader";

export { PageContainer, PageSection, PageHeader };
