import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle } from "lucide-react";

interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  success?: boolean;
  children: React.ReactNode;
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, label, htmlFor, required, error, hint, success, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        <div className="flex items-center justify-between">
          <Label
            htmlFor={htmlFor}
            className={cn(
              "text-xs font-medium",
              error ? "text-destructive" : "text-foreground/80"
            )}
          >
            {label}
            {required && (
              <span className="text-destructive ml-0.5">*</span>
            )}
          </Label>
        </div>
        
        {children}
        
        {(error || hint || success) && (
          <div className={cn(
            "flex items-start gap-1.5 text-xs mt-1.5",
            error ? "text-destructive" : success ? "text-success" : "text-muted-foreground/60"
          )}>
            {error && <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />}
            {success && <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />}
            <span>{error || (success ? "Validado" : hint)}</span>
          </div>
        )}
      </div>
    );
  }
);
FormField.displayName = "FormField";

interface FormInputProps extends React.ComponentProps<typeof Input> {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, label, error, hint, required, id, ...props }, ref) => {
    const inputId = id || `input-${label.toLowerCase().replace(/\s/g, '-')}`;
    
    return (
      <FormField
        label={label}
        htmlFor={inputId}
        error={error}
        hint={hint}
        required={required}
      >
        <Input
          ref={ref}
          id={inputId}
          className={cn(
            "h-11 text-[16px]",
            error && "border-destructive focus:ring-destructive/20",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
      </FormField>
    );
  }
);
FormInput.displayName = "FormInput";

interface FormTextareaProps extends React.ComponentProps<typeof Textarea> {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ className, label, error, hint, required, id, ...props }, ref) => {
    const textareaId = id || `textarea-${label.toLowerCase().replace(/\s/g, '-')}`;
    
    return (
      <FormField
        label={label}
        htmlFor={textareaId}
        error={error}
        hint={hint}
        required={required}
      >
        <Textarea
          ref={ref}
          id={textareaId}
          className={cn(
            "min-h-[80px] text-[16px] resize-none",
            error && "border-destructive focus:ring-destructive/20",
            className
          )}
          aria-invalid={!!error}
          {...props}
        />
      </FormField>
    );
  }
);
FormTextarea.displayName = "FormTextarea";

interface FormSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
}

const FormSection = React.forwardRef<HTMLDivElement, FormSectionProps>(
  ({ className, title, description, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-5", className)} {...props}>
        {(title || description) && (
          <div className="space-y-1">
            {title && (
              <h3 className="text-sm font-semibold text-foreground/90">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-xs text-muted-foreground/70">
                {description}
              </p>
            )}
          </div>
        )}
        <div className="space-y-4">
          {children}
        </div>
      </div>
    );
  }
);
FormSection.displayName = "FormSection";

interface FormRowProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4;
}

const colsClasses = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

const FormRow = React.forwardRef<HTMLDivElement, FormRowProps>(
  ({ className, cols = 2, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("grid gap-4", colsClasses[cols], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
FormRow.displayName = "FormRow";

export { FormField, FormInput, FormTextarea, FormSection, FormRow };
