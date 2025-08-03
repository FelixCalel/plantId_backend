import axios, { AxiosInstance, AxiosError } from 'axios';
import fs from 'fs/promises';
import path from 'path';

import { envs } from '../../config/envs';
import { logger } from '../../config/logger';
import { CustomError } from '../../domain/error/custom.error';

/* ---------- Tipos basados en Plant.id v2 ---------- */
export interface PlantIdSuggestion {
    id: number;
    plant_name: string;
    probability: number;
    plant_details?: {
        common_names?: string[];
        url?: string;
        wiki_description?: { value: string };
        taxonomy?: {
            kingdom?: string; phylum?: string; class?: string; order?: string;
            family?: string; genus?: string; species?: string; rank?: string;
        };
    };
}

export interface IdentifyResponse {
    id: string;
    suggestions: PlantIdSuggestion[];
    is_plant: boolean;
    meta_data?: { latitude?: number; longitude?: number };
    error?: string;
}

export interface UsageResponse {
    status: string;
    request_id: string;
    credits_used: number;
    credits_remaining: number;
    credits_limit: number;
}

export class PlantIdApiService {
    private readonly http: AxiosInstance;

    constructor(
        private readonly apiKey = envs.PLANTID_API_KEY,
        private readonly baseUrl = envs.PLANTID_BASE_URL, // https://plant.id/api/v2
    ) {
        this.http = axios.create({
            baseURL: this.baseUrl.replace(/\/+$/, ''),
            timeout: 30000,
            headers: {
                'Api-Key': this.apiKey,
                'Content-Type': 'application/json',
            },
        });
    }

    /** Envía la imagen a v2/identify y devuelve el resultado */
    async identify(localImagePath: string): Promise<IdentifyResponse> {
        try {
            // 1. Lee y convierte la imagen a Base64
            const bytes = await fs.readFile(path.resolve(localImagePath));
            const base64Img = bytes.toString('base64');

            // 2. Payload v2
            const payload = {
                images: [base64Img],                                      // obligatorio
                modifiers: ['crops_fast', 'similar_images'],              // opcional
                plant_language: 'es',                                     // idioma de las descripciones
                plant_details: ['common_names', 'url', 'wiki_description', 'taxonomy'],
            };

            // 3. POST /identify
            const { data } = await this.http.post<IdentifyResponse>('/identify', payload);

            if (data.error) {
                throw CustomError.badRequest(`PlantId API error: ${data.error}`);
            }

            return data;
        } catch (err) {
            return this.handleAxiosError(err);
        }
    }

    /** Consulta créditos restantes en v2/usage */
    async getUsage(): Promise<UsageResponse> {
        try {
            const { data } = await this.http.get<UsageResponse>('/usage');
            return data;
        } catch (err) {
            return this.handleAxiosError(err);
        }
    }

    /** Manejo unificado de errores Axios */
    private handleAxiosError<T>(err: unknown): never {
        if (axios.isAxiosError(err)) {
            const ax = err as AxiosError<any>;

            console.error('Plant.id v2 error payload ➜', ax.response?.data);

            const msg =
                ax.response?.data?.error ??
                ax.response?.statusText ??
                ax.message;

            const status = ax.response?.status ?? 500;
            logger.error('PlantId API %s → %s', status, msg);

            throw CustomError.fromStatus(status, msg, undefined, err);
        }

        logger.error('Unexpected error calling PlantId API: %s', err);
        throw CustomError.internal('Error interno comunicando con PlantId', undefined, err);
    }
}
