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


    async sendMessage(dto: CreateMessageDto): Promise<ChatConversation> {
        await this.repo.addMessage({
            conversacionId: dto.conversacionId,
            role: 'USUARIO',
            content: dto.content,
        });

        const before = await this.repo.getConversation(dto.conversacionId);
        if (!before) throw CustomError.notFound(`Conversación ${dto.conversacionId} no encontrada`);

        const chatResp = await this.plantApi.askChatbot(
            before.secret!,
            dto.content,
            before.messages.length <= 1
                ? { prompt: 'Eres un asistente experto en plantas, habla en español y sé breve', temperature: 0.5 }
                : undefined
        );
        const answers = chatResp.messages.filter(m => m.type === 'answer');
        if (!answers.length) throw CustomError.internal('El chatbot no devolvió respuesta');
        const lastAnswer = answers[answers.length - 1];
        await this.repo.addMessage({
            conversacionId: dto.conversacionId,
            role: 'BOT',
            content: lastAnswer.content,
        });
        const full = await this.repo.getConversation(dto.conversacionId);
        if (!full) throw CustomError.notFound(`Conversación ${dto.conversacionId} no encontrada tras guardar mensajes`);
        return full;
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
