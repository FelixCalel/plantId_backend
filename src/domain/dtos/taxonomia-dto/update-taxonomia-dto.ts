export class ActualizarTaxonomiaDto {
    private constructor(
        public readonly id: number,
        public readonly reino?: string,
        public readonly filo?: string,
        public readonly clase?: string,
        public readonly orden?: string,
        public readonly genero?: string,
        public readonly especie?: string,
        public readonly rango?: string,
        public readonly familiaId?: number,
    ) { }

    static crear(obj: any): [string?, ActualizarTaxonomiaDto?] {
        if (!obj.id) return ['El id es obligatorio'];

        return [
            undefined,
            new ActualizarTaxonomiaDto(
                Number(obj.id),
                obj.reino,
                obj.filo,
                obj.clase,
                obj.orden,
                obj.genero,
                obj.especie,
                obj.rango,
                obj.familiaId ? Number(obj.familiaId) : undefined,
            ),
        ];
    }

    toPlainObject() {
        const { id, ...rest } = this as any;
        return rest;
    }
}
