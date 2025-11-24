package com.petscape.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AppointmentRequest {

    @NotNull(message = "Animal ID is required")
    private Long animalId;

    @NotBlank(message = "Date is required")
    private String date;

    @NotBlank(message = "Time slot is required")
    private String timeSlot;

    private String notes;
}
