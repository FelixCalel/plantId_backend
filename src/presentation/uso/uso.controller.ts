import { Request, Response } from 'express';
import { PlantIdApiService, UsageResponse } from '../../infrastructure/external/plantid-api.service';

const plantApi = new PlantIdApiService();

export class UsoController {
    private plantApi = new PlantIdApiService()

    async getUsage(req: Request, res: Response) {
        try {
            const usage: UsageResponse = await this.plantApi.getUsage()
            return res.json(usage)
        } catch (err: any) {
            console.error('Error fetching Plant.ID usage →', err)
            const status = err.statusCode ?? 500
            return res.status(status).json({ error: err.message })
        }
    }
}