import { prisma } from '../../config/database';
import { FamiliaDatasource } from '../../domain/datasources/familia.datasource';
import { CrearFamiliaDto } from '../../domain/dtos/familia-dto/create-familia-dto';
import { CambiarEstadoFamiliaDto } from '../../domain/dtos/familia-dto/estado-familia';
import { ActualizarFamiliaDto } from '../../domain/dtos/familia-dto/update-familia-dto';
import { Familia } from '../../domain/entities/family.entity';
import { CustomError } from '../../domain/error/custom.error';


export class FamiliaDataSourceImpl implements FamiliaDatasource {

    async create(dto: CrearFamiliaDto): Promise<Familia> {
        const existe = await prisma.familia.findFirst({ where: { nombre: dto.nombre } });
        if (existe) throw CustomError.badRequest('La familia ya existe');

        const creada = await prisma.familia.create({ data: dto });
        return Familia.fromPrisma(creada);
    }

    async getAll(q = '', page = 1): Promise<Familia[]> {
        const familias = await prisma.familia.findMany({
            where: { nombre: { contains: q, mode: 'insensitive' } },
            skip: (page - 1) * 25,
            take: 25,
            orderBy: { nombre: 'asc' },
        });
        return familias.map(Familia.fromPrisma);
    }

    async update(dto: ActualizarFamiliaDto): Promise<Familia> {
        const actualizada = await prisma.familia.update({
            where: { id: dto.id },
            data: dto.toPlainObject(),
        });
        return Familia.fromPrisma(actualizada);
    }

    async changeStatus(dto: CambiarEstadoFamiliaDto): Promise<void> {
        await prisma.familia.update({
            where: { id: dto.id },
            data: { estado: dto.estado },
        });
    }
}
