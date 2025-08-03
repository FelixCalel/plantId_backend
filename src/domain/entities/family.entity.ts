export class Familia {
    constructor(
        public readonly id: number,
        public readonly nombre: string,
        public readonly descripcion: string | null,
        public readonly estado: 'ACTIVA' | 'INACTIVA',
        public readonly creadoEn: Date,
        public readonly actualizadoEn: Date,
    ) { }

    static fromPrisma(r: any): Familia {
        return new Familia(
            r.id, r.nombre, r.descripcion, r.estado,
            r.creadoEn, r.actualizadoEn
        );
    }
}