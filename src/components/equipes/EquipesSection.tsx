import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  Users,
  UserCog,
  ChevronLeft,
  ChevronRight,
  Save,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
} from 'lucide-react';

interface Manager {
  id: string;
  name: string;
  email: string;
  agentsCount?: number;
}

interface Agent {
  id: string;
  name: string;
  email: string;
  weight: number;
  active: boolean;
  managerId?: string;
  teamId?: string;
  leadsCount?: number;
}

interface Team {
  id: string;
  name: string;
  managerId: string;
  agents: string[];
}

interface EquipesSectionProps {
  managers: Manager[];
  agents: Agent[];
  teams: Team[];
  onBack: () => void;
}

type View = 'main' | 'team-detail' | 'agent-detail' | 'manager-detail' | 'create-team' | 'edit-team' | 'change-manager' | 'add-agent-to-team';

export const EquipesSection: React.FC<EquipesSectionProps> = ({
  managers: initialManagers,
  agents: initialAgents,
  teams: initialTeams,
  onBack,
}) => {
  const { toast } = useToast();
  
  // State for data management
  const [managers, setManagers] = useState<Manager[]>(initialManagers);
  const [agents, setAgents] = useState<Agent[]>(initialAgents.map(a => ({
    ...a,
    teamId: initialTeams.find(t => t.agents.includes(a.id))?.id
  })));
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  
  // Navigation state
  const [view, setView] = useState<View>('main');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [selectedManagerId, setSelectedManagerId] = useState<string | null>(null);
  
  // Form state
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamManagerId, setNewTeamManagerId] = useState('');
  const [editTeamName, setEditTeamName] = useState('');
  
  // Helper functions
  const getManagerById = (id: string) => managers.find(m => m.id === id);
  const getAgentById = (id: string) => agents.find(a => a.id === id);
  const getTeamById = (id: string) => teams.find(t => t.id === id);
  const getTeamAgents = (teamId: string) => agents.filter(a => a.teamId === teamId);
  const getAvailableAgentsForTeam = (teamId: string) => agents.filter(a => a.teamId !== teamId);
  const getManagerTeams = (managerId: string) => teams.filter(t => t.managerId === managerId);

  // Add agent to team
  const handleAddAgentToTeam = (agentId: string) => {
    if (!selectedTeamId) return;
    
    setAgents(prev => prev.map(a => 
      a.id === agentId ? { ...a, teamId: selectedTeamId } : a
    ));
    
    setTeams(prev => prev.map(t => ({
      ...t,
      agents: t.id === selectedTeamId 
        ? [...t.agents.filter(id => id !== agentId), agentId]
        : t.agents.filter(id => id !== agentId)
    })));
    
    const agent = getAgentById(agentId);
    const team = getTeamById(selectedTeamId);
    toast({ title: 'Vendedor adicionado', description: `${agent?.name} foi adicionado ao ${team?.name}` });
    setView('team-detail');
  };
  
  // Team Actions
  const handleCreateTeam = () => {
    if (!newTeamName.trim() || !newTeamManagerId) {
      toast({ title: 'Preencha todos os campos', variant: 'destructive' });
      return;
    }
    
    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name: newTeamName.trim(),
      managerId: newTeamManagerId,
      agents: [],
    };
    
    setTeams(prev => [...prev, newTeam]);
    setNewTeamName('');
    setNewTeamManagerId('');
    setView('main');
    toast({ title: 'Time criado', description: `${newTeam.name} foi criado com sucesso.` });
  };
  
  const handleUpdateTeamName = () => {
    if (!selectedTeamId || !editTeamName.trim()) return;
    
    setTeams(prev => prev.map(t => 
      t.id === selectedTeamId ? { ...t, name: editTeamName.trim() } : t
    ));
    setView('team-detail');
    toast({ title: 'Nome atualizado' });
  };
  
  const handleChangeTeamManager = (newManagerId: string) => {
    if (!selectedTeamId) return;
    
    setTeams(prev => prev.map(t => 
      t.id === selectedTeamId ? { ...t, managerId: newManagerId } : t
    ));
    setView('team-detail');
    toast({ title: 'Gerente alterado' });
  };
  
  const handleDeleteTeam = (teamId: string) => {
    const team = getTeamById(teamId);
    if (!team) return;
    
    // Remove agents from the team
    setAgents(prev => prev.map(a => 
      a.teamId === teamId ? { ...a, teamId: undefined } : a
    ));
    
    setTeams(prev => prev.filter(t => t.id !== teamId));
    setView('main');
    toast({ title: 'Time excluído', description: `${team.name} foi removido.` });
  };
  
  // Agent Actions
  const handleToggleAgent = (agentId: string) => {
    setAgents(prev => prev.map(a => 
      a.id === agentId ? { ...a, active: !a.active } : a
    ));
    const agent = getAgentById(agentId);
    toast({ 
      title: agent?.active ? 'Vendedor desativado' : 'Vendedor ativado',
      description: agent?.name 
    });
  };
  
  const handleChangeAgentTeam = (agentId: string, newTeamId: string | null) => {
    setAgents(prev => prev.map(a => 
      a.id === agentId ? { ...a, teamId: newTeamId || undefined } : a
    ));
    
    // Update teams agents list
    setTeams(prev => prev.map(t => ({
      ...t,
      agents: newTeamId === t.id 
        ? [...t.agents.filter(id => id !== agentId), agentId]
        : t.agents.filter(id => id !== agentId)
    })));
    
    toast({ title: 'Vendedor movido', description: newTeamId ? `Movido para ${getTeamById(newTeamId)?.name}` : 'Removido do time' });
  };

  // Sub-header component - com safe-area para mobile/PWA
  const SubHeader = ({ title, onBackClick }: { title: string; onBackClick: () => void }) => (
    <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/10 pt-[var(--safe-area-top)]">
      <div className="container flex items-center gap-3 h-12">
        <button 
          onClick={onBackClick}
          className="flex items-center gap-1 text-[13px] font-medium text-primary hover:text-primary/80 transition-colors -ml-1 active:scale-95 transition-transform min-h-[44px] min-w-[44px] justify-center"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Voltar</span>
        </button>
        <span className="text-[15px] font-semibold text-foreground/90">{title}</span>
      </div>
    </div>
  );

  // Section component
  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-2">
      <h2 className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider px-1">
        {title}
      </h2>
      <div 
        className="bg-card rounded-xl overflow-hidden divide-y divide-border/10"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      >
        {children}
      </div>
    </div>
  );

  // Item component
  const SectionItem = ({ 
    icon: Icon, 
    iconColor, 
    label, 
    sublabel,
    value, 
    showArrow = false,
    onClick,
    rightElement,
  }: { 
    icon: React.ElementType;
    iconColor: string;
    label: string;
    sublabel?: string;
    value?: string;
    showArrow?: boolean;
    onClick?: () => void;
    rightElement?: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted/30 transition-colors"
      disabled={!onClick}
    >
      <div className={`w-8 h-8 rounded-lg ${iconColor} flex items-center justify-center shrink-0`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-foreground/90 truncate">{label}</p>
        {sublabel && (
          <p className="text-[12px] text-muted-foreground/60 truncate">{sublabel}</p>
        )}
      </div>
      {value && (
        <span className="text-[12px] text-muted-foreground/60 shrink-0">{value}</span>
      )}
      {rightElement}
      {showArrow && (
        <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0" />
      )}
    </button>
  );

  // Create Team View
  if (view === 'create-team') {
    return (
      <div className="min-h-screen bg-background pb-6">
        <SubHeader title="Novo Time" onBackClick={() => setView('main')} />
        <main className="container py-4 space-y-4">
          <div 
            className="bg-card rounded-xl p-4 space-y-4"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          >
            <div className="space-y-1.5">
              <Label className="text-[12px] font-medium text-muted-foreground/70 uppercase tracking-wide">
                Nome do Time
              </Label>
              <Input
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="Ex: Time Alpha"
                className="h-10 text-[14px]"
              />
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-[12px] font-medium text-muted-foreground/70 uppercase tracking-wide">
                Gerente Responsável
              </Label>
              <select
                value={newTeamManagerId}
                onChange={(e) => setNewTeamManagerId(e.target.value)}
                className="w-full h-10 px-3 text-[14px] rounded-lg border border-border/20 bg-background"
              >
                <option value="">Selecione um gerente</option>
                {managers.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            
            <Button onClick={handleCreateTeam} className="w-full h-10 text-[13px] gap-2">
              <Plus className="w-4 h-4" />
              Criar Time
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Edit Team Name View
  if (view === 'edit-team' && selectedTeamId) {
    const team = getTeamById(selectedTeamId);
    
    return (
      <div className="min-h-screen bg-background pb-6">
        <SubHeader title="Editar Nome" onBackClick={() => setView('team-detail')} />
        <main className="container py-4 space-y-4">
          <div 
            className="bg-card rounded-xl p-4 space-y-4"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          >
            <div className="space-y-1.5">
              <Label className="text-[12px] font-medium text-muted-foreground/70 uppercase tracking-wide">
                Nome do Time
              </Label>
              <Input
                value={editTeamName}
                onChange={(e) => setEditTeamName(e.target.value)}
                placeholder="Ex: Time Alpha"
                className="h-10 text-[14px]"
              />
            </div>
            
            <Button onClick={handleUpdateTeamName} className="w-full h-10 text-[13px] gap-2">
              <Save className="w-4 h-4" />
              Salvar
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Change Team Manager View
  if (view === 'change-manager' && selectedTeamId) {
    const team = getTeamById(selectedTeamId);
    
    return (
      <div className="min-h-screen bg-background pb-6">
        <SubHeader title="Alterar Gerente" onBackClick={() => setView('team-detail')} />
        <main className="container py-4 space-y-4">
          <Section title="Selecione o novo gerente">
            {managers.map(m => (
              <SectionItem
                key={m.id}
                icon={Users}
                iconColor={m.id === team?.managerId ? 'bg-[#4CAF50]' : 'bg-[#5B8DEF]'}
                label={m.name}
                value={m.id === team?.managerId ? 'Atual' : ''}
                showArrow
                onClick={() => handleChangeTeamManager(m.id)}
              />
            ))}
          </Section>
        </main>
      </div>
    );
  }

  // Add Agent to Team View
  if (view === 'add-agent-to-team' && selectedTeamId) {
    const team = getTeamById(selectedTeamId);
    const availableAgents = getAvailableAgentsForTeam(selectedTeamId);
    
    return (
      <div className="min-h-screen bg-background pb-6">
        <SubHeader title="Adicionar Vendedor" onBackClick={() => setView('team-detail')} />
        <main className="container py-4 space-y-4">
          <Section title={`Vendedores disponíveis (${availableAgents.length})`}>
            {availableAgents.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <p className="text-[13px] text-muted-foreground/60">
                  Todos os vendedores já estão neste time
                </p>
              </div>
            ) : (
              availableAgents.map(agent => {
                const agentCurrentTeam = agent.teamId ? getTeamById(agent.teamId) : null;
                return (
                  <SectionItem
                    key={agent.id}
                    icon={UserCog}
                    iconColor={agent.active ? 'bg-[#9B7CF4]' : 'bg-muted-foreground/40'}
                    label={agent.name}
                    sublabel={agentCurrentTeam ? `Time atual: ${agentCurrentTeam.name}` : 'Sem time'}
                    showArrow
                    onClick={() => handleAddAgentToTeam(agent.id)}
                    rightElement={
                      <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                        agent.active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                      }`}>
                        {agent.active ? 'Ativo' : 'Inativo'}
                      </span>
                    }
                  />
                );
              })
            )}
          </Section>
        </main>
      </div>
    );
  }

  // Team Detail View
  if (view === 'team-detail' && selectedTeamId) {
    const team = getTeamById(selectedTeamId);
    const manager = team ? getManagerById(team.managerId) : null;
    const teamAgents = getTeamAgents(selectedTeamId);
    
    if (!team) {
      setView('main');
      return null;
    }
    
    return (
      <div className="min-h-screen bg-background pb-6">
        <SubHeader title={team.name} onBackClick={() => setView('main')} />
        <main className="container py-4 space-y-4">
          {/* Team Info Card */}
          <div 
            className="bg-card rounded-xl p-4"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#4CAF50] flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-[16px] font-semibold text-foreground/90">{team.name}</h3>
                <p className="text-[13px] text-muted-foreground/70">
                  Gerente: {manager?.name || 'Não definido'}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 h-8 text-[12px] gap-1.5"
                onClick={() => {
                  setEditTeamName(team.name);
                  setView('edit-team');
                }}
              >
                <Edit2 className="w-3.5 h-3.5" />
                Editar Nome
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 h-8 text-[12px] gap-1.5"
                onClick={() => setView('change-manager')}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Alterar Gerente
              </Button>
            </div>
          </div>

          {/* Team Agents */}
          <Section title={`Vendedores do Time (${teamAgents.length})`}>
            {teamAgents.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <p className="text-[13px] text-muted-foreground/60">
                  Nenhum vendedor neste time
                </p>
              </div>
            ) : (
              teamAgents.map(agent => (
                <SectionItem
                  key={agent.id}
                  icon={UserCog}
                  iconColor={agent.active ? 'bg-[#9B7CF4]' : 'bg-muted-foreground/40'}
                  label={agent.name}
                  sublabel={agent.email}
                  showArrow
                  onClick={() => {
                    setSelectedAgentId(agent.id);
                    setView('agent-detail');
                  }}
                  rightElement={
                    <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                      agent.active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                    }`}>
                      {agent.active ? 'Ativo' : 'Inativo'}
                    </span>
                  }
                />
              ))
            )}
          </Section>

          {/* Add Agent Button */}
          <Button 
            variant="outline" 
            className="w-full h-10 text-[13px] gap-2 text-primary border-primary/30 hover:bg-primary/10"
            onClick={() => setView('add-agent-to-team')}
          >
            <Plus className="w-4 h-4" />
            Adicionar Vendedor ao Time
          </Button>

          {/* Delete Team */}
          <Button 
            variant="outline" 
            className="w-full h-10 text-[13px] gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
            onClick={() => {
              if (confirm(`Tem certeza que deseja excluir o time "${team.name}"? Os vendedores serão desvinculados.`)) {
                handleDeleteTeam(team.id);
              }
            }}
          >
            <Trash2 className="w-4 h-4" />
            Excluir Time
          </Button>
        </main>
      </div>
    );
  }

  // Agent Detail View
  if (view === 'agent-detail' && selectedAgentId) {
    const agent = getAgentById(selectedAgentId);
    const currentTeam = agent?.teamId ? getTeamById(agent.teamId) : null;
    
    if (!agent) {
      setView('main');
      return null;
    }
    
    return (
      <div className="min-h-screen bg-background pb-6">
        <SubHeader 
          title={agent.name} 
          onBackClick={() => {
            if (selectedTeamId) {
              setView('team-detail');
            } else {
              setView('main');
            }
          }} 
        />
        <main className="container py-4 space-y-4">
          {/* Agent Info Card */}
          <div 
            className="bg-card rounded-xl p-4"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-xl ${agent.active ? 'bg-[#9B7CF4]' : 'bg-muted-foreground/40'} flex items-center justify-center`}>
                <UserCog className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-[16px] font-semibold text-foreground/90">{agent.name}</h3>
                <p className="text-[13px] text-muted-foreground/70">{agent.email}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg mb-3">
              <div>
                <p className="text-[13px] font-medium text-foreground/85">Status do Vendedor</p>
                <p className="text-[11px] text-muted-foreground/60">
                  {agent.active ? 'Recebendo leads' : 'Pausado'}
                </p>
              </div>
              <Switch 
                checked={agent.active} 
                onCheckedChange={() => handleToggleAgent(agent.id)}
              />
            </div>
            
            <div className="p-3 bg-secondary/30 rounded-lg">
              <p className="text-[12px] font-medium text-muted-foreground/70 uppercase tracking-wide mb-1">
                Time Atual
              </p>
              <p className="text-[14px] font-medium text-foreground/90">
                {currentTeam?.name || 'Sem time'}
              </p>
            </div>
          </div>

          {/* Change Team */}
          <Section title="Alterar Time">
            <SectionItem
              icon={Users}
              iconColor="bg-muted-foreground/40"
              label="Remover do time"
              sublabel="Deixar vendedor sem time"
              showArrow
              onClick={() => {
                handleChangeAgentTeam(agent.id, null);
                setView('main');
              }}
            />
            {teams.map(t => (
              <SectionItem
                key={t.id}
                icon={Users}
                iconColor={t.id === agent.teamId ? 'bg-[#4CAF50]' : 'bg-[#5B8DEF]'}
                label={t.name}
                sublabel={getManagerById(t.managerId)?.name}
                value={t.id === agent.teamId ? 'Atual' : ''}
                showArrow
                onClick={() => {
                  if (t.id !== agent.teamId) {
                    handleChangeAgentTeam(agent.id, t.id);
                    setView('main');
                  }
                }}
              />
            ))}
          </Section>
        </main>
      </div>
    );
  }

  // Manager Detail View
  if (view === 'manager-detail' && selectedManagerId) {
    const manager = getManagerById(selectedManagerId);
    const managerTeams = getManagerTeams(selectedManagerId);
    
    if (!manager) {
      setView('main');
      return null;
    }
    
    return (
      <div className="min-h-screen bg-background pb-6">
        <SubHeader title={manager.name} onBackClick={() => setView('main')} />
        <main className="container py-4 space-y-4">
          {/* Manager Info Card */}
          <div 
            className="bg-card rounded-xl p-4"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#5B8DEF] flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-[16px] font-semibold text-foreground/90">{manager.name}</h3>
                <p className="text-[13px] text-muted-foreground/70">{manager.email}</p>
              </div>
            </div>
          </div>

          {/* Manager Teams */}
          <Section title={`Times sob Gestão (${managerTeams.length})`}>
            {managerTeams.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <p className="text-[13px] text-muted-foreground/60">
                  Nenhum time sob gestão
                </p>
              </div>
            ) : (
              managerTeams.map(team => (
                <SectionItem
                  key={team.id}
                  icon={Users}
                  iconColor="bg-[#4CAF50]"
                  label={team.name}
                  value={`${getTeamAgents(team.id).length} vendedores`}
                  showArrow
                  onClick={() => {
                    setSelectedTeamId(team.id);
                    setView('team-detail');
                  }}
                />
              ))
            )}
          </Section>
        </main>
      </div>
    );
  }

  // Main View
  return (
    <div className="min-h-screen bg-background pb-6">
      <SubHeader title="Equipes & Hierarquias" onBackClick={onBack} />
      <main className="container py-4 space-y-4">
        {/* Times Section */}
        <Section title="Times">
          {teams.map(team => {
            const manager = getManagerById(team.managerId);
            const teamAgentsCount = getTeamAgents(team.id).length;
            
            return (
              <SectionItem
                key={team.id}
                icon={Users}
                iconColor="bg-[#4CAF50]"
                label={`${team.name} (${manager?.name || 'Sem gerente'})`}
                value={`${teamAgentsCount} vendedores`}
                showArrow
                onClick={() => {
                  setSelectedTeamId(team.id);
                  setView('team-detail');
                }}
              />
            );
          })}
        </Section>
        
        <Button 
          variant="outline" 
          className="w-full h-9 text-[13px] gap-2"
          onClick={() => setView('create-team')}
        >
          <Plus className="w-4 h-4" />
          Criar Novo Time
        </Button>

        {/* Gerentes Section */}
        <Section title="Gerentes">
          {managers.map(manager => {
            const managerTeamsCount = getManagerTeams(manager.id).length;
            
            return (
              <SectionItem
                key={manager.id}
                icon={Users}
                iconColor="bg-[#5B8DEF]"
                label={manager.name}
                value={`${managerTeamsCount} times`}
                showArrow
                onClick={() => {
                  setSelectedManagerId(manager.id);
                  setView('manager-detail');
                }}
              />
            );
          })}
        </Section>

        {/* Vendedores Section */}
        <Section title="Todos os Vendedores">
          {agents.map(agent => {
            const agentTeam = agent.teamId ? getTeamById(agent.teamId) : null;
            
            return (
              <SectionItem
                key={agent.id}
                icon={UserCog}
                iconColor={agent.active ? 'bg-[#9B7CF4]' : 'bg-muted-foreground/40'}
                label={agent.name}
                sublabel={agentTeam?.name || 'Sem time'}
                showArrow
                onClick={() => {
                  setSelectedTeamId(null);
                  setSelectedAgentId(agent.id);
                  setView('agent-detail');
                }}
                rightElement={
                  <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                    agent.active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                  }`}>
                    {agent.active ? 'Ativo' : 'Inativo'}
                  </span>
                }
              />
            );
          })}
        </Section>
      </main>
    </div>
  );
};
