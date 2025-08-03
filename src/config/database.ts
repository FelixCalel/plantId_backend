import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

export const prisma = new PrismaClient();


export async function initDB() {
    try {
        await prisma.$connect();
        logger.info('✅ Base de datos conectada');
    } catch (e) {
        logger.error('❌ No fue posible conectar a la base de datos', { e });
        process.exit(1);
    }
}

const shutdown = async (signal: string) => {
    logger.warn(`⏹  Señal ${signal} recibida; cerrando Prisma…`);
    await prisma.$disconnect();
    process.exit(0);
};

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));
