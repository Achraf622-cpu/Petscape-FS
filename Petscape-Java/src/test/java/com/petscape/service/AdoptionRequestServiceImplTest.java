package com.petscape.service;

import com.petscape.dto.AdoptionRequestResponse;
import com.petscape.entity.AdoptionRequest;
import com.petscape.entity.AdoptionRequest.AdoptionStatus;
import com.petscape.entity.Animal;
import com.petscape.entity.Animal.AnimalStatus;
import com.petscape.entity.User;
import com.petscape.exception.BadRequestException;
import com.petscape.exception.ForbiddenException;
import com.petscape.exception.ResourceNotFoundException;
import com.petscape.mapper.AdoptionRequestMapper;
import com.petscape.repository.AdoptionRequestRepository;
import com.petscape.repository.AnimalRepository;
import com.petscape.service.impl.AdoptionRequestServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AdoptionRequestServiceImpl Unit Tests")
class AdoptionRequestServiceImplTest {

    @Mock
    private AdoptionRequestRepository adoptionRequestRepository;
    @Mock
    private AnimalRepository animalRepository;
    @Mock
    private AdoptionRequestMapper adoptionRequestMapper;
    @InjectMocks
    private AdoptionRequestServiceImpl service;

    private User makeUser(Long id) {
        return User.builder().id(id).build();
    }

    private Animal makeAnimal(Long id, AnimalStatus status) {
        Animal a = new Animal();
        a.setId(id);
        a.setStatus(status);
        return a;
    }

    @Test
    @DisplayName("store() — successfully creates adoption request for available animal")
    void store_success() {
        User user = makeUser(1L);
        Animal animal = makeAnimal(10L, AnimalStatus.AVAILABLE);
        AdoptionRequest saved = AdoptionRequest.builder().id(1L).user(user).animal(animal)
                .status(AdoptionStatus.PENDING).message("want this pet").build();
        AdoptionRequestResponse dto = AdoptionRequestResponse.builder().build();

        when(animalRepository.findById(10L)).thenReturn(Optional.of(animal));
        when(adoptionRequestRepository.findByUserIdAndAnimalIdAndStatus(1L, 10L, AdoptionStatus.PENDING))
                .thenReturn(Optional.empty());
        when(adoptionRequestRepository.save(any())).thenReturn(saved);
        when(adoptionRequestMapper.toResponse(saved)).thenReturn(dto);

        AdoptionRequestResponse result = service.store(10L, "want this pet", user);
        assertThat(result).isSameAs(dto);
        assertThat(animal.getStatus()).isEqualTo(AnimalStatus.RESERVED);
    }

    @Test
    @DisplayName("store() — throws BadRequest when animal is not AVAILABLE")
    void store_notAvailable_throws() {
        Animal animal = makeAnimal(10L, AnimalStatus.ADOPTED);
        when(animalRepository.findById(10L)).thenReturn(Optional.of(animal));

        assertThatThrownBy(() -> service.store(10L, "msg", makeUser(1L)))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("not available");
    }

    @Test
    @DisplayName("store() — throws BadRequest on duplicate pending request")
    void store_duplicatePending_throws() {
        Animal animal = makeAnimal(10L, AnimalStatus.AVAILABLE);
        when(animalRepository.findById(10L)).thenReturn(Optional.of(animal));
        when(adoptionRequestRepository.findByUserIdAndAnimalIdAndStatus(1L, 10L, AdoptionStatus.PENDING))
                .thenReturn(Optional.of(new AdoptionRequest()));

        assertThatThrownBy(() -> service.store(10L, "msg", makeUser(1L)))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("pending adoption request");
    }

    @Test
    @DisplayName("cancel() — owner can cancel pending request")
    void cancel_byOwner_success() {
        User user = makeUser(1L);
        Animal animal = makeAnimal(10L, AnimalStatus.RESERVED);
        AdoptionRequest request = AdoptionRequest.builder().id(1L).user(user).animal(animal)
                .status(AdoptionStatus.PENDING).build();

        when(adoptionRequestRepository.findById(1L)).thenReturn(Optional.of(request));

        service.cancel(1L, user);

        assertThat(request.getStatus()).isEqualTo(AdoptionStatus.REJECTED);
        assertThat(animal.getStatus()).isEqualTo(AnimalStatus.AVAILABLE);
    }

    @Test
    @DisplayName("cancel() — non-owner throws ForbiddenException")
    void cancel_nonOwner_throws() {
        User owner = makeUser(1L);
        User other = makeUser(99L);
        AdoptionRequest request = AdoptionRequest.builder().id(1L).user(owner)
                .status(AdoptionStatus.PENDING).build();

        when(adoptionRequestRepository.findById(1L)).thenReturn(Optional.of(request));

        assertThatThrownBy(() -> service.cancel(1L, other))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    @DisplayName("updateStatus() — APPROVED sets animal to ADOPTED and rejects others")
    void updateStatus_approve_setsAdoptedAndRejectsOthers() {
        User user = makeUser(1L);
        Animal animal = makeAnimal(10L, AnimalStatus.RESERVED);
        AdoptionRequest request = AdoptionRequest.builder().id(1L).user(user).animal(animal)
                .status(AdoptionStatus.PENDING).build();
        AdoptionRequestResponse dto = AdoptionRequestResponse.builder().build();

        when(adoptionRequestRepository.findById(1L)).thenReturn(Optional.of(request));
        when(adoptionRequestRepository.findByAnimalIdAndStatus(10L, AdoptionStatus.PENDING)).thenReturn(List.of());
        when(adoptionRequestMapper.toResponse(request)).thenReturn(dto);

        service.updateStatus(1L, AdoptionStatus.APPROVED);

        assertThat(animal.getStatus()).isEqualTo(AnimalStatus.ADOPTED);
        assertThat(request.getStatus()).isEqualTo(AdoptionStatus.APPROVED);
    }

    @Test
    @DisplayName("updateStatus() — throws ResourceNotFoundException for unknown id")
    void updateStatus_notFound_throws() {
        when(adoptionRequestRepository.findById(999L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.updateStatus(999L, AdoptionStatus.APPROVED))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
