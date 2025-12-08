package com.petscape.service.impl;

import com.petscape.dto.SpeciesRequest;
import com.petscape.dto.SpeciesResponse;
import com.petscape.exception.BadRequestException;
import com.petscape.exception.ResourceNotFoundException;
import com.petscape.mapper.SpeciesMapper;
import com.petscape.entity.Species;
import com.petscape.repository.SpeciesRepository;
import com.petscape.service.ISpeciesService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SpeciesServiceImpl implements ISpeciesService {

    private final SpeciesRepository speciesRepository;
    private final SpeciesMapper speciesMapper;

    @Override
    public List<SpeciesResponse> getAll() {
        return speciesRepository.findAll().stream()
                .map(speciesMapper::toResponse)
                .toList();
    }

    @Override
    public SpeciesResponse getById(Long id) {
        return speciesMapper.toResponse(findOrThrow(id));
    }

    @Override
    @Transactional
    public SpeciesResponse create(SpeciesRequest request) {
        if (speciesRepository.existsByName(request.getName())) {
            throw new BadRequestException("Species with name '" + request.getName() + "' already exists");
        }
        Species species = speciesMapper.toEntity(request);
        return speciesMapper.toResponse(speciesRepository.save(species));
    }

    @Override
    @Transactional
    public SpeciesResponse update(Long id, SpeciesRequest request) {
        Species species = findOrThrow(id);
        speciesMapper.updateEntityFromRequest(request, species);
        return speciesMapper.toResponse(speciesRepository.save(species));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        speciesRepository.delete(findOrThrow(id));
    }

    private Species findOrThrow(Long id) {
        return speciesRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Species not found with id: " + id));
    }
}
