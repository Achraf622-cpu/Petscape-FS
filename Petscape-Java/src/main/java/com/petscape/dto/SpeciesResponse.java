package com.petscape.dto;

import lombok.Builder;
import lombok.Data;

/**
 * Response DTO for Species — shields the JPA entity from the API contract.
 * The API surface can evolve independently of the database schema.
 */
@Data
@Builder
public class SpeciesResponse {
    private Long id;
    private String name;
    private String description;
}
