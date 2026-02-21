-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('active', 'suspended', 'cancelled');

-- CreateEnum
CREATE TYPE "TenantLifecycleStatus" AS ENUM ('onboarding', 'active', 'risk', 'overdue', 'suspended', 'cancelled');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('on_time', 'overdue');

-- CreateEnum
CREATE TYPE "BillingPeriodicity" AS ENUM ('monthly', 'annual');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'manager', 'agent');

-- CreateEnum
CREATE TYPE "SuperAdminRole" AS ENUM ('master', 'operational');

-- CreateEnum
CREATE TYPE "LeadTemperature" AS ENUM ('cold', 'warm', 'hot');

-- CreateEnum
CREATE TYPE "LeadOriginType" AS ENUM ('paid', 'organic', 'referral', 'manual', 'api');

-- CreateEnum
CREATE TYPE "FunnelType" AS ENUM ('sales', 'prospecting', 'portfolio');

-- CreateEnum
CREATE TYPE "ExitType" AS ENUM ('won', 'lost', 'archived', 'out_of_profile', 'no_response');

-- CreateEnum
CREATE TYPE "ConversationStatus" AS ENUM ('ai_handling', 'manual', 'waiting', 'closed');

-- CreateEnum
CREATE TYPE "MessageDirection" AS ENUM ('inbound', 'outbound');

-- CreateEnum
CREATE TYPE "MessageSenderType" AS ENUM ('client', 'agent', 'ai', 'system');

-- CreateEnum
CREATE TYPE "MessageContentType" AS ENUM ('text', 'image', 'audio', 'video', 'document', 'location', 'contact', 'sticker');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('pending', 'sent', 'delivered', 'read', 'failed');

-- CreateEnum
CREATE TYPE "WhatsappType" AS ENUM ('business', 'api');

-- CreateEnum
CREATE TYPE "WhatsappStatus" AS ENUM ('connected', 'disconnected', 'pending', 'banned');

-- CreateEnum
CREATE TYPE "ScheduleType" AS ENUM ('meeting', 'visit', 'call', 'return', 'other');

-- CreateEnum
CREATE TYPE "ScheduleStatus" AS ENUM ('confirmed', 'tentative', 'cancelled', 'completed');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('cpf', 'cnpj');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('pix', 'credit_card', 'debit_card', 'boleto', 'transfer', 'cash');

-- CreateEnum
CREATE TYPE "PaymentCondition" AS ENUM ('cash', 'installment');

-- CreateEnum
CREATE TYPE "SaleStatus" AS ENUM ('pending_manager', 'pending_admin', 'validated', 'rejected');

-- CreateEnum
CREATE TYPE "NpsChannel" AS ENUM ('whatsapp', 'email', 'sms');

-- CreateEnum
CREATE TYPE "NpsClassification" AS ENUM ('promoter', 'passive', 'detractor');

-- CreateEnum
CREATE TYPE "DistributionType" AS ENUM ('round_robin', 'weighted', 'priority', 'manual');

-- CreateEnum
CREATE TYPE "DistributionLogType" AS ENUM ('automatic', 'manual', 'transfer');

-- CreateEnum
CREATE TYPE "AiPromptType" AS ENUM ('sdr', 'followup', 'nps', 'qualification', 'objection');

-- CreateEnum
CREATE TYPE "AiInteractionType" AS ENUM ('qualification', 'response', 'followup', 'nps');

-- CreateEnum
CREATE TYPE "AutomationTriggerType" AS ENUM ('webhook', 'schedule', 'manual', 'event');

-- CreateEnum
CREATE TYPE "AutomationStatus" AS ENUM ('started', 'success', 'failed', 'timeout');

-- CreateEnum
CREATE TYPE "SlaMetricType" AS ENUM ('first_response', 'stage_time', 'followup', 'resolution');

-- CreateEnum
CREATE TYPE "LeadHistoryEventType" AS ENUM ('observation', 'schedule_created', 'schedule_completed', 'schedule_cancelled', 'status_change', 'temperature_change', 'transfer', 'sale_registered', 'contact_attempt', 'message_sent', 'message_received', 'ai_interaction', 'assignment');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('info', 'success', 'warning', 'error');

-- CreateEnum
CREATE TYPE "NotificationCategory" AS ENUM ('message', 'team_message', 'operational', 'institutional', 'sale');

-- CreateEnum
CREATE TYPE "SupportType" AS ENUM ('whatsapp', 'funnel', 'ai', 'billing', 'technical', 'other');

