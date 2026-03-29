package com.petscape.dto;

import com.petscape.entity.AnimalReport;
import com.petscape.entity.AnimalReport.ReportStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class AnimalReportResponse {
    private Long id;
    private Long userId;
    private String userFullName;
    private com.petscape.entity.Species species;
    private String name;
    private String breed;
    private Integer age;
    private String gender;
    private String description;
    private String location;
    private Double latitude;
    private Double longitude;
    private String contactName;
    private String contactEmail;
    private String contactPhone;
    private String image;
    private LocalDateTime dateReported;
    private Boolean isFound;
    private ReportStatus status;
    private LocalDateTime createdAt;

    public static AnimalReportResponse from(AnimalReport r) {
        return AnimalReportResponse.builder()
                .id(r.getId())
                .userId(r.getUser() != null ? r.getUser().getId() : null)
                .userFullName(r.getUser() != null ? r.getUser().getFirstname() + " " + r.getUser().getLastname() : null)
                .species(r.getSpecies())
                .name(r.getName())
                .breed(r.getBreed())
                .age(r.getAge())
                .gender(r.getGender())
                .description(r.getDescription())
                .location(r.getLocation())
                .latitude(r.getLatitude())
                .longitude(r.getLongitude())
                .contactName(r.getContactName())
                .contactEmail(r.getContactEmail())
                .contactPhone(r.getContactPhone())
                .image(r.getImage())
                .dateReported(r.getDateReported())
                .isFound(r.getIsFound())
                .status(r.getStatus())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
