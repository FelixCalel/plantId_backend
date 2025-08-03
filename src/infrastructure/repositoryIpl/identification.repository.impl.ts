import path from 'path';
import fs from 'fs/promises';
import { prisma } from '../../config/database';
import { logger } from '../../config/logger';
import {
    IdentifyResponse,
    PlantIdSuggestion,
} from '../external/plantid-api.service';
import { EstadoPlanta } from '@prisma/client';
import { Identificacion } from '../../domain/entities/identification.entity';
import { IdentificacionRepository } from '../../domain/repositories/identification.repository';

const mejorSugerencia = (res: IdentifyResponse): PlantIdSuggestion | null =>
    res.suggestions?.length
        ? [...res.suggestions].sort((a, b) => b.probability - a.probability)[0]
        : null;

const nombresComunesSeguros = (arr?: string[]): string[] =>
    arr?.slice(0, 10) ?? [];

export class IdentificacionRepositoryImpl implements IdentificacionRepository {
    constructor(
        private readonly datasource?: never,
    ) { }

    async createFromApi(
        rutaImagenLocal: string,
        apiJson: IdentifyResponse,
    ): Promise<Identificacion> {
        const sugerencia = mejorSugerencia(apiJson);
        if (!sugerencia) throw new Error('Respuesta sin sugerencias');

        const nombreFamilia =
            sugerencia.plant_details?.taxonomy?.family ?? 'Desconocida';

        const familia = await prisma.familia.upsert({
            where: { nombre: nombreFamilia },
            update: {},
            create: { nombre: nombreFamilia, descripcion: nombreFamilia },
        });

        const t = sugerencia.plant_details?.taxonomy ?? {};

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

        const nombreCientifico = sugerencia.plant_name;
        let planta = await prisma.planta.findFirst({
            where: { nombreCientifico },
            include: { imagenes: true },
        });

        if (!planta) {
            planta = await prisma.planta.create({
                data: {
                    nombreCientifico,
                    nombresComunes: nombresComunesSeguros(
                        sugerencia.plant_details?.common_names,
                    ),
                    estado: EstadoPlanta.ACTIVA,
                    taxonomiaId: taxonomia.id,
                    familiaId: familia.id,
                },
                include: { imagenes: true },
            });
        }

        const dirDestino = path.join(process.cwd(), 'public', 'imagenes', `${planta.id}`);
        await fs.mkdir(dirDestino, { recursive: true });

        const nombreArchivo = `original_${Date.now()}${path.extname(rutaImagenLocal)}`;
        const rutaDestino = path.join(dirDestino, nombreArchivo);

        await fs.rename(rutaImagenLocal, rutaDestino);

        await prisma.imagenPlanta.create({
            data: {
                plantaId: planta.id,
                url: path.relative(path.join(process.cwd(), 'public'), rutaDestino)
                    .replace(/\\/g, '/'),
                miniatura: false,
            },
        });

        const identificacion = await prisma.identificacion.create({
            data: {
                plantaId: planta.id,
                imagenBase64: rutaDestino,
                respuestaApi: apiJson as unknown as object,
                confianza: sugerencia.probability,
            },
        });

        logger.info('Identificación %o', {
            id: identificacion.id,
            planta: planta.nombreCientifico,
            confianza: sugerencia.probability,
        });

        return Identificacion.fromPrisma(
            identificacion,
            planta,
            taxonomia,
            familia,
        );
    }

    async getById(id: number): Promise<Identificacion | null> {
        const ident = await prisma.identificacion.findUnique({
            where: { id },
            include: {
                planta: { include: { imagenes: true, taxonomia: true, familia: true } },
            },
        });

        return ident
            ? Identificacion.fromPrisma(
                ident,
                ident.planta!,
                ident.planta!.taxonomia!,
                ident.planta!.familia!,
            )
            : null;
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
                    planta: { include: { imagenes: true, taxonomia: true, familia: true } },
                },
            }),
        ]);

        return {
            total,
            page,
            limit,
            items: filas.map(f =>
                Identificacion.fromPrisma(
                    f,
                    f.planta!,
                    f.planta!.taxonomia!,
                    f.planta!.familia!,
                ),
            ),
        };
    }
}
