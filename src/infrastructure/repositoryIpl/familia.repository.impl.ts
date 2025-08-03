
import { FamiliaDatasource } from '../../domain/datasources/familia.datasource';
import { CrearFamiliaDto } from '../../domain/dtos/familia-dto/create-familia-dto';
import { CambiarEstadoFamiliaDto } from '../../domain/dtos/familia-dto/estado-familia';
import { ActualizarFamiliaDto } from '../../domain/dtos/familia-dto/update-familia-dto';

export class FamiliaRepositoryImpl implements FamiliaRepositoryImpl {
    constructor(private readonly ds: FamiliaDatasource) { }

    create(dto: CrearFamiliaDto) { return this.ds.create(dto); }
    getAll(q?: string, p?: number) { return this.ds.getAll(q, p); }
    update(dto: ActualizarFamiliaDto) { return this.ds.update(dto); }
    changeStatus(dto: CambiarEstadoFamiliaDto) { return this.ds.changeStatus(dto); }
}
