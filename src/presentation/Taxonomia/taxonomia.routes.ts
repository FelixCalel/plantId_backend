import { Router } from 'express';
import { TaxonomiaDataSourceImpl } from '../../infrastructure/datasourceImpl/taxonomia.datasource.impl';
import { TaxonomiaRepositoryImpl } from '../../infrastructure/repositoryIpl/taxonomia.repository.impl';
import { TaxonomiaController } from './taxonomia.controller';

export class TaxonomiaRoutes {
    static get routes(): Router {
        const router = Router();

        const ds = new TaxonomiaDataSourceImpl();
        const repo = new TaxonomiaRepositoryImpl(ds);
        const ctrl = new TaxonomiaController(repo);

        router.get('/', ctrl.listar);
        router.post('/', ctrl.crear);
        router.put('/:id', ctrl.actualizar);

        return router;
    }
}
