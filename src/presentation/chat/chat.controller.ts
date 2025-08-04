import { Request, Response } from 'express';
import { ChatDatasourceImpl } from '../../infrastructure/datasourceImpl/chat.datasource.impl';
import { PlantIdApiService } from '../../infrastructure/external/plantid-api.service';
import { CreateMessageDto } from '../../domain/dtos/chat/create-message.dto';
import { ChatService } from '../../infrastructure/external/chat.service';

const chatRepo = new ChatDatasourceImpl();
const plantApi = new PlantIdApiService();
const chatService = new ChatService(chatRepo, plantApi);

export class ChatController {

    start = async (req: Request, res: Response) => {
        const { identificationId, secret } = req.body;
        try {
            const convo = await chatService.startConversation(identificationId, secret);
            res.status(201).json(convo);
        } catch (err) {
            res.status(500).json({ error: (err as Error).message });
        }
    };


    send = async (req: Request, res: Response) => {
        const dto = new CreateMessageDto();
        dto.conversacionId = Number(req.params.id);
        dto.content = String(req.body.content);
        try {
            const conversation = await chatService.sendMessage(dto);
            res.status(201).json(conversation);
        } catch (err) {
            res.status(500).json({ error: (err as Error).message });
        }
    };


    get = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        try {
            const convo = await chatService.getConversation(id);
            if (!convo) return res.status(404).json({ error: 'Conversación no encontrada' });
            res.json(convo);
        } catch (err) {
            res.status(500).json({ error: (err as Error).message });
        }
    };


    history = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        const page = Number(req.query.page ?? 1);
        const limit = Number(req.query.limit ?? 25);
        try {
            const hist = await chatService.getHistory(id, page, limit);
            res.json(hist);
        } catch (err) {
            res.status(500).json({ error: (err as Error).message });
        }
    };
}
