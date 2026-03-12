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
import java.util.List;
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
        if (request.getImages() != null) {
            request.getImages().stream()
                .filter(f -> f != null && !f.isEmpty())
                .map(f -> fileStorageService.store(f, "animals"))
                .forEach(animal.getImages()::add);
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
        
        // Handle existing images deletion
        if (request.getExistingImages() != null) {
            List<String> imagesToKeep = request.getExistingImages();
            
            // Find images that are currently in the animal but not in the keep list
            List<String> imagesToDelete = animal.getImages().stream()
                .filter(img -> !imagesToKeep.contains(img))
                .toList();
                
            // Delete them from storage
            imagesToDelete.forEach(fileStorageService::delete);
            
            // Retain only the ones to keep
            animal.getImages().retainAll(imagesToKeep);
        } else {
            // If existingImages is explicitly null (not empty), it might mean the frontend didn't send them,
            // or wants to clear them all. To be safe, if we get an empty list, we clear; if null, we could assume clear.
            // Let's assume if it's missing (null), we clear all old images (depends on frontend sending empty array).
            // Actually, better to just clear all if it's null to be consistent.
            animal.getImages().forEach(fileStorageService::delete);
            animal.getImages().clear();
        }

        // Append new images to the list
        if (request.getImages() != null) {
            request.getImages().stream()
                .filter(f -> f != null && !f.isEmpty())
                .map(f -> fileStorageService.store(f, "animals"))
                .forEach(animal.getImages()::add);
        }
        return animalMapper.toResponse(animalRepository.save(animal));
    }

    @Override
    @Transactional
    @Auditable(action = "DELETE_ANIMAL", entityType = "Animal")
    public void delete(Long id) {
        Animal animal = findById(id);
        animal.getImages().forEach(fileStorageService::delete);
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
