package com.petscape.controller;

import com.petscape.dto.SpeciesRequest;
import com.petscape.dto.SpeciesResponse;
import com.petscape.service.ISpeciesService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/species")
@RequiredArgsConstructor
@Tag(name = "Species", description = "Animal species management")
public class SpeciesController {

    private final ISpeciesService speciesService;

    @GetMapping
    @Operation(summary = "Get all species (public)")
    public ResponseEntity<List<SpeciesResponse>> index() {
        return ResponseEntity.ok(speciesService.getAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get species by ID (public)")
    public ResponseEntity<SpeciesResponse> show(@PathVariable Long id) {
        return ResponseEntity.ok(speciesService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new species (Admin only)", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<SpeciesResponse> create(@Valid @RequestBody SpeciesRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(speciesService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update a species (Admin only)", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<SpeciesResponse> update(@PathVariable Long id,
            @Valid @RequestBody SpeciesRequest request) {
        return ResponseEntity.ok(speciesService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a species (Admin only)", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        speciesService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Species deleted"));
    }
}
