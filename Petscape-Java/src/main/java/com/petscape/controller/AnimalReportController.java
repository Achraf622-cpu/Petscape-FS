package com.petscape.controller;

import com.petscape.dto.AnimalReportRequest;
import com.petscape.dto.AnimalReportResponse;
import com.petscape.dto.StatusUpdateRequest;
import com.petscape.entity.AnimalReport.ReportStatus;
import com.petscape.entity.User;
import com.petscape.service.IAnimalReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Tag(name = "Animal Reports", description = "Lost and found animal reports")
public class AnimalReportController {

    private final IAnimalReportService reportService;

    @GetMapping
    @Operation(summary = "List all reports with optional filters")
    public ResponseEntity<Page<AnimalReportResponse>> index(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Long speciesId,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(reportService.getAll(type, speciesId, location, status, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get report by ID")
    public ResponseEntity<AnimalReportResponse> show(@PathVariable Long id) {
        return ResponseEntity.ok(reportService.getById(id));
    }

    @GetMapping("/my")
    @Operation(summary = "Get current user's reports", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Page<AnimalReportResponse>> myReports(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(reportService.getMyReports(currentUser.getId(), pageable));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Create a new report", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<AnimalReportResponse> create(
            @ModelAttribute AnimalReportRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reportService.create(request, currentUser));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Update a report (owner or admin)", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<AnimalReportResponse> update(
            @PathVariable Long id,
            @ModelAttribute AnimalReportRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(reportService.update(id, request, currentUser));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a report (owner or admin)", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Map<String, String>> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        reportService.delete(id, currentUser);
        return ResponseEntity.ok(Map.of("message", "Report deleted successfully"));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Change report status — OPEN | RESOLVED | CLOSED", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<AnimalReportResponse> changeStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest body,
            @AuthenticationPrincipal User currentUser) {
        ReportStatus status = ReportStatus.valueOf(body.status().toUpperCase());
        return ResponseEntity.ok(reportService.changeStatus(id, status, currentUser));
    }
}
