# SALT CRM — Product Requirements Document (PRD)

**Versão:** 2.1  
**Data:** Fevereiro 2026  
**Autor:** Equipe SALT Digital  
**Status:** Em Desenvolvimento

---

## Sumário

1. [Visão Geral do Produto](#1-visão-geral-do-produto)
2. [Stack Tecnológica](#2-stack-tecnológica)
3. [Arquitetura do Sistema](#3-arquitetura-do-sistema)
4. [Modelo de Dados (34 Tabelas)](#4-modelo-de-dados-34-tabelas)
5. [Sistema de Autenticação e Permissões](#5-sistema-de-autenticação-e-permissões)
6. [API REST (Express)](#6-api-rest-express)
7. [Integração WhatsApp (UAZAPI)](#7-integração-whatsapp-uazapi)
8. [Realtime (Socket.io)](#8-realtime-socketio)
9. [Workflows de Automação (n8n)](#9-workflows-de-automação-n8n)
10. [Regras de Negócio](#10-regras-de-negócio)
11. [Plano de Execução](#11-plano-de-execução)

---

## 1. Visão Geral do Produto

### 1.1 O que é o SALT CRM

O SALT CRM é uma plataforma SaaS B2B de gestão comercial com foco em:

- **Gestão de Leads**: Captura, qualificação e acompanhamento de oportunidades comerciais
- **Funil de Vendas**: Visualização e movimentação de leads através de etapas configuráveis
- **Integração WhatsApp**: Comunicação centralizada via UAZAPI
- **Inteligência Artificial**: SDR automatizado, follow-up inteligente e qualificação de leads
- **Distribuição Automática (Roleta)**: Distribuição justa de leads entre vendedores
- **Multi-tenancy**: Múltiplas empresas no mesmo banco de dados com isolamento total

### 1.2 Princípio Central

**Interface única para todos os usuários** — Admin, Gerente e Vendedor acessam a mesma tela. O controle é feito via exposição de dados no backend, não por múltiplas interfaces.

### 1.3 Público-Alvo

Empresas com equipes comerciais de 3 a 50+ pessoas que precisam organizar o processo de vendas e centralizar a comunicação com clientes.

### 1.4 Planos Comerciais

| Plano | Preço Mensal | Preço Anual | Usuários | Principais Features |
|-------|--------------|-------------|----------|---------------------|
| **Essencial** | R$ 199 | R$ 150 | Até 3 | Dashboard, Funil, WhatsApp QR/API |
| **Profissional** | R$ 250 | R$ 199 | Até 7 | + Roleta de Leads |
| **Avançado** | R$ 350 | R$ 300 | Até 15 | + IA SDR, Follow-up, Insights |
| **Completo** | R$ 500 | R$ 450 | Ilimitado | + Campanhas, IA Ligação, NPS, Suporte Prioritário |

---

## 2. Stack Tecnológica

### 2.1 Frontend

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| React | 18.x | Framework de UI |
| TypeScript | 5.x | Tipagem estática |
| Vite | 5.x | Build tool |
| Tailwind CSS | 3.x | Estilização |
| shadcn/ui | - | Componentes UI |
| Zustand | 4.x | State management |
| React Query | 5.x | Cache e fetching |
| Socket.io-client | 4.x | Realtime |
| Axios | 1.x | HTTP client |
| Lovable | - | Plataforma de deploy |

### 2.2 Backend

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| Node.js | 20.x LTS | Runtime |
| Express | 4.x | Framework HTTP |
| TypeScript | 5.x | Tipagem estática |
| Prisma | 5.x | ORM |
| Socket.io | 4.x | Realtime/WebSockets |
| JWT | - | Autenticação |
| bcrypt | - | Hash de senhas |
| Zod | 3.x | Validação de schemas |
| Winston | - | Logging |
| node-cron | - | Jobs agendados |

### 2.3 Banco de Dados

| Tecnologia | Propósito |
|------------|-----------|
| Supabase PostgreSQL | Banco de dados (apenas storage, alta disponibilidade) |
| Redis (opcional) | Cache, sessões, filas |

### 2.4 Infraestrutura

| Componente | Hospedagem |
|------------|------------|
| Backend Node.js | VPS própria |
| Frontend React | Lovable |
| n8n | VPS própria (self-hosted) |
| Banco PostgreSQL | Supabase |

### 2.5 Integrações

| Serviço | Propósito |
|---------|-----------|
| UAZAPI | API de WhatsApp (envio/recebimento de mensagens) |
| OpenAI GPT-4o-mini | IA para qualificação e respostas |
| Anthropic Claude | IA alternativa |
| Google Calendar API | Sincronização de agendamentos |

---

## 3. Arquitetura do Sistema

### 3.1 Diagrama de Alto Nível

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USUÁRIOS                                     │
│              (Admin / Gerente / Vendedor)                           │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      FRONTEND (Lovable)                              │
│         React + TypeScript + Tailwind + shadcn/ui                   │
│                                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │Dashboard │ │  Funil   │ │  Chat    │ │  Vendas  │ │ Relatórios│  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                    │                           │
                    │ HTTP (REST)               │ WebSocket
                    ▼                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    BACKEND NODE.JS (VPS)                            │
│              Express + Prisma + Socket.io + JWT                     │
│                                                                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │   Routes    │ │ Controllers │ │  Services   │ │ Middlewares │   │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘   │
│                                                                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │   Prisma    │ │  Socket.io  │ │    JWT      │ │    Zod      │   │
│  │    ORM      │ │  (Realtime) │ │   (Auth)    │ │ (Validação) │   │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
          │                                     │
          │ Prisma Client                       │ Webhooks
          ▼                                     ▼
┌──────────────────────────┐       ┌──────────────────────────┐
│   SUPABASE POSTGRESQL    │       │         n8n              │
│   (Apenas Banco)         │       │    (Self-hosted)         │
│                          │       │                          │
│  • 34 tabelas            │◄──────│  Webhooks                │
│  • Alta disponibilidade  │       │  Cron Jobs               │
│  • Backups automáticos   │       │  Integrações             │
│                          │       │                          │
└──────────────────────────┘       └──────────────────────────┘
                                               │
                               ┌───────────────┼───────────────┐
                               ▼               ▼               ▼
                    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
                    │    UAZAPI    │ │   OpenAI     │ │   Google     │
                    │  (WhatsApp)  │ │   (IA)       │ │  Calendar    │
                    └──────────────┘ └──────────────┘ └──────────────┘
```

### 3.2 Estrutura do Projeto Backend

```
salt-crm-backend/
├── prisma/
│   ├── schema.prisma          # Schema do banco
│   ├── migrations/            # Migrações
│   └── seed.ts               # Seed de dados
├── src/
│   ├── config/
│   │   ├── database.ts       # Conexão Prisma
│   │   ├── jwt.ts            # Configuração JWT
│   │   └── env.ts            # Variáveis de ambiente
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   ├── tenant.middleware.ts
│   │   ├── role.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── validation.middleware.ts
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   └── auth.schema.ts
│   │   ├── users/
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.routes.ts
│   │   │   └── users.schema.ts
│   │   ├── leads/
│   │   │   ├── leads.controller.ts
│   │   │   ├── leads.service.ts
│   │   │   ├── leads.routes.ts
│   │   │   └── leads.schema.ts
│   │   ├── conversations/
│   │   │   ├── conversations.controller.ts
│   │   │   ├── conversations.service.ts
│   │   │   ├── conversations.routes.ts
│   │   │   └── conversations.schema.ts
│   │   ├── messages/
│   │   │   ├── messages.controller.ts
│   │   │   ├── messages.service.ts
│   │   │   ├── messages.routes.ts
│   │   │   └── messages.schema.ts
│   │   ├── sales/
│   │   │   ├── sales.controller.ts
│   │   │   ├── sales.service.ts
│   │   │   ├── sales.routes.ts
│   │   │   └── sales.schema.ts
│   │   ├── funnels/
│   │   ├── teams/
│   │   ├── distribution/
│   │   ├── schedules/
│   │   ├── notifications/
│   │   └── webhooks/
│   ├── socket/
│   │   ├── socket.ts         # Setup Socket.io
│   │   ├── handlers/
│   │   │   ├── chat.handler.ts
│   │   │   ├── notification.handler.ts
│   │   │   └── lead.handler.ts
│   │   └── rooms.ts          # Gerenciamento de rooms
│   ├── utils/
│   │   ├── logger.ts
│   │   ├── errors.ts
│   │   ├── helpers.ts
│   │   └── phone.ts
│   ├── types/
│   │   ├── express.d.ts
│   │   └── index.ts
│   ├── app.ts                # Setup Express
│   └── server.ts             # Entry point
├── tests/
├── .env
├── .env.example
├── package.json
├── tsconfig.json
└── docker-compose.yml
```

### 3.3 Separação de Responsabilidades

| Camada | Responsabilidade |
|--------|------------------|
| **Routes** | Definição de endpoints, aplicação de middlewares |
| **Controllers** | Receber request, chamar service, retornar response |
| **Services** | Lógica de negócio, interação com Prisma |
| **Middlewares** | Auth, validação, tratamento de erros, tenant isolation |
| **Socket Handlers** | Eventos realtime (chat, notificações) |

### 3.4 Fluxo de Request

```
Request HTTP
    │
    ▼
┌─────────────────┐
│  Express App    │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│  Error Handler  │ ◄── Captura erros globais
└─────────────────┘
    │
    ▼
┌─────────────────┐
│  Auth Middleware│ ◄── Valida JWT, extrai user
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Tenant Middleware│ ◄── Injeta tenantId no request
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Role Middleware │ ◄── Verifica permissão do role
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Validation Mid. │ ◄── Valida body/params com Zod
└─────────────────┘
    │
    ▼
┌─────────────────┐
│   Controller    │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│    Service      │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│  Prisma Client  │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│   PostgreSQL    │
└─────────────────┘
```

---

## 4. Modelo de Dados (34 Tabelas)

### 4.1 Visão Geral

O schema completo está definido em `prisma/schema.prisma` com 34 models:

**Core - Multi-tenancy (6)**
- `Plan` - Planos comerciais
- `Tenant` - Empresas clientes
- `SuperAdminUser` - Equipe SALT
- `TenantFeatureOverride` - Overrides de features
- `Team` - Equipes
- `User` - Usuários do sistema

**Leads e Funil (8)**
- `LeadOrigin` - Origens de leads
- `Funnel` - Funis
- `FunnelStage` - Etapas do funil
- `LossReason` - Motivos de perda
- `Lead` - Leads (tabela principal)
- `LeadStageHistory` - Histórico de mudança de etapa
- `LeadHistory` - Timeline completa
- `Tag` / `LeadTag` - Sistema de tags

**Comunicação - WhatsApp (3)**
- `WhatsappConnection` - Conexões UAZAPI
- `Conversation` - Conversas
- `Message` - Mensagens

**Vendas e Pós-venda (4)**
- `Product` - Produtos/Serviços
- `Sale` - Vendas
- `Schedule` - Agendamentos
- `NpsSurvey` - Pesquisas NPS

**Distribuição (2)**
- `DistributionRule` - Regras de roleta
- `DistributionLog` - Log de distribuições

**IA (2)**
- `AiPrompt` - Prompts configuráveis
- `AiInteractionLog` - Logs de interação

**Automação e Métricas (3)**
- `AutomationLog` - Logs do n8n
- `SlaMetric` - Métricas de SLA
- `DashboardMetricDaily` - Métricas agregadas

**Configurações e Suporte (6)**
- `TenantSettings` - Configurações
- `TenantOnboarding` - Checklist de onboarding
- `Notification` - Notificações
- `SupportTicket` - Tickets de suporte
- `CriticalAlert` - Alertas críticos

### 4.2 Principais Tabelas (Detalhamento)

#### User

```prisma
model User {
  id                String    @id @default(uuid())
  tenantId          String    @map("tenant_id")
  email             String
  password          String    // bcrypt hash
  name              String
  phone             String?
  avatarUrl         String?
  
  role              UserRole  @default(agent) // admin, manager, agent
  teamId            String?
  managerId         String?
  
  weight            Int       @default(1)      // peso na roleta
  receivesLeads     Boolean   @default(true)   // participa da roleta
  maxLeadsPerDay    Int?                       // limite diário
  
  workingHoursStart String?   @default("08:00")
  workingHoursEnd   String?   @default("18:00")
  workingDays       Int[]     @default([1,2,3,4,5])
  
  isActive          Boolean   @default(true)
  refreshToken      String?   // para refresh de JWT
  
  // ... relations
}
```

#### Lead

```prisma
model Lead {
  id                    String          @id @default(uuid())
  tenantId              String
  
  // Dados pessoais
  name                  String
  phone                 String          // obrigatório, único por tenant
  email                 String?
  document              String?         // CPF/CNPJ
  
  // Endereço completo
  city                  String?
  state                 String?
  // ... outros campos de endereço
  
  // Origem e UTM
  originId              String?
  utmSource             String?
  utmMedium             String?
  utmCampaign           String?
  
  // Funil
  funnelId              String
  stageId               String
  temperature           LeadTemperature @default(cold) // cold, warm, hot
  
  // Atribuição
  assignedToId          String?
  teamId                String?
  
  // Qualificação IA
  qualifiedByAi         Boolean         @default(false)
  aiQualificationScore  Decimal?        // 0.00 a 1.00
  
  // Métricas
  firstResponseAt       DateTime?
  responseTimeSeconds   Int?
  lastInteractionAt     DateTime?
  interactionCount      Int             @default(0)
  
  // Conversão/Perda
  convertedToClientAt   DateTime?
  lossReasonId          String?
  
  customFields          Json?           @default("{}")
}
```

#### Conversation

```prisma
model Conversation {
  id                    String             @id @default(uuid())
  tenantId              String
  leadId                String?            // pode existir sem lead vinculado
  whatsappConnectionId  String?
  
  contactPhone          String
  contactName           String?
  
  status                ConversationStatus @default(ai_handling)
  // ai_handling = IA respondendo
  // manual = humano assumiu
  // waiting = aguardando cliente
  // closed = encerrada
  
  assignedToId          String?
  unreadCount           Int                @default(0)
  lastMessageAt         DateTime?
  lastMessagePreview    String?
  
  isPinned              Boolean            @default(false)
  aiContext             Json?              // contexto para IA
}
```

#### Sale

```prisma
model Sale {
  id                  String           @id @default(uuid())
  tenantId            String
  leadId              String?
  
  // Responsáveis
  agentId             String           // vendedor que registrou
  managerId           String?          // gerente responsável
  
  // Dados do cliente (snapshot)
  clientName          String
  clientDocument      String?
  clientPhone         String?
  clientEmail         String?
  
  // Produto
  productId           String?
  productName         String
  
  // Valores
  saleValue           Decimal
  discountValue       Decimal?         @default(0)
  finalValue          Decimal          // calculado
  
  // Pagamento
  paymentMethod       PaymentMethod
  paymentCondition    PaymentCondition @default(cash)
  installments        Int?             @default(1)
  
  // Validação hierárquica
  status              SaleStatus       @default(pending_manager)
  // pending_manager → pending_admin → validated | rejected
  managerValidatedAt  DateTime?
  managerComment      String?
  adminViewedAt       DateTime?
}
```

---

## 5. Sistema de Autenticação e Permissões

### 5.1 Fluxo de Autenticação (JWT)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        LOGIN                                         │
└─────────────────────────────────────────────────────────────────────┘
                                │
                    POST /api/auth/login
                    { email, password }
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│  1. Buscar usuário por email                                        │
│  2. Verificar senha com bcrypt                                      │
│  3. Gerar access_token (15min) e refresh_token (7d)                │
│  4. Salvar refresh_token no banco                                   │
│  5. Retornar tokens + user data                                     │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Response:                                                          │
│  {                                                                  │
│    "access_token": "eyJ...",                                       │
│    "refresh_token": "eyJ...",                                      │
│    "user": { id, name, email, role, tenantId, ... }                │
│  }                                                                  │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.2 Estrutura do JWT

**Access Token (15 minutos)**:
```json
{
  "sub": "user-uuid",
  "email": "usuario@empresa.com",
  "role": "agent",
  "tenantId": "tenant-uuid",
  "iat": 1234567890,
  "exp": 1234568790
}
```

**Refresh Token (7 dias)**:
```json
{
  "sub": "user-uuid",
  "type": "refresh",
  "iat": 1234567890,
  "exp": 1235172690
}
```

### 5.3 Middleware de Autenticação

```typescript
// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '@/config/database';

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tenantId: true,
        teamId: true,
        isActive: true,
      },
    });
    
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Usuário inativo' });
    }
    
    req.user = user;
    req.tenantId = user.tenantId;
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}
```

### 5.4 Middleware de Role

```typescript
// src/middlewares/role.middleware.ts
import { UserRole } from '@prisma/client';

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Sem permissão' });
    }
    
    next();
  };
}

// Uso nas rotas:
router.delete('/users/:id', requireRole('admin'), deleteUser);
router.post('/sales/:id/validate', requireRole('admin', 'manager'), validateSale);
```

### 5.5 Middleware de Tenant Isolation

```typescript
// src/middlewares/tenant.middleware.ts
export function tenantMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // tenantId já foi setado pelo authMiddleware
  if (!req.tenantId) {
    return res.status(400).json({ error: 'Tenant não identificado' });
  }
  
  // Injeta filtro de tenant em todas as queries
  // Isso é feito no Prisma via middleware ou extension
  next();
}
```

### 5.6 Hierarquia de Permissões

```
┌─────────────────────────────────────────────────────────────────────┐
│                      SUPER ADMIN (SALT)                             │
│                                                                     │
│  MASTER: Acesso total (financeiro, planos, tenants)                │
│  OPERATIONAL: Suporte técnico (sem financeiro)                     │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      TENANT (Empresa)                               │
│                                                                     │
│  ADMIN                                                              │
│  ├── Acesso total ao tenant                                        │
│  ├── CRUD usuários e equipes                                       │
│  ├── Configurações, funis, roleta                                  │
│  └── Validação final de vendas                                     │
│                                                                     │
│  MANAGER                                                            │
│  ├── Acesso aos dados da sua equipe                                │
│  ├── Validação 1º nível de vendas                                  │
│  ├── Transferir leads dentro da equipe                             │
│  └── Métricas da equipe                                            │
│                                                                     │
│  AGENT                                                              │
│  ├── Acesso aos próprios leads/conversas                           │
│  ├── Registrar vendas (sem validar)                                │
│  ├── Criar agendamentos                                            │
│  └── Adicionar observações                                         │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.7 Filtros por Role nos Services

```typescript
// src/modules/leads/leads.service.ts
export class LeadsService {
  async findAll(user: AuthUser, filters: LeadFilters) {
    const where: Prisma.LeadWhereInput = {
      tenantId: user.tenantId, // sempre filtrar por tenant
    };
    
    // Filtrar por role
    if (user.role === 'agent') {
      // Agent vê apenas seus leads
      where.assignedToId = user.id;
    } else if (user.role === 'manager') {
      // Manager vê leads da sua equipe
      where.OR = [
        { assignedToId: user.id },
        { team: { managerId: user.id } },
      ];
    }
    // Admin vê todos do tenant (sem filtro adicional)
    
    return prisma.lead.findMany({
      where,
      include: {
        origin: true,
        stage: true,
        assignedTo: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
```

---

## 6. API REST (Express)

### 6.1 Estrutura de Endpoints

**Base URL**: `https://api.saltcrm.com.br/api/v1`

**Autenticação**: Bearer Token no header `Authorization`

### 6.2 Módulo Auth

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/auth/login` | Login com email/senha | ❌ |
| POST | `/auth/refresh` | Renovar access token | ❌ |
| POST | `/auth/logout` | Logout (invalida refresh) | ✅ |
| GET | `/auth/me` | Dados do usuário logado | ✅ |
| PUT | `/auth/password` | Alterar senha | ✅ |

**POST /auth/login**
```json
// Request
{
  "email": "usuario@empresa.com",
  "password": "senha123"
}

// Response 200
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "expires_in": 900,
  "user": {
    "id": "uuid",
    "email": "usuario@empresa.com",
    "name": "João Silva",
    "role": "agent",
    "tenantId": "uuid",
    "tenant": {
      "id": "uuid",
      "name": "Empresa X",
      "slug": "empresa-x"
    }
  }
}
```

### 6.3 Módulo Users

| Método | Endpoint | Descrição | Role |
|--------|----------|-----------|------|
| GET | `/users` | Listar usuários | admin |
| GET | `/users/:id` | Buscar usuário | admin |
| POST | `/users` | Criar usuário | admin |
| PUT | `/users/:id` | Atualizar usuário | admin |
| DELETE | `/users/:id` | Desativar usuário | admin |

### 6.4 Módulo Leads

| Método | Endpoint | Descrição | Role |
|--------|----------|-----------|------|
| GET | `/leads` | Listar leads | all |
| GET | `/leads/:id` | Buscar lead | all |
| POST | `/leads` | Criar lead | all |
| PUT | `/leads/:id` | Atualizar lead | all |
| PUT | `/leads/:id/stage` | Mover no funil | all |
| PUT | `/leads/:id/assign` | Atribuir a usuário | admin, manager |
| PUT | `/leads/:id/transfer` | Transferir | admin, manager |
| GET | `/leads/:id/history` | Timeline do lead | all |
| POST | `/leads/:id/history` | Adicionar observação | all |

**GET /leads**
```json
// Query params
?page=1
&limit=20
&search=maria
&stageId=uuid
&assignedToId=uuid
&temperature=hot
&originId=uuid
&startDate=2026-01-01
&endDate=2026-01-31

// Response 200
{
  "data": [
    {
      "id": "uuid",
      "name": "Maria Santos",
      "phone": "11999999999",
      "email": "maria@email.com",
      "temperature": "hot",
      "origin": { "id": "uuid", "name": "Google Ads", "color": "#4285F4" },
      "stage": { "id": "uuid", "name": "Qualificado", "color": "#4FC3B5" },
      "assignedTo": { "id": "uuid", "name": "João", "avatarUrl": null },
      "interactionCount": 5,
      "lastInteractionAt": "2026-02-08T10:30:00Z",
      "createdAt": "2026-02-01T09:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

**PUT /leads/:id/stage**
```json
// Request
{
  "stageId": "uuid-nova-etapa",
  "notes": "Cliente confirmou interesse"
}

// Response 200
{
  "id": "uuid",
  "stageId": "uuid-nova-etapa",
  "stage": { "id": "uuid", "name": "Em Negociação", "color": "#F4C95D" },
  "updatedAt": "2026-02-08T15:00:00Z"
}
```

### 6.5 Módulo Conversations

| Método | Endpoint | Descrição | Role |
|--------|----------|-----------|------|
| GET | `/conversations` | Listar conversas | all |
| GET | `/conversations/:id` | Buscar conversa | all |
| PUT | `/conversations/:id/status` | Alterar status | all |
| PUT | `/conversations/:id/assign` | Atribuir | admin, manager |
| PUT | `/conversations/:id/pin` | Fixar/Desfixar | all |
| PUT | `/conversations/:id/read` | Marcar como lida | all |

### 6.6 Módulo Messages

| Método | Endpoint | Descrição | Role |
|--------|----------|-----------|------|
| GET | `/conversations/:id/messages` | Listar mensagens | all |
| POST | `/conversations/:id/messages` | Enviar mensagem | all |

**POST /conversations/:id/messages**
```json
// Request
{
  "content": "Olá! Como posso ajudar?",
  "contentType": "text"
}

// Request (mídia)
{
  "content": "Segue a proposta",
  "contentType": "document",
  "mediaUrl": "https://storage.saltcrm.com/proposta.pdf"
}

// Response 201
{
  "id": "uuid",
  "conversationId": "uuid",
  "direction": "outbound",
  "senderType": "agent",
  "senderId": "uuid",
  "senderName": "João",
  "contentType": "text",
  "content": "Olá! Como posso ajudar?",
  "status": "pending",
  "createdAt": "2026-02-08T15:30:00Z"
}
```

### 6.7 Módulo Sales

| Método | Endpoint | Descrição | Role |
|--------|----------|-----------|------|
| GET | `/sales` | Listar vendas | all |
| GET | `/sales/:id` | Buscar venda | all |
| POST | `/sales` | Registrar venda | all |
| PUT | `/sales/:id/validate` | Validar (gerente) | manager, admin |
| PUT | `/sales/:id/approve` | Aprovar (admin) | admin |
| PUT | `/sales/:id/reject` | Rejeitar | manager, admin |

**POST /sales**
```json
// Request
{
  "leadId": "uuid",
  "clientName": "Maria Santos",
  "clientDocument": "12345678900",
  "clientDocumentType": "cpf",
  "clientPhone": "11999999999",
  "productName": "Plano Premium",
  "productCode": "PREM-001",
  "saleValue": 1500.00,
  "discountValue": 100.00,
  "paymentMethod": "credit_card",
  "paymentCondition": "installment",
  "installments": 3,
  "observations": "Cliente optou pelo parcelamento"
}

// Response 201
{
  "id": "uuid",
  "status": "pending_manager",
  "finalValue": 1400.00,
  "createdAt": "2026-02-08T16:00:00Z"
}
```

### 6.8 Módulo Funnels

| Método | Endpoint | Descrição | Role |
|--------|----------|-----------|------|
| GET | `/funnels` | Listar funis | all |
| GET | `/funnels/:id` | Buscar funil com etapas | all |
| POST | `/funnels` | Criar funil | admin |
| PUT | `/funnels/:id` | Atualizar funil | admin |
| POST | `/funnels/:id/stages` | Adicionar etapa | admin |
| PUT | `/funnels/:id/stages/:stageId` | Atualizar etapa | admin |
| PUT | `/funnels/:id/stages/reorder` | Reordenar etapas | admin |

### 6.9 Módulo Webhooks (n8n)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/webhooks/leads/:webhookKey` | Receber lead externo | API Key |
| POST | `/webhooks/uazapi` | Webhook UAZAPI | API Key |
| POST | `/webhooks/uazapi/status` | Status de mensagem | API Key |

---

## 7. Integração WhatsApp (UAZAPI)

### 7.1 Visão Geral

A integração com WhatsApp é feita através da UAZAPI, que fornece:
- Conexão via QR Code ou API oficial
- Envio e recebimento de mensagens
- Suporte a múltiplos tipos de mídia
- Webhooks para eventos em tempo real

### 7.2 Configuração

```typescript
// src/services/uazapi.service.ts
import axios from 'axios';

const uazapi = axios.create({
  baseURL: process.env.UAZAPI_BASE_URL,
  headers: {
    'Authorization': `Bearer ${process.env.UAZAPI_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

export class UazapiService {
  // Criar instância
  async createInstance(tenantId: string) {
    const response = await uazapi.post('/instance/create', {
      instanceName: `salt-${tenantId}`,
      webhookUrl: `${process.env.API_URL}/webhooks/uazapi`,
      webhookEvents: ['messages.upsert', 'connection.update', 'message.status'],
    });
    return response.data;
  }
  
  // Enviar mensagem de texto
  async sendTextMessage(instanceId: string, phone: string, text: string) {
    const response = await uazapi.post('/message/send', {
      instanceId,
      number: this.formatPhone(phone),
      type: 'text',
      content: text,
    });
    return response.data;
  }
  
  // Enviar mídia
  async sendMediaMessage(
    instanceId: string,
    phone: string,
    type: 'image' | 'document' | 'audio' | 'video',
    url: string,
    caption?: string
  ) {
    const response = await uazapi.post('/message/send', {
      instanceId,
      number: this.formatPhone(phone),
      type,
      content: { url, caption },
    });
    return response.data;
  }
  
  private formatPhone(phone: string): string {
    // Remove caracteres não numéricos
    const numbers = phone.replace(/\D/g, '');
    // Adiciona código do país se necessário
    if (!numbers.startsWith('55')) {
      return `55${numbers}`;
    }
    return numbers;
  }
}
```

### 7.3 Webhook de Mensagem Recebida

```typescript
// src/modules/webhooks/webhooks.controller.ts
export class WebhooksController {
  async handleUazapiWebhook(req: Request, res: Response) {
    const { event, instanceId, data } = req.body;
    
    switch (event) {
      case 'messages.upsert':
        await this.handleIncomingMessage(instanceId, data);
        break;
      case 'connection.update':
        await this.handleConnectionUpdate(instanceId, data);
        break;
      case 'message.status':
        await this.handleMessageStatus(instanceId, data);
        break;
    }
    
    res.status(200).json({ received: true });
  }
  
  private async handleIncomingMessage(instanceId: string, data: any) {
    // 1. Buscar conexão WhatsApp
    const connection = await prisma.whatsappConnection.findUnique({
      where: { instanceId },
      include: { tenant: true },
    });
    
    if (!connection) return;
    
    const phone = data.key.remoteJid.replace('@s.whatsapp.net', '');
    const content = data.message.conversation || data.message.extendedTextMessage?.text;
    
    // 2. Buscar ou criar conversa
    let conversation = await prisma.conversation.findFirst({
      where: {
        tenantId: connection.tenantId,
        contactPhone: phone,
      },
    });
    
    if (!conversation) {
      // Buscar lead por telefone
      const lead = await prisma.lead.findFirst({
        where: { tenantId: connection.tenantId, phone },
      });
      
      conversation = await prisma.conversation.create({
        data: {
          tenantId: connection.tenantId,
          leadId: lead?.id,
          whatsappConnectionId: connection.id,
          contactPhone: phone,
          contactName: data.pushName,
          status: 'ai_handling', // ou 'manual' conforme config
        },
      });
    }
    
    // 3. Salvar mensagem
    const message = await prisma.message.create({
      data: {
        tenantId: connection.tenantId,
        conversationId: conversation.id,
        externalId: data.key.id,
        direction: 'inbound',
        senderType: 'client',
        senderName: data.pushName,
        contentType: 'text',
        content,
        status: 'delivered',
      },
    });
    
    // 4. Atualizar conversa
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageAt: new Date(),
        lastMessagePreview: content?.substring(0, 100),
        unreadCount: { increment: 1 },
      },
    });
    
    // 5. Emitir evento Socket.io
    io.to(`tenant:${connection.tenantId}`).emit('message:new', {
      conversation,
      message,
    });
    
    // 6. Se IA habilitada, processar
    if (conversation.status === 'ai_handling') {
      // Disparar para n8n processar com IA
      await this.triggerAiProcessing(conversation.id, message.id);
    }
  }
}
```

### 7.4 Fluxo Completo de Mensagem

```
┌─────────────────────────────────────────────────────────────────────┐
│  1. Cliente envia mensagem no WhatsApp                              │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│  2. UAZAPI recebe e envia webhook para backend                      │
│     POST /webhooks/uazapi                                           │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│  3. Backend processa:                                               │
│     - Identifica tenant pela instância                              │
│     - Busca/cria conversa                                           │
│     - Salva mensagem no banco                                       │
│     - Atualiza unreadCount                                          │
└─────────────────────────────────────────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
        ┌───────────────────────┐ ┌───────────────────────┐
        │  4a. Socket.io emit   │ │  4b. Se IA habilitada │
        │  "message:new"        │ │  Dispara n8n          │
        │                       │ │                       │
        │  Frontend atualiza    │ │  n8n processa com IA  │
        │  lista de conversas   │ │  e responde           │
        └───────────────────────┘ └───────────────────────┘
```

---

## 8. Realtime (Socket.io)

### 8.1 Setup

```typescript
// src/socket/socket.ts
import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';

export function setupSocket(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });
  
  // Middleware de autenticação
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Token não fornecido'));
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      const user = await prisma.user.findUnique({
        where: { id: decoded.sub },
      });
      
      if (!user || !user.isActive) {
        return next(new Error('Usuário inativo'));
      }
      
      socket.data.user = user;
      next();
    } catch (error) {
      next(new Error('Token inválido'));
    }
  });
  
  io.on('connection', (socket) => {
    const user = socket.data.user;
    
    // Entrar na room do tenant
    socket.join(`tenant:${user.tenantId}`);
    
    // Room pessoal do usuário
    socket.join(`user:${user.id}`);
    
    // Se for manager, entrar na room da equipe
    if (user.teamId) {
      socket.join(`team:${user.teamId}`);
    }
    
    console.log(`User ${user.id} connected`);
    
    // Handlers
    setupChatHandlers(socket, io);
    setupNotificationHandlers(socket, io);
    
    socket.on('disconnect', () => {
      console.log(`User ${user.id} disconnected`);
    });
  });
  
  return io;
}
```

### 8.2 Eventos do Chat

```typescript
// src/socket/handlers/chat.handler.ts
export function setupChatHandlers(socket: Socket, io: Server) {
  const user = socket.data.user;
  
  // Entrar em uma conversa
  socket.on('conversation:join', (conversationId: string) => {
    socket.join(`conversation:${conversationId}`);
  });
  
  // Sair de uma conversa
  socket.on('conversation:leave', (conversationId: string) => {
    socket.leave(`conversation:${conversationId}`);
  });
  
  // Indicador de digitação
  socket.on('conversation:typing', (conversationId: string) => {
    socket.to(`conversation:${conversationId}`).emit('conversation:typing', {
      conversationId,
      userId: user.id,
      userName: user.name,
    });
  });
  
  // Marcar como lida
  socket.on('conversation:read', async (conversationId: string) => {
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { unreadCount: 0 },
    });
    
    io.to(`tenant:${user.tenantId}`).emit('conversation:updated', {
      conversationId,
      unreadCount: 0,
    });
  });
}
```

### 8.3 Eventos Emitidos pelo Backend

| Evento | Payload | Descrição |
|--------|---------|-----------|
| `message:new` | `{ conversation, message }` | Nova mensagem recebida/enviada |
| `conversation:updated` | `{ conversationId, ...changes }` | Conversa atualizada |
| `conversation:typing` | `{ conversationId, userId, userName }` | Usuário digitando |
| `lead:created` | `{ lead }` | Novo lead |
| `lead:updated` | `{ leadId, ...changes }` | Lead atualizado |
| `lead:stage_changed` | `{ leadId, fromStage, toStage }` | Lead moveu no funil |
| `notification:new` | `{ notification }` | Nova notificação |
| `sale:created` | `{ sale }` | Nova venda |
| `sale:validated` | `{ saleId, status }` | Venda validada/rejeitada |

### 8.4 Uso no Frontend

```typescript
// Frontend - hooks/useSocket.ts
import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/auth';

