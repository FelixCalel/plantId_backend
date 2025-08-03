import { CrearPlantaDto } from '../dtos/planta-dto/create-planta-dto';
import { CambiarEstadoPlantaDto } from '../dtos/planta-dto/state-planta-dto';
import { ActualizarPlantaDto } from '../dtos/planta-dto/update-planta-dto';
import { Planta } from '../entities/plant.entity';

export interface PlantaRepository {
    create(dto: CrearPlantaDto): Promise<Planta>;
    getAll(
        q?: string,
        page?: number,
        estado?: 'ACTIVA' | 'INACTIVA',
    ): Promise<Planta[]>;
    update(dto: ActualizarPlantaDto): Promise<Planta>;
    changeStatus(dto: CambiarEstadoPlantaDto): Promise<void>;
}
