export class CrearPlantaDto {
  private constructor(
    public readonly nombreCientifico: string,
    public readonly taxonomiaId: number,
    public readonly nombresComunes: string[] = [],
    public readonly familiaId?: number,
  ) { }

  static crear(obj: any): [string?, CrearPlantaDto?] {
    if (!obj.nombreCientifico) return ['El nombre científico es obligatorio'];
    if (!obj.taxonomiaId) return ['El id de la taxonomía es obligatorio'];

    return [
      undefined,
      new CrearPlantaDto(
        obj.nombreCientifico,
        Number(obj.taxonomiaId),
        Array.isArray(obj.nombresComunes) ? obj.nombresComunes : [],
        obj.familiaId ? Number(obj.familiaId) : undefined,
      ),
    ];
  }
}
