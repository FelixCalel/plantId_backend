import { Router } from 'express';
import { FamiliaRoutes } from './presentation/familia/familia.routes';
import { TaxonomiaRoutes } from './presentation/Taxonomia/taxonomia.routes';
import { PlantaRoutes } from './presentation/Planta/planta.routes';
import { IdentificacionRoutes } from './presentation/Identificacion/identification.routes';
import { ChatRoutes } from './presentation/chat/chat.routes';
import { usoRoutes } from './presentation/uso/uso.routes';

export class AppRouter {
    static get routes(): Router {
        const router = Router();

        router.use('/familias', FamiliaRoutes.routes);
        router.use('/taxonomias', TaxonomiaRoutes.routes);
        router.use('/plantas', PlantaRoutes.routes);
        router.use('/identificaciones', IdentificacionRoutes.routes)
        router.use('/chat', ChatRoutes.routes)
        router.use('/', usoRoutes);

        return router;
    }
}
