import { PlantaRepository } from '../../domain/repositories/planta.repository';
import { PlantaDatasource } from '../../domain/datasources/planta.datasource';
import { CrearPlantaDto } from '../../domain/dtos/planta-dto/create-planta-dto';
import { ActualizarPlantaDto } from '../../domain/dtos/planta-dto/update-planta-dto';
import { CambiarEstadoPlantaDto } from '../../domain/dtos/planta-dto/state-planta-dto';


export class PlantaRepositoryImpl implements PlantaRepository {
    constructor(private readonly ds: PlantaDatasource) { }

    create(dto: CrearPlantaDto) { return this.ds.create(dto); }
    getAll(q?: string, p?: number, e?: 'ACTIVA' | 'INACTIVA') { return this.ds.getAll(q, p, e); }
    update(dto: ActualizarPlantaDto) { return this.ds.update(dto); }
    changeStatus(dto: CambiarEstadoPlantaDto) { return this.ds.changeStatus(dto); }
}
