export class ActualizarPlantaDto {
    private constructor(
        public readonly id: number,
        public readonly nombreCientifico?: string,
        public readonly nombresComunes?: string[],
        public readonly taxonomiaId?: number,
        public readonly familiaId?: number,
    ) { }

    static crear(obj: any): [string?, ActualizarPlantaDto?] {
        if (!obj.id) return ['El id es obligatorio'];

        return [
            undefined,
            new ActualizarPlantaDto(
                Number(obj.id),
                obj.nombreCientifico,
                Array.isArray(obj.nombresComunes) ? obj.nombresComunes : undefined,
                obj.taxonomiaId ? Number(obj.taxonomiaId) : undefined,
                obj.familiaId ? Number(obj.familiaId) : undefined,
            ),
        ];
    }

    toPlainObject() {
        const { id, ...rest } = this as any;
        return rest;
    }
}
