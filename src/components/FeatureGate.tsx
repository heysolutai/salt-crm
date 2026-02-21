import React from 'react';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';
import { FeatureFlags, PLAN_CONFIGS, getNextPlan } from '@/lib/plan-features';
import { IOSCard } from '@/components/ui/ios-card';
import { Button } from '@/components/ui/button';
import { Lock, ArrowUpRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

interface FeatureGateProps {
  /** A feature flag a ser verificada */
  featureKey: keyof FeatureFlags;
  /** Conteúdo a ser renderizado se a feature estiver ativa */
  children: React.ReactNode;
  /** 
   * Comportamento quando feature não está disponível:
   * - 'hide': Não renderiza nada
   * - 'disabled': Renderiza o children mas desabilitado
   * - 'upgrade-prompt': Mostra CTA de upgrade
   * - 'badge': Mostra badge "Disponível em plano superior"
   */
  fallback?: 'hide' | 'disabled' | 'upgrade-prompt' | 'badge';
  /** Classe CSS adicional para o wrapper */
  className?: string;
  /** Callback quando usuário clica em upgrade */
  onUpgradeClick?: () => void;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
  featureKey,
  children,
  fallback = 'hide',
  className,
  onUpgradeClick,
}) => {
  const { hasFeature, currentPlan, getFeatureLabel } = usePlanFeatures();
  const navigate = useNavigate();
  
  const isEnabled = hasFeature(featureKey);
  
  if (isEnabled) {
    return <>{children}</>;
  }
  
  // Feature não disponível - aplicar fallback
  switch (fallback) {
    case 'hide':
      return null;
      
    case 'disabled':
      return (
        <div className={`opacity-50 pointer-events-none ${className || ''}`}>
          {children}
        </div>
      );
      
    case 'badge':
      return (
        <div className={`relative ${className || ''}`}>
          <div className="opacity-50 pointer-events-none">
            {children}
          </div>
          <Badge 
            variant="outline" 
            className="absolute top-2 right-2 bg-warning/10 text-warning border-warning/20 text-xs"
          >
            <Lock className="w-3 h-3 mr-1" />
            Plano superior
          </Badge>
        </div>
      );
      
    case 'upgrade-prompt':
      const nextPlan = getNextPlan(currentPlan);
      const nextPlanConfig = nextPlan ? PLAN_CONFIGS[nextPlan] : null;
      const featureLabel = getFeatureLabel(featureKey);
      
      return (
        <IOSCard className={`p-6 ${className || ''}`}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">
                {featureLabel}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                {nextPlanConfig 
                  ? `Disponível no plano ${nextPlanConfig.name}. Faça upgrade para desbloquear.`
                  : 'Esta funcionalidade não está disponível no seu plano atual.'}
              </p>
              <Button 
                size="sm"
                onClick={() => {
                  if (onUpgradeClick) {
                    onUpgradeClick();
                  } else {
                    navigate('/outros');
                  }
                }}
              >
                Fazer Upgrade
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </IOSCard>
      );
      
    default:
      return null;
  }
};

/**
 * Componente para renderizar conteúdo apenas se o plano atual for igual ou superior ao especificado
 */
interface PlanGateProps {
  /** Plano mínimo necessário */
  minPlan: keyof typeof PLAN_CONFIGS;
  children: React.ReactNode;
  fallback?: 'hide' | 'upgrade-prompt';
  className?: string;
}

export const PlanGate: React.FC<PlanGateProps> = ({
  minPlan,
  children,
  fallback = 'hide',
  className,
}) => {
  const { currentPlan } = usePlanFeatures();
  const navigate = useNavigate();
  
  const planOrder = ['ESSENCIAL', 'PROFISSIONAL', 'AVANCADO', 'COMPLETO'] as const;
  const currentIndex = planOrder.indexOf(currentPlan as typeof planOrder[number]);
  const requiredIndex = planOrder.indexOf(minPlan as typeof planOrder[number]);
  
  const hasAccess = currentIndex >= requiredIndex;
  
  if (hasAccess) {
    return <>{children}</>;
  }
  
  if (fallback === 'hide') {
    return null;
  }
  
  const requiredPlanConfig = PLAN_CONFIGS[minPlan];
  
  return (
    <IOSCard className={`p-6 ${className || ''}`}>
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center flex-shrink-0">
          <Lock className="w-6 h-6 text-warning" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-1">
            Plano {requiredPlanConfig.name} necessário
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Este recurso está disponível a partir do plano {requiredPlanConfig.name}.
          </p>
          <Button 
            size="sm"
            onClick={() => navigate('/outros')}
          >
            Ver Planos
            <ArrowUpRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </IOSCard>
  );
};

export default FeatureGate;