let socket: Socket | null = null;

export function useSocket() {
  const { token } = useAuthStore();
  
  useEffect(() => {
    if (!token) return;
    
    socket = io(process.env.VITE_API_URL!, {
      auth: { token },
    });
    
    socket.on('connect', () => {
      console.log('Socket connected');
    });
    
    return () => {
      socket?.disconnect();
    };
  }, [token]);
  
  return socket;
}

// Uso em componente
function ConversationsList() {
  const socket = useSocket();
  const [conversations, setConversations] = useState([]);
  
  useEffect(() => {
    if (!socket) return;
    
    socket.on('message:new', ({ conversation, message }) => {
      // Atualizar lista de conversas
      setConversations(prev => {
        const updated = prev.map(c => 
          c.id === conversation.id 
            ? { ...c, lastMessageAt: message.createdAt, lastMessagePreview: message.content }
            : c
        );
        // Reordenar por última mensagem
        return updated.sort((a, b) => 
          new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
        );
      });
    });
    
    return () => {
      socket.off('message:new');
    };
  }, [socket]);
}
```

---

## 9. Workflows de Automação (n8n)

### 9.1 Visão Geral

O n8n continua responsável por automações assíncronas. A diferença é que agora ele se comunica com o backend Node.js via HTTP (não mais direto com Supabase).

### 9.2 Comunicação Backend ↔ n8n

**Backend → n8n** (Disparar workflow):
```typescript
// src/services/n8n.service.ts
export class N8nService {
  private webhookUrl = process.env.N8N_WEBHOOK_URL;
  
