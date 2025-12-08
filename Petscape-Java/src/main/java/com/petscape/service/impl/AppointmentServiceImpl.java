package com.petscape.service.impl;

import com.petscape.annotation.Auditable;
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
import com.petscape.service.IAppointmentService;
import com.petscape.service.INotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements IAppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final AnimalRepository animalRepository;
    private final AppointmentMapper appointmentMapper;
    private final INotificationService notificationService;

    @Override
    @Transactional
    @Auditable(action = "BOOK_APPOINTMENT", entityType = "Appointment")
    public AppointmentResponse book(AppointmentRequest request, User currentUser) {
        Animal animal = animalRepository.findById(request.getAnimalId())
                .orElseThrow(() -> new ResourceNotFoundException("Animal not found"));
        LocalDate date = LocalDate.parse(request.getDate());
        String timeStr = request.getTimeSlot().contains(" - ")
                ? request.getTimeSlot().split(" - ")[0].trim()
                : request.getTimeSlot().trim();
        LocalDateTime dateTime = LocalDateTime.of(date, LocalTime.parse(timeStr));
        Appointment appointment = Appointment.builder()
                .user(currentUser).animal(animal).dateTime(dateTime)
                .status(AppointmentStatus.PENDING).notes(request.getNotes()).build();
        return appointmentMapper.toResponse(appointmentRepository.save(appointment));
    }

    @Override
    @Transactional
    @Auditable(action = "UPDATE_APPOINTMENT_STATUS", entityType = "Appointment")
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
        } else if (status == AppointmentStatus.CANCELLED) {
            notificationService.createFor(userId,
                    "Appointment Cancelled",
                    "Your appointment to visit " + animalName + " has been cancelled.",
                    NotificationType.APPOINTMENT_CANCELLED);
        }

        return result;
    }

    @Override
    @Transactional
    @Auditable(action = "CANCEL_APPOINTMENT", entityType = "Appointment")
    public void cancel(Long id, User currentUser) {
        Appointment appointment = findById(id);
        if (!appointment.getUser().getId().equals(currentUser.getId()) && !currentUser.isAdmin()) {
            throw new ForbiddenException("You are not authorized to cancel this appointment");
        }
        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(appointment);
    }

    @Override
    public List<AppointmentResponse> getMyAppointments(Long userId) {
        return appointmentRepository.findByUserId(userId)
                .stream().map(appointmentMapper::toResponse).toList();
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
