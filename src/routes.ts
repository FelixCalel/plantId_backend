import { Router } from 'express';

export class AppRoutes {
    static get routers(): Router {
        const router = Router();
        router.get('/identify', (_req, res) => res.sendStatus(501));
        router.get('/plants', (_req, res) => res.sendStatus(501));
        router.get('/families', (_req, res) => res.sendStatus(501));
        router.get('/chat', (_req, res) => res.sendStatus(501));
        router.get('/stats', (_req, res) => res.sendStatus(501));

        return router;
    }
}