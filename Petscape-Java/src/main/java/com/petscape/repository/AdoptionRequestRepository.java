package com.petscape.repository;

import com.petscape.entity.AdoptionRequest;
import com.petscape.entity.AdoptionRequest.AdoptionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdoptionRequestRepository extends JpaRepository<AdoptionRequest, Long> {
    Optional<AdoptionRequest> findByUserIdAndAnimalIdAndStatus(Long userId, Long animalId, AdoptionStatus status);

    List<AdoptionRequest> findByAnimalIdAndStatus(Long animalId, AdoptionStatus status);

    long countByAnimalIdAndStatus(Long animalId, AdoptionStatus status);

    List<AdoptionRequest> findByStatus(AdoptionStatus status);


    Page<AdoptionRequest> findByUserId(Long userId, Pageable pageable);


    @Query("SELECT MONTH(a.createdAt), COUNT(a) FROM AdoptionRequest a " +
            "WHERE YEAR(a.createdAt) = :year " +
            "GROUP BY MONTH(a.createdAt) ORDER BY MONTH(a.createdAt)")
    List<Object[]> countByMonth(@Param("year") int year);
}
