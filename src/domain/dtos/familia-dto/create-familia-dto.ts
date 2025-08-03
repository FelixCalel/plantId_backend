export class CrearFamiliaDto {
    private constructor(
        public readonly nombre: string,
        public readonly descripcion?: string,
    ) { }

    static crear(obj: any): [string?, CrearFamiliaDto?] {
        if (!obj.nombre) return ['El nombre es obligatorio'];
        return [undefined, new CrearFamiliaDto(obj.nombre, obj.descripcion)];
    }
}
