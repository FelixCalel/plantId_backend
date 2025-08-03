
import { prisma } from '../../config/database';
import { TaxonomiaDatasource } from '../../domain/datasources/taxonomia.datasource';
import { CrearTaxonomiaDto } from '../../domain/dtos/taxonomia-dto/create-taxonomia-dto';
import { ActualizarTaxonomiaDto } from '../../domain/dtos/taxonomia-dto/update-taxonomia-dto';
import { Taxonomia } from '../../domain/entities/taxonomy.entity';

export class TaxonomiaDataSourceImpl implements TaxonomiaDatasource {

    async create(dto: CrearTaxonomiaDto): Promise<Taxonomia> {
        const creada = await prisma.taxonomia.create({ data: dto });
        return Taxonomia.fromPrisma(creada);
    }

    async getAll(familiaId?: number): Promise<Taxonomia[]> {
        const filas = await prisma.taxonomia.findMany({
            where: familiaId ? { familiaId } : {},
            include: { familia: true },
            orderBy: { id: 'asc' },
        });
        return filas.map(Taxonomia.fromPrisma);
    }

    async update(dto: ActualizarTaxonomiaDto): Promise<Taxonomia> {
        const actualizada = await prisma.taxonomia.update({
            where: { id: dto.id },
            data: dto.toPlainObject(),
        });
        return Taxonomia.fromPrisma(actualizada);
    }
}
