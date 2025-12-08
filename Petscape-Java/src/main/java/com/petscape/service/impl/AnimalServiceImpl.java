package com.petscape.service.impl;

import com.petscape.annotation.Auditable;
import com.petscape.dto.AnimalRequest;
import com.petscape.dto.AnimalResponse;
import com.petscape.entity.Animal;
import com.petscape.entity.Animal.AnimalStatus;
import com.petscape.entity.Species;
import com.petscape.exception.ResourceNotFoundException;
import com.petscape.mapper.AnimalMapper;
import com.petscape.repository.AnimalRepository;
import com.petscape.repository.SpeciesRepository;
import com.petscape.service.IAnimalService;
import com.petscape.service.IFileStorageService;
import com.petscape.specification.AnimalSpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AnimalServiceImpl implements IAnimalService {

    private final AnimalRepository animalRepository;
    private final SpeciesRepository speciesRepository;
    private final IFileStorageService fileStorageService;
    private final AnimalMapper animalMapper;

    @Override
    public Page<AnimalResponse> getAll(Long speciesId, String status, String search, Pageable pageable) {
        Specification<Animal> spec = AnimalSpecifications.withFilters(speciesId, status, search);
        return animalRepository.findAll(spec, pageable).map(animalMapper::toResponse);
    }

    @Override
    public Page<AnimalResponse> getAvailableForAdoption(Long speciesId, Integer maxAge, String search,
            Pageable pageable) {
        Specification<Animal> spec = AnimalSpecifications.availableForAdoption(speciesId, maxAge, search);
        return animalRepository.findAll(spec, pageable).map(animalMapper::toResponse);
    }

    @Override
    public AnimalResponse getById(Long id) {
        return animalMapper.toResponse(findById(id));
    }

    @Override
    @Transactional
    @Auditable(action = "CREATE_ANIMAL", entityType = "Animal")
    public AnimalResponse create(AnimalRequest request) {
        Species species = findSpecies(request.getSpeciesId());
        Animal animal = animalMapper.toEntity(request);
        animal.setSpecies(species);
        if (request.getImage() != null && !request.getImage().isEmpty()) {
            animal.setImage(fileStorageService.store(request.getImage(), "animals"));
        }
        return animalMapper.toResponse(animalRepository.save(animal));
    }

    @Override
    @Transactional
    @Auditable(action = "UPDATE_ANIMAL", entityType = "Animal")
    public AnimalResponse update(Long id, AnimalRequest request) {
        Animal animal = findById(id);
        Species species = findSpecies(request.getSpeciesId());
        animalMapper.updateEntityFromRequest(request, animal);
        animal.setSpecies(species);
        if (request.getImage() != null && !request.getImage().isEmpty()) {
            if (animal.getImage() != null)
                fileStorageService.delete(animal.getImage());
            animal.setImage(fileStorageService.store(request.getImage(), "animals"));
        }
        return animalMapper.toResponse(animalRepository.save(animal));
    }

    @Override
    @Transactional
    @Auditable(action = "DELETE_ANIMAL", entityType = "Animal")
    public void delete(Long id) {
        Animal animal = findById(id);
        if (animal.getImage() != null)
            fileStorageService.delete(animal.getImage());
        animalRepository.delete(animal);
    }

    @Override
    public long getAdoptedCount() {
        return animalRepository.countByStatus(AnimalStatus.ADOPTED);
    }

    private Animal findById(Long id) {
        return animalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Animal not found with id: " + id));
    }

    private Species findSpecies(Long speciesId) {
        return speciesRepository.findById(speciesId)
                .orElseThrow(() -> new ResourceNotFoundException("Species not found"));
    }
}
