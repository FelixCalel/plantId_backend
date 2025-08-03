// presentation/controllers/taxonomia.controller.ts
import { Request, Response } from 'express';
import { logger } from '../../config/logger';
import { TaxonomiaRepository } from '../../domain/repositories/taxonomia.repository';
import { CustomError } from '../../domain/error/custom.error';
import { CrearTaxonomiaDto } from '../../domain/dtos/taxonomia-dto/create-taxonomia-dto';
import { ActualizarTaxonomiaDto } from '../../domain/dtos/taxonomia-dto/update-taxonomia-dto';

export class TaxonomiaController {
    constructor(private readonly repo: TaxonomiaRepository) { }

    private handleError = (err: unknown, res: Response) => {
        logger.error('Taxonomia error: %o', err);
        if (err instanceof CustomError)
            return res.status(err.statusCode).json(err);
        return res.status(500).json({ error: 'Error interno del servidor' });
    };

    crear = (req: Request, res: Response) => {
        const [err, dto] = CrearTaxonomiaDto.crear(req.body);
        if (err) return res.status(400).json({ error: err });

        this.repo.create(dto!)
            .then(r => res.status(201).json(r))
            .catch(e => this.handleError(e, res));
    };

    listar = (req: Request, res: Response) => {
        const { familiaId } = req.query;
        this.repo.getAll(familiaId ? Number(familiaId) : undefined)
            .then(r => res.json(r))
            .catch(e => this.handleError(e, res));
    };

    actualizar = (req: Request, res: Response) => {
        const [err, dto] = ActualizarTaxonomiaDto.crear({ ...req.body, id: req.params.id });
        if (err) return res.status(400).json({ error: err });

        this.repo.update(dto!)
            .then(r => res.json(r))
            .catch(e => this.handleError(e, res));
    };
}
