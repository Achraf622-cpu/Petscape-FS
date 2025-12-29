package com.petscape.mapper;

import com.petscape.dto.AnimalReportResponse;
import com.petscape.entity.AnimalReport;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper
public interface AnimalReportMapper {

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "userFullName", expression = "java(report.getUser().getFirstname() + \" \" + report.getUser().getLastname())")
    @Mapping(target = "speciesId", source = "species.id")
    @Mapping(target = "speciesName", source = "species.name")
    AnimalReportResponse toResponse(AnimalReport report);
}
