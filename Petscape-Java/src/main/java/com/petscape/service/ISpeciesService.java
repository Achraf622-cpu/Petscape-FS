package com.petscape.service;

import com.petscape.dto.SpeciesRequest;
import com.petscape.dto.SpeciesResponse;

import java.util.List;

public interface ISpeciesService {
    List<SpeciesResponse> getAll();

    SpeciesResponse getById(Long id);

    SpeciesResponse create(SpeciesRequest request);

    SpeciesResponse update(Long id, SpeciesRequest request);

    void delete(Long id);
}
