import { Request, Response } from 'express';
import fs from 'fs/promises';
import { PlantIdApiService } from '../../infrastructure/external/plantid-api.service';
import { logger } from '../../config/logger';
import { CustomError } from '../../domain/error/custom.error';
import { IdentificacionRepository } from '../../domain/repositories/identification.repository';

export class IdentificacionController {
    constructor(
        private readonly identificationRepo: IdentificacionRepository,
        private readonly plantIdApi: PlantIdApiService,
    ) { }

    identify = async (req: Request, res: Response) => {
        try {
            if (!req.file)
                return res.status(400).json({ error: 'Se requiere un archivo "image"' });

            const tmpPath = req.file.path;
            const apiResponse = await this.plantIdApi.identify(tmpPath);

            const identificacion = await this.identificationRepo.createFromApi(
                tmpPath,
                apiResponse,
            );

            await fs.unlink(tmpPath).catch(() => { });

            return res.status(201).json(identificacion);
        } catch (error) {
            logger.error('Error en identify: %s', error);

            if (error instanceof CustomError)
                return res.status(error.statusCode).json({ error: error.message });

            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    };

    getById = async (req: Request, res: Response) => {
        try {
            const id = Number(req.params.id);
            const data = await this.identificationRepo.getById(id);

            if (!data) throw CustomError.notFound('Identificación no encontrada');
            return res.json(data);
        } catch (error) {
            if (error instanceof CustomError)
                return res.status(error.statusCode).json({ error: error.message });

            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    };

    paginate = async (req: Request, res: Response) => {
        try {
            const page = Number(req.query.page ?? 1);
            const limit = Number(req.query.limit ?? 25);

            const result = await this.identificationRepo.paginate(page, limit);
            return res.json(result);
        } catch (error) {
            if (error instanceof CustomError)
                return res.status(error.statusCode).json({ error: error.message });

            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    };
}
