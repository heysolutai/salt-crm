import * as React from "react";
import { cn } from "@/lib/utils";
import saltLogo from "@/assets/salt-logo.png";

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'pulse';
}

const Loader = React.forwardRef<HTMLDivElement, LoaderProps>(
  ({ className, size = 'md', variant = 'spinner', ...props }, ref) => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
    };

    if (variant === 'spinner') {
      return (
        <div ref={ref} className={cn("relative", sizeClasses[size], className)} {...props}>
          <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
        </div>
      );
    }

    if (variant === 'dots') {
      return (
        <div ref={ref} className={cn("flex items-center gap-1", className)} {...props}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                "bg-primary rounded-full animate-pulse",
                size === 'sm' && 'w-1.5 h-1.5',
                size === 'md' && 'w-2 h-2',
                size === 'lg' && 'w-2.5 h-2.5'
              )}
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          "bg-primary/20 rounded-lg animate-pulse",
          size === 'sm' && 'h-4 w-16',
          size === 'md' && 'h-6 w-24',
          size === 'lg' && 'h-8 w-32',
          className
        )}
        {...props}
      />
    );
  }
);
Loader.displayName = "Loader";

interface PageLoaderProps {
  message?: string;
}

const PageLoader: React.FC<PageLoaderProps> = ({ message = 'Carregando...' }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
      <div className="relative">
        <img 
          src={saltLogo} 
          alt="SALT Logo" 
          className="w-16 h-16 animate-pulse"
        />
        <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );
};

export { Loader, PageLoader };
