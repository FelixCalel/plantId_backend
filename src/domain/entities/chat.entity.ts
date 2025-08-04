// src/domain/entities/chat.entity.ts

import { MensajeChat, ConversacionChat } from '@prisma/client';

export class ChatMessage {
    id!: number;
    conversacionId!: number;
    role!: 'USUARIO' | 'BOT';
    content!: string;
    createdAt!: Date;

    static fromPrisma(m: MensajeChat): ChatMessage {
        return {
            id: m.id,
            conversacionId: m.conversacionId,
            role: m.rol as 'USUARIO' | 'BOT',
            content: m.contenido,
            createdAt: m.creadoEn,
        };
    }
}

export class ChatConversation {
    id!: number;
    identificationId!: string | null;
    secret!: string | null;
    createdAt!: Date;
    creditsUsed!: number;
    messages!: ChatMessage[];

    static fromPrisma(
        c: ConversacionChat,
        msgs: ChatMessage[]
    ): ChatConversation {
        return {
            id: c.id,
            identificationId: c.identificacion,
            secret: c.secret,
            createdAt: c.creadaEn,
            creditsUsed: c.creditosUsados,
            messages: msgs,
        };
    }
}
