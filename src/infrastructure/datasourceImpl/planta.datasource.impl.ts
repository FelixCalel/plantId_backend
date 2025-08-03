
import { prisma } from '../../config/database';
import { PlantaDatasource } from '../../domain/datasources/planta.datasource';
import { CrearPlantaDto } from '../../domain/dtos/planta-dto/create-planta-dto';
import { CambiarEstadoPlantaDto } from '../../domain/dtos/planta-dto/state-planta-dto';
import { ActualizarPlantaDto } from '../../domain/dtos/planta-dto/update-planta-dto';
import { Planta } from '../../domain/entities/plant.entity';
import { CustomError } from '../../domain/error/custom.error';


export interface PlantaConImagenes {
    id: number;
    nombreCientifico: string;
    nombresComunes: string[];
    estado: 'ACTIVA' | 'INACTIVA';
    taxonomiaId: number;
    familiaId: number;
    creadoEn: Date;
    actualizadoEn: Date;
    imagenes: string[];
    /** ↪︎ Agrégalo: */
    taxonomia: {
        id: number;
        reino: string | null;
        filo: string | null;
        clase: string | null;
        orden: string | null;
        genero: string | null;
        especie: string | null;
        rango: string | null;
        /** Y dentro, su familia: */
        familia: {
            id: number;
            nombre: string;
            descripcion: string | null;
            estado: boolean;
        }
    };
}

export class PlantaDataSourceImpl implements PlantaDatasource {

    async create(dto: CrearPlantaDto): Promise<Planta> {
        const existe = await prisma.planta.findFirst({
            where: { nombreCientifico: dto.nombreCientifico }
        });
        if (existe) throw CustomError.badRequest('La planta ya está registrada');

        const creada = await prisma.planta.create({
            data: {
                nombreCientifico: dto.nombreCientifico,
                nombresComunes: dto.nombresComunes,
                taxonomiaId: dto.taxonomiaId,
                familiaId: dto.familiaId,
                estado: 'ACTIVA',
            }
        });
        return Planta.fromPrisma(creada);
    }

    async getAll(
        q = '',
        page = 1,
        estado?: 'ACTIVA' | 'INACTIVA'
    ): Promise<PlantaConImagenes[]> {
        const plantas = await prisma.planta.findMany({
            where: {
                nombreCientifico: { contains: q, mode: 'insensitive' },
                ...(estado ? { estado } : {}),
            },
            include: {
                imagenes: true,
                taxonomia: {
                    include: { familia: true }
                }
            },
            skip: (page - 1) * 25,
            take: 25,
            orderBy: { nombreCientifico: 'asc' },
        });

        return plantas.map(p => ({
            id: p.id,
            nombreCientifico: p.nombreCientifico,
            nombresComunes: p.nombresComunes,
            estado: p.estado,
            taxonomiaId: p.taxonomiaId,
            familiaId: p.familiaId!,
            creadoEn: p.creadoEn,
            actualizadoEn: p.actualizadoEn,
            imagenes: p.imagenes.map(img => img.url),

            /* ↪︎ Aquí mapeas la taxonomía tal cual la incluiste: */
            taxonomia: {
                id: p.taxonomia.id,
                reino: p.taxonomia.reino,
                filo: p.taxonomia.filo,
                clase: p.taxonomia.clase,
                orden: p.taxonomia.orden,
                genero: p.taxonomia.genero,
                especie: p.taxonomia.especie,
                rango: p.taxonomia.rango,
                familia: {
                    id: p.taxonomia.familia.id,
                    nombre: p.taxonomia.familia.nombre,
                    descripcion: p.taxonomia.familia.descripcion,
                    estado: p.taxonomia.familia.estado,
                }
            }
        }));
    }

    async update(dto: ActualizarPlantaDto): Promise<Planta> {
        const actualizada = await prisma.planta.update({
            where: { id: dto.id },
            data: dto.toPlainObject(),
        });
        return Planta.fromPrisma(actualizada);
    }

    async changeStatus(dto: CambiarEstadoPlantaDto): Promise<void> {
        await prisma.planta.update({
            where: { id: dto.id },
            data: { estado: dto.estado },
        });
    }
}
