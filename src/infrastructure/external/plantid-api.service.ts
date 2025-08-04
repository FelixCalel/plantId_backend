import axios, { AxiosInstance, AxiosError } from 'axios';
import fs from 'fs/promises';
import path from 'path';

import { envs } from '../../config/envs';
import { logger } from '../../config/logger';
import { CustomError } from '../../domain/error/custom.error';

export interface PlantIdSuggestion {
    id: number;
    plant_name: string;
    probability: number;
    plant_details?: {
        common_names?: string[];
        url?: string;
        wiki_description?: { value: string };
        taxonomy?: {
            kingdom?: string;
            phylum?: string;
            class?: string;
            order?: string;
            family?: string;
            genus?: string;
            species?: string;
            rank?: string;
        };
    };
}

export interface IdentifyResponse {
    id: string;
    access_token: string;
    result: {
        is_plant: { binary: boolean; probability: number };
        classification: { suggestions: PlantIdSuggestion[] };
    };
    meta_data?: { latitude?: number; longitude?: number };
}

export interface UsageResponse {
    status: string;
    request_id: string;
    credits_used: number;
    credits_remaining: number;
    credits_limit: number;
}

export interface ChatbotMessage {
    content: string;
    type: 'question' | 'answer';
    created: string;
}

export interface ChatbotConversationResponse {
    messages: ChatbotMessage[];
    identification: string;
    remaining_calls: number;
    model_parameters: {
        model: string;
        temperature: number;
    };
    feedback: Record<string, unknown>;
}

export class PlantIdApiService {
    private readonly http: AxiosInstance;

    constructor(
        private readonly apiKey = envs.PLANTID_API_KEY,
        private readonly baseUrl = envs.PLANTID_BASE_URL
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
            const abs = path.resolve(localImagePath);
            const bytes = await fs.readFile(abs);
            const b64 = bytes.toString('base64');
            const payload = {
                images: [b64],
                modifiers: ['crops_fast', 'similar_images'],
                plant_language: 'es',
                plant_details: ['common_names', 'url', 'wiki_description', 'taxonomy'],
            };
            const { data } = await this.http.post<IdentifyResponse>(
                '/v2/identify',
                payload
            );

            if ((data as any).error) {
                throw CustomError.badRequest(`PlantId API error: ${(data as any).error}`);
            }
            return data;
        } catch (err) {
            return this.handleAxiosError(err);
        }
    }

    async getUsage(): Promise<UsageResponse> {
        try {
            const { data } = await this.http.get<UsageResponse>('/v2/usage');
            return data;
        } catch (err) {
            return this.handleAxiosError(err);
        }
    }

    async askChatbot(accessToken: string, question: string)
        : Promise<ChatbotConversationResponse> {
        try {
            const payload = { question };
            const url = `/v3/identification/${accessToken}/conversation`;
            const { data } = await this.http.post<ChatbotConversationResponse>(url, payload);
            return data;
        } catch (err) {
            return this.handleAxiosError(err);
        }
    }

    private handleAxiosError<T>(err: unknown): never {
        if (axios.isAxiosError(err)) {
            const ax = err as AxiosError<any>;
            console.error('Plant.ID error payload ➜', ax.response?.data);

            const msg =
                ax.response?.data?.error ??
                ax.response?.statusText ??
                ax.message;
            const status = ax.response?.status ?? 500;
            logger.error('PlantId API %s → %s', status, msg);

            throw CustomError.fromStatus(status, msg, undefined, err);
        }

        logger.error('Unexpected error calling PlantId API: %s', err);
        throw CustomError.internal(
            'Error interno comunicando con PlantId',
            undefined,
            err
        );
    }
}
