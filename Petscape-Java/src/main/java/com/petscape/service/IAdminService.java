package com.petscape.service;

import com.petscape.dto.*;
import com.petscape.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Map;

public interface IAdminService {
    Map<String, Object> getDashboardStats();

    Page<AnimalResponse> getAnimals(Pageable pageable);

    Page<AppointmentResponse> getAppointments(Pageable pageable);

    Page<AdoptionRequestResponse> getAdoptions(Pageable pageable);

    Page<UserResponse> getUsers(Pageable pageable);

    Map<String, Object> getDonationStats(Pageable pageable);

    /** Filtered, paginated audit log — all filters are optional */
    Page<AuditLog> getAuditLogs(Long userId, String action, String entityType, Pageable pageable);

    // ── User Management ──
    Map<String, String> changeRole(Long userId, String role);

    Map<String, String> banUser(Long userId, BanRequest request);

    Map<String, String> unbanUser(Long userId);
}
