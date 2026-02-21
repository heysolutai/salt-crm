import React, { useState } from 'react';
import { 
  PlanType, 
  FeatureFlags, 
  PLAN_CONFIGS, 
  FEATURE_LABELS,
  FEATURE_CATEGORIES,
  PLAN_USER_PRICING,
  canUpgradeTo,
  canDowngradeTo
} from '@/lib/plan-features';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { 
  Check, 
  X, 
  Crown, 
  ArrowUp, 
  ArrowDown, 
  AlertTriangle,
  Sparkles,
  Users,
  History
} from 'lucide-react';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TenantPlanManagerProps {
  tenantId: string;
  tenantName: string;
  currentPlan: PlanType;
  customOverrides?: Partial<FeatureFlags>;
  planHistory?: { planType: PlanType; changedAt: string; changedBy: string }[];
  onChangePlan: (newPlan: PlanType) => void;
  onToggleOverride: (featureKey: keyof FeatureFlags, enabled: boolean) => void;
  isMaster: boolean;
}

export const TenantPlanManager: React.FC<TenantPlanManagerProps> = ({
  tenantId,
  tenantName,
  currentPlan,
  customOverrides = {},
  planHistory = [],
  onChangePlan,
  onToggleOverride,
  isMaster,
}) => {
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedNewPlan, setSelectedNewPlan] = useState<PlanType | null>(null);
  
  const planConfig = PLAN_CONFIGS[currentPlan];
  const planFeatures = planConfig.features;
  
  // Get effective value for a feature (considering overrides)
  const getEffectiveValue = (key: keyof FeatureFlags): boolean | number | 'unlimited' => {
    if (key in customOverrides) {
      return customOverrides[key] as boolean | number | 'unlimited';
    }
    return planFeatures[key];
  };
  
  const hasOverride = (key: keyof FeatureFlags): boolean => {
    return key in customOverrides;
  };
  
  const handleConfirmPlanChange = () => {
    if (selectedNewPlan) {
      onChangePlan(selectedNewPlan);
      setShowChangePlanModal(false);
      setSelectedNewPlan(null);
      toast.success(`Plano alterado para ${PLAN_CONFIGS[selectedNewPlan].name}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Plan Header */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Crown className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/70">Plano Atual</p>
            <h3 className="text-xl font-bold text-foreground">{planConfig.name}</h3>
            <p className="text-xs text-muted-foreground">{planConfig.description}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-foreground">
            R$ {PLAN_USER_PRICING[currentPlan].monthly.toLocaleString('pt-BR')}
          </p>
          <p className="text-xs text-muted-foreground">/usuário/mês</p>
        </div>
      </div>

      {/* Actions */}
      {isMaster && (
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs gap-1.5"
            onClick={() => setShowChangePlanModal(true)}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Alterar Plano
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs gap-1.5"
            onClick={() => setShowHistoryModal(true)}
          >
            <History className="w-3.5 h-3.5" />
            Histórico
          </Button>
        </div>
      )}

      {/* User Limit */}
      <div className="p-4 rounded-xl border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Limite de Usuários</p>
              <p className="text-xs text-muted-foreground">Máximo de usuários permitidos</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-sm">
            {planFeatures.max_users === 'unlimited' ? 'Ilimitado' : `${planFeatures.max_users} usuários`}
          </Badge>
        </div>
      </div>

      {/* Features by Category */}
      {Object.entries(FEATURE_CATEGORIES).map(([categoryKey, category]) => (
        <div key={categoryKey} className="space-y-3">
          <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground/70 font-medium">
            {category.label}
          </h4>
          <div className="rounded-xl border overflow-hidden">
            {category.features.map((featureKey, index) => {
              if (featureKey === 'max_users') return null;
              
              const baseValue = planFeatures[featureKey];
              const effectiveValue = getEffectiveValue(featureKey);
              const isOverridden = hasOverride(featureKey);
              
              return (
                <div 
                  key={featureKey}
                  className={`flex items-center justify-between p-3 ${
                    index > 0 ? 'border-t border-border/50' : ''
                  } ${isOverridden ? 'bg-warning/5' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    {typeof effectiveValue === 'boolean' && (
                      effectiveValue ? (
                        <Check className="w-4 h-4 text-success" />
                      ) : (
                        <X className="w-4 h-4 text-muted-foreground/50" />
                      )
                    )}
                    <div>
                      <p className={`text-sm ${typeof effectiveValue === 'boolean' && !effectiveValue ? 'text-muted-foreground/50' : ''}`}>
                        {FEATURE_LABELS[featureKey]}
                      </p>
                      {isOverridden && (
                        <Badge variant="outline" className="text-[9px] mt-0.5 bg-warning/10 text-warning border-warning/20">
                          Override ativo
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {isMaster && typeof baseValue === 'boolean' && (
                    <Switch
                      checked={effectiveValue as boolean}
                      onCheckedChange={(checked) => onToggleOverride(featureKey, checked)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Change Plan Modal */}
      <Dialog open={showChangePlanModal} onOpenChange={setShowChangePlanModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Alterar Plano - {tenantName}
            </DialogTitle>
            <DialogDescription>
              Selecione o novo plano para esta empresa. A alteração será aplicada imediatamente.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            {(Object.keys(PLAN_CONFIGS) as PlanType[]).map((planKey) => {
              const plan = PLAN_CONFIGS[planKey];
              const isCurrent = planKey === currentPlan;
              const isSelected = planKey === selectedNewPlan;
              const isUpgrade = canUpgradeTo(currentPlan, planKey);
              const isDowngrade = canDowngradeTo(currentPlan, planKey);
              
              return (
                <div
                  key={planKey}
                  onClick={() => !isCurrent && setSelectedNewPlan(planKey)}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    isCurrent 
                      ? 'border-primary/50 bg-primary/5 cursor-not-allowed' 
                      : isSelected 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/30 hover:bg-muted/30'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-foreground">{plan.name}</h4>
                      <p className="text-xs text-muted-foreground">{plan.description}</p>
                    </div>
                    {isCurrent && (
                      <Badge variant="secondary" className="text-[10px]">Atual</Badge>
                    )}
                    {!isCurrent && isUpgrade && (
                      <Badge className="text-[10px] bg-success/10 text-success border-success/20">
                        <ArrowUp className="w-3 h-3 mr-0.5" />
                        Upgrade
                      </Badge>
                    )}
                    {!isCurrent && isDowngrade && (
                      <Badge className="text-[10px] bg-warning/10 text-warning border-warning/20">
                        <ArrowDown className="w-3 h-3 mr-0.5" />
                        Downgrade
                      </Badge>
                    )}
                  </div>
                  <p className="text-lg font-bold text-foreground">
                    R$ {PLAN_USER_PRICING[planKey].monthly.toLocaleString('pt-BR')}
                    <span className="text-xs font-normal text-muted-foreground">/usuário/mês</span>
                  </p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {plan.features.max_users === 'unlimited' 
                      ? 'Usuários ilimitados' 
                      : `Até ${plan.features.max_users} usuários`}
                  </div>
                </div>
              );
            })}
          </div>

          {selectedNewPlan && canDowngradeTo(currentPlan, selectedNewPlan) && (
            <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-warning">Atenção: Downgrade</p>
                <p className="text-xs text-muted-foreground">
                  Algumas funcionalidades serão desativadas ao fazer downgrade. 
                  Certifique-se de que a empresa não está utilizando features que serão removidas.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChangePlanModal(false)} className="text-xs">
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmPlanChange} 
              disabled={!selectedNewPlan}
              className="text-xs gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              Confirmar Alteração
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Modal */}
      <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              Histórico de Planos
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-[300px]">
            {planHistory.length > 0 ? (
              <div className="space-y-3">
                {planHistory.slice().reverse().map((entry, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Crown className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{PLAN_CONFIGS[entry.planType].name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(entry.changedAt).toLocaleString('pt-BR')} • por {entry.changedBy}
                      </p>
                    </div>
                    {index === 0 && (
                      <Badge variant="secondary" className="text-[10px]">Atual</Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Nenhum histórico de alteração de plano.
              </div>
            )}
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowHistoryModal(false)} className="text-xs">
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TenantPlanManager;
