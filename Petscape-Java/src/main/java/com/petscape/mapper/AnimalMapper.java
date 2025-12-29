package com.petscape.mapper;

import com.petscape.dto.AnimalRequest;
import com.petscape.dto.AnimalResponse;
import com.petscape.entity.Animal;
import org.mapstruct.*;

@Mapper
public interface AnimalMapper {

    @Mapping(target = "speciesId", source = "species.id")
    @Mapping(target = "speciesName", source = "species.name")
    AnimalResponse toResponse(Animal animal);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "species", ignore = true)
    @Mapping(target = "image", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "adoptionRequests", ignore = true)
    @Mapping(target = "appointments", ignore = true)
    Animal toEntity(AnimalRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "species", ignore = true)
    @Mapping(target = "image", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "adoptionRequests", ignore = true)
    @Mapping(target = "appointments", ignore = true)
    void updateEntityFromRequest(AnimalRequest request, @MappingTarget Animal animal);
}
