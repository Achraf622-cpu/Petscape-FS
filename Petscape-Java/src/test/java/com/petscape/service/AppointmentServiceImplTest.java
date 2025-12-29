package com.petscape.service;

import com.petscape.dto.AppointmentRequest;
import com.petscape.dto.AppointmentResponse;
import com.petscape.entity.Animal;
import com.petscape.entity.Appointment;
import com.petscape.entity.Appointment.AppointmentStatus;
import com.petscape.entity.User;
import com.petscape.exception.ForbiddenException;
import com.petscape.exception.ResourceNotFoundException;
import com.petscape.mapper.AppointmentMapper;
import com.petscape.repository.AnimalRepository;
import com.petscape.repository.AppointmentRepository;
import com.petscape.service.impl.AppointmentServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AppointmentServiceImpl Unit Tests")
class AppointmentServiceImplTest {

    @Mock
    private AppointmentRepository appointmentRepository;
    @Mock
    private AnimalRepository animalRepository;
    @Mock
    private AppointmentMapper appointmentMapper;
    @InjectMocks
    private AppointmentServiceImpl appointmentService;

    private User makeUser(Long id) {
        return User.builder().id(id).build();
    }

    @Test
    @DisplayName("book() — creates appointment for existing animal")
    void book_success() {
        AppointmentRequest req = new AppointmentRequest();
        req.setAnimalId(1L);
        req.setDate("2026-03-15");
        req.setTimeSlot("10:00 - 11:00");
        req.setNotes("Please bring a leash");

        Animal animal = new Animal();
        animal.setId(1L);
        User user = makeUser(1L);
        Appointment saved = new Appointment();
        saved.setId(1L);
        AppointmentResponse dto = AppointmentResponse.builder().id(1L).build();

        when(animalRepository.findById(1L)).thenReturn(Optional.of(animal));
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(saved);
        when(appointmentMapper.toResponse(saved)).thenReturn(dto);

        AppointmentResponse result = appointmentService.book(req, user);
        assertThat(result.getId()).isEqualTo(1L);
        verify(appointmentRepository).save(any(Appointment.class));
    }

    @Test
    @DisplayName("book() — throws ResourceNotFoundException for unknown animal")
    void book_unknownAnimal_throws() {
        AppointmentRequest req = new AppointmentRequest();
        req.setAnimalId(99L);
        req.setDate("2026-03-15");
        req.setTimeSlot("10:00");

        when(animalRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> appointmentService.book(req, makeUser(1L)))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Animal not found");
    }

    @Test
    @DisplayName("cancel() — owner can cancel appointment")
    void cancel_byOwner_success() {
        User owner = makeUser(1L);
        Appointment appointment = new Appointment();
        appointment.setId(1L);
        appointment.setUser(owner);
        appointment.setStatus(AppointmentStatus.PENDING);

        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));

        appointmentService.cancel(1L, owner);

        assertThat(appointment.getStatus()).isEqualTo(AppointmentStatus.CANCELLED);
        verify(appointmentRepository).save(appointment);
    }

    @Test
    @DisplayName("cancel() — non-owner throws ForbiddenException")
    void cancel_nonOwner_throws() {
        User owner = makeUser(1L);
        User other = makeUser(99L);
        Appointment appointment = new Appointment();
        appointment.setId(1L);
        appointment.setUser(owner);
        appointment.setStatus(AppointmentStatus.PENDING);

        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));

        assertThatThrownBy(() -> appointmentService.cancel(1L, other))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    @DisplayName("updateStatus() — admin can update status to CONFIRMED")
    void updateStatus_success() {
        User admin = makeUser(1L);
        Appointment appointment = new Appointment();
        appointment.setId(1L);
        appointment.setUser(admin);
        appointment.setStatus(AppointmentStatus.PENDING);
        AppointmentResponse dto = AppointmentResponse.builder().id(1L).build();

        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(appointment)).thenReturn(appointment);
        when(appointmentMapper.toResponse(appointment)).thenReturn(dto);

        AppointmentResponse result = appointmentService.updateStatus(1L, AppointmentStatus.CONFIRMED, admin);
        assertThat(appointment.getStatus()).isEqualTo(AppointmentStatus.CONFIRMED);
        assertThat(result.getId()).isEqualTo(1L);
    }
}
