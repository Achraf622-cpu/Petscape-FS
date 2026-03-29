package com.petscape.service.impl;

import com.petscape.dto.AppointmentRequest;
import com.petscape.dto.AppointmentResponse;
import com.petscape.entity.Animal;
import com.petscape.entity.Appointment;
import com.petscape.entity.Appointment.AppointmentStatus;
import com.petscape.entity.Notification.NotificationType;
import com.petscape.entity.User;
import com.petscape.exception.ForbiddenException;
import com.petscape.exception.ResourceNotFoundException;
import com.petscape.mapper.AppointmentMapper;
import com.petscape.repository.AnimalRepository;
import com.petscape.repository.AppointmentRepository;
import com.petscape.repository.UserRepository;
import com.petscape.service.IAppointmentService;
import com.petscape.service.INotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import org.springframework.data.domain.Page;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentServiceImpl implements IAppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final AnimalRepository animalRepository;
    private final AppointmentMapper appointmentMapper;
    private final INotificationService notificationService;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public AppointmentResponse book(AppointmentRequest request, User currentUser) {
        Animal animal = animalRepository.findById(request.getAnimalId())
                .orElseThrow(() -> new ResourceNotFoundException("Animal not found"));
        LocalDate date = LocalDate.parse(request.getDate());
        String timeStr = request.getTimeSlot().contains(" - ")
                ? request.getTimeSlot().split(" - ")[0].trim()
                : request.getTimeSlot().trim();
        LocalDateTime dateTime = LocalDateTime.of(date, LocalTime.parse(timeStr));
        Appointment appointment = Appointment.builder()
                .user(currentUser)
                .animal(animal)
                .dateTime(dateTime)
                .status(AppointmentStatus.PENDING)
                .notes(request.getNotes())
                .build();

        Appointment saved = appointmentRepository.save(appointment);
        log.debug("Booked appointment {} for user {} and animal {}", saved.getId(), currentUser.getEmail(),
                animal.getName());


        java.util.List<User> admins = userRepository.findByRole(User.Role.ADMIN);
        String requesterName = currentUser.getFirstname() + " " + currentUser.getLastname();
        String animalName = animal.getName();
        String dateLabel = saved.getDateTime().toLocalDate().toString();
        for (User admin : admins) {

            notificationService.createFor(
                    admin.getId(),
                    "New appointment request",
                    requesterName + " requested an appointment to visit " + animalName + " on " + dateLabel + ".",
                    NotificationType.GENERAL);
            log.debug("Sent appointment request notification (GENERAL) to admin {}", admin.getEmail());
        }

        return appointmentMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public AppointmentResponse updateStatus(Long id, AppointmentStatus status, User currentUser) {
        Appointment appointment = findById(id);
        appointment.setStatus(status);
        AppointmentResponse result = appointmentMapper.toResponse(appointmentRepository.save(appointment));

        // Send notification to the appointment owner
        Long userId = appointment.getUser().getId();
        String animalName = appointment.getAnimal().getName();
        if (status == AppointmentStatus.CONFIRMED) {
            notificationService.createFor(userId,
                    "Appointment Confirmed ✅",
                    "Your appointment to visit " + animalName + " on " + appointment.getDateTime().toLocalDate()
                            + " has been confirmed.",
                    NotificationType.APPOINTMENT_CONFIRMED);
            log.debug("Sent APPOINTMENT_CONFIRMED notification to user {}", appointment.getUser().getEmail());
        } else if (status == AppointmentStatus.CANCELLED) {
            notificationService.createFor(userId,
                    "Appointment Cancelled",
                    "Your appointment to visit " + animalName + " has been cancelled.",
                    NotificationType.APPOINTMENT_CANCELLED);
            log.debug("Sent APPOINTMENT_CANCELLED notification to user {}", appointment.getUser().getEmail());
        }

        return result;
    }

    @Override
    @Transactional
    public void cancel(Long id, User currentUser) {
        Appointment appointment = findById(id);
        if (!appointment.getUser().getId().equals(currentUser.getId()) && !currentUser.isAdmin()) {
            throw new ForbiddenException("You are not authorized to cancel this appointment");
        }
        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(appointment);
    }

    @Override
    public Page<AppointmentResponse> getMyAppointments(Long userId, org.springframework.data.domain.Pageable pageable) {
        return appointmentRepository.findByUserId(userId, pageable)
                .map(appointmentMapper::toResponse);
    }

    @Scheduled(fixedRate = 3600000)
    @Transactional
    public void autoUpdatePastAppointments() {
        LocalDateTime now = LocalDateTime.now();
        appointmentRepository.markPastConfirmedAsCompleted(now);
        appointmentRepository.markPastPendingAsExpired(now);
    }

    private Appointment findById(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
    }
}
