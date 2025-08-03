
import { Router } from 'express';
import { FamiliaDataSourceImpl } from '../../infrastructure/datasourceImpl/familia.datasource.impl';
import { FamiliaRepositoryImpl } from '../../infrastructure/repositoryIpl/familia.repository.impl';
import { FamiliaController } from './familia.controller';

export class FamiliaRoutes {
    static get routes(): Router {
        const router = Router();

        const ds = new FamiliaDataSourceImpl();
        const repo = new FamiliaRepositoryImpl(ds);
        const ctrl = new FamiliaController(repo);

        router.get('/', ctrl.listar);
        router.post('/', ctrl.crear);
        router.put('/:id', ctrl.actualizar);
        router.patch('/:id/estado', ctrl.cambiarEstado);

        return router;
    }
}
