package com.petscape.controller;

import com.petscape.dto.*;
import com.petscape.service.IAdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Admin Panel", description = "Admin-only management and oversight endpoints")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final IAdminService adminService;


    @GetMapping("/dashboard")
    @Operation(summary = "Dashboard statistics: animals, appointments, reports, adoption counts")
    public ResponseEntity<Map<String, Object>> dashboard() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/animals")
    @Operation(summary = "Paginated list of all animals")
    public ResponseEntity<Page<AnimalResponse>> animals(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(adminService.getAnimals(pageable));
    }

    @GetMapping("/appointments")
    @Operation(summary = "Paginated list of all appointments")
    public ResponseEntity<Page<AppointmentResponse>> appointments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "dateTime"));
        return ResponseEntity.ok(adminService.getAppointments(pageable));
    }

    @GetMapping("/adoptions")
    @Operation(summary = "Paginated adoption requests")
    public ResponseEntity<Page<AdoptionRequestResponse>> adoptions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(adminService.getAdoptions(pageable));
    }

    @GetMapping("/users")
    @Operation(summary = "Paginated list of all registered users")
    public ResponseEntity<Page<UserResponse>> users(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(adminService.getUsers(pageable));
    }

    @GetMapping("/donations")
    @Operation(summary = "Donation stats + paginated donation list")
    public ResponseEntity<Map<String, Object>> donations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(adminService.getDonationStats(pageable));
    }

    // ── User Management ──

    @PatchMapping("/users/{id}/role")
    @Operation(summary = "Change a user's role (USER <-> ADMIN)")
    public ResponseEntity<Map<String, String>> changeRole(@PathVariable Long id, @RequestParam String role) {
        return ResponseEntity.ok(adminService.changeRole(id, role));
    }

    @PostMapping("/users/{id}/ban")
    @Operation(summary = "Ban a user (temporarily or permanently)")
    public ResponseEntity<Map<String, String>> banUser(@PathVariable Long id, @RequestBody BanRequest request) {
        return ResponseEntity.ok(adminService.banUser(id, request));
    }

    @DeleteMapping("/users/{id}/ban")
    @Operation(summary = "Unban a user")
    public ResponseEntity<Map<String, String>> unbanUser(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.unbanUser(id));
    }
}
