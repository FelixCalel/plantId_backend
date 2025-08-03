import { Identificacion } from "../entities/identification.entity";


export interface IdentificacionDatasource {

    create(data: {
        plantaId: number;
        imagenBase64: string;
        respuestaApi: object;
        confianza: number;
    }): Promise<Identificacion>;

    findById(id: number): Promise<Identificacion | null>;


    paginate(
        page: number,
        limit: number,
    ): Promise<{
        total: number;
        items: Identificacion[];
    }>;
}
