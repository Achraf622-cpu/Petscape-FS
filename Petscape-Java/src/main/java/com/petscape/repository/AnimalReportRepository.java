package com.petscape.repository;

import com.petscape.entity.AnimalReport;
import com.petscape.entity.AnimalReport.ReportStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface AnimalReportRepository
        extends JpaRepository<AnimalReport, Long>, JpaSpecificationExecutor<AnimalReport> {
    Page<AnimalReport> findByUserId(Long userId, Pageable pageable);

    long countByIsFoundFalse();

    long countByStatus(ReportStatus status);

    Page<AnimalReport> findByIsFound(Boolean isFound, Pageable pageable);
}
