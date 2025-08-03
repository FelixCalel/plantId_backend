import { TaxonomiaRepository } from '../../domain/repositories/taxonomia.repository';
import { TaxonomiaDatasource } from '../../domain/datasources/taxonomia.datasource';
import { CrearTaxonomiaDto } from '../../domain/dtos/taxonomia-dto/create-taxonomia-dto';
import { ActualizarTaxonomiaDto } from '../../domain/dtos/taxonomia-dto/update-taxonomia-dto';

export class TaxonomiaRepositoryImpl implements TaxonomiaRepository {
    constructor(private readonly ds: TaxonomiaDatasource) { }

    create(dto: CrearTaxonomiaDto) { return this.ds.create(dto); }
    getAll(familiaId?: number) { return this.ds.getAll(familiaId); }
    update(dto: ActualizarTaxonomiaDto) { return this.ds.update(dto); }
}
