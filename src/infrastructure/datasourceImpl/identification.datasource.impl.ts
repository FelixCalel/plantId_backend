import { prisma } from '../../config/database';
import { IdentificacionDatasource } from '../../domain/datasources/identification.datasource';
import { Identificacion } from '../../domain/entities/identification.entity';

export class IdentificacionDataSourceImpl implements IdentificacionDatasource {


    async create(data: {
        plantaId: number;
        imagenBase64: string;
        respuestaApi: object;
        confianza: number;
    }): Promise<Identificacion> {

        const ident = await prisma.identificacion.create({
            data,
            include: {
                planta: { include: { imagenes: true, taxonomia: true, familia: true } },
            },
        });

        return Identificacion.fromPrisma(
            ident,
            ident.planta!,
            ident.planta!.taxonomia!,
            ident.planta!.familia!,
        );
    }

    async findById(id: number): Promise<Identificacion | null> {
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
