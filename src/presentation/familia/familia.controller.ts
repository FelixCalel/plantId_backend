import { Request, Response } from 'express';
import { logger } from '../../config/logger';
import { FamiliaRepository } from '../../domain/repositories/familia.repository';
import { CustomError } from '../../domain/error/custom.error';
import { CrearFamiliaDto } from '../../domain/dtos/familia-dto/create-familia-dto';
import { ActualizarFamiliaDto } from '../../domain/dtos/familia-dto/update-familia-dto';
import { CambiarEstadoFamiliaDto } from '../../domain/dtos/familia-dto/estado-familia';

export class FamiliaController {

    constructor(private readonly repo: FamiliaRepository) { }

    private handleError = (err: unknown, res: Response) => {
        logger.error('Familia error: %o', err);
        if (err instanceof CustomError)
            return res.status(err.statusCode).json(err);
        return res.status(500).json({ error: 'Error interno del servidor' });
    };

    crear = async (req: Request, res: Response) => {
        const [err, dto] = CrearFamiliaDto.crear(req.body);
        if (err) return res.status(400).json({ error: err });

        this.repo.create(dto!)
            .then(r => res.status(201).json(r))
            .catch(e => this.handleError(e, res));
    };

    listar = async (req: Request, res: Response) => {
        const { q = '', page = '1' } = req.query;
        this.repo.getAll(String(q), Number(page))
            .then(r => res.json(r))
            .catch(e => this.handleError(e, res));
    };

    actualizar = async (req: Request, res: Response) => {
        const [err, dto] = ActualizarFamiliaDto.crear({ ...req.body, id: req.params.id });
        if (err) return res.status(400).json({ error: err });

        this.repo.update(dto!)
            .then(r => res.json(r))
            .catch(e => this.handleError(e, res));
    };

    cambiarEstado = async (req: Request, res: Response) => {
        const [err, dto] = CambiarEstadoFamiliaDto.crear({ ...req.body, id: req.params.id });
        if (err) return res.status(400).json({ error: err });

        this.repo.changeStatus(dto!)
            .then(() => res.json({ message: 'Estado actualizado' }))
            .catch(e => this.handleError(e, res));
    };
}
