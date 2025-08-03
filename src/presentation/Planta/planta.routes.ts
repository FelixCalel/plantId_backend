import { Router } from 'express';
import { PlantaDataSourceImpl } from '../../infrastructure/datasourceImpl/planta.datasource.impl';
import { PlantaRepositoryImpl } from '../../infrastructure/repositoryIpl/planta.repository.impl';
import { PlantaController } from './planta.controller';

export class PlantaRoutes {
    static get routes(): Router {
        const router = Router();

        const ds = new PlantaDataSourceImpl();
        const repo = new PlantaRepositoryImpl(ds);
        const ctrl = new PlantaController(repo);

        router.get('/', ctrl.listar);
        router.post('/', ctrl.crear);
        router.put('/:id', ctrl.actualizar);
        router.patch('/:id/estado', ctrl.cambiarEstado);

        return router;
    }
}
