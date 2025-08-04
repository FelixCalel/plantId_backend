import { ChatRepository } from '../../domain/repositories/chat.repository';
import { CreateMessageDto } from '../../domain/dtos/chat/create-message.dto';
import { ChatConversation, ChatMessage } from '../../domain/entities/chat.entity';
import { PlantIdApiService, ChatbotConversationResponse } from './plantid-api.service';
import { CustomError } from '../../domain/error/custom.error';

export class ChatService {
    constructor(
        private readonly repo: ChatRepository,
        private readonly plantApi: PlantIdApiService
    ) { }
    async startConversation(
        identificationId: string,
        secret: string
    ): Promise<ChatConversation> {
        return this.repo.createConversation(identificationId, secret);
    }

    async sendMessage(dto: CreateMessageDto): Promise<{
        userMessage: ChatMessage;
        botMessage: ChatMessage;
    }> {
        const userMessage = await this.repo.addMessage({
            conversacionId: dto.conversacionId,
            role: 'USUARIO',
            content: dto.content,
        });
        const convo = await this.repo.getConversation(dto.conversacionId);
        if (!convo) {
            throw CustomError.notFound(`Conversación ${dto.conversacionId} no encontrada`);
        }

        const accessToken = convo.secret!;
        if (!accessToken) {
            throw CustomError.badRequest('Falta el access token de la conversación');
        }

        const isFirstTurn = (convo.messages?.length ?? 0) <= 1;

        let chatResp: ChatbotConversationResponse;
        try {
            chatResp = await this.plantApi.askChatbot(
                accessToken,
                dto.content,
                isFirstTurn
                    ? {
                        prompt: "Eres un asistente experto en plantas, habla en español y sé breve",
                        temperature: 0.5,
                    }
                    : undefined
            );
        } catch (err) {
            throw err;
        }

        const answer = chatResp.messages.find((m) => m.type === 'answer');
        const botContent = answer?.content ?? '';

        const botMessage = await this.repo.addMessage({
            conversacionId: dto.conversacionId,
            role: 'BOT',
            content: botContent,
        });

        return { userMessage, botMessage };
    }

    getConversation(id: number): Promise<ChatConversation | null> {
        return this.repo.getConversation(id);
    }

    getHistory(
        conversacionId: number,
        page = 1,
        limit = 25
    ): Promise<{ total: number; items: ChatMessage[] }> {
        return this.repo.getHistory(conversacionId, page, limit);
    }
}
