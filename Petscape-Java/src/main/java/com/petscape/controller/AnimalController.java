package com.petscape.controller;

import com.petscape.dto.AnimalRequest;
import com.petscape.dto.AnimalResponse;
import com.petscape.service.IAnimalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/animals")
@RequiredArgsConstructor
@Tag(name = "Animals", description = "Animal CRUD and adoption listing")
public class AnimalController {

    private final IAnimalService animalService;

    @GetMapping
    @Operation(summary = "List all animals with optional filters")
    public ResponseEntity<Page<AnimalResponse>> index(
            @RequestParam(required = false) Long speciesId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        String[] sortParts = sort.split(",");
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(sortParts[1]), sortParts[0]));
        return ResponseEntity.ok(animalService.getAll(speciesId, status, search, pageable));
    }

    @GetMapping("/adoption")
    @Operation(summary = "List available animals for adoption (public)")
    public ResponseEntity<Map<String, Object>> adoptionPage(
            @RequestParam(required = false) Long speciesId,
            @RequestParam(required = false) Integer maxAge,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<AnimalResponse> animals = animalService.getAvailableForAdoption(speciesId, maxAge, search, pageable);
        return ResponseEntity.ok(Map.of(
                "animals", animals,
                "adoptedCount", animalService.getAdoptedCount()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get animal by ID")
    public ResponseEntity<AnimalResponse> show(@PathVariable Long id) {
        return ResponseEntity.ok(animalService.getById(id));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Create a new animal (Admin only)", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<AnimalResponse> create(@Valid @ModelAttribute AnimalRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(animalService.create(request));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Update an animal (Admin only)", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<AnimalResponse> update(@PathVariable Long id, @Valid @ModelAttribute AnimalRequest request) {
        return ResponseEntity.ok(animalService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an animal (Admin only)", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        animalService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Animal deleted successfully"));
    }
}
