import { Request, Response } from 'express';
import { logger } from '../../config/logger';
import { PlantaRepository } from '../../domain/repositories/planta.repository';
import { CustomError } from '../../domain/error/custom.error';
import { CrearPlantaDto } from '../../domain/dtos/planta-dto/create-planta-dto';
import { ActualizarPlantaDto } from '../../domain/dtos/planta-dto/update-planta-dto';
import { CambiarEstadoPlantaDto } from '../../domain/dtos/planta-dto/state-planta-dto';
import { prisma } from '../../config/database';

export class PlantaController {
    constructor(private readonly repo: PlantaRepository) { }

    private handleError = (err: unknown, res: Response) => {
        logger.error('Planta error: %o', err);
        if (err instanceof CustomError)
            return res.status(err.statusCode).json(err);
        return res.status(500).json({ error: 'Error interno del servidor' });
    };

    crear = async (req: Request, res: Response) => {
        const [err, dto] = CrearPlantaDto.crear(req.body);
        if (err) return res.status(400).json({ error: err });

        try {
            const planta = await this.repo.create(dto!);
            res.status(201).json(planta);
        } catch (e: any) {
            res.status(500).json({ error: e.message || 'Error interno del servidor' });
        }
    };


    listar = async (req: Request, res: Response) => {
        const { q = '', page = '1', estado } = req.query;
        const pagina = Number(page);
        const where: any = {
            nombreCientifico: { contains: String(q), mode: 'insensitive' },
            ...(estado ? { estado: String(estado) } : {}),
        };

        try {
            // 1) Conteo total (sin paginar)
            const total = await prisma.planta.count({ where });

            // 2) Items de esta página (con imágenes, taxonomía, familia…)
            const items = await prisma.planta.findMany({
                where,
                skip: (pagina - 1) * 25,
                take: 25,
                orderBy: { nombreCientifico: 'asc' },
                include: {
                    imagenes: true,
                    taxonomia: { include: { familia: true } },
                },
            });

            // 3) Devuelvo ambos:
            return res.json({ items, total });
        } catch (e) {
            return this.handleError(e, res);
        }
    };
    actualizar = async (req: Request, res: Response) => {
        const [err, dto] = ActualizarPlantaDto.crear({
            ...req.body,
            id: req.params.id,
        });

        if (err) {
            return res.status(400).json({ error: err });
        }

        try {
            const plantaActualizada = await this.repo.update(dto!);
            return res
                .status(200)
                .json({ message: 'Planta actualizada correctamente', data: plantaActualizada });
        } catch (e: any) {
            const mensaje = e instanceof CustomError
                ? e.message
                : 'Error interno al actualizar la planta';
            return res.status(500).json({ error: mensaje });
        }
    };


    cambiarEstado = (req: Request, res: Response) => {
        const [err, dto] = CambiarEstadoPlantaDto.crear({ ...req.body, id: req.params.id });
        if (err) return res.status(400).json({ error: err });

        this.repo.changeStatus(dto!)
            .then(() => res.json({ message: 'Estado actualizado' }))
            .catch(e => this.handleError(e, res));
    };
}
