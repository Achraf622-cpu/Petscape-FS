package com.petscape.service;

import com.petscape.dto.AppointmentRequest;
import com.petscape.dto.AppointmentResponse;
import com.petscape.entity.Appointment.AppointmentStatus;
import com.petscape.entity.User;

import java.util.List;

public interface IAppointmentService {
    AppointmentResponse book(AppointmentRequest request, User currentUser);

    AppointmentResponse updateStatus(Long id, AppointmentStatus status, User currentUser);

    void cancel(Long id, User currentUser);

    List<AppointmentResponse> getMyAppointments(Long userId);
}
