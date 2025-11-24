package com.petscape.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.petscape.entity.Animal.AnimalStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AnimalResponse {
    private Long id;
    private String name;
    private Long speciesId;
    private String speciesName;
    private String breed;
    private Integer age;
    private String description;
    private AnimalStatus status;
    private String image;
    private String location;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;
}
