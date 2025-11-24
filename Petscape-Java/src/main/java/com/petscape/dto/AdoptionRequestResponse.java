package com.petscape.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.petscape.entity.AdoptionRequest.AdoptionStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AdoptionRequestResponse {
    private Long id;
    private Long userId;
    private String userFullName;
    private Long animalId;
    private String animalName;
    private AdoptionStatus status;
    private String message;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
}
