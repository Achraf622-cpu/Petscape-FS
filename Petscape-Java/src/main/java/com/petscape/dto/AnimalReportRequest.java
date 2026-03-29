package com.petscape.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class AnimalReportRequest {

    @NotNull(message = "Species is required")
    private com.petscape.entity.Species species;

    private String name;
    private String breed;
    private Integer age;
    private String gender;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Location is required")
    private String location;

    /** Optional GPS coordinates from map picker */
    private Double latitude;
    private Double longitude;

    @NotBlank(message = "Contact name is required")
    private String contactName;

    @NotBlank(message = "Contact email is required")
    @Email
    private String contactEmail;

    @NotBlank(message = "Contact phone is required")
    private String contactPhone;

    @NotNull(message = "Please specify if animal was found")
    private Boolean isFound;

    private MultipartFile image;
}
