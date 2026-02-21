import React from 'react';
import { Navigate } from 'react-router-dom';
import { useModules, ModuleId } from '@/hooks/useModules';
import { IOSCard } from '@/components/ui/ios-card';
import { Button } from '@/components/ui/button';
import { Lock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ModuleGuardProps {
  moduleId: ModuleId;
  children: React.ReactNode;
  showUpgradeMessage?: boolean;
}

export const ModuleGuard: React.FC<ModuleGuardProps> = ({
  moduleId,
  children,
  showUpgradeMessage = true,
}) => {
  const { isModuleEnabled, getModuleConfig } = useModules();
  const navigate = useNavigate();

  if (!isModuleEnabled(moduleId)) {
    if (!showUpgradeMessage) {
      return <Navigate to="/home" replace />;
    }

    const moduleConfig = getModuleConfig(moduleId);

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <IOSCard className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-warning" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Módulo Não Disponível
          </h1>
          <p className="text-muted-foreground mb-6">
            O módulo <strong>{moduleConfig?.name || moduleId}</strong> não está 
            habilitado para sua conta. Entre em contato com o suporte SALT para 
            ativar este recurso.
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => navigate('/outros')}
              className="w-full"
            >
              Solicitar Upgrade
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/home')}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Home
            </Button>
          </div>
        </IOSCard>
      </div>
    );
  }

  return <>{children}</>;
};

export default ModuleGuard;
