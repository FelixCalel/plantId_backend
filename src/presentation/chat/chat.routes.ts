import { Router } from 'express';
import { ChatController } from './chat.controller';

const ctrl = new ChatController();
export class ChatRoutes {
    static get routes() {
        const router = Router();
        router.post('/conversaciones', ctrl.start);
        router.post('/conversaciones/:id/mensajes', ctrl.send);
        router.get('/conversaciones/:id', ctrl.get);
        router.get('/conversaciones/:id/historial', ctrl.history);

        return router;
    }
}
