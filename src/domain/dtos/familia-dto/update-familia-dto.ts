export class ActualizarFamiliaDto {
    private constructor(
        public readonly id: number,
        public readonly nombre?: string,
        public readonly descripcion?: string,
    ) { }

    static crear(obj: any): [string?, ActualizarFamiliaDto?] {
        if (!obj.id) return ['El id es obligatorio'];
        return [undefined, new ActualizarFamiliaDto(
            Number(obj.id), obj.nombre, obj.descripcion)];
    }

    toPlainObject() {
        return {
            nombre: this.nombre,
            descripcion: this.descripcion
        };
    }
}
