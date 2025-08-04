
import { CreateMessageDto } from '../dtos/chat/create-message.dto';
import { ChatConversation, ChatMessage } from '../entities/chat.entity';

export interface ChatRepository {
    createConversation(
        identification: string,
        secret: string
    ): Promise<ChatConversation>;

    addMessage(dto: CreateMessageDto): Promise<ChatMessage>;
    getConversation(id: number): Promise<ChatConversation | null>;
    getHistory(conversationId: number, page: number, limit: number): Promise<{
        total: number;
        items: ChatMessage[];
    }>;

    addMessage(dto: CreateMessageDto): Promise<ChatMessage>;

    getConversation(id: number): Promise<ChatConversation | null>;

    getHistory(
        conversationId: number,
        page: number,
        limit: number
    ): Promise<{
        total: number;
        items: ChatMessage[];
    }>;
}
