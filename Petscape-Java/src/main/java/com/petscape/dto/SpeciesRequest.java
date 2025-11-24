package com.petscape.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;

/**
 * Request body for POST /api/species and PUT /api/species/{id}
 */
@Getter
public class SpeciesRequest {

    @NotBlank(message = "Species name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;
}