-- CreateEnum
CREATE TYPE "SupportPriority" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateEnum
CREATE TYPE "SupportStatus" AS ENUM ('open', 'in_progress', 'resolved');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('error', 'warning', 'connection');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('pending', 'resolved');

-- CreateEnum
CREATE TYPE "TagEntityType" AS ENUM ('lead', 'conversation', 'sale');

-- CreateTable
CREATE TABLE "plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "description" TEXT,
    "price_per_user_monthly" DECIMAL(10,2) NOT NULL,
    "price_per_user_annual" DECIMAL(10,2) NOT NULL,
    "base_users" INTEGER NOT NULL DEFAULT 3,
    "max_users" INTEGER,
    "features" JSONB NOT NULL DEFAULT '{}',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "document" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "logo_url" TEXT,
    "primary_color" TEXT DEFAULT '#007AFF',
    "plan_id" TEXT,
    "billing_periodicity" "BillingPeriodicity" NOT NULL DEFAULT 'monthly',
    "monthly_value" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "users_limit" INTEGER NOT NULL DEFAULT 3,
    "status" "TenantStatus" NOT NULL DEFAULT 'active',
    "lifecycle_status" "TenantLifecycleStatus" NOT NULL DEFAULT 'onboarding',
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'on_time',
    "last_payment_at" TIMESTAMP(3),
    "next_due_date" DATE,
    "suspended_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "segment" TEXT,
    "sales_origin" TEXT,
    "internal_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "super_admin_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "role" "SuperAdminRole" NOT NULL DEFAULT 'operational',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "super_admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_feature_overrides" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "feature_key" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "enabled_by" TEXT,
    "enabled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "tenant_feature_overrides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "manager_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "avatar_url" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'agent',
    "team_id" TEXT,
    "manager_id" TEXT,
    "weight" INTEGER NOT NULL DEFAULT 1,
    "receives_leads" BOOLEAN NOT NULL DEFAULT true,
    "max_leads_per_day" INTEGER,
    "working_hours_start" TEXT DEFAULT '08:00',
    "working_hours_end" TEXT DEFAULT '18:00',
    "working_days" INTEGER[] DEFAULT ARRAY[1, 2, 3, 4, 5]::INTEGER[],
    "timezone" TEXT DEFAULT 'America/Sao_Paulo',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "refresh_token" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_origins" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "LeadOriginType" NOT NULL DEFAULT 'manual',
    "color" TEXT DEFAULT '#6B7280',
    "icon" TEXT,
    "webhook_key" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lead_origins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funnels" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "FunnelType" NOT NULL DEFAULT 'sales',
    "description" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "funnels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funnel_stages" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "funnel_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6B7280',
    "order_index" INTEGER NOT NULL,
    "is_entry" BOOLEAN NOT NULL DEFAULT false,
    "is_exit" BOOLEAN NOT NULL DEFAULT false,
    "exit_type" "ExitType",
    "sla_hours" INTEGER,
    "auto_followup_hours" INTEGER,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "funnel_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loss_reasons" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loss_reasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "document" TEXT,
    "document_type" "DocumentType",
    "city" TEXT,
    "state" TEXT,
    "country" TEXT DEFAULT 'BR',
    "address_street" TEXT,
    "address_number" TEXT,
    "address_complement" TEXT,
    "address_neighborhood" TEXT,
    "address_zipcode" TEXT,
    "origin_id" TEXT,
    "reference" TEXT,
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campaign" TEXT,
    "utm_content" TEXT,
    "utm_term" TEXT,
    "funnel_id" TEXT NOT NULL,
    "stage_id" TEXT NOT NULL,
    "temperature" "LeadTemperature" NOT NULL DEFAULT 'cold',
    "assigned_to" TEXT,
    "team_id" TEXT,
    "qualified_by_ai" BOOLEAN NOT NULL DEFAULT false,
    "ai_qualification_score" DECIMAL(3,2),
    "ai_qualification_reason" TEXT,
    "first_response_at" TIMESTAMP(3),
    "response_time_seconds" INTEGER,
    "last_interaction_at" TIMESTAMP(3),
    "interaction_count" INTEGER NOT NULL DEFAULT 0,
    "converted_to_client_at" TIMESTAMP(3),
    "loss_reason_id" TEXT,
    "loss_notes" TEXT,
    "custom_fields" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_stage_history" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "lead_id" TEXT NOT NULL,
    "from_stage_id" TEXT,
    "to_stage_id" TEXT NOT NULL,
    "changed_by" TEXT,
    "time_in_previous_stage_seconds" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lead_stage_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_history" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "lead_id" TEXT NOT NULL,
    "event_type" "LeadHistoryEventType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lead_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6B7280',
    "entity_type" "TagEntityType" NOT NULL DEFAULT 'lead',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_tags" (
    "lead_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lead_tags_pkey" PRIMARY KEY ("lead_id","tag_id")
);

