package com.petscape.specification;

import com.petscape.entity.Animal;
import com.petscape.entity.Animal.AnimalStatus;
import org.springframework.data.jpa.domain.Specification;

public final class AnimalSpecifications {

    private AnimalSpecifications() {
    }

    public static Specification<Animal> withFilters(com.petscape.entity.Species species, String status, String search) {
        return hasSpecies(species)
                .and(hasStatus(status))
                .and(nameOrBreedOrDescriptionContains(search));
    }

    public static Specification<Animal> availableForAdoption(com.petscape.entity.Species species, Integer maxAge, String search) {
        return Specification.where(isAvailable())
                .and(hasSpecies(species))
                .and(maxAgeIs(maxAge))
                .and(nameOrBreedContains(search));
    }

    public static Specification<Animal> isAvailable() {
        return (root, query, cb) -> cb.equal(root.get("status"), AnimalStatus.AVAILABLE);
    }

    public static Specification<Animal> hasStatus(String status) {
        return (root, query, cb) -> {
            if (status == null || status.isBlank())
                return cb.conjunction();
            try {
                return cb.equal(root.get("status"), AnimalStatus.valueOf(status.toUpperCase()));
            } catch (IllegalArgumentException e) {
                return cb.conjunction();
            }
        };
    }

    public static Specification<Animal> hasSpecies(com.petscape.entity.Species species) {
        return (root, query, cb) -> species == null ? cb.conjunction()
                : cb.equal(root.get("species"), species);
    }

    public static Specification<Animal> maxAgeIs(Integer maxAge) {
        return (root, query, cb) -> maxAge == null ? cb.conjunction() : cb.lessThanOrEqualTo(root.get("age"), maxAge);
    }

    public static Specification<Animal> nameOrBreedContains(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank())
                return cb.conjunction();
            String like = "%" + search.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("name")), like),
                    cb.like(cb.lower(root.get("breed")), like));
        };
    }

    public static Specification<Animal> nameOrBreedOrDescriptionContains(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank())
                return cb.conjunction();
            String like = "%" + search.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("name")), like),
                    cb.like(cb.lower(root.get("breed")), like),
                    cb.like(cb.lower(root.get("description")), like),
                    cb.like(cb.lower(root.get("location")), like));
        };
    }
}
