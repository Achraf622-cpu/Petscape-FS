package com.petscape.service.impl;

import com.petscape.dto.AdoptionRequestResponse;
import com.petscape.entity.AdoptionRequest;
import com.petscape.entity.AdoptionRequest.AdoptionStatus;
import com.petscape.entity.Animal;
import com.petscape.entity.Animal.AnimalStatus;
import com.petscape.entity.Notification.NotificationType;
import com.petscape.entity.User;
import com.petscape.exception.BadRequestException;
import com.petscape.exception.ForbiddenException;
import com.petscape.exception.ResourceNotFoundException;
import com.petscape.mapper.AdoptionRequestMapper;
import com.petscape.repository.AdoptionRequestRepository;
import com.petscape.repository.AnimalRepository;
import com.petscape.service.IAdoptionRequestService;
import com.petscape.service.INotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdoptionRequestServiceImpl implements IAdoptionRequestService {

    private final AdoptionRequestRepository adoptionRequestRepository;
    private final AnimalRepository animalRepository;
    private final AdoptionRequestMapper adoptionRequestMapper;
    private final INotificationService notificationService;

    @Override
    @Transactional
    public AdoptionRequestResponse store(Long animalId, String message, User currentUser) {
        Animal animal = animalRepository.findById(animalId)
                .orElseThrow(() -> new ResourceNotFoundException("Animal not found"));
        if (animal.getStatus() != AnimalStatus.AVAILABLE) {
            throw new BadRequestException("This animal is not available for adoption");
        }
        adoptionRequestRepository
                .findByUserIdAndAnimalIdAndStatus(currentUser.getId(), animalId, AdoptionStatus.PENDING)
                .ifPresent(r -> {
                    throw new BadRequestException("You already have a pending adoption request for this animal");
                });

        AdoptionRequest request = AdoptionRequest.builder()
                .user(currentUser).animal(animal)
                .status(AdoptionStatus.PENDING).message(message).build();
        adoptionRequestRepository.save(request);
        animal.setStatus(AnimalStatus.RESERVED);
        animalRepository.save(animal);
        return adoptionRequestMapper.toResponse(request);
    }

    @Override
    @Transactional
    public void cancel(Long id, User currentUser) {
        AdoptionRequest request = findById(id);
        if (!request.getUser().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("You are not authorized to cancel this request");
        }
        if (request.getStatus() != AdoptionStatus.PENDING) {
            throw new BadRequestException("This request can no longer be cancelled");
        }
        request.setStatus(AdoptionStatus.REJECTED);
        adoptionRequestRepository.save(request);
        Animal animal = request.getAnimal();
        animal.setStatus(AnimalStatus.AVAILABLE);
        animalRepository.save(animal);
    }

    @Override
    @Transactional
    public AdoptionRequestResponse updateStatus(Long id, AdoptionStatus newStatus) {
        AdoptionRequest request = findById(id);
        Animal animal = request.getAnimal();
        request.setStatus(newStatus);
        adoptionRequestRepository.save(request);

        Long userId = request.getUser().getId();
        String animalName = animal.getName();

        if (newStatus == AdoptionStatus.APPROVED) {
            animal.setStatus(AnimalStatus.ADOPTED);
            animalRepository.save(animal);
            adoptionRequestRepository.findByAnimalIdAndStatus(animal.getId(), AdoptionStatus.PENDING)
                    .stream().filter(r -> !r.getId().equals(request.getId()))
                    .forEach(r -> {
                        r.setStatus(AdoptionStatus.REJECTED);
                        adoptionRequestRepository.save(r);
                        notificationService.createFor(r.getUser().getId(),
                                "Adoption Request Update",
                                "Unfortunately, your adoption request for " + animalName + " was not successful.",
                                NotificationType.ADOPTION_REJECTED);
                    });
            notificationService.createFor(userId,
                    "🎉 Adoption Approved!",
                    "Congratulations! Your adoption request for " + animalName + " has been approved.",
                    NotificationType.ADOPTION_APPROVED);

        } else if (newStatus == AdoptionStatus.REJECTED) {
            long remaining = adoptionRequestRepository.countByAnimalIdAndStatus(animal.getId(), AdoptionStatus.PENDING);
            if (remaining == 0) {
                animal.setStatus(AnimalStatus.AVAILABLE);
                animalRepository.save(animal);
            }
            notificationService.createFor(userId,
                    "Adoption Request Update",
                    "Your adoption request for " + animalName + " was not approved at this time.",
                    NotificationType.ADOPTION_REJECTED);
        }

        return adoptionRequestMapper.toResponse(request);
    }

    @Override
    public List<AdoptionRequestResponse> getPending() {
        return adoptionRequestRepository.findByStatus(AdoptionStatus.PENDING)
                .stream().map(adoptionRequestMapper::toResponse).toList();
    }

    @Override
    public Page<AdoptionRequestResponse> getMyRequests(Long userId, Pageable pageable) {
        return adoptionRequestRepository.findByUserId(userId, pageable)
                .map(adoptionRequestMapper::toResponse);
    }

    @Override
    public AdoptionRequestResponse getById(Long id, User currentUser) {
        AdoptionRequest request = findById(id);

        if (!request.getUser().getId().equals(currentUser.getId()) && !currentUser.isAdmin()) {
            throw new ForbiddenException("You are not authorized to view this adoption request");
        }
        return adoptionRequestMapper.toResponse(request);
    }

    private AdoptionRequest findById(Long id) {
        return adoptionRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Adoption request not found with id: " + id));
    }
}
