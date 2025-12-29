package com.petscape.mapper;

import com.petscape.dto.AdoptionRequestResponse;
import com.petscape.entity.AdoptionRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper
public interface AdoptionRequestMapper {

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "userFullName", expression = "java(ar.getUser().getFirstname() + \" \" + ar.getUser().getLastname())")
    @Mapping(target = "animalId", source = "animal.id")
    @Mapping(target = "animalName", source = "animal.name")
    AdoptionRequestResponse toResponse(AdoptionRequest ar);
}