  async triggerDistribution(leadId: string, tenantId: string) {
    await axios.post(`${this.webhookUrl}/distribution`, {
      leadId,
      tenantId,
      timestamp: new Date().toISOString(),
    });
  }
  
  async triggerAiProcessing(conversationId: string, messageId: string) {
    await axios.post(`${this.webhookUrl}/ai-process`, {
      conversationId,
      messageId,
    });
  }
}
```

**n8n → Backend** (Chamar API):
```
HTTP Request Node:
- URL: https://api.saltcrm.com.br/api/v1/internal/...
- Headers: X-API-Key: {internal_api_key}
```

### 9.3 Lista de Workflows

| ID | Nome | Trigger | Descrição |
|----|------|---------|-----------|
| WF-01 | Lead Entry | HTTP POST | Recebe leads externos |
| WF-02 | Distribution | Webhook interno | Distribui leads |
| WF-03 | AI Processing | Webhook interno | Processa mensagem com IA |
| WF-04 | Auto Follow-up | Cron (1h) | Follow-ups automáticos |
| WF-05 | NPS Trigger | Cron/Webhook | Dispara pesquisa NPS |
| WF-06 | SLA Monitor | Cron (15min) | Monitora SLA |
| WF-07 | Metrics Aggregation | Cron (00:00) | Agrega métricas |
| WF-08 | WhatsApp Monitor | Cron (5min) | Monitora conexões |

---

## 10. Regras de Negócio

### 10.1 Leads

**Criação**:
- Telefone é obrigatório e único por tenant
- Deduplicação automática por telefone
- Lead inicia na etapa marcada como `isEntry = true`
- Temperatura inicial é `cold`

**Movimentação no Funil**:
- Livre entre etapas não-exit
- Ao mover para etapa exit:
  - `won` → define `convertedToClientAt`
  - `lost` → exige `lossReasonId`
- Toda movimentação registra histórico

**Atribuição**:
- Pode ser atribuído a um usuário ou ficar sem dono
- Transferência registra em `distributionLogs`
- Admin pode transferir para qualquer usuário
- Manager só transfere dentro da sua equipe

### 10.2 Vendas

**Registro**:
- Apenas o vendedor atribuído ao lead pode registrar
- `finalValue` = `saleValue` - `discountValue`
- Status inicial: `pending_manager`

**Validação Hierárquica**:
```
pending_manager → (gerente valida) → pending_admin
pending_admin → (admin valida) → validated
Qualquer etapa → (rejeitar) → rejected
```

### 10.3 Distribuição (Roleta)

**Algoritmos**:
- `round_robin`: Rotativo simples
- `weighted`: Ponderado por peso do usuário
- `priority`: Por prioridade definida
- `manual`: Sem distribuição automática

**Filtros aplicados**:
- `isActive = true`
- `receivesLeads = true`
- Dentro do horário de trabalho (se configurado)
- Abaixo do limite diário (se configurado)

### 10.4 Conversas

**Status**:
- `ai_handling`: IA respondendo
- `manual`: Humano assumiu
- `waiting`: Aguardando cliente
- `closed`: Encerrada

**Transições**:
- IA pode transferir para humano
- Humano pode assumir a qualquer momento
- Inatividade move para `waiting`

---

## 11. Plano de Execução

### 11.1 Fase 1: Fundação (Semanas 1-2)

**Backend**:
- [ ] Setup projeto Node.js + Express + TypeScript
- [ ] Configurar Prisma e conectar ao Supabase
- [ ] Implementar módulo Auth (login, JWT, refresh)
- [ ] Implementar middlewares (auth, tenant, role, validation)
- [ ] CRUD básico de Users

**Frontend**:
- [ ] Configurar Axios com interceptors
- [ ] Implementar AuthProvider
- [ ] Configurar React Query
- [ ] Tela de Login

### 11.2 Fase 2: Core (Semanas 3-5)

**Backend**:
- [ ] CRUD Leads com filtros por role
- [ ] CRUD Funnels e Stages
- [ ] Módulo Conversations e Messages
- [ ] Setup Socket.io
- [ ] Integração UAZAPI (envio/recebimento)

**Frontend**:
- [ ] Dashboard com dados reais
- [ ] Funil visual (drag-and-drop)
- [ ] Lista de conversas
- [ ] Chat em tempo real

### 11.3 Fase 3: Vendas e Automação (Semanas 6-7)

**Backend**:
- [ ] CRUD Sales com validação hierárquica
- [ ] CRUD Schedules
- [ ] Módulo Distribution (roleta)
- [ ] Endpoints internos para n8n

**n8n**:
- [ ] WF-01: Lead Entry
- [ ] WF-02: Distribution
- [ ] WF-03: AI Processing

### 11.4 Fase 4: Polish (Semanas 8-9)

**Backend**:
- [ ] Módulo Notifications
- [ ] Métricas e Dashboard
- [ ] NPS automático
- [ ] Endpoints Super Admin

**Frontend**:
- [ ] Relatórios e métricas
- [ ] Configurações do tenant
- [ ] Painel Super Admin

---

## Apêndice A: Variáveis de Ambiente

```env
# Server
PORT=3000
NODE_ENV=production
API_URL=https://api.saltcrm.com.br
FRONTEND_URL=https://app.saltcrm.com.br

# Database (Supabase)
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# UAZAPI
UAZAPI_BASE_URL=https://api.uazapi.com
UAZAPI_API_KEY=your-uazapi-key

# OpenAI
OPENAI_API_KEY=sk-your-key

# n8n
N8N_WEBHOOK_URL=https://n8n.saltcrm.com.br/webhook

# Internal API (n8n → Backend)
INTERNAL_API_KEY=your-internal-key
```

---

## Apêndice B: Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor com hot reload
npm run build            # Compila TypeScript
npm run start            # Inicia servidor de produção

# Prisma
npx prisma generate      # Gera Prisma Client
npx prisma migrate dev   # Cria migração
npx prisma migrate deploy # Aplica migrações
npx prisma db seed       # Executa seed
npx prisma studio        # Abre interface visual

# Docker
docker-compose up -d     # Inicia containers
docker-compose logs -f   # Ver logs
```

---

**Fim do Documento**

*SALT CRM PRD v2.1 — Fevereiro 2026*
