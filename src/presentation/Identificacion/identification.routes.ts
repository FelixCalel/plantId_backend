// src/presentation/Identificacion/identificacion.routes.ts
import { Router } from 'express';
import multer from 'multer';
import { PlantIdApiService } from '../../infrastructure/external/plantid-api.service';
import { IdentificacionDataSourceImpl } from '../../infrastructure/datasourceImpl/identification.datasource.impl';
import { IdentificacionRepositoryImpl } from '../../infrastructure/repositoryIpl/identification.repository.impl';
import { IdentificacionController } from './identification.controller';

const upload = multer({ dest: 'uploads/' });

/* Dependencias */
const datasource = new IdentificacionDataSourceImpl();
const repository = new IdentificacionRepositoryImpl();
const plantIdApi = new PlantIdApiService();
const controller = new IdentificacionController(repository, plantIdApi);

export class IdentificacionRoutes {
    static get routes(): Router {
        const router = Router();
        router.post(
            '/',
            upload.single('image'),
            controller.identify,
        );
        router.get('/:id', controller.getById);
        router.get('/', controller.paginate);

        return router;
    }
}
