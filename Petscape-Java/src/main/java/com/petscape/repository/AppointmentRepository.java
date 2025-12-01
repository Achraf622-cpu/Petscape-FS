package com.petscape.repository;

import com.petscape.entity.Appointment;
import com.petscape.entity.Appointment.AppointmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByUserId(Long userId);

    Page<Appointment> findAll(Pageable pageable);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE DATE(a.dateTime) = DATE(:today)")
    long countTodayAppointments(LocalDateTime today);

    @Modifying
    @Query("UPDATE Appointment a SET a.status = 'COMPLETED' WHERE a.status = 'CONFIRMED' AND a.dateTime < :now")
    int markPastConfirmedAsCompleted(LocalDateTime now);

    @Modifying
    @Query("UPDATE Appointment a SET a.status = 'EXPIRED' WHERE a.status = 'PENDING' AND a.dateTime < :now")
    int markPastPendingAsExpired(LocalDateTime now);

    @Query("SELECT a FROM Appointment a WHERE DATE(a.dateTime) = DATE(:today) ORDER BY a.dateTime ASC")
    List<Appointment> findTodayAppointments(LocalDateTime today);
}
