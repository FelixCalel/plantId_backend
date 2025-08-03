import { CrearTaxonomiaDto } from '../dtos/taxonomia-dto/create-taxonomia-dto';
import { ActualizarTaxonomiaDto } from '../dtos/taxonomia-dto/update-taxonomia-dto';
import { Taxonomia } from '../entities/taxonomy.entity';


export interface TaxonomiaDatasource {
    create(dto: CrearTaxonomiaDto): Promise<Taxonomia>;

    getAll(familiaId?: number): Promise<Taxonomia[]>;

    update(dto: ActualizarTaxonomiaDto): Promise<Taxonomia>;
}
