import crypto from 'crypto';

export function generateId(): string {
    return crypto.randomUUID();
}

export function formatPhone(phone: string): string {
    // Remove non-numeric characters
    const numbers = phone.replace(/\D/g, '');

    // Add country code if missing
    if (!numbers.startsWith('55') && numbers.length <= 11) {
        return `55${numbers}`;
    }

    return numbers;
}

export function sanitizePhone(phone: string): string {
    return phone.replace(/\D/g, '');
}

export function maskDocument(document: string): string {
    const sanitized = document.replace(/\D/g, '');

    if (sanitized.length === 11) {
        // CPF: ***.***.***-XX
        return `***.***.***.${sanitized.slice(-2)}`;
    }

    if (sanitized.length === 14) {
        // CNPJ: **.***.***/****.XX
        return `**.***.***/****-${sanitized.slice(-2)}`;
    }

    return '***';
}

export function paginate<T>(
    data: T[],
    page: number,
    limit: number,
    total: number
) {
    return {
        data,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

export function parseQueryInt(value: string | undefined, defaultValue: number): number {
    if (!value) return defaultValue;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
}

export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
