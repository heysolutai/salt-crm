import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";

interface SafeSubHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Título exibido no header */
  title: string;
  /** Função de callback ao clicar em Voltar */
  onBack: () => void;
  /** Texto do botão de voltar (default: "Voltar") */
  backLabel?: string;
  /** Conteúdo adicional à direita do título */
  rightContent?: React.ReactNode;
}

/**
 * SubHeader que respeita a safe-area do mobile/PWA
 * Use este componente para páginas internas que precisam de navegação
 */
const SafeSubHeader = React.forwardRef<HTMLDivElement, SafeSubHeaderProps>(
  ({ className, title, onBack, backLabel = "Voltar", rightContent, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/10 pt-[var(--safe-area-top)]",
          className
        )}
        {...props}
      >
        <div className="container flex items-center justify-between h-12">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="flex items-center gap-1 text-[13px] font-medium text-primary hover:text-primary/80 transition-colors -ml-1 active:scale-95 transition-transform min-h-[44px] min-w-[44px] justify-center"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>{backLabel}</span>
            </button>
            <span className="text-[15px] font-semibold text-foreground/90">{title}</span>
          </div>
          {rightContent && (
            <div className="flex items-center gap-2">
              {rightContent}
            </div>
          )}
        </div>
      </div>
    );
  }
);
SafeSubHeader.displayName = "SafeSubHeader";

export { SafeSubHeader };
