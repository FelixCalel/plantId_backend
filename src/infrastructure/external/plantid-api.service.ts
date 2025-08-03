import axios, { AxiosInstance, AxiosError } from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { envs } from '../../config/envs';
import { logger } from '../../config/logger';
import { CustomError } from '../../domain/error/custom.error';

export interface PlantIdSuggestion {
    id: number;
    plant_name: string;
    plant_details: {
        common_names?: string[];
        url?: string;
        wiki_description?: { value: string };
        taxonomy?: {
            family?: string;
            genus?: string;
            order?: string;
            kingdom?: string;
            phylum?: string;
            class?: string;
            species?: string;
            rank?: string;
        };
    };
    probability: number;
}

export interface IdentifyResponse {
    id: string;
    suggestions: PlantIdSuggestion[];
    meta_data: { latitude?: number; longitude?: number };
    is_plant: boolean;
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
    private http: AxiosInstance;

    constructor(
        private readonly apiKey = envs.PLANTID_API_KEY,
        private readonly baseUrl = envs.PLANTID_BASE_URL,
    ) {
        this.http = axios.create({
            baseURL: this.baseUrl.replace(/\/+$/, ''),
            timeout: 30_000,
            headers: {
                'Api-Key': this.apiKey,
                'Content-Type': 'application/json',
            },
        });
    }

    async identify(localImagePath: string): Promise<IdentifyResponse> {
        try {
            const absPath = path.resolve(localImagePath);
            const fileBytes = await fs.readFile(absPath);
            const base64Img = fileBytes.toString('base64');

            const payload = {
                images: [base64Img],
                modifiers: ['crops_fast', 'similar_images'],
                plant_language: 'es',
                plant_details: ['common_names', 'url', 'wiki_description', 'taxonomy'],
            };

            const { data } = await this.http.post<IdentifyResponse>('/identify', payload);

            if (data.error)
                throw CustomError.badRequest(`PlantId API error: ${data.error}`);

            return data;
        } catch (error) {
            return this.handleAxiosError(error);
        }
    }

    async getUsage(): Promise<UsageResponse> {
        try {
            const { data } = await this.http.get<UsageResponse>('/usage');
            return data;
        } catch (error) {
            return this.handleAxiosError(error);
        }
    }
    private handleAxiosError<T>(error: unknown): never {
        if (axios.isAxiosError(error)) {
            const axiosErr = error as AxiosError<{ error: string }>;

            const msg =
                axiosErr.response?.data?.error ??
                axiosErr.response?.statusText ??
                axiosErr.message;

            const status = axiosErr.response?.status ?? 500;
            logger.error('PlantId API request failed: %s', msg);

            throw CustomError.fromStatus(status, msg, undefined, error);
        }

        logger.error('Unexpected error calling PlantId API: %s', error);
        throw CustomError.internal(
            'Error interno comunicando con PlantId',
            undefined,
            error,
        );
    }

}
