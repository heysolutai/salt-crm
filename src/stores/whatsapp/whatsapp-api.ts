import { api } from '@/lib/api';

export interface WhatsAppConnectionResponse {
    id: string;
    instanceId: string;
    status: string;
    qrCode?: string;
    base64?: string;
}

export const whatsappApi = {
    createInstance: async (name: string, phone?: string) => {
        const response = await api.post<WhatsAppConnectionResponse>('/whatsapp/instance', { name, phone });
        return response.data;
    },

    connect: async (connectionId: string) => {
        const response = await api.get<WhatsAppConnectionResponse>(`/whatsapp/${connectionId}/connect`);
        return response.data;
    }
};
