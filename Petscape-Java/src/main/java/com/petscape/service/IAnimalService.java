package com.petscape.service;

import com.petscape.dto.AnimalRequest;
import com.petscape.dto.AnimalResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IAnimalService {
    Page<AnimalResponse> getAll(Long speciesId, String status, String search, Pageable pageable);

    Page<AnimalResponse> getAvailableForAdoption(Long speciesId, Integer maxAge, String search, Pageable pageable);

    AnimalResponse getById(Long id);

    AnimalResponse create(AnimalRequest request);

    AnimalResponse update(Long id, AnimalRequest request);

    void delete(Long id);

    long getAdoptedCount();
}
