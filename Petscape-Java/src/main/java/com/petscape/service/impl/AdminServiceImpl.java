package com.petscape.service.impl;

import com.petscape.dto.AdoptionRequestResponse;
import com.petscape.dto.AnimalResponse;
import com.petscape.dto.AppointmentResponse;
import com.petscape.dto.UserResponse;
import com.petscape.entity.Animal.AnimalStatus;
import com.petscape.entity.AuditLog;
import com.petscape.mapper.AdoptionRequestMapper;
import com.petscape.mapper.AnimalMapper;
import com.petscape.mapper.AppointmentMapper;
import com.petscape.mapper.UserMapper;
import com.petscape.repository.*;
import com.petscape.service.IAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements IAdminService {

    private final AnimalRepository animalRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final AnimalReportRepository reportRepository;
    private final DonationRepository donationRepository;
    private final AdoptionRequestRepository adoptionRequestRepository;
    private final AuditLogRepository auditLogRepository;
    private final AnimalMapper animalMapper;
    private final AppointmentMapper appointmentMapper;
    private final AdoptionRequestMapper adoptionRequestMapper;
    private final UserMapper userMapper;
    private final JavaMailSender mailSender;

    @Value("${app.base-url:http://localhost:4200}")
    private String baseUrl;

    @Override
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        int year = LocalDate.now().getYear();

        // ── Core stats ──────────────────────────────────────────────────────
        long totalAnimals = animalRepository.count();
        long availableCount = animalRepository.countByStatus(AnimalStatus.AVAILABLE);
        long reservedCount = animalRepository.countByStatus(AnimalStatus.RESERVED);
        long totalAdoptions = adoptionRequestRepository.count();
        long totalAppts = appointmentRepository.count();
        long totalReports = reportRepository.count();

        stats.put("totalAnimals", totalAnimals);
        stats.put("availableAnimals", availableCount);
        stats.put("ongoingAdoptions", reservedCount);
        stats.put("totalAdoptions", totalAdoptions);
        stats.put("todayAppointments", appointmentRepository.countTodayAppointments(java.time.LocalDateTime.now()));
        stats.put("totalAppointments", totalAppts);
        stats.put("activeReports", reportRepository.countByIsFoundFalse());
        stats.put("totalReports", totalReports);
        stats.put("todayAppointmentsList",
                appointmentRepository.findTodayAppointments(java.time.LocalDateTime.now())
                        .stream().limit(5).map(appointmentMapper::toResponse).toList());

        // ── Chart data: adoptions per month ──────────────────────────────────
        List<Object[]> adoptionRows = adoptionRequestRepository.countByMonth(year);
        int[] adoptionsByMonth = new int[12];
        for (Object[] row : adoptionRows) {
            int month = ((Number) row[0]).intValue() - 1; // 0-indexed
            adoptionsByMonth[month] = ((Number) row[1]).intValue();
        }
        stats.put("adoptionsByMonth", IntStream.of(adoptionsByMonth).boxed().toList());

        // ── Chart data: donations per month ──────────────────────────────────
        List<Object[]> donationRows = donationRepository.sumByMonth(year);
        double[] donationsByMonth = new double[12];
        for (Object[] row : donationRows) {
            int month = ((Number) row[0]).intValue() - 1;
            donationsByMonth[month] = ((Number) row[1]).doubleValue();
        }
        stats.put("donationsByMonth",
                java.util.Arrays.stream(donationsByMonth).boxed().toList());

        // ── Chart data: animals by species ───────────────────────────────────
        List<Object[]> speciesRows = animalRepository.countBySpecies();
        Map<String, Long> speciesMap = new LinkedHashMap<>();
        for (Object[] row : speciesRows) {
            speciesMap.put(String.valueOf(row[0]), ((Number) row[1]).longValue());
        }
        stats.put("animalsBySpecies", speciesMap);

        return stats;
    }

    @Override
    public Page<AnimalResponse> getAnimals(Pageable pageable) {
        return animalRepository.findAll(pageable).map(animalMapper::toResponse);
    }

    @Override
    public Page<AppointmentResponse> getAppointments(Pageable pageable) {
        return appointmentRepository.findAll(pageable).map(appointmentMapper::toResponse);
    }

    @Override
    public Page<AdoptionRequestResponse> getAdoptions(Pageable pageable) {
        return adoptionRequestRepository.findAll(pageable).map(adoptionRequestMapper::toResponse);
    }

    @Override
    public Page<UserResponse> getUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(userMapper::toResponse);
    }

    @Override
    public Map<String, Object> getDonationStats(Pageable pageable) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalAmount", donationRepository.sumCompletedDonations());
        stats.put("uniqueDonors", donationRepository.countUniqueDonors());
        stats.put("averageDonation", donationRepository.avgDonationAmount());
        stats.put("donations", donationRepository.findAll(pageable).map(d -> Map.of(
                "id", d.getId(), "userId", d.getUser().getId(),
                "userEmail", d.getUser().getEmail(), "amount", d.getAmount(),
                "status", d.getStatus(), "createdAt", d.getCreatedAt())));
        return stats;
    }

    @Override
    public Page<AuditLog> getAuditLogs(Long userId, String action, String entityType, Pageable pageable) {
        if (userId != null) {
            return auditLogRepository.findByUserId(userId, pageable);
        } else if (action != null && !action.isBlank()) {
            return auditLogRepository.findByAction(action, pageable);
        } else if (entityType != null && !entityType.isBlank()) {
            return auditLogRepository.findByEntityType(entityType, pageable);
        }
        return auditLogRepository.findAll(pageable);
    }

    // ── User Management ──

    @Override
    public Map<String, String> changeRole(Long userId, String role) {
        com.petscape.entity.User user = userRepository.findById(userId)
                .orElseThrow(() -> new com.petscape.exception.ResourceNotFoundException("User not found"));

        if ("admin@petscape.com".equalsIgnoreCase(user.getEmail())) {
            throw new com.petscape.exception.BadRequestException("The Super Admin role cannot be changed.");
        }

        user.setRole(com.petscape.entity.User.Role.valueOf(role.toUpperCase()));
        userRepository.save(user);
        return Map.of("message", "User role updated successfully");
    }

    @Override
    public Map<String, String> banUser(Long userId, com.petscape.dto.BanRequest request) {
        com.petscape.entity.User user = userRepository.findById(userId)
                .orElseThrow(() -> new com.petscape.exception.ResourceNotFoundException("User not found"));

        if ("admin@petscape.com".equalsIgnoreCase(user.getEmail())) {
            throw new com.petscape.exception.BadRequestException("The Super Admin cannot be banned.");
        }

        if (user.isAdmin()) {
            throw new com.petscape.exception.BadRequestException("Cannot ban an admin directly. Change role first.");
        }

        user.setBanned(true);
        user.setBanReason(request.reason());
        user.setBanComment(request.comment());
        user.setBannedAt(java.time.LocalDateTime.now());

        if (request.durationDays() != null) {
            user.setBannedUntil(java.time.LocalDateTime.now().plusDays(request.durationDays()));
        } else {
            user.setBannedUntil(null); // permanent
        }

        userRepository.save(user);

        // Send ban email notification
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setTo(user.getEmail());
            msg.setSubject("Your account has been restricted - PetsCape");

            String duration = request.durationDays() != null ? request.durationDays() + " days" : "permanently";
            String reason = request.reason() != null ? request.reason().name() : "Unspecified";

            msg.setText("Hello " + user.getFirstname() + ",\n\n" +
                    "Your account has been banned " + duration + " for the following reason:\n" +
                    reason + "\n\n" +
                    "If you believe this is a mistake, please contact us at admin@petscape.com\n\n" +
                    "Thank you,\nThe PetsCape Team");
            mailSender.send(msg);
        } catch (Exception e) {
            // Log but don't fail the request if email fails (use System.err to avoid
            // needing slf4j setup here)
            System.err.println("Failed to send ban email: " + e.getMessage());
        }

        return Map.of("message", "User banned successfully");
    }

    @Override
    public Map<String, String> unbanUser(Long userId) {
        com.petscape.entity.User user = userRepository.findById(userId)
                .orElseThrow(() -> new com.petscape.exception.ResourceNotFoundException("User not found"));
        user.setBanned(false);
        user.setBanReason(null);
        user.setBanComment(null);
        user.setBannedAt(null);
        user.setBannedUntil(null);
        userRepository.save(user);
        return Map.of("message", "User unbanned successfully");
    }
}
