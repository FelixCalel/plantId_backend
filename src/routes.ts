import { Router } from 'express';
import { FamiliaRoutes } from './presentation/familia/familia.routes';
import { TaxonomiaRoutes } from './presentation/Taxonomia/taxonomia.routes';
import { PlantaRoutes } from './presentation/Planta/planta.routes';

export class AppRouter {
    static get routes(): Router {
        const router = Router();

        router.use('/familias', FamiliaRoutes.routes);
        router.use('/taxonomias', TaxonomiaRoutes.routes);
        router.use('/plantas', PlantaRoutes.routes);

        return router;
    }
}
