package com.petscape.service.impl;

import com.petscape.dto.AnimalReportRequest;
import com.petscape.dto.AnimalReportResponse;
import com.petscape.entity.AnimalReport;
import com.petscape.entity.AnimalReport.ReportStatus;
import com.petscape.entity.Species;
import com.petscape.entity.User;
import com.petscape.exception.ForbiddenException;
import com.petscape.exception.ResourceNotFoundException;
import com.petscape.mapper.AnimalReportMapper;
import com.petscape.repository.AnimalReportRepository;
import com.petscape.repository.SpeciesRepository;
import com.petscape.service.IAnimalReportService;
import com.petscape.service.IFileStorageService;
import com.petscape.specification.AnimalReportSpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AnimalReportServiceImpl implements IAnimalReportService {

    private final AnimalReportRepository reportRepository;
    private final SpeciesRepository speciesRepository;
    private final IFileStorageService fileStorageService;
    private final AnimalReportMapper reportMapper;

    @Override
    public Page<AnimalReportResponse> getAll(String type, Long speciesId, String location, String status,
            Pageable pageable) {
        Specification<AnimalReport> spec = AnimalReportSpecifications.withFilters(type, speciesId, location, status);
        return reportRepository.findAll(spec, pageable).map(reportMapper::toResponse);
    }

    @Override
    public AnimalReportResponse getById(Long id) {
        return reportMapper.toResponse(findById(id));
    }

    @Override
    public Page<AnimalReportResponse> getMyReports(Long userId, Pageable pageable) {
        return reportRepository.findByUserId(userId, pageable).map(reportMapper::toResponse);
    }

    @Override
    @Transactional
    public AnimalReportResponse create(AnimalReportRequest request, User currentUser) {
        Species species = findSpecies(request.getSpeciesId());
        AnimalReport report = AnimalReport.builder()
                .user(currentUser).species(species)
                .name(request.getName()).breed(request.getBreed())
                .age(request.getAge()).gender(request.getGender())
                .description(request.getDescription()).location(request.getLocation())
                .latitude(request.getLatitude()).longitude(request.getLongitude())
                .contactName(request.getContactName()).contactEmail(request.getContactEmail())
                .contactPhone(request.getContactPhone()).isFound(request.getIsFound())
                .status(ReportStatus.PENDING).build();
        if (request.getImage() != null && !request.getImage().isEmpty()) {
            report.setImage(fileStorageService.store(request.getImage(), "reports"));
        }
        return reportMapper.toResponse(reportRepository.save(report));
    }

    @Override
    @Transactional
    public AnimalReportResponse update(Long id, AnimalReportRequest request, User currentUser) {
        AnimalReport report = findById(id);
        checkOwnership(report, currentUser);
        Species species = findSpecies(request.getSpeciesId());
        report.setSpecies(species);
        report.setName(request.getName());
        report.setBreed(request.getBreed());
        report.setAge(request.getAge());
        report.setGender(request.getGender());
        report.setDescription(request.getDescription());
        report.setLocation(request.getLocation());
        report.setLatitude(request.getLatitude());
        report.setLongitude(request.getLongitude());
        report.setContactName(request.getContactName());
        report.setContactEmail(request.getContactEmail());
        report.setContactPhone(request.getContactPhone());
        if (request.getImage() != null && !request.getImage().isEmpty()) {
            if (report.getImage() != null)
                fileStorageService.delete(report.getImage());
            report.setImage(fileStorageService.store(request.getImage(), "reports"));
        }
        return reportMapper.toResponse(reportRepository.save(report));
    }

    @Override
    @Transactional
    public void delete(Long id, User currentUser) {
        AnimalReport report = findById(id);
        checkOwnership(report, currentUser);
        if (report.getImage() != null)
            fileStorageService.delete(report.getImage());
        reportRepository.delete(report);
    }

    @Override
    @Transactional
    public AnimalReportResponse changeStatus(Long id, ReportStatus status, User currentUser) {
        AnimalReport report = findById(id);
        checkOwnership(report, currentUser);
        report.setStatus(status);
        return reportMapper.toResponse(reportRepository.save(report));
    }

    private void checkOwnership(AnimalReport report, User currentUser) {
        if (!report.getUser().getId().equals(currentUser.getId()) && !currentUser.isAdmin()) {
            throw new ForbiddenException("You do not have permission to modify this report");
        }
    }

    private AnimalReport findById(Long id) {
        return reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with id: " + id));
    }

    private Species findSpecies(Long id) {
        return speciesRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Species not found"));
    }
}
