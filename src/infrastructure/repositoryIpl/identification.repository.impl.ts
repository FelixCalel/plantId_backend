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

    if (res.result?.classification?.suggestions?.length) {
        return res.result.classification.suggestions;
    }

    if ((res as any).suggestions?.length) {
        return (res as any).suggestions;
    }
    return [];
}

function mejorSugerencia(res: IdentifyResponse): PlantIdSuggestion | null {
    const sugerencias = todasLasSugerencias(res);
    if (!sugerencias.length) return null;
    return [...sugerencias].sort((a, b) => b.probability - a.probability)[0];
}


function nombresComunesSeguros(arr?: string[]): string[] {
    return arr?.slice(0, 10) ?? [];
}

export class IdentificacionRepositoryImpl implements IdentificacionRepository {
    async createFromApi(
        rutaImagenLocal: string,
        apiJson: IdentifyResponse
    ): Promise<Identificacion> {

        const mejor = mejorSugerencia(apiJson);
        if (!mejor) throw new Error('Respuesta de Plant.ID sin sugerencias');

        const nombreFamilia =
            mejor.plant_details?.taxonomy?.family ?? 'Desconocida';
        const familia = await prisma.familia.upsert({
            where: { nombre: nombreFamilia },
            update: {},
            create: { nombre: nombreFamilia, descripcion: nombreFamilia },
        });

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

        await prisma.imagenPlanta.create({
            data: {
                plantaId: planta.id,
                url: path
                    .relative(path.join(process.cwd(), 'public'), rutaDestino)
                    .replace(/\\/g, '/'),
                miniatura: false,
            },
        });


        const identificacion = await prisma.identificacion.create({
            data: {
                plantaId: planta.id,
                imagenBase64: rutaDestino,
                respuestaApi: apiJson as unknown as object,
                confianza: mejor.probability,
                secret: apiJson.access_token,
            },
        });

        logger.info('Identificación creada: %o', {
            id: identificacion.id,
            planta: planta.nombreCientifico,
            confianza: mejor.probability,
        });

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
