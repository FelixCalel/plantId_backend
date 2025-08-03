import { Identificacion } from "../../entities/identification.entity";
import { toIdentificacionDto } from "./identification.dto";

export interface IdentificacionesPaginaDto {
    page: number;
    limit: number;
    total: number;
    items: ReturnType<typeof toIdentificacionDto>[];
}

export const toPaginaDto = (
    page: number,
    limit: number,
    total: number,
    items: Identificacion[],
): IdentificacionesPaginaDto => ({
    page,
    limit,
    total,
    items: items.map(toIdentificacionDto),
});
