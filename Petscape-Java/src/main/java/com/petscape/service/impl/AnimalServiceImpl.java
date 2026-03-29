package com.petscape.service.impl;

import com.petscape.dto.AnimalRequest;
import com.petscape.dto.AnimalResponse;
import com.petscape.entity.Animal;
import com.petscape.entity.Animal.AnimalStatus;
import com.petscape.entity.Species;
import com.petscape.exception.ResourceNotFoundException;
import com.petscape.mapper.AnimalMapper;
import com.petscape.repository.AnimalRepository;
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
    private final IFileStorageService fileStorageService;
    private final AnimalMapper animalMapper;

    @Override
    public Page<AnimalResponse> getAll(com.petscape.entity.Species species, String status, String search, Pageable pageable) {
        Specification<Animal> spec = AnimalSpecifications.withFilters(species, status, search);
        return animalRepository.findAll(spec, pageable).map(animalMapper::toResponse);
    }

    @Override
    public Page<AnimalResponse> getAvailableForAdoption(com.petscape.entity.Species species, Integer maxAge, String search,
            Pageable pageable) {
        Specification<Animal> spec = AnimalSpecifications.availableForAdoption(species, maxAge, search);
        return animalRepository.findAll(spec, pageable).map(animalMapper::toResponse);
    }

    @Override
    public AnimalResponse getById(Long id) {
        return animalMapper.toResponse(findById(id));
    }

    @Override
    @Transactional
    public AnimalResponse create(AnimalRequest request) {
        Species species = request.getSpecies();
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
    public AnimalResponse update(Long id, AnimalRequest request) {
        Animal animal = findById(id);
        Species species = request.getSpecies();
        animalMapper.updateEntityFromRequest(request, animal);
        animal.setSpecies(species);
        

        if (request.getExistingImages() != null) {
            List<String> imagesToKeep = request.getExistingImages();
            

            List<String> imagesToDelete = animal.getImages().stream()
                .filter(img -> !imagesToKeep.contains(img))
                .toList();
                

            imagesToDelete.forEach(fileStorageService::delete);
            

            animal.getImages().retainAll(imagesToKeep);
        } else {

            animal.getImages().forEach(fileStorageService::delete);
            animal.getImages().clear();
        }


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
}
