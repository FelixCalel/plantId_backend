
import { prisma } from '../../config/database';
import { PlantaDatasource } from '../../domain/datasources/planta.datasource';
import { CrearPlantaDto } from '../../domain/dtos/planta-dto/create-planta-dto';
import { CambiarEstadoPlantaDto } from '../../domain/dtos/planta-dto/state-planta-dto';
import { ActualizarPlantaDto } from '../../domain/dtos/planta-dto/update-planta-dto';
import { Planta } from '../../domain/entities/plant.entity';
import { CustomError } from '../../domain/error/custom.error';


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

    async getAll(q = '', page = 1, estado?: 'ACTIVA' | 'INACTIVA'): Promise<Planta[]> {
        const plantas = await prisma.planta.findMany({
            where: {
                nombreCientifico: { contains: q, mode: 'insensitive' },
                ...(estado ? { estado } : {})
            },
            include: {
                imagenes: { where: { miniatura: true } },
                taxonomia: { include: { familia: true } }
            },
            skip: (page - 1) * 25,
            take: 25,
            orderBy: { nombreCientifico: 'asc' },
        });
        return plantas.map(Planta.fromPrisma);
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
