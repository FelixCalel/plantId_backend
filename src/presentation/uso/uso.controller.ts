import { Request, Response } from 'express';
import { PlantIdApiService, UsageResponse } from '../../infrastructure/external/plantid-api.service';

const plantApi = new PlantIdApiService();

export class UsoController {
    private plantApi = new PlantIdApiService()

    /** GET /uso */
    async getUsage(req: Request, res: Response) {
        try {
            // 1) Llamo a Plant.ID
            const usage: UsageResponse = await this.plantApi.getUsage()
            // 2) Devuelvo tal cual el objeto
            return res.json(usage)
        } catch (err: any) {
            console.error('Error fetching Plant.ID usage →', err)
            const status = err.statusCode ?? 500
            return res.status(status).json({ error: err.message })
        }
    }
}