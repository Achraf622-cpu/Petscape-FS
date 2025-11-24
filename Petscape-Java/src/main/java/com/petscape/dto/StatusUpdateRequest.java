package com.petscape.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Shared request body for all "change status" PATCH endpoints.
 * Used by AdoptionRequestController, AppointmentController,
 * AnimalReportController.
 */
public record StatusUpdateRequest(@NotBlank(message = "Status is required") String status) {
}
