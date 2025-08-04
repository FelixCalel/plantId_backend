import { IdentifyResponse } from '../../infrastructure/external/plantid-api.service';
import { Identificacion } from '../entities/identification.entity';

export interface IdentificacionRepository {

    createFromApi(data: {
        imagenBase64: string;
        respuestaApi: IdentifyResponse;
        confianza: number;
        secret: string;
    }): Promise<Identificacion>;

    getById(id: number): Promise<Identificacion | null>;
    paginate(
        page: number,
        limit: number,
    ): Promise<{
        items: Identificacion[];
        total: number;
        page: number;
        limit: number;
    }>;
}
