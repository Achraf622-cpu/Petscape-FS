package com.petscape.dto;

import com.petscape.entity.Animal.AnimalStatus;
import jakarta.validation.constraints.*;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@Data
public class AnimalRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Species is required")
    private Long speciesId;

    @NotBlank(message = "Breed is required")
    private String breed;

    @NotNull(message = "Age is required")
    @Min(value = 0, message = "Age cannot be negative")
    private Integer age;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Status is required")
    private AnimalStatus status;

    @NotBlank(message = "Location is required")
    private String location;

    private List<String> existingImages;

    private List<MultipartFile> images;
}
