import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Maximize2, Minimize2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ResponsiveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Tamanho máximo do modal no desktop */
  size?: "sm" | "default" | "lg" | "xl" | "full";
  /** Mostrar botão de voltar no mobile */
  showBackButton?: boolean;
  /** Callback do botão voltar */
  onBack?: () => void;
  /** Permitir expandir para tela cheia */
  allowFullscreen?: boolean;
}

const sizeClasses = {
  sm: "sm:max-w-sm",
  default: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-3xl",
  full: "sm:max-w-[95vw]",
};

const ResponsiveModal: React.FC<ResponsiveModalProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = "default",
  showBackButton = false,
  onBack,
  allowFullscreen = true,
}) => {
  const isMobile = useIsMobile();
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  // Reset fullscreen when modal closes
  React.useEffect(() => {
    if (!open) {
      setIsFullscreen(false);
    }
  }, [open]);

  const effectiveSize = isFullscreen ? "full" : size;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "w-full transition-all duration-200",
          sizeClasses[effectiveSize],
          // Mobile: Full screen modal com scroll interno e safe-area
          isMobile && "fixed inset-0 w-full max-w-full h-full max-h-full rounded-none translate-x-0 translate-y-0 left-0 top-0 data-[state=open]:slide-in-from-bottom-0 pt-[var(--safe-area-top)] pb-[var(--safe-area-bottom)]",
          // Desktop: Modal centralizado com altura controlada
          !isMobile && !isFullscreen && "max-h-[85vh] overflow-hidden flex flex-col",
          // Desktop Fullscreen - tela inteira com safe-area
          !isMobile && isFullscreen && "!fixed !inset-0 !w-screen !max-w-none !h-screen !max-h-none !translate-x-0 !translate-y-0 !left-0 !top-0 !right-0 !bottom-0 !rounded-none !m-0 overflow-hidden flex flex-col !pt-[var(--safe-area-top)] !pb-[var(--safe-area-bottom)]"
        )}
      >
        {/* Header */}
        <DialogHeader className={cn(
          "flex-shrink-0",
          isMobile && "sticky top-0 bg-background z-10 pb-3 border-b border-border/10"
        )}>
          <div className="flex items-center gap-3">
            {showBackButton && isMobile && (
              <button
                onClick={onBack || (() => onOpenChange(false))}
                className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors -ml-1"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div className="flex-1">
              <DialogTitle className="text-base sm:text-lg font-semibold">
                {title}
              </DialogTitle>
              {description && (
                <DialogDescription className="text-sm text-muted-foreground/70 mt-0.5">
                  {description}
                </DialogDescription>
              )}
            </div>
            {/* Fullscreen toggle button - only on desktop */}
            {allowFullscreen && !isMobile && (
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-secondary/80 transition-colors text-muted-foreground hover:text-foreground"
                title={isFullscreen ? "Restaurar tamanho" : "Tela cheia"}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </DialogHeader>

        {/* Content com scroll */}
        <div className={cn(
          "flex-1 overflow-y-auto",
          isMobile ? "px-4 py-4" : "py-4",
          isMobile && "min-h-0"
        )}>
          {children}
        </div>

        {/* Footer sticky no bottom */}
        {footer && (
          <DialogFooter className={cn(
            "flex-shrink-0 gap-2",
            isMobile && "sticky bottom-0 bg-background pt-3 border-t border-border/10 pb-[var(--safe-area-bottom)]"
          )}>
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Componente helper para ações de footer comuns
interface ModalActionsProps {
  onCancel: () => void;
  onConfirm: () => void;
  cancelLabel?: string;
  confirmLabel?: string;
  confirmDisabled?: boolean;
  confirmLoading?: boolean;
  confirmVariant?: "default" | "destructive";
}

const ModalActions: React.FC<ModalActionsProps> = ({
  onCancel,
  onConfirm,
  cancelLabel = "Cancelar",
  confirmLabel = "Confirmar",
  confirmDisabled = false,
  confirmLoading = false,
  confirmVariant = "default",
}) => {
  const isMobile = useIsMobile();

  return (
    <>
      <Button
        variant="outline"
        onClick={onCancel}
        className={cn(isMobile && "flex-1")}
      >
        {cancelLabel}
      </Button>
      <Button
        variant={confirmVariant}
        onClick={onConfirm}
        disabled={confirmDisabled || confirmLoading}
        className={cn(isMobile && "flex-1")}
      >
        {confirmLoading ? "Carregando..." : confirmLabel}
      </Button>
    </>
  );
};

export { ResponsiveModal, ModalActions };
