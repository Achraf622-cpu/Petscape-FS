package com.petscape.specification;

import com.petscape.entity.AnimalReport;
import com.petscape.entity.AnimalReport.ReportStatus;
import org.springframework.data.jpa.domain.Specification;

public final class AnimalReportSpecifications {

    private AnimalReportSpecifications() {
    }

    public static Specification<AnimalReport> withFilters(String type, com.petscape.entity.Species species, String location, String status) {
        return Specification.where(isOfType(type))
                .and(hasSpecies(species))
                .and(locationContains(location))
                .and(hasStatus(status));
    }

    public static Specification<AnimalReport> isOfType(String type) {
        return (root, query, cb) -> {
            if ("lost".equalsIgnoreCase(type))
                return cb.isFalse(root.get("isFound"));
            if ("found".equalsIgnoreCase(type))
                return cb.isTrue(root.get("isFound"));
            return cb.conjunction();
        };
    }

    public static Specification<AnimalReport> hasSpecies(com.petscape.entity.Species species) {
        return (root, query, cb) -> species == null ? cb.conjunction()
                : cb.equal(root.get("species"), species);
    }

    public static Specification<AnimalReport> locationContains(String location) {
        return (root, query, cb) -> {
            if (location == null || location.isBlank())
                return cb.conjunction();
            return cb.like(cb.lower(root.get("location")), "%" + location.toLowerCase() + "%");
        };
    }

    public static Specification<AnimalReport> hasStatus(String status) {
        return (root, query, cb) -> {
            if (status == null || status.isBlank())
                return cb.conjunction();
            try {
                return cb.equal(root.get("status"), ReportStatus.valueOf(status.toUpperCase()));
            } catch (IllegalArgumentException e) {
                return cb.conjunction();
            }
        };
    }
}
