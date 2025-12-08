package com.petscape.service;

import com.petscape.dto.AnimalReportRequest;
import com.petscape.dto.AnimalReportResponse;
import com.petscape.entity.AnimalReport.ReportStatus;
import com.petscape.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IAnimalReportService {
    Page<AnimalReportResponse> getAll(String type, Long speciesId, String location, String status, Pageable pageable);

    AnimalReportResponse getById(Long id);

    Page<AnimalReportResponse> getMyReports(Long userId, Pageable pageable);

    AnimalReportResponse create(AnimalReportRequest request, User currentUser);

    AnimalReportResponse update(Long id, AnimalReportRequest request, User currentUser);

    void delete(Long id, User currentUser);

    AnimalReportResponse changeStatus(Long id, ReportStatus status, User currentUser);
}
