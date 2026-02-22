-- AlterTable
ALTER TABLE "conversations" ADD COLUMN     "contact_lid" TEXT;

-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "avatar_url" TEXT;

-- AlterTable
ALTER TABLE "whatsapp_connections" ADD COLUMN     "instance_token" TEXT;
