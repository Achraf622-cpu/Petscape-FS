package com.petscape.mapper;

import com.petscape.dto.AnimalRequest;
import com.petscape.dto.AnimalResponse;
import com.petscape.entity.Animal;
import org.mapstruct.*;

@Mapper
public interface AnimalMapper {

    AnimalResponse toResponse(Animal animal);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "adoptionRequests", ignore = true)
    @Mapping(target = "appointments", ignore = true)
    Animal toEntity(AnimalRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "adoptionRequests", ignore = true)
    @Mapping(target = "appointments", ignore = true)
    void updateEntityFromRequest(AnimalRequest request, @MappingTarget Animal animal);
}
