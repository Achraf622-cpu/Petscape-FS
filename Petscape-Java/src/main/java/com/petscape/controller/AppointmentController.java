package com.petscape.controller;

import com.petscape.dto.AppointmentRequest;
import com.petscape.dto.AppointmentResponse;
import com.petscape.dto.StatusUpdateRequest;
import com.petscape.entity.Appointment.AppointmentStatus;
import com.petscape.entity.User;
import com.petscape.service.IAppointmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
@Tag(name = "Appointments", description = "Book and manage animal visit appointments")
@SecurityRequirement(name = "bearerAuth")
public class AppointmentController {

    private final IAppointmentService appointmentService;

    @PostMapping
    @Operation(summary = "Book an appointment for an animal meeting")
    public ResponseEntity<AppointmentResponse> store(
            @Valid @RequestBody AppointmentRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(appointmentService.book(request, currentUser));
    }

    @GetMapping("/my")
    @Operation(summary = "Get all of the current user's appointments")
    public ResponseEntity<org.springframework.data.domain.Page<AppointmentResponse>> myAppointments(
            @AuthenticationPrincipal User currentUser,
            org.springframework.data.domain.Pageable pageable) {
        return ResponseEntity.ok(appointmentService.getMyAppointments(currentUser.getId(), pageable));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update appointment status — CONFIRMED | CANCELLED | COMPLETED (Admin only)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AppointmentResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest body,
            @AuthenticationPrincipal User currentUser) {
        AppointmentStatus status = AppointmentStatus.valueOf(body.status().toUpperCase());
        return ResponseEntity.ok(appointmentService.updateStatus(id, status, currentUser));
    }

    @DeleteMapping("/{id}/cancel")
    @Operation(summary = "Cancel an appointment (owner or admin)")
    public ResponseEntity<Map<String, String>> cancel(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        appointmentService.cancel(id, currentUser);
        return ResponseEntity.ok(Map.of("message", "Appointment cancelled successfully"));
    }
}
