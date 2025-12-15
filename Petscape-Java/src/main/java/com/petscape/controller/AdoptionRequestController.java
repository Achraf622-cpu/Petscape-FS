package com.petscape.controller;

import com.petscape.dto.AdoptionRequestRequest;
import com.petscape.dto.AdoptionRequestResponse;
import com.petscape.dto.StatusUpdateRequest;
import com.petscape.entity.AdoptionRequest.AdoptionStatus;
import com.petscape.entity.User;
import com.petscape.service.IAdoptionRequestService;
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
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/adoption-requests")
@RequiredArgsConstructor
@Tag(name = "Adoption Requests", description = "Submit, track, and manage adoption requests")
@SecurityRequirement(name = "bearerAuth")
public class AdoptionRequestController {

    private final IAdoptionRequestService service;

    @PostMapping
    @Operation(summary = "Submit an adoption request for an animal")
    public ResponseEntity<AdoptionRequestResponse> store(
            @Valid @RequestBody AdoptionRequestRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.store(request.getAnimalId(), request.getMessage(), currentUser));
    }

    @GetMapping("/my")
    @Operation(summary = "Get all of the current user's adoption requests (paginated)")
    public ResponseEntity<Page<AdoptionRequestResponse>> myRequests(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(service.getMyRequests(currentUser.getId(), pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a single adoption request by ID")
    public ResponseEntity<AdoptionRequestResponse> show(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(service.getById(id, currentUser));
    }

    @DeleteMapping("/{id}/cancel")
    @Operation(summary = "Cancel a pending adoption request (request owner only)")
    public ResponseEntity<Map<String, String>> cancel(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        service.cancel(id, currentUser);
        return ResponseEntity.ok(Map.of("message", "Adoption request cancelled"));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update adoption request status — APPROVED | REJECTED (Admin only)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdoptionRequestResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest body) {
        AdoptionStatus status = AdoptionStatus.valueOf(body.status().toUpperCase());
        return ResponseEntity.ok(service.updateStatus(id, status));
    }
}
