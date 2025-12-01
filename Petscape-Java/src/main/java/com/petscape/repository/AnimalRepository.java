package com.petscape.repository;

import com.petscape.entity.Animal;
import com.petscape.entity.Animal.AnimalStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnimalRepository extends JpaRepository<Animal, Long>, JpaSpecificationExecutor<Animal> {
    Page<Animal> findByStatus(AnimalStatus status, Pageable pageable);

    long countByStatus(AnimalStatus status);

    /** Returns [speciesName, count] pairs for the species breakdown chart */
    @Query("SELECT a.species.name, COUNT(a) FROM Animal a GROUP BY a.species.name ORDER BY COUNT(a) DESC")
    List<Object[]> countBySpecies();
}
