import { prisma } from '../../config/database';
import { ChatRepository } from '../../domain/repositories/chat.repository';
import { CreateMessageDto } from '../../domain/dtos/chat/create-message.dto';
import { ChatConversation, ChatMessage } from '../../domain/entities/chat.entity';

export class ChatDatasourceImpl implements ChatRepository {
    async createConversation(
        identification: string,
        secret: string
    ): Promise<ChatConversation> {
        const c = await prisma.conversacionChat.create({
            data: {
                identificacion: identification,
                secret: secret,
            },
        });
        return ChatConversation.fromPrisma(c, []);
    }

    async addMessage(dto: CreateMessageDto): Promise<ChatMessage> {
        const m = await prisma.mensajeChat.create({
            data: {
                conversacionId: dto.conversacionId,
                rol: dto.role,
                contenido: dto.content,
            }
        });
        return ChatMessage.fromPrisma(m);
    }

    async getConversation(id: number): Promise<ChatConversation | null> {
        const c = await prisma.conversacionChat.findUnique({ where: { id } });
        if (!c) return null;
        const msgs = await prisma.mensajeChat.findMany({
            where: { conversacionId: id },
            orderBy: { creadoEn: 'asc' }
        });
        const mapped = msgs.map(ChatMessage.fromPrisma);
        return ChatConversation.fromPrisma(c, mapped);
    }

    async getHistory(conversacionId: number, page: number, limit: number) {
        const skip = (page - 1) * limit;
        const [total, rows] = await prisma.$transaction([
            prisma.mensajeChat.count({ where: { conversacionId } }),
            prisma.mensajeChat.findMany({
                where: { conversacionId },
                orderBy: { creadoEn: 'asc' },
                skip,
                take: limit,
            })
        ]);
        return { total, items: rows.map(ChatMessage.fromPrisma) };
    }
}