// taxonomy.entity.ts
export class Taxonomia {
    constructor(
        public readonly id: number,
        public readonly reino: string | null,
        public readonly filo: string | null,
        public readonly clase: string | null,
        public readonly orden: string | null,
        public readonly genero: string | null,
        public readonly especie: string | null,
        public readonly rango: string | null,
        public readonly familiaId: number,
    ) { }

    static fromPrisma(r: any): Taxonomia {
        return new Taxonomia(
            r.id, r.reino, r.filo, r.clase, r.orden,
            r.genero, r.especie, r.rango, r.familiaId
        );
    }
}
