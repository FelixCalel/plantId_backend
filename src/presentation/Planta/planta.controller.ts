
import { Request, Response } from 'express';
import { logger } from '../../config/logger';
import { PlantaRepository } from '../../domain/repositories/planta.repository';
import { CustomError } from '../../domain/error/custom.error';
import { CrearPlantaDto } from '../../domain/dtos/planta-dto/create-planta-dto';
import { ActualizarPlantaDto } from '../../domain/dtos/planta-dto/update-planta-dto';
import { CambiarEstadoPlantaDto } from '../../domain/dtos/planta-dto/state-planta-dto';

export class PlantaController {
    constructor(private readonly repo: PlantaRepository) { }

    private handleError = (err: unknown, res: Response) => {
        logger.error('Planta error: %o', err);
        if (err instanceof CustomError)
            return res.status(err.statusCode).json(err);
        return res.status(500).json({ error: 'Error interno del servidor' });
    };

    crear = (req: Request, res: Response) => {
        const [err, dto] = CrearPlantaDto.crear(req.body);
        if (err) return res.status(400).json({ error: err });

        this.repo.create(dto!)
            .then(r => res.status(201).json(r))
            .catch(e => this.handleError(e, res));
    };

    listar = (req: Request, res: Response) => {
        const { q = '', page = '1', estado } = req.query;
        this.repo.getAll(String(q), Number(page), estado as any)
            .then(r => res.json(r))
            .catch(e => this.handleError(e, res));
    };

    actualizar = (req: Request, res: Response) => {
        const [err, dto] = ActualizarPlantaDto.crear({ ...req.body, id: req.params.id });
        if (err) return res.status(400).json({ error: err });

        this.repo.update(dto!)
            .then(r => res.json(r))
            .catch(e => this.handleError(e, res));
    };

    cambiarEstado = (req: Request, res: Response) => {
        const [err, dto] = CambiarEstadoPlantaDto.crear({ ...req.body, id: req.params.id });
        if (err) return res.status(400).json({ error: err });

        this.repo.changeStatus(dto!)
            .then(() => res.json({ message: 'Estado actualizado' }))
            .catch(e => this.handleError(e, res));
    };
}
