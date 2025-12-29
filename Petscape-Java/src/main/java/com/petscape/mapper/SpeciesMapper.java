package com.petscape.mapper;

import com.petscape.dto.SpeciesRequest;
import com.petscape.dto.SpeciesResponse;
import com.petscape.entity.Species;
import org.mapstruct.*;

@Mapper
public interface SpeciesMapper {

    SpeciesResponse toResponse(Species species);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "animals", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Species toEntity(SpeciesRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "animals", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromRequest(SpeciesRequest request, @MappingTarget Species species);
}
