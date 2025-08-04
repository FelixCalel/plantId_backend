import {
    Identificacion as PrismaIdent,
    Planta,
    Taxonomia,
    Familia,
    Prisma,
} from '@prisma/client';

export class Identificacion {

    constructor(
        public readonly id: number,
        public readonly imagenBase64: string,
        public readonly confianza: number | null,
        public readonly respuestaApi: Prisma.JsonValue,
        public readonly creadaEn: Date,
        public readonly planta: Planta,
        public readonly taxonomia: Taxonomia,
        public readonly familia: Familia,
        public readonly secret?: string,
    ) { }

    static fromPrisma(
        row: PrismaIdent,
        planta: Planta,
        taxonomia: Taxonomia,
        familia: Familia,
    ): Identificacion {
        return new Identificacion(
            row.id,
            row.imagenBase64,
            row.confianza,
            row.respuestaApi,
            row.creadaEn,
            planta,
            taxonomia,
            familia,
            row.secret ?? undefined,
        );
    }
}
