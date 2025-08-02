import 'dotenv/config';
import { get } from 'env-var';

export const envs = {
    PORT: get('PORT').required().asPortNumber(),
    HOST: get('HOST').required().asString(),
    PUBLIC_PATH: get('PUBLIC_PATH').default('public').asString(),

    PLANTID_API_KEY: get('PLANTID_API_KEY').required().asString(),
    PLANTID_BASE_URL: get('PLANTID_BASE_URL').required().asString(),
};