-- CreateTable
CREATE TABLE "whatsapp_connections" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "instance_id" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "name" TEXT,
    "type" "WhatsappType" NOT NULL DEFAULT 'business',
    "status" "WhatsappStatus" NOT NULL DEFAULT 'pending',
    "qr_code" TEXT,
    "webhook_url" TEXT,
    "last_connected_at" TIMESTAMP(3),
    "last_disconnected_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "lead_id" TEXT,
    "whatsapp_connection_id" TEXT,
    "contact_phone" TEXT NOT NULL,
    "contact_name" TEXT,
    "status" "ConversationStatus" NOT NULL DEFAULT 'ai_handling',
    "assigned_to" TEXT,
    "unread_count" INTEGER NOT NULL DEFAULT 0,
    "last_message_at" TIMESTAMP(3),
    "last_message_preview" TEXT,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "pin_reason" TEXT,
    "pin_expires_at" TIMESTAMP(3),
    "pinned_by" TEXT,
    "pinned_at" TIMESTAMP(3),
    "ai_context" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "external_id" TEXT,
    "direction" "MessageDirection" NOT NULL,
    "sender_type" "MessageSenderType" NOT NULL,
    "sender_id" TEXT,
    "sender_name" TEXT,
    "content_type" "MessageContentType" NOT NULL DEFAULT 'text',
    "content" TEXT,
    "media_url" TEXT,
    "media_mime_type" TEXT,
    "status" "MessageStatus" NOT NULL DEFAULT 'pending',
    "delivered_at" TIMESTAMP(3),
    "read_at" TIMESTAMP(3),
    "failed_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "code" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(12,2),
    "category" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "lead_id" TEXT,
    "agent_id" TEXT NOT NULL,
    "manager_id" TEXT,
    "client_name" TEXT NOT NULL,
    "client_document" TEXT,
    "client_document_type" "DocumentType",
    "client_phone" TEXT,
    "client_email" TEXT,
    "client_address" JSONB,
    "product_id" TEXT,
    "product_name" TEXT NOT NULL,
    "product_code" TEXT,
    "sale_value" DECIMAL(12,2) NOT NULL,
    "discount_value" DECIMAL(12,2) DEFAULT 0,
    "final_value" DECIMAL(12,2) NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL,
    "payment_condition" "PaymentCondition" NOT NULL DEFAULT 'cash',
    "installments" INTEGER DEFAULT 1,
    "sale_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "SaleStatus" NOT NULL DEFAULT 'pending_manager',
    "manager_validated_at" TIMESTAMP(3),
    "manager_rejected_at" TIMESTAMP(3),
    "manager_comment" TEXT,
    "admin_viewed_at" TIMESTAMP(3),
    "observations" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedules" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "lead_id" TEXT,
    "assigned_to" TEXT NOT NULL,
    "type" "ScheduleType" NOT NULL DEFAULT 'meeting',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "end_at" TIMESTAMP(3),
    "timezone" TEXT DEFAULT 'America/Sao_Paulo',
    "location" TEXT,
    "conference_link" TEXT,
    "status" "ScheduleStatus" NOT NULL DEFAULT 'confirmed',
    "reminder_minutes" INTEGER[] DEFAULT ARRAY[30, 60]::INTEGER[],
    "google_calendar_id" TEXT,
    "sync_status" TEXT DEFAULT 'pending',
    "completed_at" TIMESTAMP(3),
    "completion_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nps_surveys" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "lead_id" TEXT,
    "sale_id" TEXT,
    "conversation_id" TEXT,
    "agent_id" TEXT,
    "sent_via" "NpsChannel" NOT NULL DEFAULT 'whatsapp',
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responded_at" TIMESTAMP(3),
    "score" INTEGER,
    "classification" "NpsClassification",
    "feedback" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nps_surveys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "distribution_rules" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "DistributionType" NOT NULL DEFAULT 'round_robin',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "criteria" JSONB NOT NULL DEFAULT '{}',
    "target_users" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "target_teams" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "respect_capacity" BOOLEAN NOT NULL DEFAULT true,
    "respect_working_hours" BOOLEAN NOT NULL DEFAULT true,
    "last_assigned_user_id" TEXT,
    "last_assigned_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "distribution_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "distribution_logs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "lead_id" TEXT NOT NULL,
    "rule_id" TEXT,
    "assigned_to" TEXT NOT NULL,
    "distribution_type" "DistributionLogType" NOT NULL DEFAULT 'automatic',
    "previous_owner" TEXT,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "distribution_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_prompts" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "type" "AiPromptType" NOT NULL,
    "name" TEXT NOT NULL,
    "prompt_template" TEXT NOT NULL,
    "system_prompt" TEXT,
    "variables" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "model" TEXT DEFAULT 'gpt-4o-mini',
    "temperature" DECIMAL(2,1) DEFAULT 0.7,
    "max_tokens" INTEGER DEFAULT 500,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_prompts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_interaction_logs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "conversation_id" TEXT,
    "lead_id" TEXT,
    "prompt_id" TEXT,
    "interaction_type" "AiInteractionType" NOT NULL,
    "input_tokens" INTEGER,
    "output_tokens" INTEGER,
    "input_text" TEXT,
    "output_text" TEXT,
    "model_used" TEXT,
    "latency_ms" INTEGER,
    "cost_usd" DECIMAL(10,6),
    "success" BOOLEAN NOT NULL DEFAULT true,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_interaction_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_logs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "workflow_id" TEXT NOT NULL,
    "workflow_name" TEXT NOT NULL,
    "execution_id" TEXT,
    "trigger_type" "AutomationTriggerType" NOT NULL,
    "status" "AutomationStatus" NOT NULL,
    "input_data" JSONB,
    "output_data" JSONB,
    "error_message" TEXT,
    "duration_ms" INTEGER,
    "affected_entities" JSONB,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMP(3),

    CONSTRAINT "automation_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sla_metrics" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "lead_id" TEXT,
    "conversation_id" TEXT,
    "user_id" TEXT,
    "metric_type" "SlaMetricType" NOT NULL,
    "target_seconds" INTEGER NOT NULL,
    "actual_seconds" INTEGER NOT NULL,
    "is_within_sla" BOOLEAN NOT NULL,
    "breach_notified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sla_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dashboard_metrics_daily" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "metric_date" DATE NOT NULL,
    "user_id" TEXT,
    "team_id" TEXT,
    "origin_id" TEXT,
    "funnel_id" TEXT,
    "leads_received" INTEGER NOT NULL DEFAULT 0,
    "leads_qualified" INTEGER NOT NULL DEFAULT 0,
    "leads_won" INTEGER NOT NULL DEFAULT 0,
    "leads_lost" INTEGER NOT NULL DEFAULT 0,
    "conversations_started" INTEGER NOT NULL DEFAULT 0,
    "messages_sent" INTEGER NOT NULL DEFAULT 0,
    "messages_received" INTEGER NOT NULL DEFAULT 0,
    "avg_response_time_seconds" INTEGER,
    "total_sales_value" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "sales_count" INTEGER NOT NULL DEFAULT 0,
    "nps_responses" INTEGER NOT NULL DEFAULT 0,
    "nps_average" DECIMAL(3,1),
    "ai_interactions" INTEGER NOT NULL DEFAULT 0,
    "ai_tokens_used" INTEGER NOT NULL DEFAULT 0,
    "ai_cost_usd" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dashboard_metrics_daily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_settings" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "working_hours_start" TEXT DEFAULT '08:00',
    "working_hours_end" TEXT DEFAULT '18:00',
    "working_days" INTEGER[] DEFAULT ARRAY[1, 2, 3, 4, 5]::INTEGER[],
    "timezone" TEXT DEFAULT 'America/Sao_Paulo',
    "auto_assign_leads" BOOLEAN NOT NULL DEFAULT true,
    "ai_enabled" BOOLEAN NOT NULL DEFAULT true,
    "ai_auto_qualify" BOOLEAN NOT NULL DEFAULT true,
    "ai_auto_respond" BOOLEAN NOT NULL DEFAULT true,
    "sla_first_response_minutes" INTEGER DEFAULT 60,
    "sla_followup_hours" INTEGER DEFAULT 24,
    "nps_auto_send" BOOLEAN NOT NULL DEFAULT true,
    "nps_delay_hours" INTEGER DEFAULT 24,
    "notification_email" TEXT,
    "notification_whatsapp" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_onboarding" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "admin_created" BOOLEAN NOT NULL DEFAULT false,
    "admin_created_at" TIMESTAMP(3),
    "users_created" BOOLEAN NOT NULL DEFAULT false,
    "users_created_at" TIMESTAMP(3),
    "whatsapp_connected" BOOLEAN NOT NULL DEFAULT false,
    "whatsapp_connected_at" TIMESTAMP(3),
    "funnel_configured" BOOLEAN NOT NULL DEFAULT false,
    "funnel_configured_at" TIMESTAMP(3),
    "ai_configured" BOOLEAN NOT NULL DEFAULT false,
    "ai_configured_at" TIMESTAMP(3),
    "first_lead_received" BOOLEAN NOT NULL DEFAULT false,
    "first_lead_received_at" TIMESTAMP(3),
    "first_sale_done" BOOLEAN NOT NULL DEFAULT false,
    "first_sale_done_at" TIMESTAMP(3),
    "progress_percent" INTEGER NOT NULL DEFAULT 0,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_onboarding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT,
    "target_roles" "UserRole"[] DEFAULT ARRAY[]::"UserRole"[],
    "team_id" TEXT,
    "type" "NotificationType" NOT NULL DEFAULT 'info',
    "category" "NotificationCategory" NOT NULL DEFAULT 'operational',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "action_url" TEXT,
    "icon" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_tickets" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "SupportType" NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "SupportPriority" NOT NULL DEFAULT 'medium',
    "status" "SupportStatus" NOT NULL DEFAULT 'open',
    "assigned_to" TEXT,
    "resolved_at" TIMESTAMP(3),
    "resolved_by" TEXT,
    "resolution_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "critical_alerts" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "type" "AlertType" NOT NULL,
    "flow_name" TEXT,
    "error_message" TEXT NOT NULL,
    "status" "AlertStatus" NOT NULL DEFAULT 'pending',
    "resolved_by" TEXT,
    "resolved_at" TIMESTAMP(3),
    "resolution_notes" TEXT,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "critical_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "plans_name_key" ON "plans"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE INDEX "tenants_status_idx" ON "tenants"("status");

