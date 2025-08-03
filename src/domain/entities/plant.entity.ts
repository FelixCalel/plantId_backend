export class Planta {
    constructor(
        public readonly id: number,
        public readonly nombreCientifico: string,
        public readonly nombresComunes: string[],
        public readonly estado: 'ACTIVA' | 'INACTIVA',
        public readonly taxonomiaId: number,
        public readonly familiaId: number | null,
        public readonly creadoEn: Date,
        public readonly actualizadoEn: Date,
    ) { }

    static fromPrisma(r: any): Planta {
        return new Planta(
            r.id, r.nombreCientifico, r.nombresComunes,
            r.estado, r.taxonomiaId, r.familiaId,
            r.creadoEn, r.actualizadoEn
        );
    }
}
