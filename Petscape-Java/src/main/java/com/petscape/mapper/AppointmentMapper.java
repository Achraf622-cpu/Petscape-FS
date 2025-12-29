package com.petscape.mapper;

import com.petscape.dto.AppointmentResponse;
import com.petscape.entity.Appointment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper
public interface AppointmentMapper {

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "userFullName", expression = "java(a.getUser().getFirstname() + \" \" + a.getUser().getLastname())")
    @Mapping(target = "animalId", source = "animal.id")
    @Mapping(target = "animalName", source = "animal.name")
    AppointmentResponse toResponse(Appointment a);
}