-- CreateIndex
CREATE INDEX "tenants_lifecycle_status_idx" ON "tenants"("lifecycle_status");

-- CreateIndex
CREATE INDEX "tenants_plan_id_idx" ON "tenants"("plan_id");

-- CreateIndex
CREATE UNIQUE INDEX "super_admin_users_email_key" ON "super_admin_users"("email");

-- CreateIndex
CREATE INDEX "tenant_feature_overrides_tenant_id_idx" ON "tenant_feature_overrides"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_feature_overrides_tenant_id_feature_key_key" ON "tenant_feature_overrides"("tenant_id", "feature_key");

-- CreateIndex
CREATE INDEX "teams_tenant_id_idx" ON "teams"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "teams_tenant_id_name_key" ON "teams"("tenant_id", "name");

-- CreateIndex
CREATE INDEX "users_tenant_id_idx" ON "users"("tenant_id");

-- CreateIndex
CREATE INDEX "users_team_id_idx" ON "users"("team_id");

-- CreateIndex
CREATE INDEX "users_manager_id_idx" ON "users"("manager_id");

-- CreateIndex
CREATE INDEX "users_tenant_id_role_idx" ON "users"("tenant_id", "role");

-- CreateIndex
CREATE INDEX "users_tenant_id_is_active_idx" ON "users"("tenant_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "users_tenant_id_email_key" ON "users"("tenant_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "lead_origins_webhook_key_key" ON "lead_origins"("webhook_key");

-- CreateIndex
CREATE INDEX "lead_origins_tenant_id_idx" ON "lead_origins"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "lead_origins_tenant_id_name_key" ON "lead_origins"("tenant_id", "name");

-- CreateIndex
CREATE INDEX "funnels_tenant_id_idx" ON "funnels"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "funnels_tenant_id_name_key" ON "funnels"("tenant_id", "name");

-- CreateIndex
CREATE INDEX "funnel_stages_funnel_id_idx" ON "funnel_stages"("funnel_id");

-- CreateIndex
CREATE INDEX "funnel_stages_tenant_id_idx" ON "funnel_stages"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "funnel_stages_funnel_id_order_index_key" ON "funnel_stages"("funnel_id", "order_index");

-- CreateIndex
CREATE UNIQUE INDEX "loss_reasons_tenant_id_name_key" ON "loss_reasons"("tenant_id", "name");

-- CreateIndex
CREATE INDEX "leads_tenant_id_idx" ON "leads"("tenant_id");

-- CreateIndex
CREATE INDEX "leads_tenant_id_created_at_idx" ON "leads"("tenant_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "leads_tenant_id_phone_idx" ON "leads"("tenant_id", "phone");

-- CreateIndex
CREATE INDEX "leads_tenant_id_email_idx" ON "leads"("tenant_id", "email");

-- CreateIndex
CREATE INDEX "leads_assigned_to_idx" ON "leads"("assigned_to");

-- CreateIndex
CREATE INDEX "leads_team_id_idx" ON "leads"("team_id");

-- CreateIndex
CREATE INDEX "leads_stage_id_idx" ON "leads"("stage_id");

-- CreateIndex
CREATE INDEX "leads_funnel_id_idx" ON "leads"("funnel_id");

-- CreateIndex
CREATE INDEX "leads_origin_id_idx" ON "leads"("origin_id");

-- CreateIndex
CREATE INDEX "leads_tenant_id_temperature_idx" ON "leads"("tenant_id", "temperature");

-- CreateIndex
CREATE INDEX "leads_tenant_id_qualified_by_ai_idx" ON "leads"("tenant_id", "qualified_by_ai");

-- CreateIndex
CREATE INDEX "lead_stage_history_lead_id_idx" ON "lead_stage_history"("lead_id");

-- CreateIndex
CREATE INDEX "lead_stage_history_tenant_id_created_at_idx" ON "lead_stage_history"("tenant_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "lead_history_lead_id_idx" ON "lead_history"("lead_id");

-- CreateIndex
CREATE INDEX "lead_history_tenant_id_created_at_idx" ON "lead_history"("tenant_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "lead_history_lead_id_event_type_idx" ON "lead_history"("lead_id", "event_type");

-- CreateIndex
CREATE INDEX "tags_tenant_id_idx" ON "tags"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "tags_tenant_id_name_entity_type_key" ON "tags"("tenant_id", "name", "entity_type");

-- CreateIndex
CREATE INDEX "lead_tags_tag_id_idx" ON "lead_tags"("tag_id");

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_connections_instance_id_key" ON "whatsapp_connections"("instance_id");

-- CreateIndex
CREATE INDEX "whatsapp_connections_tenant_id_idx" ON "whatsapp_connections"("tenant_id");

-- CreateIndex
CREATE INDEX "whatsapp_connections_status_idx" ON "whatsapp_connections"("status");

-- CreateIndex
CREATE INDEX "conversations_tenant_id_idx" ON "conversations"("tenant_id");

-- CreateIndex
CREATE INDEX "conversations_lead_id_idx" ON "conversations"("lead_id");

-- CreateIndex
CREATE INDEX "conversations_assigned_to_idx" ON "conversations"("assigned_to");

-- CreateIndex
CREATE INDEX "conversations_tenant_id_contact_phone_idx" ON "conversations"("tenant_id", "contact_phone");

-- CreateIndex
CREATE INDEX "conversations_tenant_id_status_idx" ON "conversations"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "conversations_tenant_id_unread_count_idx" ON "conversations"("tenant_id", "unread_count");

-- CreateIndex
CREATE INDEX "conversations_tenant_id_is_pinned_idx" ON "conversations"("tenant_id", "is_pinned");

-- CreateIndex
CREATE INDEX "messages_conversation_id_created_at_idx" ON "messages"("conversation_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "messages_tenant_id_created_at_idx" ON "messages"("tenant_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "messages_external_id_idx" ON "messages"("external_id");

-- CreateIndex
CREATE INDEX "products_tenant_id_idx" ON "products"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "products_tenant_id_code_key" ON "products"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "sales_tenant_id_idx" ON "sales"("tenant_id");

-- CreateIndex
CREATE INDEX "sales_tenant_id_sale_date_idx" ON "sales"("tenant_id", "sale_date" DESC);

-- CreateIndex
CREATE INDEX "sales_agent_id_idx" ON "sales"("agent_id");

-- CreateIndex
CREATE INDEX "sales_manager_id_idx" ON "sales"("manager_id");

-- CreateIndex
CREATE INDEX "sales_tenant_id_status_idx" ON "sales"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "sales_lead_id_idx" ON "sales"("lead_id");

-- CreateIndex
CREATE INDEX "schedules_tenant_id_idx" ON "schedules"("tenant_id");

-- CreateIndex
CREATE INDEX "schedules_assigned_to_idx" ON "schedules"("assigned_to");

-- CreateIndex
CREATE INDEX "schedules_lead_id_idx" ON "schedules"("lead_id");

-- CreateIndex
CREATE INDEX "schedules_tenant_id_scheduled_at_idx" ON "schedules"("tenant_id", "scheduled_at");

-- CreateIndex
CREATE INDEX "nps_surveys_tenant_id_idx" ON "nps_surveys"("tenant_id");

-- CreateIndex
CREATE INDEX "nps_surveys_tenant_id_created_at_idx" ON "nps_surveys"("tenant_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "nps_surveys_tenant_id_classification_idx" ON "nps_surveys"("tenant_id", "classification");

-- CreateIndex
CREATE INDEX "nps_surveys_agent_id_idx" ON "nps_surveys"("agent_id");

-- CreateIndex
CREATE INDEX "distribution_rules_tenant_id_idx" ON "distribution_rules"("tenant_id");

-- CreateIndex
CREATE INDEX "distribution_rules_tenant_id_is_active_idx" ON "distribution_rules"("tenant_id", "is_active");

-- CreateIndex
CREATE INDEX "distribution_logs_tenant_id_created_at_idx" ON "distribution_logs"("tenant_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "distribution_logs_lead_id_idx" ON "distribution_logs"("lead_id");

-- CreateIndex
CREATE INDEX "ai_prompts_tenant_id_idx" ON "ai_prompts"("tenant_id");

-- CreateIndex
CREATE INDEX "ai_prompts_tenant_id_type_idx" ON "ai_prompts"("tenant_id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "ai_prompts_tenant_id_type_name_key" ON "ai_prompts"("tenant_id", "type", "name");

-- CreateIndex
CREATE INDEX "ai_interaction_logs_tenant_id_created_at_idx" ON "ai_interaction_logs"("tenant_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "ai_interaction_logs_conversation_id_idx" ON "ai_interaction_logs"("conversation_id");

-- CreateIndex
CREATE INDEX "ai_interaction_logs_lead_id_idx" ON "ai_interaction_logs"("lead_id");

-- CreateIndex
CREATE INDEX "automation_logs_tenant_id_started_at_idx" ON "automation_logs"("tenant_id", "started_at" DESC);

-- CreateIndex
CREATE INDEX "automation_logs_workflow_id_idx" ON "automation_logs"("workflow_id");

-- CreateIndex
CREATE INDEX "automation_logs_status_idx" ON "automation_logs"("status");

-- CreateIndex
CREATE INDEX "sla_metrics_tenant_id_created_at_idx" ON "sla_metrics"("tenant_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "sla_metrics_tenant_id_is_within_sla_idx" ON "sla_metrics"("tenant_id", "is_within_sla");

-- CreateIndex
CREATE INDEX "dashboard_metrics_daily_tenant_id_metric_date_idx" ON "dashboard_metrics_daily"("tenant_id", "metric_date" DESC);

-- CreateIndex
CREATE INDEX "dashboard_metrics_daily_user_id_metric_date_idx" ON "dashboard_metrics_daily"("user_id", "metric_date" DESC);

-- CreateIndex
CREATE INDEX "dashboard_metrics_daily_team_id_metric_date_idx" ON "dashboard_metrics_daily"("team_id", "metric_date" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "tenant_settings_tenant_id_key" ON "tenant_settings"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_onboarding_tenant_id_key" ON "tenant_onboarding"("tenant_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_created_at_idx" ON "notifications"("user_id", "is_read", "created_at" DESC);

-- CreateIndex
CREATE INDEX "notifications_tenant_id_created_at_idx" ON "notifications"("tenant_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "support_tickets_tenant_id_idx" ON "support_tickets"("tenant_id");

-- CreateIndex
CREATE INDEX "support_tickets_status_idx" ON "support_tickets"("status");

-- CreateIndex
CREATE INDEX "support_tickets_assigned_to_idx" ON "support_tickets"("assigned_to");

-- CreateIndex
CREATE INDEX "critical_alerts_status_idx" ON "critical_alerts"("status");

-- CreateIndex
CREATE INDEX "critical_alerts_tenant_id_idx" ON "critical_alerts"("tenant_id");

-- AddForeignKey
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_feature_overrides" ADD CONSTRAINT "tenant_feature_overrides_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_feature_overrides" ADD CONSTRAINT "tenant_feature_overrides_enabled_by_fkey" FOREIGN KEY ("enabled_by") REFERENCES "super_admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_origins" ADD CONSTRAINT "lead_origins_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funnels" ADD CONSTRAINT "funnels_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funnel_stages" ADD CONSTRAINT "funnel_stages_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funnel_stages" ADD CONSTRAINT "funnel_stages_funnel_id_fkey" FOREIGN KEY ("funnel_id") REFERENCES "funnels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loss_reasons" ADD CONSTRAINT "loss_reasons_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_origin_id_fkey" FOREIGN KEY ("origin_id") REFERENCES "lead_origins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_funnel_id_fkey" FOREIGN KEY ("funnel_id") REFERENCES "funnels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_stage_id_fkey" FOREIGN KEY ("stage_id") REFERENCES "funnel_stages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_loss_reason_id_fkey" FOREIGN KEY ("loss_reason_id") REFERENCES "loss_reasons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_stage_history" ADD CONSTRAINT "lead_stage_history_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_stage_history" ADD CONSTRAINT "lead_stage_history_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_stage_history" ADD CONSTRAINT "lead_stage_history_from_stage_id_fkey" FOREIGN KEY ("from_stage_id") REFERENCES "funnel_stages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_stage_history" ADD CONSTRAINT "lead_stage_history_to_stage_id_fkey" FOREIGN KEY ("to_stage_id") REFERENCES "funnel_stages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_stage_history" ADD CONSTRAINT "lead_stage_history_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_history" ADD CONSTRAINT "lead_history_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_history" ADD CONSTRAINT "lead_history_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_history" ADD CONSTRAINT "lead_history_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_tags" ADD CONSTRAINT "lead_tags_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_tags" ADD CONSTRAINT "lead_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_connections" ADD CONSTRAINT "whatsapp_connections_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_whatsapp_connection_id_fkey" FOREIGN KEY ("whatsapp_connection_id") REFERENCES "whatsapp_connections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_pinned_by_fkey" FOREIGN KEY ("pinned_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nps_surveys" ADD CONSTRAINT "nps_surveys_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nps_surveys" ADD CONSTRAINT "nps_surveys_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nps_surveys" ADD CONSTRAINT "nps_surveys_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "sales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nps_surveys" ADD CONSTRAINT "nps_surveys_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nps_surveys" ADD CONSTRAINT "nps_surveys_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distribution_rules" ADD CONSTRAINT "distribution_rules_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distribution_rules" ADD CONSTRAINT "distribution_rules_last_assigned_user_id_fkey" FOREIGN KEY ("last_assigned_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distribution_logs" ADD CONSTRAINT "distribution_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distribution_logs" ADD CONSTRAINT "distribution_logs_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distribution_logs" ADD CONSTRAINT "distribution_logs_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "distribution_rules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distribution_logs" ADD CONSTRAINT "distribution_logs_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distribution_logs" ADD CONSTRAINT "distribution_logs_previous_owner_fkey" FOREIGN KEY ("previous_owner") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_prompts" ADD CONSTRAINT "ai_prompts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_interaction_logs" ADD CONSTRAINT "ai_interaction_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_interaction_logs" ADD CONSTRAINT "ai_interaction_logs_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_interaction_logs" ADD CONSTRAINT "ai_interaction_logs_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_interaction_logs" ADD CONSTRAINT "ai_interaction_logs_prompt_id_fkey" FOREIGN KEY ("prompt_id") REFERENCES "ai_prompts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_logs" ADD CONSTRAINT "automation_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sla_metrics" ADD CONSTRAINT "sla_metrics_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sla_metrics" ADD CONSTRAINT "sla_metrics_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sla_metrics" ADD CONSTRAINT "sla_metrics_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sla_metrics" ADD CONSTRAINT "sla_metrics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dashboard_metrics_daily" ADD CONSTRAINT "dashboard_metrics_daily_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dashboard_metrics_daily" ADD CONSTRAINT "dashboard_metrics_daily_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dashboard_metrics_daily" ADD CONSTRAINT "dashboard_metrics_daily_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dashboard_metrics_daily" ADD CONSTRAINT "dashboard_metrics_daily_origin_id_fkey" FOREIGN KEY ("origin_id") REFERENCES "lead_origins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dashboard_metrics_daily" ADD CONSTRAINT "dashboard_metrics_daily_funnel_id_fkey" FOREIGN KEY ("funnel_id") REFERENCES "funnels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_settings" ADD CONSTRAINT "tenant_settings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_onboarding" ADD CONSTRAINT "tenant_onboarding_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "super_admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "super_admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "critical_alerts" ADD CONSTRAINT "critical_alerts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "critical_alerts" ADD CONSTRAINT "critical_alerts_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "super_admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
