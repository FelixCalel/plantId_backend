import { Identificacion } from "../../entities/identification.entity";

export interface IdentificacionDto {
    id: number;
    imagenUrl: string;
    confianza: number | null;
    creadaEn: string;
    planta: {
        id: number;
        nombreCientifico: string;
        nombresComunes: string[];
        familia: string;
    };
}

export const toIdentificacionDto = (
    ident: Identificacion,
): IdentificacionDto => ({
    id: ident.id,

    imagenUrl: ident.imagenBase64
        .replace(/^.*?public[\\/]/, '')
        .replace(/\\/g, '/'),

    confianza: ident.confianza,
    creadaEn: ident.creadaEn.toISOString(),

    planta: {
        id: ident.planta.id,
        nombreCientifico: ident.planta.nombreCientifico,
        nombresComunes: ident.planta.nombresComunes,
        familia: ident.familia.nombre,
    },
});
