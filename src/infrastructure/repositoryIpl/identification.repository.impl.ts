// src/infrastructure/repositoryIpl/identification.repository.impl.ts

import path from 'path';
import fs from 'fs/promises';
import { prisma } from '../../config/database';
import { logger } from '../../config/logger';
import { EstadoPlanta } from '@prisma/client';

import {
    IdentifyResponse,
    PlantIdSuggestion,
} from '../external/plantid-api.service';
import { Identificacion } from '../../domain/entities/identification.entity';
import { IdentificacionRepository } from '../../domain/repositories/identification.repository';

function todasLasSugerencias(res: IdentifyResponse): PlantIdSuggestion[] {
    // V3
    if (res.result?.classification?.suggestions?.length) {
        return res.result.classification.suggestions;
    }
    // V2
    if ((res as any).suggestions?.length) {
        return (res as any).suggestions;
    }
    return [];
}

/** Saca la mejor sugerencia de identificación */
function mejorSugerencia(res: IdentifyResponse): PlantIdSuggestion | null {
    const sugerencias = todasLasSugerencias(res);
    if (!sugerencias.length) return null;
    return [...sugerencias].sort((a, b) => b.probability - a.probability)[0];
}

/** Limita los nombres comunes a 10 como máximo */
function nombresComunesSeguros(arr?: string[]): string[] {
    return arr?.slice(0, 10) ?? [];
}

export class IdentificacionRepositoryImpl implements IdentificacionRepository {
    async createFromApi(
        rutaImagenLocal: string,
        apiJson: IdentifyResponse
    ): Promise<Identificacion> {
        // 1) Extraer mejor sugerencia
        const mejor = mejorSugerencia(apiJson);
        if (!mejor) throw new Error('Respuesta de Plant.ID sin sugerencias');

        // 2) Upsert de familia
        const nombreFamilia =
            mejor.plant_details?.taxonomy?.family ?? 'Desconocida';
        const familia = await prisma.familia.upsert({
            where: { nombre: nombreFamilia },
            update: {},
            create: { nombre: nombreFamilia, descripcion: nombreFamilia },
        });

        // 3) Upsert de taxonomía
        const t = mejor.plant_details?.taxonomy ?? {};
        const taxonomia = await prisma.taxonomia.upsert({
            where: {
                familiaId_genero_especie: {
                    familiaId: familia.id,
                    genero: t.genus ?? 'sp',
                    especie: t.species ?? 'sp.',
                },
            },
            update: {},
            create: {
                familiaId: familia.id,
                reino: t.kingdom ?? '',
                filo: t.phylum ?? '',
                clase: t.class ?? '',
                orden: t.order ?? '',
                genero: t.genus ?? 'sp',
                especie: t.species ?? 'sp.',
                rango: t.rank ?? '',
            },
        });

        // 4) Crea o busca planta
        const nombreCientifico = mejor.plant_name;
        let planta = await prisma.planta.findFirst({
            where: { nombreCientifico },
            include: { imagenes: true },
        });
        if (!planta) {
            planta = await prisma.planta.create({
                data: {
                    nombreCientifico,
                    nombresComunes: nombresComunesSeguros(
                        mejor.plant_details?.common_names
                    ),
                    estado: EstadoPlanta.ACTIVA,
                    taxonomiaId: taxonomia.id,
                    familiaId: familia.id,
                },
                include: { imagenes: true },
            });
        }

        // 5) Mueve la imagen al directorio público
        const dirDestino = path.join(
            process.cwd(),
            'public',
            'imagenes',
            `${planta.id}`
        );
        await fs.mkdir(dirDestino, { recursive: true });
        const nombreArchivo = `original_${Date.now()}${path.extname(
            rutaImagenLocal
        )}`;
        const rutaDestino = path.join(dirDestino, nombreArchivo);
        await fs.rename(rutaImagenLocal, rutaDestino);

        // 6) Guarda la URL en ImagenPlanta
        await prisma.imagenPlanta.create({
            data: {
                plantaId: planta.id,
                url: path
                    .relative(path.join(process.cwd(), 'public'), rutaDestino)
                    .replace(/\\/g, '/'),
                miniatura: false,
            },
        });

        // 7) Crea la Identificación en BD, guardando también el access_token
        const identificacion = await prisma.identificacion.create({
            data: {
                plantaId: planta.id,
                imagenBase64: rutaDestino,
                respuestaApi: apiJson as unknown as object,
                confianza: mejor.probability,
                secret: apiJson.access_token,   // <-- aquí guardamos el token para el chat
            },
        });

        logger.info('Identificación creada: %o', {
            id: identificacion.id,
            planta: planta.nombreCientifico,
            confianza: mejor.probability,
        });

        // 8) Devolver la entidad de dominio
        return Identificacion.fromPrisma(
            identificacion,
            planta,
            taxonomia,
            familia
        );
    }

    async getById(id: number): Promise<Identificacion | null> {
        const ident = await prisma.identificacion.findUnique({
            where: { id },
            include: {
                planta: { include: { imagenes: true, taxonomia: true, familia: true } },
            },
        });
        if (!ident) return null;
        return Identificacion.fromPrisma(
            ident,
            ident.planta!,
            ident.planta!.taxonomia!,
            ident.planta!.familia!
        );
    }

    async paginate(page = 1, limit = 25) {
        const skip = (page - 1) * limit;
        const [total, filas] = await prisma.$transaction([
            prisma.identificacion.count(),
            prisma.identificacion.findMany({
                skip,
                take: limit,
                orderBy: { creadaEn: 'desc' },
                include: {
                    planta: {
                        include: { imagenes: true, taxonomia: true, familia: true },
                    },
                },
            }),
        ]);
        return {
            total,
            page,
            limit,
            items: filas.map((f) =>
                Identificacion.fromPrisma(
                    f,
                    f.planta!,
                    f.planta!.taxonomia!,
                    f.planta!.familia!
                )
            ),
        };
    }
}
