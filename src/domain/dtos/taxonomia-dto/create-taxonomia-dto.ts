export class CrearTaxonomiaDto {
    private constructor(
        public readonly familiaId: number,
        public readonly reino?: string,
        public readonly filo?: string,
        public readonly clase?: string,
        public readonly orden?: string,
        public readonly genero?: string,
        public readonly especie?: string,
        public readonly rango?: string,
    ) { }

    static crear(obj: any): [string?, CrearTaxonomiaDto?] {
        if (!obj.familiaId) return ['El id de la familia es obligatorio'];
        return [
            undefined,
            new CrearTaxonomiaDto(
                Number(obj.familiaId),
                obj.reino,
                obj.filo,
                obj.clase,
                obj.orden,
                obj.genero,
                obj.especie,
                obj.rango,
            ),
        ];
    }
}
