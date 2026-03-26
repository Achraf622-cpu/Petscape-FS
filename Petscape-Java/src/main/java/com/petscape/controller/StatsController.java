package com.petscape.controller;

import com.petscape.repository.AdoptionRequestRepository;
import com.petscape.repository.AnimalRepository;
import com.petscape.repository.AnimalReportRepository;
import com.petscape.repository.DonationRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.Map;


@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
@Tag(name = "Public Stats", description = "Live platform statistics for the public stats page")
public class StatsController {

    private final AnimalRepository animalRepository;
    private final AdoptionRequestRepository adoptionRepository;
    private final AnimalReportRepository reportRepository;
    private final DonationRepository donationRepository;

    @GetMapping
    @Operation(summary = "Get aggregated public platform statistics")
    public ResponseEntity<Map<String, Object>> getStats() {
        long totalAnimals = animalRepository.count();
        long availableAnimals = animalRepository.countByStatus(com.petscape.entity.Animal.AnimalStatus.AVAILABLE);
        long adoptedAnimals = animalRepository.countByStatus(com.petscape.entity.Animal.AnimalStatus.ADOPTED);
        long totalReports = reportRepository.count();
        long resolvedReports = reportRepository.countByStatus(com.petscape.entity.AnimalReport.ReportStatus.RESOLVED);
        long totalAdoptions = adoptionRepository.count();
        BigDecimal totalDonated = donationRepository.sumCompletedDonations();

        return ResponseEntity.ok(Map.of(
                "totalAnimals", totalAnimals,
                "availableAnimals", availableAnimals,
                "adoptedAnimals", adoptedAnimals,
                "adoptionRate", totalAnimals > 0 ? Math.round((double) adoptedAnimals / totalAnimals * 100) : 0,
                "totalReports", totalReports,
                "resolvedReports", resolvedReports,
                "totalAdoptions", totalAdoptions,
                "totalDonated", totalDonated != null ? totalDonated : BigDecimal.ZERO));
    }
}
