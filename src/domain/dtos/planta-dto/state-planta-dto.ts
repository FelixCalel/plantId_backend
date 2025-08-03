export class CambiarEstadoPlantaDto {
    private constructor(
        public readonly id: number,
        public readonly estado: 'ACTIVA' | 'INACTIVA',
    ) { }

    static crear(obj: any): [string?, CambiarEstadoPlantaDto?] {
        if (!obj.id) return ['El id es obligatorio'];
        if (!obj.estado) return ['El estado es obligatorio'];

        const estado = String(obj.estado).toUpperCase();
        if (!['ACTIVA', 'INACTIVA'].includes(estado))
            return ['Estado inválido (ACTIVA | INACTIVA)'];

        return [undefined, new CambiarEstadoPlantaDto(Number(obj.id), estado as any)];
    }
}
