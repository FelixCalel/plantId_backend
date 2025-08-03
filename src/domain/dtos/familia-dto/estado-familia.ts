export class CambiarEstadoFamiliaDto {
    private constructor(
        public readonly id: number,
        public readonly estado: boolean,
    ) { }

    static crear(obj: any): [string?, CambiarEstadoFamiliaDto?] {
        if (!obj.id) return ['El id es obligatorio'];
        if (!obj.estado) return ['El estado es obligatorio'];
        if (!['ACTIVA', 'INACTIVA'].includes(obj.estado))
            return ['Estado inválido (ACTIVA | INACTIVA)'];
        return [undefined, new CambiarEstadoFamiliaDto(Number(obj.id), obj.estado)];
    }
}
