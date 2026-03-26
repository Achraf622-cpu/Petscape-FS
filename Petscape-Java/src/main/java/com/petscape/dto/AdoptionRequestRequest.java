package com.petscape.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;


@Getter
public class AdoptionRequestRequest {

    @NotNull(message = "Animal ID is required")
    @Positive(message = "Animal ID must be a positive number")
    private Long animalId;

    private String message;
}
