import { CrearFamiliaDto } from '../dtos/familia-dto/create-familia-dto';
import { CambiarEstadoFamiliaDto } from '../dtos/familia-dto/estado-familia';
import { ActualizarFamiliaDto } from '../dtos/familia-dto/update-familia-dto';
import { Familia } from '../entities/family.entity';

export interface FamiliaRepository {
    create(dto: CrearFamiliaDto): Promise<Familia>;
    getAll(q?: string, page?: number): Promise<Familia[]>;
    update(dto: ActualizarFamiliaDto): Promise<Familia>;
    changeStatus(dto: CambiarEstadoFamiliaDto): Promise<void>;
}
